'use client';
import { useCallback, useEffect, useState } from 'react';
import BirthForm, { type BirthFormState } from '@/components/BirthForm';
import ChartBoard from '@/components/ChartBoard';
import InsightPanel from '@/components/InsightPanel';
import TimeNav, { type TimeView } from '@/components/TimeNav';
import HistoryList from '@/components/HistoryList';
import { generateChart } from '@/lib/ziwei/algorithm';
import { formToBirthInfo } from '@/lib/ziwei/share';
import type { BirthInfo, ZiweiChart, Palace } from '@/lib/ziwei/types';
import { useI18n } from '@/lib/i18n/client';
import LocaleSwitcher from '@/components/LocaleSwitcher';
import {
  loadChartRecords, upsertChart, saveChartThreads, removeChartRecord, countReadings,
  type ChartRecord, type ThreadMap,
} from '@/lib/history/store';

/**
 * 命盘页 —— 开源版「排盘引擎 Demo」
 *
 * 这是一个最小可运行示例：用本仓库的排盘引擎 generateChart() 配合基础 UI
 * 组件，渲染一张完整紫微命盘 + 基础解读，并支持本命 / 大限 / 流年切换。
 *
 * 说明：线上商业版的完整交互界面（重设计的新 UI、AI 流式解读、合盘、分享
 * 卡片等）不在开源范围内；但排盘内核——安星算法、四化、格局识别、古籍库——
 * 完全开放（见 lib/ziwei/*），可自由二次开发出你自己的界面。
 *
 * 历史记录：起盘时按「姓名 + 出生日期」存入 localStorage，AI 解读对话随之保存；
 * 从历史打开时直接还原对话，不重新生成。
 */
export default function ChartPage() {
  const [chart, setChart] = useState<ZiweiChart | null>(null);
  const [selectedPalace, setSelectedPalace] = useState<Palace | null>(null);
  const [view, setView] = useState<TimeView>('mingpan');
  const [liunianYear, setLiunianYear] = useState(() => new Date().getFullYear());
  const { t } = useI18n();

  // ── 历史记录 ──
  const [records, setRecords] = useState<ChartRecord[]>([]);
  const [current, setCurrent] = useState<ChartRecord | null>(null);   // 当前打开的记录
  const [latestForm, setLatestForm] = useState<BirthFormState | null>(null); // 表单实时状态
  const [prefill, setPrefill] = useState<Partial<BirthFormState> | undefined>(undefined);
  const [formKey, setFormKey] = useState(0); // 变更后强制 BirthForm 重新挂载以吃到 prefill
  const [restored, setRestored] = useState(false);

  useEffect(() => { setRecords(loadChartRecords()); }, []);

  const openRecord = useCallback((record: ChartRecord, restoredFromHistory: boolean) => {
    setCurrent(record);
    setRestored(restoredFromHistory && countReadings(record.threads) > 0);
    setSelectedPalace(null);
    setChart(generateChart(formToBirthInfo(record.form)));
  }, []);

  // 表单提交：BirthForm 给的是 BirthInfo，表单原文从 onFormSave 的实时状态里取
  const handleSubmit = (info: BirthInfo) => {
    if (latestForm) {
      const record = upsertChart(latestForm);
      setRecords(loadChartRecords());
      openRecord(record, false);
    } else {
      setCurrent(null);
      setRestored(false);
      setChart(generateChart(info));
    }
  };

  const handleThreads = useCallback((threads: ThreadMap) => {
    if (!current) return;
    saveChartThreads(current.key, threads);
    setRecords(loadChartRecords());
  }, [current]);

  const backToForm = () => {
    setChart(null);
    setSelectedPalace(null);
    setCurrent(null);
    setRecords(loadChartRecords());
  };

  // ── 未起盘：展示出生信息表单 + 历史记录 ──
  if (!chart) {
    return (
      <main style={{ maxWidth: 1180, margin: '0 auto', padding: '48px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}><LocaleSwitcher /></div>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>{t('紫微斗数排盘')}</h1>
        <p style={{ color: '#888', marginBottom: 24, fontSize: 14, lineHeight: 1.7 }}>
          {t('输入出生年月日时，开源排盘引擎即时生成命盘。')}
          <br />
          {t('（本页为引擎 Demo，完整商业版界面不在开源范围；排盘内核完全开放。）')}
        </p>
        {/* 表单在左、历史在右（窄屏时历史在表单上方，便于直接点开旧记录） */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,640px)_minmax(0,1fr)]" style={{ gap: 32, alignItems: 'start' }}>
          <div className="order-2 lg:order-1">
            <BirthForm
              key={formKey}
              initialData={prefill}
              onSubmit={handleSubmit}
              onFormSave={setLatestForm}
            />
          </div>
          <div className="order-1 lg:order-2 lg:sticky lg:top-6" style={{ maxHeight: 'calc(100vh - 48px)', overflowY: 'auto' }}>
            <HistoryList
              records={records}
              onOpen={r => openRecord(r, true)}
              onEdit={r => { setPrefill(r.form); setFormKey(k => k + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              onRemove={r => { removeChartRecord(r.key); setRecords(loadChartRecords()); }}
              onChanged={() => setRecords(loadChartRecords())}
            />
          </div>
        </div>
      </main>
    );
  }

  // ── 已起盘：命盘 + 解读 ──
  return (
    <main style={{ maxWidth: 1280, margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 12 }}>
        <button
          type="button"
          onClick={backToForm}
          style={{
            padding: '6px 14px', cursor: 'pointer',
            border: '1px solid #ccc', borderRadius: 8, background: 'transparent',
          }}
        >
          {t('← 重新起盘')}
        </button>
        {restored && (
          <span style={{ fontSize: 11, color: '#888', flex: 1 }}>{t('已从历史记录还原，解读不会重新生成')}</span>
        )}
        <LocaleSwitcher />
      </div>

      <TimeNav
        chart={chart}
        view={view}
        liunianYear={liunianYear}
        onViewChange={setView}
        onYearChange={setLiunianYear}
      />

      <div
        className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)]"
        style={{
          gap: 20, marginTop: 16, alignItems: 'start',
        }}
      >
        <ChartBoard chart={chart} onPalaceSelect={setSelectedPalace} />
        <InsightPanel
          key={current?.key ?? 'anon'}
          chart={chart}
          selectedPalace={selectedPalace}
          initialThreads={current?.threads}
          onThreadsChange={current ? handleThreads : undefined}
        />
      </div>
    </main>
  );
}
