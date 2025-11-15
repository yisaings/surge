const resBody = $response.body;

try {
    let obj = JSON.parse(resBody);

    if (obj?.data?.currentUser) {
        let u = obj.data.currentUser;

        // ---- 强制 SVIP ----
        u.isLifetimeVipMember = false;
        u.isLifetimeSvipMember = true;
        u.isLifetimeVipProMember = false;
        u.isNormalMember = true;

        // ---- 去广告 ----
        u.isNoAdMember = true;
        u.adTag = "SVIP";

        // 部分界面可能查看这个字段
        u.memberType = "SVIP";

        // 若 UI 判断 group 权限
        if (u.currentGroup) {
            u.currentGroup.currentUserIsCreator = true;
        }

        $done({ body: JSON.stringify(obj) });
    } else {
        $done({ body: resBody });
    }
} catch (e) {
    // 避免因解析失败导致接口出错
    $done({ body: resBody });
}