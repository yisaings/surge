(function () {
  var req = $request || {};
  var res = $response || {};
  var body = res.body;
  function passthrough() { $done({}); }
  if (!(body instanceof Uint8Array)) { passthrough(); return; }
  function readVarint(bytes, pos) {
    var value = 0;
    var shift = 0;
    while (pos < bytes.length && shift < 53) {
      var byte = bytes[pos++];
      value += (byte & 0x7f) * Math.pow(2, shift);
      if ((byte & 0x80) === 0) return [value, pos];
      shift += 7;
    }
    throw new Error("bad varint");
  }
  function writeVarint(value) {
    var out = [];
    while (value > 127) {
      out.push((value & 0x7f) | 0x80);
      value = Math.floor(value / 128);
    }
    out.push(value);
    return out;
  }
  function parseFields(bytes) {
    var fields = [];
    var pos = 0;
    while (pos < bytes.length) {
      var start = pos;
      var r = readVarint(bytes, pos);
      var tag = r[0]; pos = r[1];
      var fieldNo = Math.floor(tag / 8);
      var wireType = tag & 7;
      if (fieldNo <= 0) throw new Error("bad field number");
      var payloadStart = -1;
      var payloadEnd = -1;
      if (wireType === 0) {
        payloadStart = pos;
        pos = readVarint(bytes, pos)[1];
        payloadEnd = pos;
      } else if (wireType === 1) {
        pos += 8;
      } else if (wireType === 2) {
        var rLen = readVarint(bytes, pos);
        var len = rLen[0];
        pos = rLen[1];
        payloadStart = pos;
        payloadEnd = pos + len;
        pos = payloadEnd;
      } else if (wireType === 5) {
        pos += 4;
      } else {
        throw new Error("unsupported wire type " + wireType);
      }
      if (pos > bytes.length) throw new Error("truncated field");
      fields.push({ fieldNo: fieldNo, wireType: wireType, start: start, end: pos, payloadStart: payloadStart, payloadEnd: payloadEnd });
    }
    return fields;
  }
  function concat(parts) {
    var total = 0;
    for (var i = 0; i < parts.length; i++) total += parts[i].length;
    var out = new Uint8Array(total);
    var offset = 0;
    for (var j = 0; j < parts.length; j++) {
      out.set(parts[j], offset);
      offset += parts[j].length;
    }
    return out;
  }
  function wrapField(fieldNo, payload) {
    return concat([new Uint8Array(writeVarint(fieldNo * 8 + 2)), new Uint8Array(writeVarint(payload.length)), payload]);
  }
  function payloadOf(bytes, field) {
    return bytes.subarray(field.payloadStart, field.payloadEnd);
  }
  function findField(bytes, fieldNo) {
    var fields = parseFields(bytes);
    for (var i = 0; i < fields.length; i++) {
      if (fields[i].fieldNo === fieldNo && fields[i].wireType === 2) return fields[i];
    }
    return null;
  }
  function replacePayload(bytes, fieldNo, newPayload) {
    var fields = parseFields(bytes);
    var parts = [];
    var done = false;
    for (var i = 0; i < fields.length; i++) {
      var f = fields[i];
      if (!done && f.fieldNo === fieldNo && f.wireType === 2) {
        parts.push(wrapField(fieldNo, newPayload));
        done = true;
      } else {
        parts.push(bytes.subarray(f.start, f.end));
      }
    }
    if (!done) throw new Error("field " + fieldNo + " not found");
    return concat(parts);
  }
  function bytesOf(str) {
    var out = new Uint8Array(str.length);
    for (var i = 0; i < str.length; i++) out[i] = str.charCodeAt(i) & 0xff;
    return out;
  }
  function bytesEqual(a, b) {
    if (a.length !== b.length) return false;
    for (var i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
    return true;
  }
  function indexOfBytes(hay, needle) {
    if (needle.length === 0 || hay.length < needle.length) return -1;
    for (var i = 0; i <= hay.length - needle.length; i++) {
      var ok = true;
      for (var j = 0; j < needle.length; j++) {
        if (hay[i + j] !== needle[j]) { ok = false; break; }
      }
      if (ok) return i;
    }
    return -1;
  }
  function hasFieldNo(bytes, fieldNo) {
    var fields = parseFields(bytes);
    for (var i = 0; i < fields.length; i++) {
      if (fields[i].fieldNo === fieldNo) return true;
    }
    return false;
  }
  function filterHotCard(payload) {
    var fields = parseFields(payload);
    var parts = [];
    for (var i = 0; i < fields.length; i++) {
      var f = fields[i];
      if (f.fieldNo === 1 && f.wireType === 2) {
        var sub = payloadOf(payload, f);
        var hot = false;
        try { hot = hasFieldNo(sub, 12); } catch (e) { hot = false; }
        if (!hot) parts.push(payload.subarray(f.start, f.end));
      } else {
        parts.push(payload.subarray(f.start, f.end));
      }
    }
    return concat(parts);
  }
  function setCardTypeNormal(meta) {
    var fields = parseFields(meta);
    var parts = [];
    var changed = false;
    var CARD_TYPE = bytesOf("card_type");
    var VIDEO = bytesOf("video");
    var NORMAL = bytesOf("normal");
    for (var i = 0; i < fields.length; i++) {
      var f = fields[i];
      if (f.fieldNo === 1 && f.wireType === 2 && bytesEqual(payloadOf(meta, f), CARD_TYPE)) {
        if (i + 1 < fields.length && fields[i + 1].fieldNo === 2 && fields[i + 1].wireType === 2 && bytesEqual(payloadOf(meta, fields[i + 1]), VIDEO)) {
          parts.push(meta.subarray(f.start, f.end));
          parts.push(wrapField(2, NORMAL));
          changed = true;
          i++;
          continue;
        }
      }
      parts.push(meta.subarray(f.start, f.end));
    }
    return changed ? concat(parts) : null;
  }
  function convertVideoPost(item) {
    var fields = parseFields(item);
    var parts = [];
    var changed = false;
    for (var i = 0; i < fields.length; i++) {
      var f = fields[i];
      if (f.fieldNo === 79) {
        changed = true;
        continue;
      }
      if (f.fieldNo === 234 && f.wireType === 2) {
        var newMeta = setCardTypeNormal(payloadOf(item, f));
        if (newMeta) {
          parts.push(wrapField(234, newMeta));
          changed = true;
        } else {
          parts.push(item.subarray(f.start, f.end));
        }
        continue;
      }
      parts.push(item.subarray(f.start, f.end));
    }
    return changed ? concat(parts) : null;
  }
  function filterRecForum(payload) {
    var fields = parseFields(payload);
    var parts = [];
    for (var i = 0; i < fields.length; i++) {
      var f = fields[i];
      if (f.fieldNo === 2 && f.wireType === 2) {
        var item = payloadOf(payload, f);
        if (indexOfBytes(item, REC_FORUM) !== -1) continue;
      }
      parts.push(payload.subarray(f.start, f.end));
    }
    return concat(parts);
  }
  var EMPTY = new Uint8Array(0);
  var TB_VIDEO = bytesOf("tb-video.bdstatic.com");
  var REC_FORUM = bytesOf("recommend_forum");
  try {
    var url = req.url || "";
    var topF2 = findField(body, 2);
    if (!topF2) { passthrough(); return; }
    var f2 = payloadOf(body, topF2);
    if (url.indexOf("excellent/personalized") !== -1) {
      var fields = parseFields(f2);
      var parts = [];
      var changed = false;
      for (var i = 0; i < fields.length; i++) {
        var f = fields[i];
        if (f.fieldNo === 9 && f.wireType === 2) {
          if (f.payloadEnd - f.payloadStart > 0) changed = true;
          parts.push(wrapField(9, EMPTY));
        } else if (f.fieldNo === 27 && f.wireType === 2) {
          var newHot = filterHotCard(payloadOf(f2, f));
          if (newHot.length !== (f.payloadEnd - f.payloadStart)) changed = true;
          parts.push(wrapField(27, newHot));
        } else if (f.fieldNo === 2 && f.wireType === 2) {
          var p = payloadOf(f2, f);
          if (indexOfBytes(p, TB_VIDEO) !== -1) {
            var conv = convertVideoPost(p);
            if (conv) {
              parts.push(wrapField(2, conv));
              changed = true;
            } else {
              parts.push(f2.subarray(f.start, f.end));
            }
          } else {
            parts.push(f2.subarray(f.start, f.end));
          }
        } else {
          parts.push(f2.subarray(f.start, f.end));
        }
      }
      if (!changed) { passthrough(); return; }
      $done({ body: replacePayload(body, 2, concat(parts)) });
      return;
    }
    if (url.indexOf("frs/page") !== -1) {
      var newF2 = f2;
      var changed = false;
      var midField = findField(f2, 2);
      if (midField) {
        var mid = payloadOf(f2, midField);
        if (findField(mid, 33)) {
          var newMid = replacePayload(mid, 33, EMPTY);
          newF2 = replacePayload(f2, 2, newMid);
          changed = true;
        }
      }
      var f126 = findField(newF2, 126);
      if (f126) {
        var oldLen = f126.payloadEnd - f126.payloadStart;
        var newF126 = filterRecForum(payloadOf(newF2, f126));
        if (newF126.length !== oldLen) {
          newF2 = replacePayload(newF2, 126, newF126);
          changed = true;
        }
      }
      if (!changed) { passthrough(); return; }
      $done({ body: replacePayload(body, 2, newF2) });
      return;
    }
    if (url.indexOf("frs/threadlist") !== -1) {
      if (!findField(f2, 3)) { passthrough(); return; }
      var newF2c = replacePayload(f2, 3, EMPTY);
      $done({ body: replacePayload(body, 2, newF2c) });
      return;
    }
    passthrough();
  } catch (e) {
    passthrough();
  }
})();
