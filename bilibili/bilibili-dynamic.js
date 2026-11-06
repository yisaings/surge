function readVarint(buf, pos) {
    var result = 0;
    var shift = 0;
    while (pos < buf.length) {
        var b = buf[pos++];
        result |= (b & 0x7f) << shift;
        if ((b & 0x80) === 0) return { value: result, pos: pos };
        shift += 7;
        if (shift > 63) return null;
    }
    return null;
}

function encodeVarint(n) {
    var out = [];
    do {
        var b = n & 0x7f;
        n >>>= 7;
        if (n) out.push(b | 0x80);
        else out.push(b);
    } while (n);
    return out;
}

function parseFields(buf, start, end) {
    var fields = [];
    var pos = start;
    while (pos < end) {
        var fieldStart = pos;
        var k = readVarint(buf, pos);
        if (!k) break;
        var key = k.value;
        pos = k.pos;
        var tagEnd = pos;
        var fno = key >> 3;
        var wt = key & 7;
        if (fno === 0 || (wt !== 0 && wt !== 1 && wt !== 2 && wt !== 5)) break;
        var f = { fno: fno, wt: wt, fieldStart: fieldStart, tagEnd: tagEnd, value: null, valueStart: pos, valueEnd: pos, fieldEnd: pos };
        if (wt === 0) {
            var v = readVarint(buf, pos);
            if (!v) break;
            f.value = v.value;
            pos = v.pos;
            f.valueEnd = pos;
        } else if (wt === 1) {
            if (pos + 8 > end) break;
            pos += 8;
            f.valueEnd = pos;
        } else if (wt === 5) {
            if (pos + 4 > end) break;
            pos += 4;
            f.valueEnd = pos;
        } else {
            var l = readVarint(buf, pos);
            if (!l) break;
            pos = l.pos;
            var len = l.value;
            if (len < 0 || pos + len > end) break;
            f.valueStart = pos;
            pos += len;
            f.valueEnd = pos;
        }
        f.fieldEnd = pos;
        fields.push(f);
    }
    return fields;
}

function hasGoodsModule(buf, itemStart, itemEnd) {
    var fields = parseFields(buf, itemStart, itemEnd);
    for (var i = 0; i < fields.length; i++) {
        var f = fields[i];
        if (f.fno === 3 && f.wt === 2) {
            var mf = parseFields(buf, f.valueStart, f.valueEnd);
            for (var j = 0; j < mf.length; j++) {
                if (mf[j].fno === 1 && mf[j].wt === 0 && mf[j].value === 8) return true;
            }
        }
    }
    return false;
}

function main() {
    var body = $response.body;
    if (!body || typeof body.length !== 'number' || typeof body.subarray !== 'function') return $done({});
    if (body.length < 5) return $done({});
    if (body[0] !== 0) return $done({});
    var msgLen = (body[1] << 24) | (body[2] << 16) | (body[3] << 8) | body[4];
    if (msgLen <= 0 || 5 + msgLen !== body.length) return $done({});
    var msgStart = 5;
    var msgEnd = 5 + msgLen;
    var replyFields = parseFields(body, msgStart, msgEnd);
    if (replyFields.length === 0) return $done({});
    if (replyFields[replyFields.length - 1].fieldEnd !== msgEnd) return $done({});
    var listField = null;
    for (var i = 0; i < replyFields.length; i++) {
        if (replyFields[i].fno === 1 && replyFields[i].wt === 2) { listField = replyFields[i]; break; }
    }
    if (!listField) return $done({});
    var listFields = parseFields(body, listField.valueStart, listField.valueEnd);
    if (listFields.length === 0) return $done({});
    if (listFields[listFields.length - 1].fieldEnd !== listField.valueEnd) return $done({});
    var kept = [];
    var dropped = 0;
    for (var i = 0; i < listFields.length; i++) {
        var f = listFields[i];
        if (f.fno === 1 && f.wt === 2) {
            if (hasGoodsModule(body, f.valueStart, f.valueEnd)) { dropped++; continue; }
        }
        kept.push(f);
    }
    if (dropped === 0) return $done({});
    var listLen = 0;
    for (var i = 0; i < kept.length; i++) listLen += kept[i].fieldEnd - kept[i].fieldStart;
    var newList = new Uint8Array(listLen);
    var p = 0;
    for (var i = 0; i < kept.length; i++) {
        newList.set(body.subarray(kept[i].fieldStart, kept[i].fieldEnd), p);
        p += kept[i].fieldEnd - kept[i].fieldStart;
    }
    var lenBytes = encodeVarint(newList.length);
    var tagLen = listField.tagEnd - listField.fieldStart;
    var newReplyLen = (listField.fieldStart - msgStart) + tagLen + lenBytes.length + newList.length + (msgEnd - listField.fieldEnd);
    var newReply = new Uint8Array(newReplyLen);
    var q = 0;
    newReply.set(body.subarray(msgStart, listField.fieldStart), q);
    q += listField.fieldStart - msgStart;
    newReply.set(body.subarray(listField.fieldStart, listField.tagEnd), q);
    q += tagLen;
    for (var i = 0; i < lenBytes.length; i++) newReply[q++] = lenBytes[i];
    newReply.set(newList, q);
    q += newList.length;
    newReply.set(body.subarray(listField.fieldEnd, msgEnd), q);
    var out = new Uint8Array(5 + newReply.length);
    out[0] = 0;
    out[1] = (newReply.length >>> 24) & 0xff;
    out[2] = (newReply.length >>> 16) & 0xff;
    out[3] = (newReply.length >>> 8) & 0xff;
    out[4] = newReply.length & 0xff;
    out.set(newReply, 5);
    $done({ body: out });
}

main();
