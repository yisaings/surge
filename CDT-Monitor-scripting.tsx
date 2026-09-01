import {
  Widget,
  VStack,
  HStack,
  Text,
  Spacer,
} from 'scripting';

// ==================== 用户配置区 ====================
const BASE_URL = "https://域名.com"; // 面板地址
const API_KEY = "cdt_7DHQNmMUNrRu3F9OCa0S..."; // 替换为你的完整 API Key
// ====================================================

interface AccountItem {
  id?: number;
  account?: string;
  name?: string;
  region?: string;
  region_name?: string;
  instance_status?: string;
  status?: string;
  flow_used?: number;
  used?: number;
  flow_total?: number;
  total?: number;
  percentage?: number;
  threshold?: number;
  monthly_cost?: number;
  cost?: number;
  currency?: string;
}

interface ApiResponse {
  accounts?: AccountItem[];
  system_last_run?: string;
}

const loadData = async (): Promise<ApiResponse | null> => {
  try {
    const url = BASE_URL.trim().replace(/\/+$/, '') + '/api/v1/status';
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY.trim()}`,
        'Content-Type': 'application/json',
      },
    });
    if (!res.ok) return null;
    return (await res.json()) as ApiResponse;
  } catch (e) {
    console.error('Fetch error:', e);
    return null;
  }
};

function WidgetView(props: { data: ApiResponse | null }) {
  const { data } = props;
  const family = String(Widget.family || 'systemMedium').toLowerCase();

  // 1. 无数据兜底
  if (!data || !data.accounts || data.accounts.length === 0) {
    return (
      <VStack
        padding
        background="#1c2029"
        foregroundStyle="#ffffff"
        alignment="center"
        spacing={4}
      >
        <Text font={12} bold foregroundStyle="#ff453a">
          ⚠️ 未能连接到 CDT 实例
        </Text>
        <Text font={10} foregroundStyle="rgba(255, 255, 255, 0.6)">
          请检查 Base URL 与 API Key
        </Text>
      </VStack>
    );
  }

  // 2. 真实字段解析与聚合
  const list = data.accounts.map((item) => {
    const used = parseFloat(String(item.flow_used ?? item.used ?? 0.0));
    const total = parseFloat(String(item.flow_total ?? item.total ?? 200)) || 200;
    const pct = item.percentage !== undefined ? parseFloat(String(item.percentage)) : (total > 0 ? (used / total) * 100 : 0);
    const statusStr = String(item.instance_status ?? item.status ?? 'Running');
    const isRunning = statusStr.toLowerCase().includes('run') || statusStr.includes('运行');

    const rawCost = item.monthly_cost ?? item.cost ?? null;
    let costDisplay = '';
    if (rawCost !== null && rawCost !== undefined) {
      const symbol = (item.currency === 'USD' || !item.currency) ? '$' : '¥';
      costDisplay = `${symbol}${parseFloat(String(rawCost)).toFixed(2)}`;
    }

    return {
      name: item.account ?? item.name ?? '未命名实例',
      region: item.region_name ?? item.region ?? '中国香港',
      status: isRunning ? '运行中' : '未运行',
      isRunning,
      used: used.toFixed(2),
      total,
      pct: pct.toFixed(2),
      cost: costDisplay,
      threshold: item.threshold ?? 95,
    };
  });

  const mainServer = list[0];
  const runningCount = list.filter((i) => i.isRunning).length;
  const totalTrafficNum = list.reduce((acc, cur) => acc + parseFloat(cur.used), 0);
  const formattedTraffic = totalTrafficNum < 1 && totalTrafficNum > 0 ? totalTrafficNum.toFixed(2) : totalTrafficNum.toFixed(1);
  const syncTime = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });

  // 3. 小号组件 (Small)
  if (family.includes('small')) {
    return (
      <VStack
        padding
        background="#1c2029"
        foregroundStyle="#ffffff"
        alignment="leading"
        spacing={4}
      >
        <HStack alignment="center">
          <Text font={11} bold>{mainServer.name}</Text>
          <Spacer />
          <Text font={8} foregroundStyle={mainServer.isRunning ? '#30d158' : '#ff9f0a'}>●</Text>
        </HStack>

        <HStack alignment="center">
          <Text font={9} foregroundStyle="rgba(255, 255, 255, 0.45)">{mainServer.region}</Text>
          <Spacer />
          {mainServer.cost ? (
            <Text font={10} bold foregroundStyle="#ffd60a">{mainServer.cost}</Text>
          ) : null}
        </HStack>

        <Spacer />

        <HStack alignment="bottom">
          <Text font={20} bold>{mainServer.used}</Text>
          <Text font={10} foregroundStyle="rgba(255, 255, 255, 0.45)">{` / ${mainServer.total}G`}</Text>
        </HStack>

        <Spacer />

        <HStack alignment="center">
          <Text font={9} foregroundStyle="rgba(255, 255, 255, 0.6)">{`${mainServer.pct}%`}</Text>
          <Spacer />
          <Text font={9} foregroundStyle="rgba(255, 255, 255, 0.35)">{syncTime}</Text>
        </HStack>
      </VStack>
    );
  }

  // 4. 中号组件 (Medium)
  return (
    <VStack
      padding
      background="#1c2029"
      foregroundStyle="#ffffff"
      alignment="leading"
      spacing={6}
    >
      {/* 顶部标题栏 */}
      <HStack alignment="center">
        <Text font={10} bold foregroundStyle="rgba(255, 255, 255, 0.7)">
          CDT MONITOR
        </Text>
        <Spacer />
        <Text font={9} bold foregroundStyle={mainServer.isRunning ? '#30d158' : '#ff9f0a'}>
          {mainServer.isRunning ? '● 运行中' : '● 未运行'}
        </Text>
      </HStack>

      {/* 统计指标卡 */}
      <HStack
        padding
        background="rgba(255, 255, 255, 0.08)"
        alignment="center"
      >
        <VStack alignment="center" spacing={1}>
          <Text font={8} foregroundStyle="rgba(255, 255, 255, 0.5)">实例 (总/运)</Text>
          <Text font={11} bold>{`${list.length}/${runningCount}`}</Text>
        </VStack>
        <Spacer />
        <VStack alignment="center" spacing={1}>
          <Text font={8} foregroundStyle="rgba(255, 255, 255, 0.5)">累计流量</Text>
          <Text font={11} bold>{`${formattedTraffic} GB`}</Text>
        </VStack>
        <Spacer />
        <VStack alignment="center" spacing={1}>
          <Text font={8} foregroundStyle="rgba(255, 255, 255, 0.5)">阈值告警</Text>
          <Text font={11} bold>0 项</Text>
        </VStack>
      </HStack>

      {/* 实例详细卡 */}
      <VStack
        padding
        background="rgba(255, 255, 255, 0.08)"
        spacing={3}
      >
        <HStack alignment="center">
          <Text font={10} bold>{mainServer.name}</Text>
          <Text font={8} foregroundStyle="rgba(255, 255, 255, 0.45)">{` · ${mainServer.region}`}</Text>
          <Spacer />
          {mainServer.cost ? (
            <Text font={8} bold foregroundStyle="#ffd60a">{`本月 ${mainServer.cost}`}</Text>
          ) : null}
        </HStack>

        <HStack alignment="bottom">
          <Text font={15} bold>{mainServer.used}</Text>
          <Text font={9} foregroundStyle="rgba(255, 255, 255, 0.45)">{` / ${mainServer.total} GB`}</Text>
        </HStack>

        <HStack alignment="center">
          <Text font={8} foregroundStyle="rgba(255, 255, 255, 0.6)">{`${mainServer.pct}% 已使用`}</Text>
          <Spacer />
          <Text font={8} foregroundStyle="rgba(255, 255, 255, 0.35)">同步 {syncTime}</Text>
          <Spacer />
          <Text font={8} foregroundStyle="rgba(255, 255, 255, 0.35)">阈值 95%</Text>
        </HStack>
      </VStack>
    </VStack>
  );
}

// 统一执行入口
loadData().then((data) => {
  Widget.present(<WidgetView data={data} />);
});
