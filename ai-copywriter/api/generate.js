const Anthropic = require("@anthropic-ai/sdk");

module.exports = async (req, res) => {
  // 只允许 POST
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed",
    });
  }

  try {
    // 1️⃣ 读取前端传来的数据
    const { topic, tone, length } = req.body || {};

    if (!topic || !tone || !length) {
      return res.status(400).json({
        success: false,
        error: "Missing topic / tone / length",
      });
    }

    // 2️⃣ 初始化 Claude（Anthropic）
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    // 3️⃣ 调用 Claude API
    const response = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 300,
      messages: [
        {
          role: "user",
          content: `Write a ${tone} marketing copy about "${topic}" with a length of ${length}.`,
        },
      ],
    });

    // 4️⃣ 安全取出生成文本（防 undefined）
    const generatedText =
      response?.content?.[0]?.text ??
      "AI did not return any content.";

    // 5️⃣ 返回给前端（必须是 JSON）
    return res.status(200).json({
      success: true,
      content: generatedText,
    });
  } catch (error) {
    // ❌ 出错也要返回 JSON（否则前端会报 not valid JSON）
    return res.status(500).json({
      success: false,
      error: error?.message || "Claude API error",
    });
  }
};
