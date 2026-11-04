(function () {
  var req = $request || {};
  var res = $response || {};
  var body = res.body;
  function passthrough() { $done({}); }
  function header(name) {
    var h = req.headers || {};
    var want = String(name).toLowerCase();
    if (Array.isArray(h)) {
      for (var i = 0; i < h.length; i++) {
        var f = h[i] && h[i].field;
        if (f && String(f).toLowerCase() === want) return h[i].value;
      }
      return "";
    }
    for (var k in h) {
      if (String(k).toLowerCase() === want) return h[k];
    }
    return "";
  }
  var rpid = String(header("rpid") || "").trim();
  if (rpid !== "1100001" && rpid !== "1000017" && rpid !== "1000002" && rpid !== "1000029") { passthrough(); return; }
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
  function filterFields(bytes, fieldNo, keep) {
    var fields = parseFields(bytes);
    var parts = [];
    var removed = 0;
    for (var i = 0; i < fields.length; i++) {
      var f = fields[i];
      if (f.fieldNo === fieldNo && f.wireType === 2) {
        if (keep(payloadOf(bytes, f))) {
          parts.push(bytes.subarray(f.start, f.end));
        } else {
          removed++;
        }
      } else {
        parts.push(bytes.subarray(f.start, f.end));
      }
    }
    return { bytes: concat(parts), removed: removed };
  }
  function filterAtPath(bytes, path, repFn, keepFn) {
    if (path.length === 0) return filterFields(bytes, repFn, keepFn);
    var f = findField(bytes, path[0]);
    if (!f) throw new Error("path field " + path[0] + " not found");
    var inner = filterAtPath(payloadOf(bytes, f), path.slice(1), repFn, keepFn);
    return { bytes: replacePayload(bytes, path[0], inner.bytes), removed: inner.removed };
  }
  var decoder = null;
  try { decoder = new TextDecoder(); } catch (e) { decoder = null; }
  function textOf(payload) {
    if (!decoder) return "";
    try { return decoder.decode(payload); } catch (e) { return ""; }
  }
  function fieldVarint(item, fieldNo) {
    var fields = parseFields(item);
    for (var i = 0; i < fields.length; i++) {
      if (fields[i].fieldNo === fieldNo && fields[i].wireType === 0) {
        return readVarint(item, fields[i].payloadStart)[0];
      }
    }
    return null;
  }
  function fieldString(item, fieldNo) {
    var fields = parseFields(item);
    for (var i = 0; i < fields.length; i++) {
      if (fields[i].fieldNo === fieldNo && fields[i].wireType === 2) {
        return textOf(payloadOf(item, fields[i]));
      }
    }
    return "";
  }
  function keepMyPageSection(payload) {
    var t = textOf(payload);
    if (/"title"\s*:\s*"票券权益"/.test(t)) return true;
    if (/"hasOperationCard"\s*:\s*true/.test(t)) return false;
    if (/"trackName"\s*:\s*"equity"/.test(t)) return false;
    if (/"trackName"\s*:\s*"advert"/.test(t) || /\/fs\/advert\//.test(t)) return false;
    return true;
  }
  function isCircleEntry(payload) {
    var t = textOf(payload);
    return t.indexOf("greenBook-weex") !== -1 || t.indexOf("航旅圈子") !== -1;
  }
  try {
    var topField7 = findField(body, 7);
    if (!topField7) { passthrough(); return; }
    var p7 = payloadOf(body, topField7);
    if (rpid === "1000017") {
      var cardField = findField(p7, 1);
      if (!cardField) { passthrough(); return; }
      var emptyJson = new TextEncoder().encode("{}");
      var newP7 = replacePayload(p7, 1, emptyJson);
      $done({ body: replacePayload(body, 7, newP7) });
      return;
    }
    if (rpid === "1100001") {
      var p1Field = findField(p7, 1);
      if (!p1Field) { passthrough(); return; }
      var p1 = payloadOf(p7, p1Field);
      var removed = 0;
      var newP1 = p1;
      var sectionList = findField(p1, 11);
      if (sectionList) {
        var filtered = filterFields(payloadOf(p1, sectionList), 5, keepMyPageSection);
        removed += filtered.removed;
        newP1 = replacePayload(newP1, 11, filtered.bytes);
      }
      var circ = filterFields(newP1, 2, function (pl) { return !isCircleEntry(pl); });
      removed += circ.removed;
      newP1 = circ.bytes;
      if (removed === 0) { passthrough(); return; }
      var newP7b = replacePayload(p7, 1, newP1);
      $done({ body: replacePayload(body, 7, newP7b) });
      return;
    }
    if (rpid === "1000002") {
      var r2 = filterAtPath(body, [7, 1, 2], 5, function (item) {
        var id = fieldVarint(item, 1);
        return id !== 3700 && id !== 580 && id !== 200 && id !== 100;
      });
      if (r2.removed === 0) { passthrough(); return; }
      $done({ body: r2.bytes });
      return;
    }
    if (rpid === "1000029") {
      var r9 = filterAtPath(body, [7, 1, 1, 5], 8, function (item) {
        var name = fieldString(item, 3);
        return name !== "瀑布流_特价机票" && name !== "瀑布流_租车卡片" && name !== "瀑布流_今日热议" && name !== "瀑布流_城市攻略";
      });
      if (r9.removed === 0) { passthrough(); return; }
      $done({ body: r9.bytes });
      return;
    }
    passthrough();
  } catch (e) {
    passthrough();
  }
})();
