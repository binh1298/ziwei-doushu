'use client';
import { useRef } from 'react';
import { useI18n } from '@/lib/i18n/client';
import {
  formLabelParts, countReadings, exportHistory, importHistory, type ChartRecord,
} from '@/lib/history/store';

interface HistoryListProps {
  records: ChartRecord[];
  onOpen: (record: ChartRecord) => void;
  onEdit: (record: ChartRecord) => void;
  onRemove: (record: ChartRecord) => void;
  /** 导入后让页面重新读列表 */
  onChanged: () => void;
}

/** /chart 起盘前的历史记录列表，含整体导出 / 导入 */
export default function HistoryList({ records, onOpen, onEdit, onRemove, onChanged }: HistoryListProps) {
  const { t, locale } = useI18n();
  const fileRef = useRef<HTMLInputElement>(null);
  const fmtTime = (ts: number) => new Date(ts).toLocaleString(locale === 'vi' ? 'vi-VN' : 'zh-CN', { hour12: false });

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(exportHistory(), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ziwei-history-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = async (file: File | undefined) => {
    if (!file) return;
    try {
      const n = importHistory(JSON.parse(await file.text()));
      onChanged();
      alert(t('已导入 {c} 条命盘记录、{h} 条合盘记录', { c: n.charts, h: n.heming }));
    } catch {
      alert(t('导入失败：不是有效的历史记录文件'));
    } finally {
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <section>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <h2 style={{ fontSize: 14, letterSpacing: '0.3em', color: 'var(--t-gold, #b8922a)', flex: 1, margin: 0 }}>{t('历史记录')}</h2>
        <button type="button" onClick={handleExport} disabled={records.length === 0} style={btn('transparent', 'inherit')}>{t('导出')}</button>
        <button type="button" onClick={() => fileRef.current?.click()} style={btn('transparent', 'inherit')}>{t('导入')}</button>
        <input ref={fileRef} type="file" accept="application/json,.json" style={{ display: 'none' }}
          onChange={e => handleImportFile(e.target.files?.[0])} />
      </div>
      <p style={{ fontSize: 11, color: '#888', marginBottom: 12, lineHeight: 1.6 }}>
        {t('同名、同生日、同出生时分视为同一个人，再排一次会覆盖；若排出的盘变了（如改了性别），旧解读作废。')}
      </p>
      {records.length === 0 ? (
        <p style={{ fontSize: 13, color: '#888' }}>{t('暂无历史记录。起盘后会自动保存，AI 解读也会一并保存。')}</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {records.map(r => {
            const p = formLabelParts(r.form);
            const readings = countReadings(r.threads);
            return (
              <li key={r.key} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
                border: '1px solid rgba(184,146,42,0.25)', borderRadius: 12,
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>
                    {p.name || t('未命名')}
                    <span style={{ fontWeight: 400, marginLeft: 8, color: '#888' }}>
                      {p.date} · {p.time || t('时辰不详')} · {t(p.gender === 'male' ? '男' : '女')}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>
                    {fmtTime(r.updatedAt)} · {t('{n} 条解读', { n: readings })}
                  </div>
                </div>
                <button type="button" onClick={() => onOpen(r)} style={btn('rgba(184,146,42,0.9)', '#fff8e8')}>{t('打开')}</button>
                <button type="button" onClick={() => onEdit(r)} style={btn('transparent', 'inherit')}>{t('编辑')}</button>
                <button type="button" onClick={() => { if (confirm(t('确定删除这条记录？'))) onRemove(r); }} style={btn('transparent', '#dc2626')}>{t('删除')}</button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function btn(background: string, color: string): React.CSSProperties {
  return {
    fontSize: 12, padding: '6px 12px', borderRadius: 8, cursor: 'pointer',
    border: '1px solid rgba(184,146,42,0.35)', background, color, whiteSpace: 'nowrap',
  };
}
