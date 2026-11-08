/*
 * 网易云音乐自用精简脚本 (完整独立单文件版)
 * 包含：Gzip解压 + AES-128-ECB加解密 + 首页/Tab/弹窗净化逻辑
 */

// ==================== 1. Gzip (Inflate) 解压缩引擎 ====================
const Zlib = (() => {
  const Z_OK = 0, Z_STREAM_END = 1, Z_NEED_DICT = 2, Z_STREAM_ERROR = -2, Z_DATA_ERROR = -3, Z_MEM_ERROR = -4, Z_BUF_ERROR = -5;
  const lbase = new Uint16Array([3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258,0,0]);
  const lext = new Uint8Array([16,16,16,16,16,16,16,16,17,17,17,17,18,18,18,18,19,19,19,19,20,20,20,20,21,21,21,21,16,72,78]);
  const dbase = new Uint16Array([1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577,0,0]);
  const dext = new Uint8Array([16,16,16,16,17,17,18,18,19,19,20,20,21,21,22,22,23,23,24,24,25,25,26,26,27,27,28,28,29,29,64,64]);
  const order = new Uint8Array([16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15]);

  function inflate_table(type, lens, lens_index, codes, table, table_index, work, opts) {
    const bits = opts.bits;
    let len = 0, sym = 0, min = 0, max = 0, root = 0, curr = 0, drop = 0, left = 0, used = 0, huff = 0, incr = 0, fill = 0, low = 0, mask = 0, next = 0;
    let base = null, extra = null, match = 0;
    const count = new Uint16Array(16), offs = new Uint16Array(16);
    for (len = 0; len <= 15; len++) count[len] = 0;
    for (sym = 0; sym < codes; sym++) count[lens[lens_index + sym]]++;
    root = bits;
    for (max = 15; max >= 1 && count[max] === 0; max--);
    if (root > max) root = max;
    if (max === 0) { table[table_index++] = (1 << 24) | (64 << 16) | 0; table[table_index++] = (1 << 24) | (64 << 16) | 0; opts.bits = 1; return 0; }
    for (min = 1; min < max && count[min] === 0; min++);
    if (root < min) root = min;
    left = 1;
    for (len = 1; len <= 15; len++) { left <<= 1; left -= count[len]; if (left < 0) return -1; }
    if (left > 0 && (type === 0 || max !== 1)) return -1;
    offs[1] = 0;
    for (len = 1; len < 15; len++) offs[len + 1] = offs[len] + count[len];
    for (sym = 0; sym < codes; sym++) if (lens[lens_index + sym] !== 0) work[offs[lens[lens_index + sym]]++] = sym;
    if (type === 0) { base = extra = work; match = 20; }
    else if (type === 1) { base = lbase; extra = lext; match = 257; }
    else { base = dbase; extra = dext; match = 0; }
    huff = 0; sym = 0; len = min; next = table_index; curr = root; drop = 0; low = -1; used = 1 << root; mask = used - 1;
    if ((type === 1 && used > 852) || (type === 2 && used > 592)) return 1;
    for (;;) {
      let here_bits = len - drop, here_op = 0, here_val = 0;
      if (work[sym] + 1 < match) { here_op = 0; here_val = work[sym]; }
      else if (work[sym] >= match) { here_op = extra[work[sym] - match]; here_val = base[work[sym] - match]; }
      else { here_op = 96; here_val = 0; }
      incr = 1 << (len - drop); fill = 1 << curr; min = fill;
      do { fill -= incr; table[next + (huff >> drop) + fill] = (here_bits << 24) | (here_op << 16) | here_val; } while (fill !== 0);
      incr = 1 << (len - 1);
      while (huff & incr) incr >>= 1;
      if (incr !== 0) { huff &= incr - 1; huff += incr; } else huff = 0;
      sym++;
      if (--count[len] === 0) { if (len === max) break; len = lens[lens_index + work[sym]]; }
      if (len > root && (huff & mask) !== low) {
        if (drop === 0) drop = root;
        next += min; curr = len - drop; left = 1 << curr;
        while (curr + drop < max) { left -= count[curr + drop]; if (left <= 0) break; curr++; left <<= 1; }
        used += 1 << curr;
        if ((type === 1 && used > 852) || (type === 2 && used > 592)) return 1;
        low = huff & mask;
        table[low] = (root << 24) | (curr << 16) | (next - table_index);
      }
    }
    if (huff !== 0) table[next + huff] = ((len - drop) << 24) | (64 << 16) | 0;
    opts.bits = root;
    return 0;
  }

  let fixed_tl = null, fixed_td = null;
  function getFixedTables(lens, work) {
    if (!fixed_tl) {
      fixed_tl = new Int32Array(512); fixed_td = new Int32Array(32);
      let i = 0;
      while (i < 144) lens[i++] = 8;
      while (i < 256) lens[i++] = 9;
      while (i < 280) lens[i++] = 7;
      while (i < 288) lens[i++] = 8;
      inflate_table(1, lens, 0, 288, fixed_tl, 0, work, { bits: 9 });
      for (i = 0; i < 32; i++) lens[i] = 5;
      inflate_table(2, lens, 0, 32, fixed_td, 0, work, { bits: 5 });
    }
    return { lencode: fixed_tl, lenbits: 9, distcode: fixed_td, distbits: 5 };
  }

  function ungzip(input) {
    let pos = 0;
    if (input.length >= 10 && input[0] === 0x1f && input[1] === 0x8b) {
      const flg = input[3]; pos = 10;
      if (flg & 4) { const xlen = input[pos] | (input[pos + 1] << 8); pos += 2 + xlen; }
      if (flg & 8) { while (pos < input.length && input[pos++] !== 0); }
      if (flg & 16) { while (pos < input.length && input[pos++] !== 0); }
      if (flg & 2) pos += 2;
    } else if (input.length >= 2 && input[0] === 0x78 && (((input[0] << 8) | input[1]) % 31 === 0)) {
      pos = 2;
    } else {
      return input;
    }

    let out = new Uint8Array(Math.max(input.length * 3, 32768)), outPos = 0;
    const ensureOut = (need) => {
      if (outPos + need > out.length) {
        const next = new Uint8Array(Math.max(out.length * 2, outPos + need));
        next.set(out); out = next;
      }
    };

    let hold = 0, bits = 0;
    const NEEDBITS = (n) => { while (bits < n && pos < input.length) { hold += input[pos++] << bits; bits += 8; } };
    const DROPBITS = (n) => { hold >>>= n; bits -= n; };
    const lens = new Uint16Array(320), work = new Uint16Array(288);
    const lendyn = new Int32Array(852), distdyn = new Int32Array(592);

    let last = 0;
    while (!last) {
      NEEDBITS(3);
      last = hold & 1; DROPBITS(1);
      const type = hold & 3; DROPBITS(2);
      if (type === 0) {
        hold >>>= (bits & 7); bits -= (bits & 7);
        NEEDBITS(32);
        const len = hold & 0xffff; DROPBITS(32);
        ensureOut(len);
        out.set(input.subarray(pos, pos + len), outPos);
        pos += len; outPos += len;
      } else if (type === 1 || type === 2) {
        let lencode, lenbits, distcode, distbits;
        if (type === 1) {
          const fixed = getFixedTables(lens, work);
          lencode = fixed.lencode; lenbits = fixed.lenbits; distcode = fixed.distcode; distbits = fixed.distbits;
        } else {
          NEEDBITS(14);
          const nlen = 257 + (hold & 31); DROPBITS(5);
          const ndist = 1 + (hold & 31); DROPBITS(5);
          const ncode = 4 + (hold & 15); DROPBITS(4);
          let have = 0;
          while (have < ncode) { NEEDBITS(3); lens[order[have++]] = hold & 7; DROPBITS(3); }
          while (have < 19) lens[order[have++]] = 0;
          let opts = { bits: 7 };
          if (inflate_table(0, lens, 0, 19, lendyn, 0, work, opts) !== 0) throw new Error("inflate code table err");
          lenbits = opts.bits; have = 0;
          while (have < nlen + ndist) {
            let here, hbits, hop, hval;
            for (;;) {
              here = lendyn[hold & ((1 << lenbits) - 1)];
              hbits = here >>> 24; hop = (here >>> 16) & 255; hval = here & 65535;
              if (hbits <= bits) break;
              NEEDBITS(hbits);
            }
            if (hval < 16) { DROPBITS(hbits); lens[have++] = hval; }
            else {
              let copy = 0, sym = 0;
              if (hval === 16) { NEEDBITS(hbits + 2); DROPBITS(hbits); sym = lens[have - 1]; copy = 3 + (hold & 3); DROPBITS(2); }
              else if (hval === 17) { NEEDBITS(hbits + 3); DROPBITS(hbits); sym = 0; copy = 3 + (hold & 7); DROPBITS(3); }
              else { NEEDBITS(hbits + 7); DROPBITS(hbits); sym = 0; copy = 11 + (hold & 127); DROPBITS(7); }
              while (copy--) lens[have++] = sym;
            }
          }
          opts = { bits: 9 };
          if (inflate_table(1, lens, 0, nlen, lendyn, 0, work, opts) !== 0) throw new Error("inflate lit table err");
          lenbits = opts.bits; opts = { bits: 6 };
          if (inflate_table(2, lens, nlen, ndist, distdyn, 0, work, opts) !== 0) throw new Error("inflate dist table err");
          distbits = opts.bits; lencode = lendyn; distcode = distdyn;
        }

        for (;;) {
          let here, hbits, hop, hval;
          for (;;) {
            here = lencode[hold & ((1 << lenbits) - 1)];
            hbits = here >>> 24; hop = (here >>> 16) & 255; hval = here & 65535;
            if (hbits <= bits) break;
            NEEDBITS(hbits);
          }
          if (hop && (hop & 240) === 0) {
            const pbits = hbits, pop = hop, pval = hval;
            for (;;) {
              here = lencode[pval + ((hold & ((1 << (pbits + pop)) - 1)) >>> pbits)];
              hbits = here >>> 24; hop = (here >>> 16) & 255; hval = here & 65535;
              if (pbits + hbits <= bits) break;
              NEEDBITS(pbits + hbits);
            }
            DROPBITS(pbits);
          }
          DROPBITS(hbits);
          if (hop === 0) { ensureOut(1); out[outPos++] = hval; }
          else if (hop & 32) break;
          else {
            let length = hval;
            const extra = hop & 15;
            if (extra) { NEEDBITS(extra); length += hold & ((1 << extra) - 1); DROPBITS(extra); }
            for (;;) {
              here = distcode[hold & ((1 << distbits) - 1)];
              hbits = here >>> 24; hop = (here >>> 16) & 255; hval = here & 65535;
              if (hbits <= bits) break;
              NEEDBITS(hbits);
            }
            if ((hop & 240) === 0) {
              const pbits = hbits, pop = hop, pval = hval;
              for (;;) {
                here = distcode[pval + ((hold & ((1 << (pbits + pop)) - 1)) >>> pbits)];
                hbits = here >>> 24; hop = (here >>> 16) & 255; hval = here & 65535;
                if (pbits + hbits <= bits) break;
                NEEDBITS(pbits + hbits);
              }
              DROPBITS(pbits);
            }
            DROPBITS(hbits);
            let offset = hval;
            const dextra = hop & 15;
            if (dextra) { NEEDBITS(dextra); offset += hold & ((1 << dextra) - 1); DROPBITS(dextra); }
            ensureOut(length);
            let from = outPos - offset;
            while (length--) out[outPos++] = out[from++];
          }
        }
      } else {
        throw new Error("invalid inflate block");
      }
    }
    return out.subarray(0, outPos);
  }
  return { ungzip };
})();

