import {
  Widget,
  VStack,
  HStack,
  Text,
  Spacer,
} from 'scripting';

// ==================== 用户配置区 ====================
const BASE_URL = "https://cdt.yisaw.com"; // 面板地址
const API_KEY = "cdt_7DHQnnMUNrRu3F9OCa0SJty0VyqU4GDI7d70jfsjiXU"; // 你的完整 API Key
// ====================================================

interface AccountItem {
  id?: number;
  account?: string;
  name?: string;
  region?: string;
  region_name?: string;
  instance_status?: string;
  status?: string;
  flow_used?: number | string;
  used?: number | string;
  flow_total?: number | string;
  total?: number | string;
  percentage?: number | string;
  threshold?: number | string;
  monthly_cost?: number | string;
  cost?: number | string;
  currency?: string;
}

interface ApiResponse {
  accounts?: AccountItem[];
  system_last_run?: string;
}

interface ParsedAccount {
  name: string;
  region: string;
  status: string;
  isRunning: boolean;
  used: string;
  total: number;
  pct: string;
  pctNum: number;
  cost: string;
  threshold: number;
}

type HexColor = `#${string}`;
type DynamicColor = { light: HexColor; dark: HexColor };

// 原生深浅色动态配色表
const theme = {
  bg: { light: '#f2f2f7', dark: '#111318' } as DynamicColor,
  card: { light: '#ffffff', dark: '#1c2029' } as DynamicColor,
  primary: { light: '#000000', dark: '#ffffff' } as DynamicColor,
  secondary: { light: '#3c3c43', dark: '#ffffffb3' } as DynamicColor,
  tertiary: { light: '#3c3c4399', dark: '#ffffff80' } as DynamicColor,
  muted: { light: '#8e8e93', dark: '#ffffff66' } as DynamicColor,
  faint: { light: '#aeaeb2', dark: '#ffffff40' } as DynamicColor,
  cost: { light: '#b45309', dark: '#ffd60a' } as DynamicColor,
  progressBg: { light: '#e5e5ea', dark: '#2c303c' } as DynamicColor,
  progressBar: { light: '#007aff', dark: '#0a84ff' } as DynamicColor,
  progressWarn: '#ff453a' as HexColor,
  badgeRunBg: { light: '#34c75920', dark: '#30d15826' } as DynamicColor,
  badgeRunText: { light: '#248a3d', dark: '#30d158' } as DynamicColor,
  badgeWarnBg: { light: '#ff950020', dark: '#ff9f0a26' } as DynamicColor,
  badgeWarnText: { light: '#c93400', dark: '#ff9f0a' } as DynamicColor,
};

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

// 进度条组件
function ProgressBar({ pct, width = 285, height = 3.5 }: { pct: number; width?: number; height?: number }) {
  const clamped = Math.max(0, Math.min(100, pct));
  const fillWidth = clamped > 0 ? Math.max(3, Math.min(width, (clamped / 100) * width)) : 0;
  const barColor = clamped >= 90 ? theme.progressWarn : theme.progressBar;

  return (
    <HStack
      frame={{ height, width }}
      background={theme.progressBg}
      alignment="center"
      spacing={0}
    >
      {fillWidth > 0 && (
        <HStack
          frame={{ height, width: fillWidth }}
          background={barColor}
        />
      )}
      <Spacer />
    </HStack>
  );
}

// 顶部标题栏
function HeaderBar({
  isAllRun,
  runningCount,
  totalCount,
}: {
  isAllRun: boolean;
  runningCount: number;
  totalCount: number;
}) {
  return (
    <HStack alignment="center">
      <Text font={10} bold foregroundStyle={theme.secondary}>
        CDT MONITOR
      </Text>
      <Spacer />
      <HStack
        padding={{ vertical: 2, horizontal: 6 }}
        background={isAllRun ? theme.badgeRunBg : theme.badgeWarnBg}
        alignment="center"
        spacing={3}
      >
        <Text font={6} foregroundStyle={isAllRun ? theme.badgeRunText : theme.badgeWarnText}>●</Text>
        <Text font={8} bold foregroundStyle={isAllRun ? theme.badgeRunText : theme.badgeWarnText}>
          {isAllRun ? '全部运行' : `${runningCount}/${totalCount} 运行`}
        </Text>
      </HStack>
    </HStack>
  );
}

