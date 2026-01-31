export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  try {
    const { topic, tone, length } = req.body;

    if (!topic || !tone || !length) {
      return res.status(400).json({
        success: false,
        error: "Missing parameters"
      });
    }

    const prompt = `Write a ${length} ${tone} social media copy about: ${topic}`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a helpful marketing copywriter." },
          { role: "user", content: prompt }
        ]
      })
    });

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    return res.status(200).json({
      success: true,
      content
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
}