// ==================== 2. AES-128-ECB 加解密引擎 ====================
const AES = (() => {
  const Sbox = new Uint8Array([
    99,124,119,123,242,107,111,197,48,1,103,43,254,215,171,118,202,130,201,125,250,89,71,240,173,212,162,175,156,164,114,192,
    183,253,147,38,54,63,247,204,52,165,229,241,113,216,49,21,4,199,35,195,24,150,5,154,7,18,128,226,235,39,178,117,
    9,131,44,26,27,110,90,160,82,59,214,179,41,227,47,132,83,209,0,237,32,252,177,91,106,203,190,57,74,76,88,207,
    208,239,170,251,67,77,51,133,69,249,2,127,80,60,159,168,81,163,64,143,146,157,56,245,188,182,218,33,16,255,243,210,
    205,12,19,236,95,151,68,23,196,167,126,61,100,93,25,115,96,129,79,220,34,42,144,136,70,238,184,20,222,94,11,219,
    224,50,58,10,73,6,36,92,194,211,172,98,145,149,228,121,231,200,55,109,141,213,78,169,108,86,244,234,101,122,174,8,
    186,120,37,46,28,166,180,198,232,221,116,31,75,189,139,138,112,62,181,102,72,3,246,14,97,53,87,185,134,193,29,158,
    225,248,152,17,105,217,142,148,155,30,135,233,206,85,40,223,140,161,137,13,191,230,66,104,65,153,45,15,176,84,187,22
  ]);
  const InvSbox = new Uint8Array(256);
  for (let i = 0; i < 256; i++) InvSbox[Sbox[i]] = i;
  const Rcon = [0, 1, 2, 4, 8, 16, 32, 64, 128, 27, 54];

  function keyExpansion(key) {
    const w = new Uint32Array(44);
    for (let i = 0; i < 4; i++) w[i] = (key[4 * i] << 24) | (key[4 * i + 1] << 16) | (key[4 * i + 2] << 8) | key[4 * i + 3];
    for (let i = 4; i < 44; i++) {
      let temp = w[i - 1];
      if (i % 4 === 0) {
        temp = (temp << 8) | (temp >>> 24);
        temp = ((Sbox[(temp >>> 24) & 0xff] << 24) | (Sbox[(temp >>> 16) & 0xff] << 16) | (Sbox[(temp >>> 8) & 0xff] << 8) | Sbox[temp & 0xff]) ^ (Rcon[i / 4] << 24);
      }
      w[i] = (w[i - 4] ^ temp) >>> 0;
    }
    return w;
  }

  function shiftRows(s) {
    let t = s[1]; s[1] = s[5]; s[5] = s[9]; s[9] = s[13]; s[13] = t;
    t = s[2]; s[2] = s[10]; s[10] = t; t = s[6]; s[6] = s[14]; s[14] = t;
    t = s[15]; s[15] = s[11]; s[11] = s[7]; s[7] = s[3]; s[3] = t;
  }
  function invShiftRows(s) {
    let t = s[13]; s[13] = s[9]; s[9] = s[5]; s[5] = s[1]; s[1] = t;
    t = s[2]; s[2] = s[10]; s[10] = t; t = s[6]; s[6] = s[14]; s[14] = t;
    t = s[3]; s[3] = s[7]; s[7] = s[11]; s[11] = s[15]; s[15] = t;
  }
  const xtime = a => ((a << 1) ^ (((a >> 7) & 1) * 0x1b)) & 0xff;
  function mixColumns(s) {
    for (let c = 0; c < 4; c++) {
      const i = c * 4, a = s[i], b = s[i + 1], d = s[i + 2], e = s[i + 3], h = a ^ b ^ d ^ e;
      s[i] ^= h ^ xtime(a ^ b); s[i + 1] ^= h ^ xtime(b ^ d); s[i + 2] ^= h ^ xtime(d ^ e); s[i + 3] ^= h ^ xtime(e ^ a);
    }
  }
  function mul(a, b) {
    let p = 0;
    for (let c = 0; c < 8; c++) { if (b & 1) p ^= a; const hi = a & 0x80; a = (a << 1) & 0xff; if (hi) a ^= 0x1b; b >>= 1; }
    return p;
  }
  function invMixColumns(s) {
    for (let c = 0; c < 4; c++) {
      const i = c * 4, a = s[i], b = s[i + 1], d = s[i + 2], e = s[i + 3];
      s[i] = mul(a, 14) ^ mul(b, 11) ^ mul(d, 13) ^ mul(e, 9);
      s[i + 1] = mul(a, 9) ^ mul(b, 14) ^ mul(d, 11) ^ mul(e, 13);
      s[i + 2] = mul(a, 13) ^ mul(b, 9) ^ mul(d, 14) ^ mul(e, 11);
      s[i + 3] = mul(a, 11) ^ mul(b, 13) ^ mul(d, 9) ^ mul(e, 14);
    }
  }
  function addRoundKey(s, w, r) {
    for (let c = 0; c < 4; c++) {
      const k = w[r * 4 + c];
      s[c * 4] ^= (k >>> 24) & 0xff; s[c * 4 + 1] ^= (k >>> 16) & 0xff; s[c * 4 + 2] ^= (k >>> 8) & 0xff; s[c * 4 + 3] ^= k & 0xff;
    }
  }
  function encryptBlock(block, w) {
    const s = new Uint8Array(block);
    addRoundKey(s, w, 0);
    for (let r = 1; r < 10; r++) { for (let i = 0; i < 16; i++) s[i] = Sbox[s[i]]; shiftRows(s); mixColumns(s); addRoundKey(s, w, r); }
    for (let i = 0; i < 16; i++) s[i] = Sbox[s[i]]; shiftRows(s); addRoundKey(s, w, 10);
    return s;
  }
  function decryptBlock(block, w) {
    const s = new Uint8Array(block);
    addRoundKey(s, w, 10);
    for (let r = 9; r >= 1; r--) { invShiftRows(s); for (let i = 0; i < 16; i++) s[i] = InvSbox[s[i]]; addRoundKey(s, w, r); invMixColumns(s); }
    invShiftRows(s); for (let i = 0; i < 16; i++) s[i] = InvSbox[s[i]]; addRoundKey(s, w, 0);
    return s;
  }

  return {
    decrypt(ciphertext, keyBytes) {
      const w = keyExpansion(keyBytes);
      const res = new Uint8Array(ciphertext.length);
      for (let i = 0; i < ciphertext.length; i += 16) res.set(decryptBlock(ciphertext.subarray(i, i + 16), w), i);
      const pad = res[res.length - 1];
      return pad > 0 && pad <= 16 ? res.subarray(0, res.length - pad) : res;
    },
    encrypt(plaintext, keyBytes) {
      const w = keyExpansion(keyBytes);
      const pad = 16 - (plaintext.length % 16);
      const padded = new Uint8Array(plaintext.length + pad);
      padded.set(plaintext, 0); padded.fill(pad, plaintext.length);
      const res = new Uint8Array(padded.length);
      for (let i = 0; i < padded.length; i += 16) res.set(encryptBlock(padded.subarray(i, i + 16), w), i);
      return res;
    }
  };
})();

