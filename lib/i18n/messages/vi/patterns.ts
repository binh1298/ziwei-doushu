/**
 * 格局描述（lib/ziwei/patterns.ts 的 description 字段）。
 * 格局名走 term() 汉越音；这里只放描述正文。条件/出处暂保留中文。
 */
export const patterns: Record<string, string> = {
  '紫微入命，左辅右弼同会，帝王得贤臣辅佐，主大富大贵、统御之命。一生贵人不绝，宜走政商高位、跨界领袖之途。':
    'Tử Vi tọa Mệnh, Tả Phù Hữu Bật hội chiếu: đế vương có hiền thần phò tá, chủ đại phú đại quý, mệnh thống lĩnh. Cả đời quý nhân không dứt, hợp làm lãnh đạo cấp cao trong chính trị, kinh doanh.',
  '天府天相分守命宫三方四正，文武并济、权印双辉，主一生衣食丰足、地位崇高。古书云"府相朝垣千钟食禄"，常见于政界、企业管理者。':
    'Thiên Phủ, Thiên Tướng chia nhau trấn giữ tam phương tứ chính của Mệnh, văn võ song toàn, quyền ấn cùng sáng; chủ cả đời ăn mặc dư dả, địa vị cao. Cổ thư nói "Phủ Tướng triều viên, thiên chung thực lộc", thường gặp ở chính khách, nhà quản lý.',
  '太阳、天梁、文昌、禄存四星齐会命宫三方，号称"科举之星"，主清贵显达、考运极佳，宜走学术、文教、研究、专业认证之路，一生功名易就。':
    'Thái Dương, Thiên Lương, Văn Xương, Lộc Tồn cùng hội về tam phương Mệnh, gọi là "sao khoa cử"; chủ thanh quý hiển đạt, thi cử rất tốt, hợp học thuật, giáo dục, nghiên cứu, chứng chỉ chuyên môn; công danh dễ thành.',
  '武曲贪狼会命，财星与桃花欲望星交辉，古书云"武贪不发少年人"——三十岁后方能厚积薄发。主中年以后大富大贵，财源由人脉、应酬、欲望管理而来，适合金融、投机、销售、娱乐业。':
    'Vũ Khúc, Tham Lang hội Mệnh: sao tài và sao đào hoa dục vọng cùng chiếu. Cổ thư nói "Vũ Tham bất phát thiếu niên nhân" — sau 30 tuổi mới tích lũy mà bật lên. Chủ trung niên về sau đại phú đại quý, tài lộc đến từ quan hệ, giao tế và biết tiết chế dục vọng; hợp tài chính, đầu cơ, bán hàng, giải trí.',
  '七杀、破军、贪狼三星会命，开创闯荡之命格。一生变动多、不甘平凡，宜创业、军警、业务、销售。中年后才能稳定守成，年轻时易因冲动失利。':
    'Thất Sát, Phá Quân, Tham Lang hội Mệnh: mệnh cách khai phá, bôn ba. Đời nhiều biến động, không cam phận tầm thường; hợp khởi nghiệp, quân cảnh, kinh doanh, bán hàng. Sau trung niên mới ổn định, lúc trẻ dễ thất bại vì bốc đồng.',
  '天机太阴天同天梁四星齐入命迁财官，文质彬彬、聪慧善谋。最适合公职、学术、文艺、医疗、服务等需稳定累积的行业，不宜大冒险大投机。':
    'Thiên Cơ, Thái Âm, Thiên Đồng, Thiên Lương cùng vào Mệnh – Thiên Di – Tài Bạch – Quan Lộc: nho nhã, thông minh, giỏi mưu tính. Hợp nhất với công chức, học thuật, văn nghệ, y tế, dịch vụ — những ngành cần tích lũy ổn định; không hợp mạo hiểm, đầu cơ lớn.',
  '廉贞天相同宫，印绶格局，主秉公处事、清廉之名，宜任公职、行政管理、法务、企划。怕见擎羊化忌，则反主官非。':
    'Liêm Trinh, Thiên Tướng đồng cung, cách ấn thụ; chủ xử sự công chính, tiếng thanh liêm, hợp công chức, quản lý hành chính, pháp chế, hoạch định. Kỵ gặp Kình Dương, Hóa Kỵ — khi đó ngược lại chủ quan phi, kiện tụng.',
  '武曲七杀同宫，将星配财星，主果决刚毅、理财能力强，适合金融、军警、创业。但忌见化忌煞星，否则凶险。一生奋斗、积财但操心。':
    'Vũ Khúc, Thất Sát đồng cung: tướng tinh đi với tài tinh, chủ quyết đoán cương nghị, giỏi quản lý tiền bạc; hợp tài chính, quân cảnh, khởi nghiệp. Kỵ gặp Hóa Kỵ, sát tinh — khi đó hung hiểm. Cả đời phấn đấu, tích được tài nhưng lao tâm.',
  '天同天梁同宫，福星与荫星共会，主宽厚和善、乐于助人，宜医疗、教育、宗教、社会公益。但偏温和保守，难成大富大贵之局。':
    'Thiên Đồng, Thiên Lương đồng cung: phúc tinh và ấm tinh cùng hội, chủ khoan hậu hiền hòa, thích giúp người; hợp y tế, giáo dục, tôn giáo, công ích xã hội. Nhưng thiên về ôn hòa bảo thủ, khó thành cục đại phú đại quý.',
  '太阳太阴分居命宫两侧夹照，光明磊落，一生贵人相助，事业蓬勃。男主官贵，女主旺夫兴家。日月须不落陷方为真夹。':
    'Thái Dương, Thái Âm ở hai bên giáp chiếu cung Mệnh: quang minh lỗi lạc, cả đời được quý nhân giúp, sự nghiệp hưng thịnh. Nam chủ quan quý, nữ chủ vượng phu hưng gia. Nhật Nguyệt phải không hãm địa mới là giáp thật.',
  '巨门坐命子午，外表平凡而内蕴才学。早年默默无闻、中年方显贵气，宜走专业、研究、口才、传媒。需有禄权或文昌相助方能"凿石见玉"。':
    'Cự Môn tọa Mệnh tại Tý, Ngọ: bề ngoài bình thường nhưng bên trong có tài học. Thời trẻ âm thầm, trung niên mới hiển quý; hợp chuyên môn, nghiên cứu, hùng biện, truyền thông. Cần có Lộc, Quyền hoặc Văn Xương trợ giúp mới "đục đá thấy ngọc".',
  '命未空宫，对宫丑宫日月同辉拱照，号"明珠出海"。主出生平凡、后天努力出头，宜远赴他乡、学术研究或大公司高位，主大富大贵。':
    'Mệnh tại Mùi vô chính diệu, đối cung Sửu có Nhật Nguyệt cùng sáng chiếu về, gọi là "Minh Châu Xuất Hải". Chủ xuất thân bình thường, nhờ nỗ lực mà thành; hợp đi xa lập nghiệp, nghiên cứu học thuật hoặc chức vụ cao ở công ty lớn, chủ đại phú đại quý.',
  '紫微独坐命宫，帝王之星，自尊心强、有领导魅力。但紫微最忌"在野孤君"——若无左右辅弼相会，反成孤高自傲、易招毁谤。':
    'Tử Vi độc tọa cung Mệnh, sao đế vương: tự trọng cao, có sức hút lãnh đạo. Nhưng Tử Vi kỵ nhất "tại dã cô quân" — không có Tả Hữu Phù Bật hội chiếu thì thành cô cao tự phụ, dễ bị gièm pha.',
  '左辅右弼夹命，传统论述认为此格象征贵人相助与福厚特质。适合走仕途、大企业管理等能发挥组织才能的方向。古书云"左辅右弼，终身福厚"——强调此格在组织协调中的优势。':
    'Tả Phù, Hữu Bật giáp Mệnh; theo luận thuật truyền thống, cách này tượng trưng quý nhân tương trợ và phúc dày. Hợp con đường quan trường, quản lý doanh nghiệp lớn — nơi phát huy tài tổ chức. Cổ thư nói "Tả Phù Hữu Bật, chung thân phúc hậu" — nhấn mạnh ưu thế về điều phối, tổ chức.',
  '文昌文曲夹命宫，主聪明俊秀、文采斐然，宜走文教、学术、艺术、写作。古书云"昌曲夹命主科甲"，最利考运。':
    'Văn Xương, Văn Khúc giáp cung Mệnh: chủ thông minh tuấn tú, văn chương xuất sắc; hợp giáo dục, học thuật, nghệ thuật, viết lách. Cổ thư nói "Xương Khúc giáp Mệnh chủ khoa giáp", lợi nhất cho thi cử.',
  '天魁天钺夹命，男称天乙、女称玉堂，一生贵人提携。考试、求职、关键时刻常有意外贵人相助。':
    'Thiên Khôi, Thiên Việt giáp Mệnh (nam gọi Thiên Ất, nữ gọi Ngọc Đường): cả đời được quý nhân nâng đỡ. Thi cử, xin việc, những thời khắc then chốt thường có quý nhân bất ngờ giúp sức.',
  '化禄、禄存同会命宫三方四正，财源涌动、衣食丰足。古书云"双禄朝垣，富比陶朱"，主一生不愁财，多有正财横财兼得。':
    'Hóa Lộc, Lộc Tồn cùng hội tam phương tứ chính của Mệnh: tài nguyên dồi dào, ăn mặc sung túc. Cổ thư nói "Song Lộc triều viên, phú tỉ Đào Chu", chủ cả đời không lo tiền bạc, thường được cả chính tài lẫn hoạnh tài.',
  '化禄、化权、化科三吉化齐会命宫三方四正，号称"三奇加会"。主一生功名、财富、贵人三全，是紫微斗数最高吉格之一。':
    'Hóa Lộc, Hóa Quyền, Hóa Khoa — ba cát hóa cùng hội tam phương tứ chính của Mệnh, gọi là "Tam Kỳ Gia Hội". Chủ cả đời công danh, tài phú, quý nhân vẹn cả ba; là một trong những cách cục cát nhất của Tử Vi Đẩu Số.',
  '化忌坐命，左右擎羊陀罗夹命，古书云"羊陀夹忌为败局"，主一生劳碌奔波、坎坷不顺、身心俱疲。需以德行修养与积极做事化解，凡事谨慎为上。':
    'Hóa Kỵ tọa Mệnh, hai bên Kình Dương, Đà La giáp Mệnh; cổ thư nói "Dương Đà giáp Kỵ vi bại cục", chủ cả đời lao lực bôn ba, trắc trở, thân tâm mệt mỏi. Cần lấy đức hạnh, tu dưỡng và làm việc tích cực để hóa giải; mọi việc thận trọng là hơn.',
  '火星铃星分居命宫前后两宫夹命，主性急、易冲动、突发意外或纠纷。需培养耐性、避免冲动决策。':
    'Hỏa Tinh, Linh Tinh ở hai cung trước sau giáp Mệnh: chủ nóng tính, dễ bốc đồng, hay gặp bất trắc, tranh chấp đột ngột. Cần rèn kiên nhẫn, tránh quyết định vội vàng.',
  '地空地劫夹命，主财来财去、思想脱俗、易遁入宗教哲学。古书云"空劫夹命，财不聚"。宜技艺、宗教、研究等不重物质之业。':
    'Địa Không, Địa Kiếp giáp Mệnh: chủ tiền đến rồi đi, tư tưởng thoát tục, dễ hướng về tôn giáo, triết học. Cổ thư nói "Không Kiếp giáp Mệnh, tài bất tụ". Hợp kỹ nghệ, tôn giáo, nghiên cứu — những nghề không nặng vật chất.',
  '廉贞、七杀、擎羊三星会照命宫三方，传统论述中标记为需要特别关注的组合。此格在大限流年触发时提醒保持谨慎态度：驾驶安全、人际和平、医疗决策需理性——强调主动管理而非消极宿命。':
    'Liêm Trinh, Thất Sát, Kình Dương hội chiếu tam phương Mệnh; luận thuật truyền thống xếp vào tổ hợp cần đặc biệt lưu ý. Khi đại hạn, lưu niên kích hoạt, cách này nhắc giữ thái độ thận trọng: lái xe an toàn, hòa khí trong quan hệ, quyết định y tế cần lý trí — nhấn mạnh chủ động quản lý thay vì cam chịu số mệnh.',
  '巨门、火星、擎羊三星会照，传统古籍记载此格为需要警惕之组合（古文"终身缢死"为宿命论表述，今已不适用）。现代理解为：此组合象征直言易触发冲突、情绪激烈时需要自我觉察。修养方向是：练习温和表达、主动化解对立、培养情绪管理。':
    'Cự Môn, Hỏa Tinh, Kình Dương hội chiếu; cổ tịch ghi đây là tổ hợp cần cảnh giác (câu cổ "chung thân ải tử" là lối nói định mệnh, nay không còn phù hợp). Cách hiểu hiện đại: tổ hợp này tượng trưng lời nói thẳng dễ gây xung đột, cần tự nhận biết khi cảm xúc dâng cao. Hướng tu dưỡng: tập diễn đạt ôn hòa, chủ động hóa giải đối lập, rèn quản lý cảm xúc.',
  '铃星、文昌、陀罗、武曲四星齐会，传统古籍记载此为需要特别关注之组合（古文"限至投河"为宿命论表述，非现代理解）。现代建议为：此组合在大限流年触发时，提醒理性处理重大决策、关注情绪波动、维持生活的稳定性——强调主动管理而非消极等待。':
    'Linh Tinh, Văn Xương, Đà La, Vũ Khúc cùng hội; cổ tịch ghi đây là tổ hợp cần đặc biệt lưu ý (câu cổ "hạn chí đầu hà" là lối nói định mệnh, không phải cách hiểu hiện đại). Lời khuyên hiện đại: khi đại hạn, lưu niên kích hoạt, nên xử lý lý trí các quyết định lớn, để ý biến động cảm xúc, giữ cuộc sống ổn định — nhấn mạnh chủ động quản lý thay vì thụ động chờ đợi.',
  '擎羊于午宫坐命，号"马头带箭"，古书云"威镇边疆"。此格象征果决行动力与竞争精神，适合需要执行力与果敢决策的职业方向。传统论述同时提醒此格需要配合吉利星曜才能最优发挥——强调组合影响而非单星独论。':
    'Kình Dương tọa Mệnh tại Ngọ, gọi là "Mã Đầu Đới Tiễn", cổ thư nói "uy trấn biên cương". Cách này tượng trưng sức hành động quyết đoán và tinh thần cạnh tranh, hợp những nghề cần năng lực thực thi và quyết định dứt khoát. Luận thuật truyền thống cũng nhắc cách này cần phối hợp cát tinh mới phát huy tốt nhất — nhấn mạnh ảnh hưởng của tổ hợp chứ không luận riêng một sao.',
  '左辅右弼同会命宫三方四正，主一生贵人不绝、人缘极佳。最宜领导岗位与团队合作型工作。倪师说「辅弼夹命，平生贵人多」——你不是单打独斗的命，要善用人际网络。':
    'Tả Phù, Hữu Bật cùng hội tam phương tứ chính của Mệnh: chủ cả đời quý nhân không dứt, nhân duyên rất tốt. Hợp nhất với vị trí lãnh đạo và công việc theo nhóm. Thầy Nghê nói "Phụ Bật giáp Mệnh, bình sinh quý nhân đa" — bạn không phải mệnh đơn thương độc mã, hãy tận dụng mạng lưới quan hệ.',
  '天魁天钺同会命宫三方四正，主"天乙贵人"加持，关键时刻总有贵人提携。倪师说「魁钺夹命，必为贵人」——遇到困难时身边会出现得力相助者，宜主动维护人脉。':
    'Thiên Khôi, Thiên Việt cùng hội tam phương tứ chính của Mệnh: được "Thiên Ất quý nhân" gia trì, thời khắc then chốt luôn có quý nhân nâng đỡ. Thầy Nghê nói "Khôi Việt giáp Mệnh, tất vi quý nhân" — lúc khó khăn sẽ có người đắc lực giúp, nên chủ động giữ gìn quan hệ.',
  '化科 + 化权 同会三方四正，主名权双美——既有学识/名声（科），又有掌控力（权），宜走"专业权威"路线（如医生、律师、教授、技术骨干），名利双收且根基扎实。':
    'Hóa Khoa và Hóa Quyền cùng hội tam phương tứ chính: chủ danh và quyền đều đẹp — vừa có học thức, danh tiếng (Khoa), vừa có năng lực nắm quyền (Quyền); hợp con đường "chuyên gia có uy tín" (bác sĩ, luật sư, giáo sư, kỹ thuật nòng cốt), danh lợi song toàn và nền tảng vững.',
};
