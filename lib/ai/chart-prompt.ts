/**
 * 把排盘引擎的 ZiweiChart 序列化成给 LLM 看的中文文本，并拼出命盘解读 / 合盘的系统提示。
 * 星名、宫名保持引擎里的中文；越南语界面只要求模型用越南语作答并用汉越音写术语。
 */
import 'server-only';
import type { ZiweiChart, Palace, Star } from '@/lib/ziwei/types';
import { STEMS, BRANCHES, SHICHEN } from '@/lib/ziwei/constants';
import { detectPatterns } from '@/lib/ziwei/patterns';
import {
  STAR_IN_FUQI_GU, SIHUA_IN_FUQI_GU, HEMING_METHODOLOGY, MARRIAGE_STARS_BRIEF, HEMING_SCORE_CRITERIA,
} from '@/lib/ziwei/heming-knowledge';
import type { Locale } from '@/lib/i18n/config';

const TYPE_LABEL: Record<Star['type'], string> = { major: '主星', lucky: '吉星', sha: '煞星', minor: '杂曜' };

function starText(s: Star): string {
  const tags = [s.brightnessRaw, s.siHua ? `化${s.siHua}` : ''].filter(Boolean);
  return tags.length ? `${s.name}(${tags.join(',')})` : s.name;
}

function palaceText(chart: ZiweiChart, p: Palace): string {
  const marks = [
    p.isMingGong ? '命宫' : '',
    p.isShenGong ? '身宫' : '',
    p.isCurrentDaXian && p.daXianAge ? `当前大限${p.daXianAge[0]}–${p.daXianAge[1]}岁` : '',
  ].filter(Boolean);
  const byType = (t: Star['type']) => p.stars.filter(s => s.type === t).map(starText).join('、');
  const parts = (['major', 'lucky', 'sha', 'minor'] as Star['type'][])
    .map(t => (byType(t) ? `${TYPE_LABEL[t]}：${byType(t)}` : ''))
    .filter(Boolean);
  if (p.isEmpty) {
    const borrowed = p.borrowedStars?.length ? p.borrowedStars.join('、') : '';
    parts.unshift(`空宫，借对宫${p.borrowedFromName ?? ''}${borrowed ? `（${borrowed}）` : ''}`);
  }
  if (p.selfSihua?.length) parts.push(`宫干自化：${p.selfSihua.map(x => `${x.starName}自化${x.siHua}`).join('、')}`);
  const age = p.daXianAge ? ` 大限${p.daXianAge[0]}–${p.daXianAge[1]}岁` : '';
  return `- ${p.name}（${STEMS[p.stem]}${BRANCHES[p.branch]}${marks.length ? '，' + marks.join('、') : ''}）${age}：${parts.join('；') || '无星'}`;
}

/** 整张命盘的中文描述（给模型看，不给用户看） */
export function describeChart(chart: ZiweiChart, label = ''): string {
  const b = chart.birthInfo;
  const l = chart.lunarInfo;
  const shichen = SHICHEN[b.hour];
  const head = [
    `${label ? `【${label}】` : '【命主】'}${b.name ? ` 姓名：${b.name}` : ''}`,
    `性别：${b.gender === 'male' ? '男' : '女'}${chart.yinYangGender ? `（${chart.yinYangGender}）` : ''}`,
    `公历：${b.year}-${b.month}-${b.day} ${shichen?.name ?? ''}（${shichen?.range ?? ''}）`,
    `农历：${l.lunarYear}年${l.isLeapMonth ? '闰' : ''}${Math.abs(l.lunarMonth)}月${l.lunarDay}日`,
    l.fourPillars ? `四柱：${l.fourPillars.join(' ')}` : '',
    `命宫在${BRANCHES[chart.mingGongBranch]}，身宫在${BRANCHES[chart.shenGongBranch]}，${chart.wuxingJuName}`,
    chart.mingZhu || chart.shenZhu ? `命主星：${chart.mingZhu ?? ''}，身主星：${chart.shenZhu ?? ''}` : '',
    `当前年龄：${chart.currentAge}岁`,
  ].filter(Boolean).join('\n');

  // 按命宫起、逆时针（地支递减）排列十二宫，便于模型按三方四正推
  const ordered: Palace[] = [];
  for (let i = 0; i < 12; i++) {
    const branch = ((chart.mingGongBranch - i) % 12 + 12) % 12;
    const p = chart.palaces.find(x => x.branch === branch);
    if (p) ordered.push(p);
  }
  const palaces = ordered.map(p => palaceText(chart, p)).join('\n');

  const daxian = chart.daXians
    .map((d, i) => `${d.startAge}–${d.endAge}岁 ${d.palaceName}${i === chart.currentDaXianIndex ? '（当前）' : ''}`)
    .join('；');

  let patterns = '';
  try {
    const found = detectPatterns(chart);
    if (found.length) {
      patterns = '\n【引擎识别到的格局】\n' + found.map(p => `- ${p.name}（${p.level}）：${p.description}`).join('\n');
    }
  } catch { /* 格局识别失败不影响解读 */ }

  return `${head}\n【十二宫】\n${palaces}\n【大限】${daxian}${patterns}`;
}

const SIHUA_NAMES: Record<string, string> = { '禄': '化禄', '权': '化权', '科': '化科', '忌': '化忌' };

function languageRule(locale: Locale): string {
  if (locale === 'vi') {
    return [
      '语言要求：全程用越南语（tiếng Việt）作答。星曜、宫位、天干地支、四化一律用汉越音写法，',
      '例如 紫微→Tử Vi、天机→Thiên Cơ、化禄→Hóa Lộc、命宫→cung Mệnh、庚午→Canh Ngọ、夫妻宫→cung Phu Thê。',
      '章节标题仍保持 **【…】** 的形式，但括号里的标题文字译成越南语。',
    ].join('');
  }
  return '语言要求：用简体中文作答。';
}

