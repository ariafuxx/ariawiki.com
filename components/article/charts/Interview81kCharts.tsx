"use client";

import InteractiveChart from "../InteractiveChart";
import LightAndShade from "../LightAndShade";

const GOLD = "#D4A03C";
const GOLD_LIGHT = "#DCBA6A";
const BLUE = "#7E9BBE";

const hopeData = [
  {
    label: "做更好的工作",
    value: 18.8,
    color: GOLD,
    description: "让 AI 处理常规任务，专注于更有价值的战略工作和复杂问题",
    quote: "不用再为写文档发愁之后，我对护士们更有耐心了。",
    quoteSource: "医疗工作者",
  },
  {
    label: "个人成长",
    value: 13.7,
    color: BLUE,
    description: "借助 AI 实现个人成长、情绪健康或生活转变",
    quote: "AI 教会了我理解情绪，我变成了一个更好的人。",
    quoteSource: "用户",
  },
  {
    label: "管理生活",
    value: 13.5,
    color: GOLD,
    description: "让 AI 帮忙管理日程、减轻心理负担，处理日常琐事",
    quote: "AI 真的帮我分担了心理负荷，让我能把注意力完全放在眼前的人身上。",
    quoteSource: "管理者",
  },
  {
    label: "时间自由",
    value: 11.1,
    color: GOLD,
    description: "从工作和家务中省出时间，用来陪家人、做自己的事",
    quote: "有了 AI，我工作效率更高了……上周二，它让我可以和妈妈一起做饭，而不是继续处理工作。",
    quoteSource: "哥伦比亚白领",
  },
  {
    label: "经济独立",
    value: 9.7,
    color: GOLD_LIGHT,
    description: "通过 AI 创收、创业或实现财务自由",
    quote: "它就像我的影子，只是一个非常非常长的影子。",
    quoteSource: "创业者",
  },
  {
    label: "推动社会变革",
    value: 9.4,
    color: BLUE,
    description: "用 AI 解决疾病、贫困、气候变化等社会问题",
    quote: "如果 AI 能加速找到治愈方法，每个人都应该有平等的机会。",
    quoteSource: "软件工程师",
  },
  {
    label: "创业",
    value: 8.7,
    color: GOLD_LIGHT,
    description: "把 AI 当成力量倍增器，一个人做一支团队的事",
    quote: "它是一个均衡器，让技术落后地区的人也能参与竞争。",
    quoteSource: "创业者",
  },
  {
    label: "学习和成长",
    value: 8.4,
    color: BLUE,
    description: "AI 作为个性化老师，按自己的节奏学任何东西",
    quote: "孩子在 AI 辅导下每个学科都超出了标准。",
    quoteSource: "家长",
  },
  {
    label: "创作表达",
    value: 5.6,
    color: BLUE,
    description: "跨越想象力和执行力之间的鸿沟",
    quote: "在有 AI 之前，我的游戏做了三年。",
    quoteSource: "开发者",
  },
];

const deliveredData = [
  {
    label: "提高效率",
    value: 32.0,
    color: GOLD,
    description: "大幅加速工作，自动化重复任务",
    quote: "那天我准时下班，去幼儿园接了女儿。",
    quoteSource: "软件工程师，日本",
  },
  {
    label: "未达预期",
    value: 18.9,
    color: "#C4C4C4",
    description: "输出不够准确，或者还不具备用户期待的能力",
    quote: "AI 应该去擦窗户、清理洗碗机，这样我才能画画和写诗。现在正好反过来了。",
    quoteSource: "用户",
  },
  {
    label: "思考伙伴",
    value: 17.2,
    color: BLUE,
    description: "头脑风暴、整理思路、和 AI 一起想问题",
    quote: "AI 帮我重新找到了自己的方向。我看到了一条路。",
    quoteSource: "无家可归者",
  },
  {
    label: "学到新东西",
    value: 9.9,
    color: BLUE,
    description: "自适应讲解、按需辅导、在陌生领域提供专业知识",
    quote: "我发现自己没有以前以为的那么笨。",
    quoteSource: "律师",
  },
  {
    label: "做到以前做不了的事",
    value: 8.7,
    color: GOLD,
    description: "没有技术背景也能做出产品，独立创作者做出团队级别的作品",
    quote: "我做了一个视频剪辑工具，帮助有听力障碍的人。",
    quoteSource: "非技术背景用户",
  },
  {
    label: "整合复杂信息",
    value: 7.2,
    color: BLUE,
    description: "处理大量文献、理解法律权利、翻译医疗结果",
    quote: "Claude 把所有历史碎片拼在一起，帮我找到了被误诊 9 年的真正病因。",
    quoteSource: "被误诊 9 年的患者",
  },
  {
    label: "情感支持",
    value: 6.1,
    color: "#C4917E",
    description: "提供无评判的倾听空间、情绪陪伴、个人指导",
    quote: "妈妈用了 AI 之后不再容易起冲突，变得平和了。",
    quoteSource: "用户家属",
  },
];