// 统计指示卡
function StatsCard({
  totalInstances,
  runningInstances,
  totalTraffic,
  alerts,
  padding = { vertical: 4.5, horizontal: 10 },
}: {
  totalInstances: number;
  runningInstances: number;
  totalTraffic: string;
  alerts: number;
  padding?: { vertical: number; horizontal: number };
}) {
  const alertColor = alerts > 0 ? ({ light: '#ff3b30', dark: '#ff453a' } as DynamicColor) : theme.primary;

  return (
    <HStack
      padding={padding}
      background={theme.card}
      alignment="center"
    >
      <VStack alignment="center" spacing={1}>
        <Text font={7} foregroundStyle={theme.muted}>实例 (总/运)</Text>
        <Text font={10.5} bold foregroundStyle={theme.primary}>{`${totalInstances}/${runningInstances}`}</Text>
      </VStack>
      <Spacer />
      <VStack alignment="center" spacing={1}>
        <Text font={7} foregroundStyle={theme.muted}>累计流量</Text>
        <Text font={10.5} bold foregroundStyle={theme.primary}>{`${totalTraffic} GB`}</Text>
      </VStack>
      <Spacer />
      <VStack alignment="center" spacing={1}>
        <Text font={7} foregroundStyle={theme.muted}>阈值告警</Text>
        <Text font={10.5} bold foregroundStyle={alertColor}>{`${alerts} 项`}</Text>
      </VStack>
    </HStack>
  );
}

// 通栏全宽卡片
function FullCard({
  item,
  syncTime,
  barWidth = 285,
  compact = false,
}: {
  item: ParsedAccount;
  syncTime: string;
  barWidth?: number;
  compact?: boolean;
}) {
  return (
    <VStack
      padding={{ vertical: compact ? 4 : 6, horizontal: 9 }}
      background={theme.card}
      alignment="leading"
      spacing={compact ? 2 : 3}
    >
      <HStack alignment="center">
        <Text font={10} bold foregroundStyle={theme.primary} lineLimit={1}>{item.name}</Text>
        {item.region ? (
          <Text font={7.5} foregroundStyle={theme.muted}>{` · ${item.region}`}</Text>
        ) : null}
        <Spacer />
        <Text font={6} foregroundStyle={item.isRunning ? theme.badgeRunText : theme.badgeWarnText}>● </Text>
        {item.cost ? (
          <Text font={8.5} bold foregroundStyle={theme.cost}>{`本月 ${item.cost}`}</Text>
        ) : (
          <Text font={7.5} foregroundStyle={item.isRunning ? theme.badgeRunText : theme.badgeWarnText}>{item.status}</Text>
        )}
      </HStack>

      <HStack alignment="bottom">
        <Text font={compact ? 13.5 : 14.5} bold foregroundStyle={theme.primary}>{item.used}</Text>
        <Text font={8.5} foregroundStyle={theme.muted}>{` / ${item.total} GB`}</Text>
        <Spacer />
        <Text font={8.5} bold foregroundStyle={theme.secondary}>{`${item.pct}%`}</Text>
      </HStack>

      <ProgressBar pct={item.pctNum} width={barWidth} />

      <HStack alignment="center">
        <Text font={7} foregroundStyle={theme.muted}>{`${item.pct}% 已使用`}</Text>
        <Spacer />
        <Text font={7} foregroundStyle={theme.faint}>{`同步 ${syncTime}`}</Text>
        <Spacer />
        <Text font={7} foregroundStyle={theme.faint}>{`阈值 ${item.threshold}%`}</Text>
      </HStack>
    </VStack>
  );
}

