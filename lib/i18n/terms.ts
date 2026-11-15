/**
 * 紫微斗数术语 → 越南语（汉越音）。
 *
 * 三层，先到先得：
 *   1. TERM_OVERRIDES —— 人工校订：修正 iztro 译名错误，并改用越南紫微书（Vân Đằng Thái Thứ Lang 等）的通行叫法
 *   2. IZTRO_VI_TERMS —— iztro 语言包对齐生成（scripts/i18n/gen-terms.cjs）
 *   3. HANVIET_CHARS  —— 逐字汉越音兜底，用于人名、地名、书名、格局名等没收录的词
 *
 * 单字地支（子丑寅…）只在整词匹配时生效；拆字兜底时「子」读 Tử 而不是 Tý，避免「孔子」变成「Khổng Tý」。
 */
import { IZTRO_VI_TERMS } from './terms.generated';
import { HANVIET_CHARS } from './hanviet-chars';
import { STEMS, BRANCHES, PALACE_NAMES_ORDER } from '@/lib/ziwei/constants';

const PALACE_VI: Record<string, string> = {
  '命': 'Mệnh', '兄弟': 'Huynh Đệ', '夫妻': 'Phu Thê', '子女': 'Tử Tức', '财帛': 'Tài Bạch',
  '疾厄': 'Tật Ách', '迁移': 'Thiên Di', '交友': 'Nô Bộc', '仆役': 'Nô Bộc', '官禄': 'Quan Lộc',
  '田宅': 'Điền Trạch', '福德': 'Phúc Đức', '父母': 'Phụ Mẫu', '身': 'Thân',
};

