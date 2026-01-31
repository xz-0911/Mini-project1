export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { topic, tone, length } = req.body;

  // ⬇️ 先用假数据兜底（非常重要，用来验证前后端通不通）
  const generatedText = `这是一个关于「${topic}」的示例文案。
语气：${tone}
长度：${length}

这是一个测试生成结果，用来确认 API 正常工作。`;

  return res.status(200).json({
    success: true,
    content: generatedText
  });
}