// ==================== 3. 网易云 EAPI 自动解包与打包 ====================
const EAPI_KEY = new TextEncoder().encode("e82ckenh8dichen8");
const isGzip = b => b && b.length >= 2 && b[0] === 0x1f && b[1] === 0x8b;

function decodeBody(raw) {
  let bytes;
  if (raw instanceof Uint8Array) bytes = raw;
  else if (raw instanceof ArrayBuffer) bytes = new Uint8Array(raw);
  else if (typeof raw === "string") {
    bytes = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i) & 0xff;
  } else return null;

  if (!bytes.length) return null;
  if (isGzip(bytes)) {
    try { bytes = Zlib.ungzip(bytes); } catch (e) {}
  }
  try {
    let dec = AES.decrypt(bytes, EAPI_KEY);
    if (isGzip(dec)) dec = Zlib.ungzip(dec);
    const str = new TextDecoder("utf-8").decode(dec);
    return JSON.parse(str);
  } catch (e) {
    try {
      return JSON.parse(new TextDecoder("utf-8").decode(bytes));
    } catch (e2) {
      return null;
    }
  }
}

function encodeBody(obj) {
  const plainBytes = new TextEncoder().encode(JSON.stringify(obj));
  return AES.encrypt(plainBytes, EAPI_KEY);
}

