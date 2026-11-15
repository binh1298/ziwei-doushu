'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ZiweiChart, Palace } from '@/lib/ziwei/types';
import type { TimeView } from './TimeNav';
import { useI18n } from '@/lib/i18n/client';
import type { ChatMessage, ThreadMap } from '@/lib/history/store';

export type Message = ChatMessage;
export type { ThreadMap };

interface SelectedSiHua {
  starName: string;
  siHua: string;
  view: TimeView;
}

interface InsightPanelProps {
  chart: ZiweiChart;
  selectedPalace?: Palace | null;
  selectedSiHua?: SelectedSiHua | null;
  /** 从历史记录还原的各页签线程；某页签已有内容就不再自动生成 */
  initialThreads?: ThreadMap;
  /** 线程变化（一次生成结束后）回调，供页面持久化 */
  onThreadsChange?: (threads: ThreadMap) => void;
}

const TOPICS = [
  { key: 'overview',     label: '命格' },
  { key: 'love',        label: '感情' },
  { key: 'career',      label: '事业' },
  { key: 'wealth',      label: '财运' },
  { key: 'health',      label: '健康' },
  { key: 'personality', label: '性格' },
] as const;

const TOPIC_PROMPTS: Record<string, string> = {
  overview: `请生成命格总览，按以下结构输出：

**【命格定性】**
用一句话概括这个命盘的核心格局与命主气质。

**【主星解读】**
命宫主星的核心特质，引用倪海厦原话或观点。

**【三方四正】**
财、官、迁三宫的联动分析及整体格局。

**【当前大限】**
当下大限运势方向与最值得关注的事项。

**【优势与注意】**
命盘天赋优势，以及需要注意的风险或功课。`,

  love: `请深度分析感情婚姻运，按以下结构输出：

**【感情格局】**
一句话定性感情命格。

**【夫妻宫分析】**
夫妻宫主星、四化，以及倪海厦体系的具体解读。

**【三方联动】**
相关宫位对感情的影响。

**【当前大限感情运】**
当下10年感情走向与关键节点。

**【实际建议】**
具体可行的感情建议。`,

  career: `请深度分析事业运，按以下结构输出：

**【事业格局】**
一句话定性事业命格，宜任职或宜创业。

**【官禄宫分析】**
官禄宫主星、四化，以及倪师对这种配置的判断。

**【财帛宫联动】**
财运与事业的关系，财路来源分析。

**【当前大限事业运】**
当下10年事业走向。

**【实际建议】**
适合的方向、行业与策略。`,

  wealth: `请深度分析财运，按以下结构输出：

**【财运格局】**
一句话定性财运模式，是主动财还是被动财。

**【财帛宫分析】**
财帛宫主星、四化，财富来源与流动模式。

**【田宅宫（财库）】**
积蓄能力与不动产运势分析。

**【当前大限财运】**
当下财运走向与注意事项。

**【理财建议】**
具体的财务建议。`,

  health: `请分析健康运势，按以下结构输出：

**【疾厄宫主星】**
疾厄宫星曜与健康含义。

**【主要风险】**
结合倪海厦子午流注理论，分析主要健康隐患与需关注的部位。

**【大限健康走势】**
当下健康趋势与关键时间段。

**【预防建议】**
具体注意事项与养生方向。`,

  personality: `请深度解析性格特质，按以下结构输出：

**【命宫主星性格】**
命宫主星的核心性格特质，引用倪师原话。

**【三方性格综合】**
财、官、迁三宫对性格的影响，全貌描绘。

**【人际关系模式】**
与他人互动方式、待人处世风格。

**【优势与人生课题】**
天赋优势，以及需要面对的人生功课。`,
};

const PALACE_ROLES: Record<string, string> = {
  '命宫':   '自我、性格、先天格局',
  '兄弟宫': '兄弟关系、合伙人',
  '夫妻宫': '感情关系、婚姻状态',
  '子女宫': '子女缘分、下属关系',
  '财帛宫': '财运来源、收入方式',
  '疾厄宫': '身体健康、意外',
  '迁移宫': '外出机遇、人际格局',
  '交友宫': '朋友圈、贵人、小人',
  '官禄宫': '事业成就、社会地位',
  '田宅宫': '不动产、家庭环境',
  '福德宫': '精神享受、内心福分',
  '父母宫': '父母关系、文书契约',
};

