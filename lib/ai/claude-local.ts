/**
 * 本机 Claude Code CLI 作为解读后端。
 *
 * 开源版不带 /api/interpret 与 /api/heming；这里用机器上已登录的 `claude` 命令（Claude Code）
 * 以无头模式（`claude -p --output-format stream-json`）生成解读，不需要 API Key。
 *
 * 输出统一转成前端 InsightPanel / heming 页已经在解析的 SSE 格式：
 *   data: {"delta":{"text":"…"}}\n\n   …   data: [DONE]\n\n
 *
 * 环境变量（都可不填）：
 *   CLAUDE_BIN           claude 可执行文件路径，默认 PATH 里的 `claude`
 *   CLAUDE_LOCAL_MODEL   传给 `--model`（如 sonnet / opus），默认用 Claude Code 自己的设置
 */
import 'server-only';
import { spawn } from 'node:child_process';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

export interface LocalClaudeRequest {
  /** 系统提示（走 --system-prompt-file，避免 Windows 命令行转义问题） */
  system: string;
  /** 用户侧完整提示，通过 stdin 传入 */
  prompt: string;
}

const encoder = new TextEncoder();
const sse = (text: string) => encoder.encode(`data: ${JSON.stringify({ delta: { text } })}\n\n`);
const SSE_DONE = encoder.encode('data: [DONE]\n\n');

/** 子进程环境：去掉 Claude Code 的嵌套标记，否则在 Claude Code 里启动的 dev server 会拒绝再启动 claude */
function childEnv(): NodeJS.ProcessEnv {
  const env = { ...process.env };
  delete env.CLAUDECODE;
  delete env.CLAUDE_CODE_ENTRYPOINT;
  return env;
}

export function streamLocalClaude({ system, prompt }: LocalClaudeRequest): ReadableStream<Uint8Array> {
  let kill: (() => void) | null = null;

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      const dir = await mkdtemp(join(tmpdir(), 'ziwei-claude-'));
      const systemFile = join(dir, 'system.md');
      await writeFile(systemFile, system, 'utf8');
      const cleanup = () => rm(dir, { recursive: true, force: true }).catch(() => {});

      const args = [
        '-p',
        '--output-format', 'stream-json',
        '--verbose',
        '--include-partial-messages',
        '--no-session-persistence',
        '--tools', '',
        '--system-prompt-file', systemFile,
      ];
      const model = process.env.CLAUDE_LOCAL_MODEL?.trim();
      if (model) args.push('--model', model);

      const child = spawn(process.env.CLAUDE_BIN?.trim() || 'claude', args, {
        env: childEnv(),
        stdio: ['pipe', 'pipe', 'pipe'],
        windowsHide: true,
      });
      kill = () => { try { child.kill(); } catch { /* already gone */ } };

      let sentText = false;
      let stderr = '';
      let buffered = '';
      let finished = false;
      const finish = (trailer?: string) => {
        if (finished) return;
        finished = true;
        if (trailer) controller.enqueue(sse(trailer));
        controller.enqueue(SSE_DONE);
        controller.close();
        void cleanup();
      };

      const handleLine = (line: string) => {
        if (!line.trim()) return;
        let msg: Record<string, unknown>;
        try { msg = JSON.parse(line); } catch { return; }
        if (msg.type === 'stream_event') {
          const ev = msg.event as { type?: string; delta?: { type?: string; text?: string } } | undefined;
          if (ev?.type === 'content_block_delta' && ev.delta?.type === 'text_delta' && ev.delta.text) {
            sentText = true;
            controller.enqueue(sse(ev.delta.text));
          }
        } else if (msg.type === 'result') {
          // 正常结束时正文已经通过 stream_event 发完；只在出错且没发过正文时把错误信息透出
          const isError = msg.is_error === true || (typeof msg.subtype === 'string' && msg.subtype !== 'success');
          if (isError && !sentText) {
            const detail = typeof msg.result === 'string' ? msg.result
              : Array.isArray(msg.errors) ? (msg.errors as unknown[]).join('; ') : String(msg.subtype ?? 'error');
            controller.enqueue(sse(`[Claude Code] ${detail}`));
            sentText = true;
          }
        }
      };

      child.stdout.setEncoding('utf8');
      child.stdout.on('data', (chunk: string) => {
        buffered += chunk;
        const lines = buffered.split('\n');
        buffered = lines.pop() ?? '';
        for (const l of lines) handleLine(l);
      });
      child.stderr.setEncoding('utf8');
      child.stderr.on('data', (chunk: string) => { stderr += chunk; });

      child.on('error', (err: NodeJS.ErrnoException) => {
        const hint = err.code === 'ENOENT'
          ? '找不到 claude 命令。请先安装并登录 Claude Code，或在 .env.local 里用 CLAUDE_BIN 指定路径。'
          : err.message;
        finish(`[Claude Code] ${hint}`);
      });
      child.on('close', (code) => {
        if (buffered) handleLine(buffered);
        if (!sentText && code !== 0) {
          finish(`[Claude Code] 进程退出码 ${code}${stderr.trim() ? `：${stderr.trim().slice(0, 800)}` : ''}`);
        } else {
          finish();
        }
      });

      child.stdin.on('error', () => { /* 进程已退出时写 stdin 会报错，忽略 */ });
      child.stdin.end(prompt, 'utf8');
    },
    cancel() {
      kill?.();
    },
  });
}

/** 前端 fetch 直接读的 SSE 响应 */
export function sseResponse(stream: ReadableStream<Uint8Array>): Response {
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'X-Accel-Buffering': 'no',
    },
  });
}
