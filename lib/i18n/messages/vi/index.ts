/**
 * 越南语界面文案：中文原文 → 越南语。按页面/组件分文件，这里合并。
 * 术语（星名、宫名、干支等）不用登记，走 lib/i18n/terms.ts。
 */
import { common } from './common';
import { form } from './form';
import { chart } from './chart';
import { patterns } from './patterns';
import { heming } from './heming';
import { knowledge } from './knowledge';
import { announcement } from './announcement';
import { home } from './home';
import { history } from './history';

export const VI_MESSAGES: Record<string, string> = {
  ...history,
  ...home,
  ...announcement,
  ...knowledge,
  ...heming,
  ...patterns,
  ...chart,
  ...form,
  ...common,
};
