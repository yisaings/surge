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
  var EMPTY = new Uint8Array(0);
  try {
    var url = req.url || "";
    var topF2 = findField(body, 2);
    if (!topF2) { passthrough(); return; }
    var f2 = payloadOf(body, topF2);
    if (url.indexOf("excellent/personalized") !== -1) {
      if (!findField(f2, 9)) { passthrough(); return; }
      var newF2 = replacePayload(f2, 9, EMPTY);
      $done({ body: replacePayload(body, 2, newF2) });
      return;
    }
    if (url.indexOf("frs/page") !== -1) {
      var midField = findField(f2, 2);
      if (!midField) { passthrough(); return; }
      var mid = payloadOf(f2, midField);
      if (!findField(mid, 33)) { passthrough(); return; }
      var newMid = replacePayload(mid, 33, EMPTY);
      var newF2b = replacePayload(f2, 2, newMid);
      $done({ body: replacePayload(body, 2, newF2b) });
      return;
    }
    passthrough();
  } catch (e) {
    passthrough();
  }
})();
