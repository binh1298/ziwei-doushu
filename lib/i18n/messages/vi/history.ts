/** 历史记录（/chart 与 /heming） */
export const history: Record<string, string> = {
  '历史记录': 'Lịch sử',
  '暂无历史记录。起盘后会自动保存，AI 解读也会一并保存。': 'Chưa có lịch sử. Lá số và luận giải AI sẽ tự động được lưu sau khi lập.',
  '同名、同生日、同出生时分视为同一个人，再排一次会覆盖；若排出的盘变了（如改了性别），旧解读作废。':
    'Cùng tên, cùng ngày sinh và cùng giờ phút sinh được coi là một người; lập lại sẽ ghi đè. Nếu lá số thay đổi (ví dụ đổi giới tính), luận giải cũ không còn áp dụng.',
  '导出': 'Xuất',
  '导入': 'Nhập',
  '已导入 {c} 条命盘记录、{h} 条合盘记录': 'Đã nhập {c} lá số và {h} hợp lá số',
  '导入失败：不是有效的历史记录文件': 'Nhập thất bại: không phải tệp lịch sử hợp lệ',
  '未命名': 'Chưa đặt tên',
  '时辰不详': 'Không rõ giờ',
  '{n} 条解读': '{n} luận giải',
  '打开': 'Mở',
  '编辑': 'Sửa',
  '删除': 'Xóa',
  '确定删除这条记录？': 'Xóa bản ghi này?',
  '已从历史记录还原，解读不会重新生成': 'Đã khôi phục từ lịch sử, luận giải không được tạo lại',
  '合盘历史': 'Lịch sử hợp lá số',
  '查看': 'Xem',
  '提问：{q}': 'Câu hỏi: {q}',
  '完整合盘': 'Hợp lá số đầy đủ',

  // InsightPanel 页签
  '宫位': 'Cung',
  '重新生成': 'Tạo lại',
  '点击命盘上的宫位，这里会显示该宫的解读': 'Bấm vào một cung trên lá số để xem luận giải của cung đó',
  '针对「{topic}」继续追问或要求展开…': 'Hỏi thêm hoặc yêu cầu nói rõ hơn về "{topic}"…',
  '空宫（借对宫）': 'Vô chính diệu (mượn đối cung)',
  '正在生成「{topic}」，完成后自动开始这一页': 'Đang tạo "{topic}"; xong sẽ tự động tạo tiếp mục này',
};