/** Render AI markdown: **【Title】** → gold header, **bold** → strong */
function AiContent({ text, streaming }: { text: string; streaming?: boolean }) {
  const lines = text.split('\n');
  return (
    <div className="space-y-0.5">
      {lines.map((line, i) => {
        const sectionMatch = line.match(/^\*\*【(.+?)】\*\*$/);
        if (sectionMatch) {
          return (
            <div key={i} className="pt-3 pb-0.5 first:pt-0">
              <span className="text-[11px] font-semibold tracking-wide" style={{ color: 'var(--t-gold)' }}>
                【{sectionMatch[1]}】
              </span>
            </div>
          );
        }
        if (line.trim() === '') return <div key={i} className="h-1" />;
        const parts = line.split(/\*\*(.+?)\*\*/);
        return (
          <div key={i} className="text-[11px] leading-relaxed" style={{ color: 'var(--t-text2)' }}>
            {parts.map((part, j) =>
              j % 2 === 0
                ? part
                : <strong key={j} className="font-medium" style={{ color: 'var(--t-text)' }}>{part}</strong>
            )}
          </div>
        );
      })}
      {streaming && (
        <span
          className="inline-block w-1.5 h-3 ml-0.5 animate-pulse rounded-sm align-middle"
          style={{ background: 'var(--t-gold)', opacity: 0.6 }}
        />
      )}
    </div>
  );
}

/** 宫位 / 四化点击的分析单独放一个页签 */
const PALACE_TAB = 'palace';
type TabKey = typeof TOPICS[number]['key'] | typeof PALACE_TAB;