const FORMAT_RULE = [
  '输出格式：Markdown。每个章节以单独一行的 **【章节标题】** 开头（前端按这个标记渲染），正文用普通段落，',
  '重点可用 **加粗**；不要用 # 标题、表格、代码块、水平线。如果用户的提问里已经给了章节结构，严格按那个结构输出。',
].join('');

/** /api/interpret 的系统提示 */
export function buildInterpretSystem(chart: ZiweiChart, locale: Locale): string {
  return [
    '你是一位精通倪海厦《天纪》体系的紫微斗数命理老师，熟悉《紫微斗数全书》《紫微斗数全集》《骨髓赋》等古籍，',
    '按南派三合派的思路看盘：以命宫为本、三方四正为用、四化为纲、空宫借对宫，重视大限与流年的叠加。',
    '',
    '规则：',
    '1. 只依据下面给出的命盘数据论断，不要自己重新排盘或臆造星曜位置；数据里没有的信息就说明无法判断。',
    '2. 引用倪师观点时用平实语气转述，不要编造讲义出处、集数或时间码。',
    '3. 解读要具体到宫位和星曜，说明判断依据（哪颗星、哪个宫、什么四化），避免空泛套话。',
    '4. 涉及健康、投资、法律、重大决策时提醒仅供参考，命运掌握在自己手中；不要做医疗诊断或投资指令。',
    `5. ${FORMAT_RULE}`,
    `6. ${languageRule(locale)}`,
    '',
    '命盘数据：',
    describeChart(chart),
  ].join('\n');
}

/** 把前端的多轮对话压成一段提示；最后一条为本轮请求 */
export function flattenMessages(messages: { role: 'user' | 'assistant'; content: string }[]): string {
  if (messages.length <= 1) return messages[0]?.content ?? '';
  const history = messages.slice(0, -1)
    .map(m => `${m.role === 'user' ? '用户' : '你（上一轮回答）'}：\n${m.content}`)
    .join('\n\n');
  return `以下是此前的对话记录，供参考：\n\n${history}\n\n——\n本轮请求：\n${messages[messages.length - 1].content}`;
}

/** /api/heming 的系统提示：合盘方法论 + 两张盘 + 相关古书断语 */
export function buildHemingSystem(chartA: ZiweiChart, chartB: ZiweiChart, locale: Locale): string {
  const relevantStars = new Set<string>();
  for (const c of [chartA, chartB]) {
    for (const p of c.palaces) {
      if (p.name === '夫妻宫' || p.name === '福德宫') {
        p.stars.forEach(s => { if (s.type === 'major') relevantStars.add(s.name); });
        p.borrowedStars?.forEach(s => relevantStars.add(s));
      }
    }
  }
  const starNotes = [...relevantStars]
    .map(name => {
      const k = STAR_IN_FUQI_GU[name];
      if (!k) return '';
      return `- ${name}在夫妻宫：${k.summary}。吉：${k.good}。凶：${k.bad}。配偶：${k.spouse_traits}。婚期：${k.timing}。${k.ni_quote ? `倪师：${k.ni_quote}` : ''}`;
    })
    .filter(Boolean)
    .join('\n');
  const sihuaNotes = Object.entries(SIHUA_IN_FUQI_GU).map(([k, v]) => `- ${k}：${v}`).join('\n');
  const marriageStars = Object.entries(MARRIAGE_STARS_BRIEF).map(([k, v]) => `- ${k}：${v}`).join('\n');
  const score = Object.entries(HEMING_SCORE_CRITERIA).map(([k, v]) => `- ${k}：${v}`).join('\n');

  return [
    '你是一位精通倪海厦《天纪》体系的紫微斗数命理老师，现在要为两个人做合盘（双盘比对）。',
    '',
    '规则：',
    '1. 只依据下面两张命盘的数据论断，不要重新排盘或臆造星曜。',
    '2. 按合盘方法论逐项比对：双方夫妻宫互参、命宫与对方夫妻宫的呼应、福德宫、四化（尤其化忌冲夫妻宫）、大限走向。',
    '3. 结论要具体到宫位和星曜，并说明依据；最后给出 1–5 星的缘分评分并解释。',
    '4. 涉及婚姻等重大决定时提醒仅供参考，不要替用户做决定。',
    `5. ${FORMAT_RULE}`,
    `6. ${languageRule(locale)}`,
    '',
    HEMING_METHODOLOGY.trim(),
    '',
    '【四化在夫妻宫】',
    sihuaNotes,
    '',
    '【婚恋辅星】',
    marriageStars,
    '',
    '【评分标准】',
    score,
    starNotes ? `\n【本次涉及的主星在夫妻宫的古书断语】\n${starNotes}` : '',
    '',
    describeChart(chartA, '甲方 A'),
    '',
    describeChart(chartB, '乙方 B'),
  ].join('\n');
}

export const HEMING_DEFAULT_QUESTION = [
  '请对甲方 A 与乙方 B 做完整合盘分析，按以下结构输出：',
  '',
  '**【缘分总评】**',
  '一句话定性两人关系，并给出 1–5 星评分。',
  '',
  '**【夫妻宫互参】**',
  '双方夫妻宫主星、四化与对方命宫的呼应。',
  '',
  '**【性格相配】**',
  '双方命宫主星与三方四正的互动，相处模式与摩擦点。',
  '',
  '**【福德宫与深层感情】**',
  '感情能否长久的依据。',
  '',
  '**【四化与大限】**',
  '化忌、化禄的互相影响，以及近期大限对关系的提示。',
  '',
  '**【相处建议】**',
  '具体可行的建议。',
].join('\n');

export { SIHUA_NAMES };
