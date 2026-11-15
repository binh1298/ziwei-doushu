/**
 * 命盘 / 合盘历史记录 —— 存 localStorage，不引入数据库。
 *
 * 命盘记录按「姓名 + 公历出生日期 + 出生时分」唯一（同一个人再排一次就覆盖同一条）。
 * 每条记录保存出生表单 + 解读面板各页签的对话（包含 AI 回复），回到历史时直接还原，不重新生成。
 * 合盘记录按「甲方 key × 乙方 key」唯一，保存最后一次分析正文。
 * 支持整体导出 / 导入 JSON（备份、换浏览器、手工补录）。
 */
import type { BirthFormState } from '@/components/BirthForm';
import { formToBirthInfo } from '@/lib/ziwei/share';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  hidden?: boolean;
  /** 显示用的短标签（content 是发给模型的完整提示） */
  label?: string;
}

/** 解读面板每个页签一条线程：overview / love / career / wealth / health / personality / palace */
export type ThreadMap = Record<string, ChatMessage[]>;

export interface ChartRecord {
  /** `${姓名}|${年}-${月}-${日}`，姓名为空时为 `|年-月-日` */
  key: string;
  form: BirthFormState;
  threads: ThreadMap;
  createdAt: number;
  updatedAt: number;
}

export function countReadings(threads: ThreadMap): number {
  return Object.values(threads).reduce((n, msgs) => n + msgs.filter(m => m.role === 'assistant' && m.content.trim()).length, 0);
}

export interface HemingRecord {
  key: string;            // `${keyA}×${keyB}`
  formA: BirthFormState;
  formB: BirthFormState;
  question: string;
  analysis: string;
  createdAt: number;
  updatedAt: number;
}

const CHART_KEY = 'ziwei_chart_history_v1';
const HEMING_KEY = 'ziwei_heming_history_v1';
const MAX_RECORDS = 50;

export function chartKey(form: Pick<BirthFormState, 'name' | 'year' | 'month' | 'day' | 'clockHour' | 'clockMinute' | 'unknownTime'>): string {
  const y = parseInt(form.year) || 0;
  const m = parseInt(form.month) || 0;
  const d = parseInt(form.day) || 0;
  const time = form.unknownTime
    ? 'unknown'
    : `${String(parseInt(form.clockHour) || 0).padStart(2, '0')}:${String(parseInt(form.clockMinute) || 0).padStart(2, '0')}`;
  return `${(form.name ?? '').trim()}|${y}-${m}-${d}|${time}`;
}

export function hemingKey(formA: BirthFormState, formB: BirthFormState): string {
  return `${chartKey(formA)}×${chartKey(formB)}`;
}

/** 排出来的盘是否相同（公历排盘日 + 时辰支 + 性别）；不同说明旧解读已不适用 */
export function sameChartInput(a: BirthFormState, b: BirthFormState): boolean {
  const x = formToBirthInfo(a);
  const y = formToBirthInfo(b);
  return x.year === y.year && x.month === y.month && x.day === y.day && x.hour === y.hour && x.gender === y.gender;
}

function read<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write<T>(key: string, list: T[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(list.slice(0, MAX_RECORDS)));
  } catch {
    // 配额满或被禁用：丢掉最旧的一半再试一次，仍失败就放弃
    try { localStorage.setItem(key, JSON.stringify(list.slice(0, Math.ceil(MAX_RECORDS / 2)))); } catch { /* ignore */ }
  }
}

// ─── 命盘 ───────────────────────────────────────────────