// 并排网格卡片（支持 4 台机器饱满卡片 与 3 列超宽紧凑卡片）
function GridCard({
  item,
  syncTime,
  barWidth = 126,
  padding = { vertical: 5, horizontal: 8 },
  isFourGrid = false,
  isThreeCol = false,
}: {
  item: ParsedAccount;
  syncTime: string;
  barWidth?: number;
  padding?: { vertical: number; horizontal: number };
  isFourGrid?: boolean;
  isThreeCol?: boolean;
}) {
  const pV = isFourGrid ? 13 : padding.vertical;
  const pH = isFourGrid ? 10 : padding.horizontal;
  const numFont = isFourGrid ? 17.5 : (isThreeCol ? 12 : 13);
  const nameFont = isFourGrid ? 11 : (isThreeCol ? 9 : 10);
  const barH = isFourGrid ? 4 : 3;

  return (
    <VStack
      padding={{ vertical: pV, horizontal: pH }}
      background={theme.card}
      alignment="leading"
      spacing={isFourGrid ? 4 : (isThreeCol ? 1.5 : 2.5)}
    >
      <HStack alignment="center">
        <Text font={nameFont} bold foregroundStyle={theme.primary} lineLimit={1}>{item.name}</Text>
        <Spacer />
        <Text font={isFourGrid ? 6.5 : 5.5} foregroundStyle={item.isRunning ? theme.badgeRunText : theme.badgeWarnText}>● </Text>
        {item.cost ? (
          <Text font={isFourGrid ? 9.5 : (isThreeCol ? 7.5 : 8.5)} bold foregroundStyle={theme.cost}>{item.cost}</Text>
        ) : (
          <Text font={isFourGrid ? 8.5 : (isThreeCol ? 7 : 7.5)} foregroundStyle={item.isRunning ? theme.badgeRunText : theme.badgeWarnText}>{item.status}</Text>
        )}
      </HStack>

      <HStack alignment="bottom">
        <Text font={numFont} bold foregroundStyle={theme.primary}>{item.used}</Text>
        <Text font={isFourGrid ? 8.5 : (isThreeCol ? 6.5 : 7.5)} foregroundStyle={theme.muted}>{` / ${item.total}G`}</Text>
        <Spacer />
        <Text font={isFourGrid ? 8.5 : (isThreeCol ? 6.5 : 7.5)} bold foregroundStyle={theme.secondary}>{`${item.pct}%`}</Text>
      </HStack>

      <ProgressBar pct={item.pctNum} width={barWidth} height={barH} />

      <HStack alignment="center">
        <Text font={isFourGrid ? 7.5 : 6} foregroundStyle={theme.muted}>{`${item.pct}% 已用`}</Text>
        <Spacer />
        <Text font={isFourGrid ? 7.5 : 6} foregroundStyle={theme.faint}>{syncTime}</Text>
      </HStack>
    </VStack>
  );
}