// ==================== 4. 你的专属页面净化逻辑 ====================
(() => {
  const rawBody = $response.body;
  if (!rawBody || !rawBody.length) return $done({});

  const obj = decodeBody(rawBody);
  if (!obj) {
    console.log("[网易云自用脚本] 解密失败或非JSON，原样放行: " + $request.url);
    return $done({});
  }

  const url = $request.url;

  try {
    if (url.includes("/link/home/framework/top/tab")) {
      if (obj.data && Array.isArray(obj.data.commonResourceList)) {
        const blackNames = ["播客", "听书", "免费听"];
        const blackCodes = ["podcast", "vBook", "freeListen"];
        obj.data.commonResourceList = obj.data.commonResourceList.filter(item => {
          if (blackNames.includes(item.title)) return false;
          if (blackCodes.includes(item.resCode)) return false;
          if (item.trp_type === "musicTopTabIntervene") return false;
          return true;
        });
      }
      if (obj.data && obj.data.adminList) {
        obj.data.adminList = [];
      }
    }

    if (url.endsWith("/link/home/framework/tab") || url.includes("/link/home/framework/tab?")) {
      if (obj.data && Array.isArray(obj.data.commonResourceList)) {
        const bottomBlackNames = ["关注", "漫游", "笔记", "发现", "动态"];
        obj.data.commonResourceList = obj.data.commonResourceList.filter(item => {
          return !bottomBlackNames.includes(item.title);
        });
      }
    }

    if (url.includes("/homepage/block/page") || url.includes("/page/rcmd/") || url.includes("/page/discovery/") || url.includes("/recommend/resource")) {
      const filterBlock = (block) => {
        const showType = block.showType || "";
        const bizCode = block.bizCode || block.blockCode || "";
        if (showType === "BANNER" || bizCode.includes("BANNER")) return false;
        if (showType.includes("AD") || bizCode.includes("AD")) return false;
        const blockStr = JSON.stringify(block);
        if (
          blockStr.includes("云贝免费领") ||
          blockStr.includes("运营推广") ||
          blockStr.includes("免费听歌还剩") ||
          blockStr.includes("畅听免费续") ||
          blockStr.includes("免费听歌模式")
        ) {
          return false;
        }
        return true;
      };

      if (obj.data && Array.isArray(obj.data.blocks)) {
        obj.data.blocks = obj.data.blocks.filter(filterBlock);
      } else if (Array.isArray(obj.data)) {
        obj.data = obj.data.filter(filterBlock);
      }

      if (obj.data && typeof obj.data.blockCodeOrderList === "string") {
        try {
          const list = JSON.parse(obj.data.blockCodeOrderList).filter(x => !x.includes("BANNER") && !x.includes("AD"));
          obj.data.blockCodeOrderList = JSON.stringify(list);
        } catch (e) {}
      }
    }

    if (url.includes("/sp/flow/popup/") || url.includes("/vipactivity/") || url.includes("/position/show/")) {
      if (obj.data) obj.data = {};
    }

    if (url.includes("/batch")) {
      for (const key of Object.keys(obj)) {
        if (key.includes("/ad/") || key.includes("popup") || key.includes("inserted") || key.includes("crossPlatformResource")) {
          if (obj[key] && obj[key].data) obj[key].data = {};
        }
      }
    }

    $done({ body: encodeBody(obj) });
  } catch (err) {
    console.log("[网易云自用脚本] 处理出错: " + err);
    $done({});
  }
})();