export const TERM_OVERRIDES: Record<string, string> = {
  // 宫位：盘面只写宫名，不加「cung」
  ...Object.fromEntries(Object.entries(PALACE_VI).flatMap(([zh, vi]) => [[zh, vi], [`${zh}宫`, vi]])),
  '命宫': 'Mệnh', '身宫': 'Thân', '来因': 'Lai Nhân', '来因宫': 'Lai Nhân',

  // 亮度：越南书用 Miếu / Vượng / Đắc / Bình / Hãm；iztro 把「陷」译成 Hạn 是错的
  '庙': 'Miếu', '旺': 'Vượng', '得': 'Đắc', '利': 'Lợi', '平': 'Bình', '不': 'Bất', '闲': 'Nhàn', '陷': 'Hãm', '地': 'Địa',

  // 四化
  '化禄': 'Hóa Lộc', '化权': 'Hóa Quyền', '化科': 'Hóa Khoa', '化忌': 'Hóa Kỵ',
  '四化': 'Tứ Hóa', '自化': 'Tự Hóa', '生年四化': 'Tứ Hóa năm sinh',

  // 星曜：越南通行写法
  '凤阁': 'Phượng Các', '台辅': 'Thai Phụ', '截空': 'Triệt', '旬空': 'Tuần', '副截': 'Phó Triệt', '副旬': 'Phó Tuần',
  '天德': 'Thiên Đức', '年解': 'Giải Thần',
  '月钺': 'Thiên Việt(M)', '日钺': 'Thiên Việt(d)', '时钺': 'Thiên Việt(H)',

  // 长生十二神
  '长生': 'Tràng Sinh', '沐浴': 'Mộc Dục',
  // 博士十二神
  '博士': 'Bác Sĩ', '力士': 'Lực Sĩ',
  // 岁前十二神：岁建越南盘写 Thái Tuế
  '岁建': 'Thái Tuế', '贯索': 'Quán Sách',
  // 将前十二神
  '攀鞍': 'Phan An',

  // 运限
  '童限': 'Đồng Hạn', '大限': 'Đại Hạn', '小限': 'Tiểu Hạn', '流年': 'Lưu Niên', '流月': 'Lưu Nguyệt',
  '流日': 'Lưu Nhật', '流时': 'Lưu Thời', '本命': 'Bản Mệnh', '命盘': 'Lá số',

  // 命盘要素
  '命主': 'Mệnh Chủ', '身主': 'Thân Chủ', '五行局': 'Ngũ Hành Cục', '纳音': 'Nạp Âm',
  '阳男': 'Dương Nam', '阴男': 'Âm Nam', '阳女': 'Dương Nữ', '阴女': 'Âm Nữ',
  '三方四正': 'Tam Phương Tứ Chính', '对宫': 'Xung Chiếu', '空宫': 'Vô Chính Diệu', '借星': 'Mượn sao',
  '主星': 'Chính Tinh', '辅星': 'Phụ Tinh', '吉星': 'Cát Tinh', '煞星': 'Sát Tinh', '杂曜': 'Tạp Diệu',
  '四柱': 'Tứ Trụ', '八字': 'Bát Tự', '真太阳时': 'Giờ Mặt Trời thực',
  '金': 'Kim', '木': 'Mộc', '水': 'Thủy', '火': 'Hỏa', '土': 'Thổ',

  // 时辰
  ...Object.fromEntries(['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'].map((b, i) => [
    `${b}时`, `Giờ ${['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'][i]}`,
  ])),
  '早子时': 'Giờ Tý sớm', '晚子时': 'Giờ Tý muộn',

  // 书名与人名
  '紫微斗数': 'Tử Vi Đẩu Số', '倪海厦': 'Nghê Hải Hạ', '倪师': 'Thầy Nghê', '天纪': 'Thiên Kỷ',
  '紫微斗数全书': 'Tử Vi Đẩu Số Toàn Thư', '紫微斗数全集': 'Tử Vi Đẩu Số Toàn Tập', '骨髓赋': 'Cốt Tủy Phú',
  '女命骨髓赋': 'Nữ Mệnh Cốt Tủy Phú', '斗数全书': 'Đẩu Số Toàn Thư',
  '明代': 'Đời Minh', '宋代': 'Đời Tống', '清代': 'Đời Thanh', '明': 'Minh',

  // 省份（出生地下拉框只译省级，城市名保持中文）
  '北京': 'Bắc Kinh', '上海': 'Thượng Hải', '天津': 'Thiên Tân', '重庆': 'Trùng Khánh', '河北': 'Hà Bắc', '山西': 'Sơn Tây',
  '辽宁': 'Liêu Ninh', '吉林': 'Cát Lâm', '黑龙江': 'Hắc Long Giang', '江苏': 'Giang Tô', '浙江': 'Chiết Giang', '安徽': 'An Huy',
  '福建': 'Phúc Kiến', '江西': 'Giang Tây', '山东': 'Sơn Đông', '河南': 'Hà Nam', '湖北': 'Hồ Bắc', '湖南': 'Hồ Nam',
  '广东': 'Quảng Đông', '海南': 'Hải Nam', '四川': 'Tứ Xuyên', '贵州': 'Quý Châu', '云南': 'Vân Nam', '陕西': 'Thiểm Tây',
  '甘肃': 'Cam Túc', '青海': 'Thanh Hải', '台湾': 'Đài Loan', '内蒙古': 'Nội Mông', '广西': 'Quảng Tây', '西藏': 'Tây Tạng',
  '宁夏': 'Ninh Hạ', '新疆': 'Tân Cương', '香港': 'Hồng Kông', '澳门': 'Ma Cao',
  // cities.ts 里的省级全名（带 省/市/自治区 后缀），下拉框直接显示这些
  '北京市': 'Bắc Kinh', '天津市': 'Thiên Tân', '上海市': 'Thượng Hải', '重庆市': 'Trùng Khánh',
  '河北省': 'Hà Bắc', '山西省': 'Sơn Tây', '内蒙古自治区': 'Nội Mông', '辽宁省': 'Liêu Ninh', '吉林省': 'Cát Lâm',
  '黑龙江省': 'Hắc Long Giang', '江苏省': 'Giang Tô', '浙江省': 'Chiết Giang', '安徽省': 'An Huy', '福建省': 'Phúc Kiến',
  '江西省': 'Giang Tây', '山东省': 'Sơn Đông', '河南省': 'Hà Nam', '湖北省': 'Hồ Bắc', '湖南省': 'Hồ Nam',
  '广东省': 'Quảng Đông', '广西壮族自治区': 'Quảng Tây', '海南省': 'Hải Nam', '四川省': 'Tứ Xuyên', '贵州省': 'Quý Châu',
  '云南省': 'Vân Nam', '西藏自治区': 'Tây Tạng', '陕西省': 'Thiểm Tây', '甘肃省': 'Cam Túc', '青海省': 'Thanh Hải',
  '宁夏回族自治区': 'Ninh Hạ', '新疆维吾尔自治区': 'Tân Cương', '香港特别行政区': 'Hồng Kông', '澳门特别行政区': 'Ma Cao',
  '台湾省': 'Đài Loan', '安顺': 'An Thuận',
};