// ==================== 主视图 ====================
function WidgetView(props: { data: ApiResponse | null }) {
  const { data } = props;
  const rawFamily = String(Widget.family || 'systemMedium').toLowerCase();

  const isExtraLarge = rawFamily.includes('extralarge');
  const isLarge = rawFamily.includes('large') && !isExtraLarge;
  const isSmall = rawFamily.includes('small');

  // 1. 无数据兜底
  if (!data || !data.accounts || data.accounts.length === 0) {
    return (
      <VStack
        padding={{ top: 16, bottom: 16, leading: 16, trailing: 16 }}
        background={theme.bg}
        alignment="center"
        spacing={4}
      >
        <Spacer />
        <Text font={12} bold foregroundStyle={theme.progressWarn}>
          ⚠️ 未能连接到 CDT 实例
        </Text>
        <Text font={10} foregroundStyle={theme.muted}>
          请检查 Base URL 与 API Key
        </Text>
        <Spacer />
      </VStack>
    );
  }

  // 2. 字段解析
  const list: ParsedAccount[] = data.accounts.map((item) => {
    const used = parseFloat(String(item.flow_used ?? item.used ?? 0.0)) || 0;
    const total = parseFloat(String(item.flow_total ?? item.total ?? 200)) || 200;

    let pctNum = parseFloat(String(item.percentage));
    if (!Number.isFinite(pctNum)) {
      pctNum = total > 0 ? (used / total) * 100 : 0;
    }
    pctNum = Math.max(0, Math.min(100, pctNum));

    const statusStr = String(item.instance_status ?? item.status ?? 'Running');
    const isRunning = statusStr.toLowerCase().includes('run') || statusStr.includes('运行');

    const rawCost = item.monthly_cost ?? item.cost ?? null;
    let costDisplay = '';
    if (rawCost !== null && rawCost !== undefined && rawCost !== '') {
      const symbol = (item.currency === 'USD' || !item.currency) ? '$' : '¥';
      costDisplay = `${symbol}${parseFloat(String(rawCost)).toFixed(2)}`;
    }

    return {
      name: item.account ?? item.name ?? '未命名实例',
      region: item.region_name ?? item.region ?? '中国香港',
      status: isRunning ? '运行中' : '已关机',
      isRunning,
      used: used.toFixed(2),
      total,
      pct: pctNum.toFixed(2),
      pctNum,
      cost: costDisplay,
      threshold: parseFloat(String(item.threshold ?? 95)) || 95,
    };
  });

  const count = list.length;
  const mainServer = list[0];
  const runningCount = list.filter((i) => i.isRunning).length;
  const isAllRun = runningCount === count && count > 0;
  const alertsCount = list.filter((i) => i.pctNum >= i.threshold).length;

  const totalTrafficNum = list.reduce((acc, cur) => acc + parseFloat(cur.used), 0);
  const formattedTraffic = totalTrafficNum < 1 && totalTrafficNum > 0 ? totalTrafficNum.toFixed(2) : totalTrafficNum.toFixed(1);
  const syncTime = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });

  // 3. Small 小号组件
  if (isSmall) {
    return (
      <VStack
        padding={{ top: 12, bottom: 12, leading: 14, trailing: 14 }}
        background={theme.bg}
        alignment="leading"
      >
        <HStack alignment="center">
          <Text font={11} bold foregroundStyle={theme.primary}>{mainServer.name}</Text>
          <Spacer />
          <Text font={8} foregroundStyle={mainServer.isRunning ? theme.badgeRunText : theme.badgeWarnText}>●</Text>
        </HStack>

        <HStack alignment="center">
          <Text font={9} foregroundStyle={theme.muted}>{mainServer.region}</Text>
          <Spacer />
          {mainServer.cost ? (
            <Text font={10} bold foregroundStyle={theme.cost}>{mainServer.cost}</Text>
          ) : null}
        </HStack>

        <Spacer />

        <HStack alignment="bottom">
          <Text font={20} bold foregroundStyle={theme.primary}>{mainServer.used}</Text>
          <Text font={10} foregroundStyle={theme.muted}>{` / ${mainServer.total}G`}</Text>
        </HStack>

        <Spacer />

        <ProgressBar pct={mainServer.pctNum} width={128} />

        <Spacer />

        <HStack alignment="center">
          <Text font={9} foregroundStyle={theme.secondary}>{`${mainServer.pct}%`}</Text>
          <Spacer />
          <Text font={9} foregroundStyle={theme.faint}>{syncTime}</Text>
        </HStack>
      </VStack>
    );
  }

  // 4. systemExtraLarge 超大宽幅组件（4台强制使用对称 2x2，6台使用 3x2）
  if (isExtraLarge) {
    return (
      <VStack
        padding={{ top: 7, bottom: 7, leading: 10, trailing: 10 }}
        background={theme.bg}
        alignment="leading"
      >
        <HeaderBar isAllRun={isAllRun} runningCount={runningCount} totalCount={count} />
        <Spacer />

        <StatsCard
          totalInstances={count}
          runningInstances={runningCount}
          totalTraffic={formattedTraffic}
          alerts={alertsCount}
          padding={{ vertical: 3.5, horizontal: 10 }}
        />
        <Spacer />

        {/* 1 ~ 3 台：1 行卡片平铺 */}
        {count <= 3 && (
          <HStack spacing={6}>
            {list.slice(0, count).map((item, idx) => (
              <GridCard key={idx} item={item} syncTime={syncTime} barWidth={count === 1 ? 285 : (count === 2 ? 136 : 84)} padding={{ vertical: 5, horizontal: 8 }} isThreeCol={count === 3} />
            ))}
          </HStack>
        )}

        {/* 4 台专属：对称 2x2 四宫格（告别 3+1 畸形比例） */}
        {count === 4 && (
          <VStack spacing={4}>
            <HStack spacing={6}>
              <GridCard item={list[0]} syncTime={syncTime} barWidth={130} padding={{ vertical: 4.5, horizontal: 9 }} />
              <GridCard item={list[1]} syncTime={syncTime} barWidth={130} padding={{ vertical: 4.5, horizontal: 9 }} />
            </HStack>
            <HStack spacing={6}>
              <GridCard item={list[2]} syncTime={syncTime} barWidth={130} padding={{ vertical: 4.5, horizontal: 9 }} />
              <GridCard item={list[3]} syncTime={syncTime} barWidth={130} padding={{ vertical: 4.5, horizontal: 9 }} />
            </HStack>
          </VStack>
        )}

        {/* 5 台及以上：3 列网格排布 */}
        {count >= 5 && (
          <VStack spacing={4}>
            <HStack spacing={5}>
              <GridCard item={list[0]} syncTime={syncTime} barWidth={84} padding={{ vertical: 3.5, horizontal: 6 }} isThreeCol />
              <GridCard item={list[1]} syncTime={syncTime} barWidth={84} padding={{ vertical: 3.5, horizontal: 6 }} isThreeCol />
              <GridCard item={list[2]} syncTime={syncTime} barWidth={84} padding={{ vertical: 3.5, horizontal: 6 }} isThreeCol />
            </HStack>

            <HStack spacing={5}>
              <GridCard item={list[3]} syncTime={syncTime} barWidth={84} padding={{ vertical: 3.5, horizontal: 6 }} isThreeCol />
              <GridCard item={list[4]} syncTime={syncTime} barWidth={84} padding={{ vertical: 3.5, horizontal: 6 }} isThreeCol />
              {count > 5 ? (
                <GridCard item={list[5]} syncTime={syncTime} barWidth={84} padding={{ vertical: 3.5, horizontal: 6 }} isThreeCol />
              ) : <Spacer />}
            </HStack>
          </VStack>
        )}

        <Spacer />
      </VStack>
    );
  }

  // 5. systemLarge 标准大号组件（4台使用原版厚实四宫格，6台使用 3x2）
  if (isLarge) {
    return (
      <VStack
        padding={{ top: 12, bottom: 12, leading: 13, trailing: 13 }}
        background={theme.bg}
        alignment="leading"
      >
        <HeaderBar isAllRun={isAllRun} runningCount={runningCount} totalCount={count} />
        <Spacer />

        <StatsCard
          totalInstances={count}
          runningInstances={runningCount}
          totalTraffic={formattedTraffic}
          alerts={alertsCount}
        />
        <Spacer />

        {/* 1 ~ 3 台：全宽通栏卡片 */}
        {count <= 3 && (
          <VStack spacing={6}>
            {list.slice(0, count).map((item, idx) => (
              <FullCard key={idx} item={item} syncTime={syncTime} barWidth={285} compact={count === 3} />
            ))}
          </VStack>
        )}

        {/* 4 台专属：饱满厚实四宫格（大字号 17.5pt + 13pt 垂直内边距，完全撑满大号组件） */}
        {count === 4 && (
          <VStack spacing={8}>
            <HStack spacing={7}>
              <GridCard item={list[0]} syncTime={syncTime} barWidth={126} isFourGrid />
              <GridCard item={list[1]} syncTime={syncTime} barWidth={126} isFourGrid />
            </HStack>
            <HStack spacing={7}>
              <GridCard item={list[2]} syncTime={syncTime} barWidth={126} isFourGrid />
              <GridCard item={list[3]} syncTime={syncTime} barWidth={126} isFourGrid />
            </HStack>
          </VStack>
        )}

        {/* 5 台：1 个全宽大卡片 + 4 个双并排卡片 */}
        {count === 5 && (
          <VStack spacing={6}>
            <FullCard item={list[0]} syncTime={syncTime} barWidth={285} compact />
            <HStack spacing={6}>
              <GridCard item={list[1]} syncTime={syncTime} barWidth={126} padding={{ vertical: 6, horizontal: 8 }} />
              <GridCard item={list[2]} syncTime={syncTime} barWidth={126} padding={{ vertical: 6, horizontal: 8 }} />
            </HStack>
            <HStack spacing={6}>
              <GridCard item={list[3]} syncTime={syncTime} barWidth={126} padding={{ vertical: 6, horizontal: 8 }} />
              <GridCard item={list[4]} syncTime={syncTime} barWidth={126} padding={{ vertical: 6, horizontal: 8 }} />
            </HStack>
          </VStack>
        )}

        {/* 6 台及以上：3 行 x 2 列并排网格 */}
        {count >= 6 && (
          <VStack spacing={6}>
            <HStack spacing={6}>
              <GridCard item={list[0]} syncTime={syncTime} barWidth={126} padding={{ vertical: 5.5, horizontal: 8 }} />
              <GridCard item={list[1]} syncTime={syncTime} barWidth={126} padding={{ vertical: 5.5, horizontal: 8 }} />
            </HStack>
            <HStack spacing={6}>
              <GridCard item={list[2]} syncTime={syncTime} barWidth={126} padding={{ vertical: 5.5, horizontal: 8 }} />
              <GridCard item={list[3]} syncTime={syncTime} barWidth={126} padding={{ vertical: 5.5, horizontal: 8 }} />
            </HStack>
            <HStack spacing={6}>
              <GridCard item={list[4]} syncTime={syncTime} barWidth={126} padding={{ vertical: 5.5, horizontal: 8 }} />
              <GridCard item={list[5]} syncTime={syncTime} barWidth={126} padding={{ vertical: 5.5, horizontal: 8 }} />
            </HStack>
          </VStack>
        )}

        <Spacer />
      </VStack>
    );
  }

  // 6. Medium 中号组件
  if (count >= 2) {
    return (
      <VStack
        padding={{ top: 12, bottom: 12, leading: 14, trailing: 14 }}
        background={theme.bg}
        alignment="leading"
      >
        <HeaderBar isAllRun={isAllRun} runningCount={runningCount} totalCount={count} />
        <Spacer />
        <HStack spacing={7}>
          <GridCard item={list[0]} syncTime={syncTime} barWidth={126} padding={{ vertical: 7, horizontal: 8 }} />
          <GridCard item={list[1]} syncTime={syncTime} barWidth={126} padding={{ vertical: 7, horizontal: 8 }} />
        </HStack>
        <Spacer />
      </VStack>
    );
  }

  // 单台实例标准中号卡
  return (
    <VStack
      padding={{ top: 12, bottom: 12, leading: 14, trailing: 14 }}
      background={theme.bg}
      alignment="leading"
    >
      <HeaderBar isAllRun={isAllRun} runningCount={runningCount} totalCount={count} />
      <Spacer />

      <StatsCard
        totalInstances={count}
        runningInstances={runningCount}
        totalTraffic={formattedTraffic}
        alerts={alertsCount}
      />
      <Spacer />

      <FullCard item={mainServer} syncTime={syncTime} barWidth={285} />
    </VStack>
  );
}

// 统一执行入口
loadData().then((data) => {
  Widget.present(<WidgetView data={data} />);
});
