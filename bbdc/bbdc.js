let body = $response.body;

if (body) {
    try {
        let obj = JSON.parse(body);

        // 定义递归函数，深度遍历修改所有的 VIP 节点
        function modifyVipInfo(node) {
            if (node && typeof node === 'object') {
                for (let key in node) {
                    if (node[key] && typeof node[key] === 'object') {
                        // 如果键名包含 vip，或者对象内包含 expire_date 字段，就判定为特权对象
                        if (key.includes('vip') || node[key].hasOwnProperty('expire_date') || node[key].hasOwnProperty('expire_timestamp')) {
                            
                            // 强制点亮 VIP 状态
                            node[key].type = "vip";
                            // 修改到期时间至 2035 年
                            node[key].expire_date = "2035-12-31";
                            node[key].expire_timestamp = 2082643199000;
                            
                            // 放宽配额限制（如笔记、词单的配额）
                            if (node[key].hasOwnProperty('quota')) {
                                node[key].quota = 999;
                            }
                        }
                        // 继续向下层递归
                        modifyVipInfo(node[key]);
                    }
                }
            }
        }

        // 只有包含 data_body 的标准接口才执行遍历，避免影响无关的普通请求
        if (obj.data_body) {
            modifyVipInfo(obj.data_body);
        }
        
        $done({ body: JSON.stringify(obj) });
    } catch (e) {
        $done({});
    }
} else {
    $done({});
}
