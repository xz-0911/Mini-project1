export default async function handler(req, res) {
  // 允许前端 POST
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  try {
    const { topic, tone, length } = req.body || {};

    if (!topic) {
      return res.status(400).json({ success: false, error: "Missing topic" });
    }

    // 你在 Vercel 里要配置这个环境变量
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        error: "Missing OPENAI_API_KEY in Vercel Environment Variables",
      });
    }

    // 生成文案的提示词：你可以按作业需求再细化
    const prompt = `
You are a professional social media copywriter.
Write copy based on:
- Topic: ${topic}
- Tone: ${tone || "friendly"}
- Length: ${length || "medium"}

Return only the final copy text (no extra labels).
`.trim();

    // 调用 OpenAI Responses API
    const r = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: prompt,
      }),
    });

    if (!r.ok) {
      const errText = await r.text();
      return res.status(500).json({
        success: false,
        error: `OpenAI API error: ${r.status} ${errText}`,
      });
    }

    const data = await r.json();

    // Responses API 常见文本位置（做兼容提取）
    const text =
      data?.output_text ||
      data?.output?.[0]?.content?.[0]?.text ||
      "";

    return res.status(200).json({
      success: true,
      content: text || "(No text returned)",
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      error: e?.message || "Server error",
    });
  }
}