export function loadChartRecords(): ChartRecord[] {
  // key 按当前规则重算：旧格式（无时分）的记录也能继续用
  return read<ChartRecord>(CHART_KEY)
    .map(r => ({ ...r, key: r.form ? chartKey(r.form) : r.key, threads: r.threads ?? {} }))
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

export function getChartRecord(key: string): ChartRecord | undefined {
  return read<ChartRecord>(CHART_KEY).find(r => r.key === key);
}

/**
 * 起盘时调用：同 key 已存在则更新表单；若影响排盘的输入变了，旧对话作废。
 * 返回写入后的记录（含应还原的 messages）。
 */
export function upsertChart(form: BirthFormState): ChartRecord {
  const list = read<ChartRecord>(CHART_KEY);
  const key = chartKey(form);
  const now = Date.now();
  const idx = list.findIndex(r => r.key === key);
  let record: ChartRecord;
  if (idx >= 0) {
    const prev = list[idx];
    record = {
      ...prev,
      form: { ...form },
      threads: sameChartInput(prev.form, form) ? (prev.threads ?? {}) : {},
      updatedAt: now,
    };
    list.splice(idx, 1);
  } else {
    record = { key, form: { ...form }, threads: {}, createdAt: now, updatedAt: now };
  }
  write(CHART_KEY, [record, ...list]);
  return record;
}

export function saveChartThreads(key: string, threads: ThreadMap): void {
  const list = read<ChartRecord>(CHART_KEY);
  const idx = list.findIndex(r => r.key === key);
  if (idx < 0) return;
  const record = { ...list[idx], threads, updatedAt: Date.now() };
  list.splice(idx, 1);
  write(CHART_KEY, [record, ...list]);
}

export function removeChartRecord(key: string): void {
  write(CHART_KEY, read<ChartRecord>(CHART_KEY).filter(r => r.key !== key));
}

// ─── 合盘 ───────────────────────────────────────────────

export function loadHemingRecords(): HemingRecord[] {
  return read<HemingRecord>(HEMING_KEY).sort((a, b) => b.updatedAt - a.updatedAt);
}

export function upsertHeming(formA: BirthFormState, formB: BirthFormState, question: string, analysis: string): HemingRecord {
  const list = read<HemingRecord>(HEMING_KEY);
  const key = hemingKey(formA, formB);
  const now = Date.now();
  const prev = list.find(r => r.key === key);
  const record: HemingRecord = {
    key, formA: { ...formA }, formB: { ...formB }, question, analysis,
    createdAt: prev?.createdAt ?? now, updatedAt: now,
  };
  write(HEMING_KEY, [record, ...list.filter(r => r.key !== key)]);
  return record;
}

export function removeHemingRecord(key: string): void {
  write(HEMING_KEY, read<HemingRecord>(HEMING_KEY).filter(r => r.key !== key));
}

// ─── 导出 / 导入 ───────────────────────────────────────

export interface HistoryExport {
  version: 1;
  exportedAt: number;
  charts: ChartRecord[];
  heming: HemingRecord[];
}

export function exportHistory(): HistoryExport {
  return { version: 1, exportedAt: Date.now(), charts: loadChartRecords(), heming: loadHemingRecords() };
}

/** 合并导入：同 key 以 updatedAt 较新的为准。返回导入的条数。 */
export function importHistory(raw: unknown): { charts: number; heming: number } {
  const data = raw as Partial<HistoryExport> | null;
  if (!data || typeof data !== 'object') throw new Error('invalid history file');
  const charts = Array.isArray(data.charts) ? data.charts : [];
  const heming = Array.isArray(data.heming) ? data.heming : [];

  const mergeBy = <T extends { key: string; updatedAt: number }>(existing: T[], incoming: T[]): T[] => {
    const map = new Map(existing.map(r => [r.key, r]));
    for (const r of incoming) {
      if (!r || typeof r.key !== 'string') continue;
      const prev = map.get(r.key);
      if (!prev || (r.updatedAt ?? 0) >= (prev.updatedAt ?? 0)) map.set(r.key, r);
    }
    return [...map.values()].sort((a, b) => b.updatedAt - a.updatedAt);
  };

  const validCharts = charts.filter(r => r && r.form && typeof r.form.year === 'string')
    .map(r => ({ ...r, key: chartKey(r.form), threads: r.threads ?? {} }));
  const validHeming = heming.filter(r => r && r.formA && r.formB)
    .map(r => ({ ...r, key: hemingKey(r.formA, r.formB) }));

  // 命盘按页签合并：某页签只有一边有内容就取那一边，两边都有则取较新记录的
  const existingCharts = new Map(loadChartRecords().map(r => [r.key, r]));
  const mergedCharts: ChartRecord[] = [...existingCharts.values()];
  for (const inc of validCharts) {
    const prev = existingCharts.get(inc.key);
    if (!prev) { mergedCharts.push(inc); continue; }
    const incNewer = (inc.updatedAt ?? 0) >= (prev.updatedAt ?? 0);
    const threads: ThreadMap = { ...prev.threads };
    for (const [tab, msgs] of Object.entries(inc.threads)) {
      if (!msgs?.length) continue;
      if (!threads[tab]?.length || incNewer) threads[tab] = msgs;
    }
    const merged: ChartRecord = {
      ...(incNewer ? inc : prev),
      threads,
      createdAt: Math.min(prev.createdAt ?? inc.createdAt, inc.createdAt ?? prev.createdAt),
      updatedAt: Math.max(prev.updatedAt ?? 0, inc.updatedAt ?? 0),
    };
    mergedCharts[mergedCharts.findIndex(r => r.key === inc.key)] = merged;
  }
  write(CHART_KEY, mergedCharts.sort((a, b) => b.updatedAt - a.updatedAt));
  write(HEMING_KEY, mergeBy(read<HemingRecord>(HEMING_KEY), validHeming));
  return { charts: validCharts.length, heming: validHeming.length };
}

/** 列表里显示用的一行标签（纯数据拼接，翻译交给调用方） */
export function formLabelParts(form: BirthFormState): { name: string; date: string; time: string; gender: 'male' | 'female' } {
  const hh = form.unknownTime ? '' : `${form.clockHour.padStart(2, '0')}:${form.clockMinute.padStart(2, '0')}`;
  return { name: form.name?.trim() ?? '', date: `${form.year}-${form.month}-${form.day}`, time: hh, gender: form.gender };
}
