/**
 * 从 iztro 自带的 zh-CN / vi-VN 语言包按 key 对齐，生成「简体术语 → 越南语汉越音」表。
 * 用法：node scripts/i18n/gen-terms.cjs  → 写出 lib/i18n/terms.generated.ts
 * iztro 译名有少量错误或与越南通行口径不同，修正写在 lib/i18n/terms.ts 的 TERM_OVERRIDES 里，不改这里。
 */
const fs = require('fs');
const path = require('path');

const base = path.join(__dirname, '../../node_modules/iztro/lib/i18n/locales');
const cats = ['star', 'palace', 'brightness', 'earthlyBranch', 'heavenlyStem', 'fiveElementsClass', 'mutagen', 'gender'];
const out = {};
for (const c of cats) {
  const zh = require(path.join(base, 'zh-CN', c + '.js')).default;
  const vi = require(path.join(base, 'vi-VN', c + '.js')).default;
  for (const k of Object.keys(zh)) if (vi[k] && zh[k] !== vi[k] && !out[zh[k]]) out[zh[k]] = vi[k];
}
const zc = require(path.join(base, 'zh-CN/common.json'));
const vc = require(path.join(base, 'vi-VN/common.json'));
for (const k of Object.keys(zc)) {
  if (typeof zc[k] === 'string' && typeof vc[k] === 'string' && !out[zc[k]]) out[zc[k]] = vc[k];
}

const ver = require(path.join(__dirname, '../../node_modules/iztro/package.json')).version;
const body = Object.entries(out).map(([k, v]) => `  ${JSON.stringify(k)}: ${JSON.stringify(v)},`).join('\n');
fs.writeFileSync(
  path.join(__dirname, '../../lib/i18n/terms.generated.ts'),
  `// 由 scripts/i18n/gen-terms.cjs 从 iztro@${ver} 语言包生成，请勿手改；修正写在 terms.ts。\n` +
  `export const IZTRO_VI_TERMS: Record<string, string> = {\n${body}\n};\n`,
);
console.log(`wrote ${Object.keys(out).length} terms`);
