/**
 * POST /api/interpret —— 命盘 AI 解读（本机 Claude Code 版）
 *
 * 请求体：{ chart: ZiweiChart, messages: { role: 'user'|'assistant', content: string }[] }
 * 响应：SSE，data: {"delta":{"text":…}} … data: [DONE]（与 components/InsightPanel.tsx 的解析一致）
 */
import { NextResponse } from 'next/server';
import type { ZiweiChart } from '@/lib/ziwei/types';
import { getLocale } from '@/lib/i18n/server';
import { buildInterpretSystem, flattenMessages } from '@/lib/ai/chart-prompt';
import { streamLocalClaude, sseResponse } from '@/lib/ai/claude-local';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface Body {
  chart?: ZiweiChart;
  messages?: { role: 'user' | 'assistant'; content: string }[];
}

export async function POST(request: Request) {
  let body: Body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }
  const { chart, messages } = body;
  if (!chart?.palaces?.length || !Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: 'chart and messages are required' }, { status: 400 });
  }

  const locale = await getLocale();
  return sseResponse(streamLocalClaude({
    system: buildInterpretSystem(chart, locale),
    prompt: flattenMessages(messages),
  }));
}