const concernsData = [
  {
    label: "不可靠",
    value: 26.7,
    color: "#C4917E",
    description: "幻觉、错误、输出质量不稳定",
    quote: "我得拍照片给 AI 看，才能让它承认自己说错了。",
    quoteSource: "用户",
  },
  {
    label: "就业和经济",
    value: 22.3,
    color: "#C4917E",
    description: "被替代的压力，有人已经因为 AI 被裁了",
    quote: "马消失了。现在人们害怕自己就是那匹马。",
    quoteSource: "用户",
  },
  {
    label: "自主性",
    value: 21.9,
    color: "#C4917E",
    description: "在使用过程中悄悄失去自己的判断力",
    quote: "是 Claude 在划那条线，不像是我自己的想法。",
    quoteSource: "学生",
  },
  {
    label: "认知萎缩",
    value: 16.3,
    color: "#9EAAB8",
    description: "过度依赖导致独立思考能力下降",
    quote: "我用 AI 写作业拿了高分，但那不是我学到的东西。",
    quoteSource: "用户",
  },
  {
    label: "治理缺失",
    value: 14.7,
    color: "#9EAAB8",
    description: "监管框架跟不上技术发展",
    quote: "连能力边界都不清楚，怎么谈负责任地开发？",
    quoteSource: "市场从业者",
  },
  {
    label: "虚假信息",
    value: 13.6,
    color: "#9EAAB8",
    description: "深度伪造，侵蚀共享现实",
    quote: "每条信息都要反复核实，这成了一种永久的负担。",
    quoteSource: "用户",
  },
  {
    label: "隐私和监控",
    value: 13.1,
    color: "#9EAAB8",
    description: "数据被利用、行踪被追踪",
    quote: "所有东西都变得'聪明'了，但可能会反过来对付我。",
    quoteSource: "用户",
  },
  {
    label: "讨好倾向",
    value: 10.8,
    color: "#BFBFBF",
    description: "AI 太顺从，不够诚实",
    quote: "Claude 应该更认真地指出我的问题。",
    quoteSource: "用户",
  },
  {
    label: "过度限制",
    value: 11.7,
    color: "#BFBFBF",
    description: "安全机制太保守，反而成为障碍",
    quote: "真正的威胁是 AI 太胆小、太圆滑。",
    quoteSource: "用户",
  },
];

const tensionPairs = [
  {
    lightLabel: "学习",
    shadeLabel: "认知萎缩",
    lightPct: 33,
    shadePct: 17,
    lightSeen: 30,
    lightExpect: 3,
    shadeSeen: 8,
    shadeExpect: 9,
    lightQuote: "半年学到的比大学四年还多。",
    lightQuoteSource: "创业者，德国",
    shadeQuote: "我不再像以前那样思考了。我很难把自己的想法表达出来。",
    shadeQuoteSource: "重度 AI 用户，美国",
  },
  {
    lightLabel: "决策",
    shadeLabel: "不可靠",
    lightPct: 22,
    shadePct: 37,
    lightSeen: 18,
    lightExpect: 4,
    shadeSeen: 28,
    shadeExpect: 9,
    lightQuote: "AI 帮我做出了更好的商业决策。",
    lightQuoteSource: "企业主",
    shadeQuote: "我得拍照片给 AI 看，才能让它承认自己说错了。",
    shadeQuoteSource: "用户",
  },
  {
    lightLabel: "情感支持",
    shadeLabel: "依赖",
    lightPct: 16,
    shadePct: 12,
    lightSeen: 14,
    lightExpect: 2,
    shadeSeen: 5,
    shadeExpect: 7,
    lightQuote: "妈妈用了 AI 之后不再容易起冲突，变得平和了。",
    lightQuoteSource: "用户家属",
    shadeQuote: "去掉关系中的摩擦，也去掉了成长。",
    shadeQuoteSource: "用户",
  },
  {
    lightLabel: "省时间",
    shadeLabel: "跑步机加速",
    lightPct: 50,
    shadePct: 19,
    lightSeen: 44,
    lightExpect: 6,
    shadeSeen: 10,
    shadeExpect: 9,
    lightQuote: "那天我准时下班，去幼儿园接了女儿。",
    lightQuoteSource: "软件工程师，日本",
    shadeQuote: "省出来的时间又被更多任务填满了。",
    shadeQuoteSource: "自由职业者",
  },
  {
    lightLabel: "经济机会",
    shadeLabel: "被取代",
    lightPct: 28,
    shadePct: 18,
    lightSeen: 23,
    lightExpect: 5,
    shadeSeen: 6,
    shadeExpect: 12,
    lightQuote: "它是一个均衡器。",
    lightQuoteSource: "创业者",
    shadeQuote: "马消失了。现在人们害怕自己就是那匹马。",
    shadeQuoteSource: "用户",
  },
];

export function HopeChart() {
  return (
    <InteractiveChart
      title="人们对 AI 的期待"
      data={hopeData}
    />
  );
}

export function DeliveredChart() {
  return (
    <InteractiveChart
      title="AI 做到了什么"
      data={deliveredData}
    />
  );
}

export function ConcernsChart() {
  return (
    <InteractiveChart
      title="人们的顾虑"
      data={concernsData}
    />
  );
}

export function TensionViz() {
  return <LightAndShade pairs={tensionPairs} />;
}