export default function InsightPanel({ chart, selectedPalace, selectedSiHua, initialThreads, onThreadsChange }: InsightPanelProps) {
  const { t, term } = useI18n();
  const [threads, setThreads] = useState<ThreadMap>(() => initialThreads ?? {});
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [streamingTab, setStreamingTab] = useState<TabKey | null>(null);
  const threadsRef = useRef<ThreadMap>(threads); // always-current copy for closures
  const loadingRef = useRef(false);
  const autoLoaded = useRef(false);
  const lastPalaceBranch = useRef<number | undefined>(undefined);
  const lastSiHuaKey = useRef<string | undefined>(undefined);
  const scrollRef = useRef<HTMLDivElement>(null);
  const pendingTab = useRef<TabKey | null>(null); // 别的页签正在生成时点开的空页签，排队等生成

  // Keep refs in sync
  useEffect(() => { threadsRef.current = threads; }, [threads]);
  useEffect(() => { loadingRef.current = loading; }, [loading]);

  // 持久化：流式输出结束后再通知页面保存，避免每个 delta 都写一次 localStorage
  useEffect(() => {
    if (!loading && Object.values(threads).some(m => m.length > 0)) onThreadsChange?.(threads);
  }, [threads, loading, onThreadsChange]);

  const activeMessages = threads[activeTab] ?? [];

  // Auto-scroll（切页签或当前页签有新内容时）
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeMessages, activeTab]);

  const setThread = useCallback((tab: TabKey, update: (prev: Message[]) => Message[]) => {
    setThreads(prev => ({ ...prev, [tab]: update(prev[tab] ?? []) }));
  }, []);

  const streamResponse = async (tab: TabKey, apiMessages: { role: 'user' | 'assistant'; content: string }[]) => {
    try {
      const res = await fetch('/api/interpret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chart, messages: apiMessages }),
      });
      if (res.status === 404) throw new Error('api-missing');
      if (!res.ok) throw new Error('请求失败');
      if (!res.body) throw new Error('无响应流');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistantText = '';

      setThread(tab, prev => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split('\n')) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6);
          if (data === '[DONE]') break;
          try {
            const delta = JSON.parse(data).delta?.text ?? '';
            assistantText += delta;
            setThread(tab, prev => {
              const updated = [...prev];
              updated[updated.length - 1] = { role: 'assistant', content: assistantText };
              return updated;
            });
          } catch { /* skip */ }
        }
      }
    } catch (e) {
      const missing = e instanceof Error && e.message === 'api-missing';
      setThread(tab, prev => [...prev, { role: 'assistant', content: missing ? t('开源版不含 AI 解读接口（/api/interpret），需要你自己实现后才能用，详见 README「快速开始」。排盘本身不需要任何 API Key。') : t('解读失败，请稍后重试。') }]);
    } finally {
      setLoading(false);
      setStreamingTab(null);
      loadingRef.current = false;
    }
  };

  /** 向某个页签的线程发一条消息；上下文只带该页签自己的历史 */
  const sendMessage = (tab: TabKey, text: string, hidden = false, label?: string) => {
    if (!text.trim() || loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    setStreamingTab(tab);

    const userMsg: Message = { role: 'user', content: text, hidden, label };
    // Capture current thread synchronously via ref (avoids stale closure)
    const apiMessages = [...(threadsRef.current[tab] ?? []), userMsg].map(m => ({
      role: m.role,
      content: m.content,
    }));

    setThread(tab, prev => [...prev, userMsg]);
    setInput('');
    streamResponse(tab, apiMessages);
  };

  // Auto-generate 命格总览 on mount（从历史还原时已有内容，不再重新生成）
  useEffect(() => {
    if (autoLoaded.current) return;
    autoLoaded.current = true;
    if (!(threadsRef.current.overview?.length)) sendMessage('overview', TOPIC_PROMPTS.overview, true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Inject palace analysis when palace selected → 宫位页签
  useEffect(() => {
    if (!selectedPalace || selectedPalace.branch === lastPalaceBranch.current) return;
    lastPalaceBranch.current = selectedPalace.branch;

    const majorStars = selectedPalace.stars.filter(s => s.type === 'major');
    const starDesc = majorStars.length > 0
      ? majorStars.map(s => `${s.name}${s.siHua ? '化' + s.siHua : ''}`).join('、')
      : '空宫（借对宫）';
    const role = PALACE_ROLES[selectedPalace.name] ?? '';

    const prompt = `请重点分析【${selectedPalace.name}】（主管：${role}），该宫主星为${starDesc}，按以下结构输出：

**【宫位定性】**
${selectedPalace.name}在命盘中的意义，以及这种星曜配置的整体判断。

**【主星解读】**
主星在此宫的倪海厦体系解读，引用具体观点。

**【三方四正联动】**
三方四正宫位对此宫的影响。

**【实际建议】**
基于此宫的具体建议。`;

    const label = `${term(selectedPalace.name)} · ${majorStars.length > 0
      ? majorStars.map(s => `${term(s.name)}${s.siHua ? ' ' + t('化{x}', { x: term(s.siHua) }) : ''}`).join('、')
      : t('空宫（借对宫）')}`;
    setActiveTab(PALACE_TAB);
    sendMessage(PALACE_TAB, prompt, false, label);
  }, [selectedPalace]); // eslint-disable-line react-hooks/exhaustive-deps

  // 注入四化飞化分析 → 宫位页签
  useEffect(() => {
    if (!selectedSiHua) return;
    const key = `${selectedSiHua.starName}-${selectedSiHua.siHua}-${selectedSiHua.view}`;
    if (key === lastSiHuaKey.current) return;
    lastSiHuaKey.current = key;

    // 找出该星所在宫位
    const palaceOfStar = chart.palaces.find(p =>
      p.stars.some(s => s.name === selectedSiHua.starName)
    );
    const palaceName = palaceOfStar?.name ?? '未知宫位';
    const viewLabel = selectedSiHua.view === 'daxian' ? '大限' : '流年';

    const prompt = `请分析【${viewLabel}${selectedSiHua.starName}化${selectedSiHua.siHua}】的飞化影响，按以下结构输出：

**【化${selectedSiHua.siHua}基本含义】**
化${selectedSiHua.siHua}在倪海厦体系中的核心含义，以及${selectedSiHua.starName}化${selectedSiHua.siHua}的特殊含义。

**【落宫影响】**
${selectedSiHua.starName}化${selectedSiHua.siHua}落在【${palaceName}】，该宫主管的领域受到何种影响，倪师如何解读。

**【三方四正飞化路径】**
化${selectedSiHua.siHua}入${palaceName}后，对其三方四正（对宫、两个三合宫）的联动影响。

**【当前运势影响】**
在${viewLabel}时间维度下，此化${selectedSiHua.siHua}对命主近期运势的具体影响。

**【实际建议】**
基于此四化的具体可操作建议。`;

    const label = `${t(viewLabel)} · ${t('{star}化{x}', { star: term(selectedSiHua.starName), x: term(selectedSiHua.siHua) })}`;
    setActiveTab(PALACE_TAB);
    sendMessage(PALACE_TAB, prompt, false, label);
  }, [selectedSiHua]); // eslint-disable-line react-hooks/exhaustive-deps

  /** 点页签：切换显示；该页签还没生成过就自动生成一次（正在生成别的页签时先排队） */
  const handleTabClick = (tab: TabKey) => {
    setActiveTab(tab);
    if (tab === PALACE_TAB) { pendingTab.current = null; return; }
    if (threadsRef.current[tab]?.length) { pendingTab.current = null; return; }
    if (loadingRef.current) { pendingTab.current = tab; return; }
    sendMessage(tab, TOPIC_PROMPTS[tab], true);
  };

  // 上一个生成结束后，自动生成排队中的页签（用户仍停在那个页签上且它还是空的）
  useEffect(() => {
    if (loading) return;
    const tab = pendingTab.current;
    pendingTab.current = null;
    if (tab && tab === activeTab && tab !== PALACE_TAB && !(threadsRef.current[tab]?.length)) {
      sendMessage(tab, TOPIC_PROMPTS[tab], true);
    }
  }, [loading]); // eslint-disable-line react-hooks/exhaustive-deps

  /** 重新生成当前页签（清空该页签线程） */
  const handleRegenerate = () => {
    if (loadingRef.current || activeTab === PALACE_TAB) return;
    setThread(activeTab, () => []);
    threadsRef.current = { ...threadsRef.current, [activeTab]: [] };
    sendMessage(activeTab, TOPIC_PROMPTS[activeTab], true);
  };

  const handleSend = () => {
    sendMessage(activeTab, input);
  };

  const activeLabel = activeTab === PALACE_TAB ? t('宫位') : t(TOPICS.find(x => x.key === activeTab)?.label ?? '');
  const streamingLabel = streamingTab === PALACE_TAB ? t('宫位') : t(TOPICS.find(x => x.key === streamingTab)?.label ?? '');
  const showPalaceTab = (threads[PALACE_TAB]?.length ?? 0) > 0 || !!selectedPalace || !!selectedSiHua;
  const tabs: { key: TabKey; label: string }[] = [
    ...TOPICS.map(x => ({ key: x.key as TabKey, label: t(x.label) })),
    ...(showPalaceTab ? [{ key: PALACE_TAB as TabKey, label: t('宫位') }] : []),
  ];
  const firstAssistantIdx = activeMessages.findIndex(m => m.role === 'assistant');

  return (
    <div className="flex flex-col h-full rounded-xl overflow-hidden card-glass">

      {/* ── Tabs ── */}
      <div className="flex-shrink-0 px-2 pt-2.5 pb-2" style={{ borderBottom: '1px solid var(--t-border)' }}>
        <div className={`grid gap-1 ${showPalaceTab ? 'grid-cols-7' : 'grid-cols-6'}`}>
          {tabs.map(tab => {
            const isActive = activeTab === tab.key;
            const hasContent = (threads[tab.key]?.length ?? 0) > 0;
            const isStreaming = streamingTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => handleTabClick(tab.key)}
                className="relative py-1.5 text-[10px] font-medium rounded-lg transition-all duration-150"
                style={{
                  background: isActive ? 'rgba(212,168,67,0.12)' : 'transparent',
                  border: `1px solid ${isActive ? 'rgba(212,168,67,0.3)' : 'var(--t-border)'}`,
                  color: isActive ? 'var(--t-gold)' : hasContent ? 'var(--t-text2)' : 'var(--t-faint)',
                }}
              >
                {tab.label}
                {(hasContent || isStreaming) && (
                  <span
                    className={`absolute top-1 right-1 w-1 h-1 rounded-full ${isStreaming ? 'animate-pulse' : ''}`}
                    style={{ background: isStreaming ? 'var(--t-gold)' : 'rgba(212,168,67,0.5)' }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Messages (当前页签) ── */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">

        {activeMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-4xl mb-3" style={{ color: 'var(--t-gold)', opacity: 0.1 }}>✦</div>
            <p className={`text-[10px] ${loading && streamingTab === activeTab ? 'animate-pulse' : ''}`} style={{ color: 'var(--t-faint)' }}>
              {activeTab === PALACE_TAB
                ? t('点击命盘上的宫位，这里会显示该宫的解读')
                : loading && streamingTab !== activeTab
                  ? t('正在生成「{topic}」，完成后自动开始这一页', { topic: streamingLabel })
                  : t('命格解读生成中…')}
            </p>
          </div>
        )}

        <AnimatePresence initial={false}>
          {activeMessages.map((msg, i) => {
            if (msg.role === 'user' && msg.hidden) return null;

            if (msg.role === 'user') {
              return (
                <motion.div
                  key={`${activeTab}-${i}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-end"
                >
                  <div
                    className="max-w-[85%] rounded-xl px-3 py-2 text-[11px]"
                    style={{
                      background: 'rgba(212,168,67,0.08)',
                      border: '1px solid rgba(212,168,67,0.18)',
                      color: 'var(--t-gold)',
                    }}
                  >
                    {msg.label ?? msg.content}
                  </div>
                </motion.div>
              );
            }

            // Assistant message
            const isLastMsg = i === activeMessages.length - 1;
            return (
              <motion.div
                key={`${activeTab}-${i}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div
                  className="text-[9px] tracking-widest mb-2 flex items-center gap-1.5"
                  style={{ color: 'var(--t-faint)' }}
                >
                  <span style={{ color: 'var(--t-gold)', opacity: 0.4 }}>✦</span>
                  {t('命理解读')}
                  {i === firstAssistantIdx && activeTab !== PALACE_TAB && !loading && (
                    <button
                      onClick={handleRegenerate}
                      className="ml-auto text-[9px] px-1.5 py-0.5 rounded border transition-opacity hover:opacity-100"
                      style={{ borderColor: 'var(--t-border)', color: 'var(--t-faint)', opacity: 0.7 }}
                    >
                      {t('重新生成')}
                    </button>
                  )}
                </div>
                <AiContent text={msg.content} streaming={loading && streamingTab === activeTab && isLastMsg} />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* ── Input（追问进当前页签） ── */}
      <div className="flex-shrink-0 px-3 pb-3 pt-2" style={{ borderTop: '1px solid var(--t-border)' }}>
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder={t('针对「{topic}」继续追问或要求展开…', { topic: activeLabel })}
            disabled={loading || activeMessages.length === 0}
            className="flex-1 rounded-lg px-3 py-2 text-[11px] focus:outline-none transition-colors"
            style={{
              background: 'var(--t-card)',
              border: '1px solid var(--t-border)',
              color: 'var(--t-text)',
            }}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim() || activeMessages.length === 0}
            className="px-3 py-2 rounded-lg text-[11px] font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              background: 'rgba(212,168,67,0.15)',
              border: '1px solid rgba(212,168,67,0.25)',
              color: 'var(--t-gold)',
            }}
          >
            {loading ? '…' : t('追问')}
          </button>
        </div>
      </div>

    </div>
  );
}
