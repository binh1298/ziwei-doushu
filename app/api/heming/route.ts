/**
 * POST /api/heming —— 合盘 AI 分析（本机 Claude Code 版）
 *
 * 请求体：{ chartA: ZiweiChart, chartB: ZiweiChart, question?: string }
 * 响应：SSE，data: {"delta":{"text":…}} … data: [DONE]（与 app/heming/page.tsx 的解析一致）
 */
import { NextResponse } from 'next/server';
import type { ZiweiChart } from '@/lib/ziwei/types';
import { getLocale } from '@/lib/i18n/server';
import { buildHemingSystem, HEMING_DEFAULT_QUESTION } from '@/lib/ai/chart-prompt';
import { streamLocalClaude, sseResponse } from '@/lib/ai/claude-local';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface Body {
  chartA?: ZiweiChart;
  chartB?: ZiweiChart;
  question?: string;
}

export async function POST(request: Request) {
  let body: Body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }
  const { chartA, chartB, question } = body;
  if (!chartA?.palaces?.length || !chartB?.palaces?.length) {
    return NextResponse.json({ error: 'chartA and chartB are required' }, { status: 400 });
  }

  const locale = await getLocale();
  const q = typeof question === 'string' && question.trim() ? question.trim() : '';
  return sseResponse(streamLocalClaude({
    system: buildHemingSystem(chartA, chartB, locale),
    prompt: q ? `${HEMING_DEFAULT_QUESTION}\n\n另外，用户特别想知道：${q}\n请在分析中重点回答这个问题，并在最后单独用 **【针对提问】** 一节作答。` : HEMING_DEFAULT_QUESTION,
  }));
}