const STEM_VI = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'];
const BRANCH_VI = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];

/** 干支组合（甲子、丙寅……）整词收录，拆字时地支才能读成 Tý 而不是 Tử */
const GANZHI: Record<string, string> = {};
STEMS.forEach((s, i) => BRANCHES.forEach((b, j) => {
  if (i % 2 === j % 2) GANZHI[s + b] = `${STEM_VI[i]} ${BRANCH_VI[j]}`;
}));

const TERMS: Record<string, string> = { ...IZTRO_VI_TERMS, ...GANZHI, ...TERM_OVERRIDES };

/** 拆词时只用多字词；单字走 HANVIET_CHARS */
const MULTI_TERMS = Object.keys(TERMS).filter(k => [...k].length > 1);
const MAX_TERM_LEN = Math.max(...MULTI_TERMS.map(k => [...k].length));
const MULTI_SET = new Set(MULTI_TERMS);

const PUNCT: Record<string, string> = {
  '，': ', ', '、': ', ', '。': '. ', '：': ': ', '；': '; ', '！': '! ', '？': '? ',
  '（': ' (', '）': ') ', '【': ' [', '】': '] ', '「': ' “', '」': '” ', '《': ' «', '》': '» ',
  '·': ' · ', '—': ' — ', '～': '~', '／': '/', '　': ' ',
};

const isCjk = (ch: string) => /[㐀-鿿]/.test(ch);

/** 单个整词直接查表；否则按最长匹配拆词，查不到的字逐字转汉越音，非汉字原样保留 */
export function hanViet(zh: string): string {
  if (!zh) return zh;
  const exact = TERMS[zh];
  if (exact) return exact;
  if (!/[㐀-鿿]/.test(zh)) return zh;

  const chars = [...zh];
  let out = '';
  let lastWasWord = false; // 上一段是汉越音词或字母数字，下一个词前要补空格
  let i = 0;
  const pushWord = (word: string) => {
    if (lastWasWord) out += ' ';
    out += word;
    lastWasWord = true;
  };
  while (i < chars.length) {
    let matched = false;
    for (let len = Math.min(MAX_TERM_LEN, chars.length - i); len > 1; len--) {
      const piece = chars.slice(i, i + len).join('');
      if (MULTI_SET.has(piece)) {
        pushWord(TERMS[piece]);
        i += len;
        matched = true;
        break;
      }
    }
    if (matched) continue;
    const ch = chars[i++];
    if (isCjk(ch)) {
      const r = HANVIET_CHARS[ch];
      pushWord(r ? r[0].toUpperCase() + r.slice(1) : ch);
    } else if (PUNCT[ch]) {
      out += PUNCT[ch];
      lastWasWord = false;
    } else if (/[\p{L}\p{N}]/u.test(ch)) {
      // 连续字母数字（如 2026、AI）算同一个词，只在与汉越音词相接处补空格
      if (lastWasWord && isCjk(chars[i - 2] ?? '')) out += ' ';
      out += ch;
      lastWasWord = true;
    } else {
      out += ch;
      lastWasWord = false;
    }
  }
  return out.replace(/ {2,}/g, ' ').replace(/ ([,.:;!?)\]”»])/g, '$1').trim();
}

/** 宫位顺序表的越南语版本，供需要整表的地方用 */
export const PALACE_NAMES_ORDER_VI = PALACE_NAMES_ORDER.map(hanViet);
