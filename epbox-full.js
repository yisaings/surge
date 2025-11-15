/*
 * EPBox / 功夫豆 全功能解锁
 * Author: yisaings + ChatGPT
 * Version: 2025
 */

function patchUser(u) {
    if (!u) return;

    u.isLifetimeVipMember = true;
    u.isLifetimeSvipMember = true;
    u.isLifetimeMember = true;
    u.isLifetimeVipProMember = true;
    u.isNormalMember = true;
    u.isNoAdMember = true;

    u.memberType = "SVIP";
    u.adTag = "SVIP";
    u.vipLevel = 3;

    if (u.currentGroup) {
        u.currentGroup.currentUserIsCreator = true;
    }

    u.privilege = {
        vip: true,
        svip: true,
        pro: true,
        lifetime: true,
        noAd: true,
        unlimited: true,
        ocrUnlimited: true,
        storageUnlimited: true,
        advancedTools: true
    };

    u.storage = {
        total: 1024 * 1024 * 1024 * 1024,
        used: 0,
        free: 1024 * 1024 * 1024 * 1024
    };

    u.limits = {
        ocr: { used: 0, total: 999999 },
        pdf: { used: 0, total: 999999 },
        convert: { used: 0, total: 999999 },
        ai: { used: 0, total: 999999 }
    };

    u.currentToken = u.currentToken || "FAKE_SVIP_TOKEN_2099";
    u.kidToken = u.kidToken || "FAKE_KID_TOKEN_2099";
}

function patchKid(k) {
    if (!k) return;
    k.normalMember = true;
    k.lifetimeVipProMember = true;
    k.privilege = {
        vip: true,
        svip: true,
        pro: true,
        unlimited: true
    };
}

function deepPatch(obj) {
    if (!obj || typeof obj !== "object") return;

    for (let key in obj) {
        let v = obj[key];

        if (v?.__typename === "User") patchUser(v);
        if (v?.__typename === "Kid") patchKid(v);

        if (Array.isArray(v)) {
            v.forEach(item => {
                if (item?.__typename === "User") patchUser(item);
                if (item?.__typename === "Kid") patchKid(item);
            });
        }

        if (typeof v === "object") deepPatch(v);
    }
}

try {
    let body = JSON.parse($response.body);
    deepPatch(body.data);
    $done({ body: JSON.stringify(body) });
} catch (e) {
    console.log("EPBOX ERROR:", e);
    $done($response);
}