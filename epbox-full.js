const resBody = $response.body;

try {
    let obj = JSON.parse(resBody);

    if (obj?.data?.currentUser) {
        let u = obj.data.currentUser;

        // ---- 强制 SVIP ----
        u.isLifetimeVipMember = false;
        u.isLifetimeSvipMember = true;
        u.isLifetimeVipProMember = true;
        u.isNormalMember = true;

        // ---- 去广告 ----
        u.isNoAdMember = true;
        u.adTag = "SVIP";

        // ---- UI显示 ----
        u.memberType = "SVIP";

        // ---- group权限 ----
        if (u.currentGroup) {
            u.currentGroup.currentUserIsCreator = true;
        }

        // ---- 完整付费订阅字段 ----
        u.paidMemberSubscription = true;
        u.memberSubscriptions = [
            {
                "__typename": "MemberSubscription",
                "memberType": "SVIP",
                "isValid": true,
                "expireTime": "2099-12-31",
                "expireTimeUint": 4102329600,
                "day": 99999,
                "orderSn": null,
                "startTime": "2025-01-01",
                "startTimeUint": 1735689600
            }
        ];

        // ---- 修改今日可打印张数 ----
        u.todayPrintPaperLeftCount = 999;

        // ---- 让所有资源免费 ----
        if (obj.data.libResource) {
            obj.data.libResource.free = true;
        }

        $done({ body: JSON.stringify(obj) });
    } else {
        $done({ body: resBody });
    }
} catch (e) {
    $done({ body: resBody });
}