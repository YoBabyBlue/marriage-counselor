export async function POST(request) {
  const { messages } = await request.json();

  const SYSTEM_PROMPT = `你是一位冷静、睿智、但略带幽默的婚姻咨询师。你的工作是分析一段对话或争吵，给出客观、温柔但犀利的复盘报告。

请用以下JSON格式输出分析结果（只输出JSON，不要加任何说明或markdown代码块）：

{
  "summary": "一句话总结这场争吵的本质（可以幽默）",
  "highlights": [{"quote": "说的话","speaker": "A或B","comment": "点评","type": "highlight"}],
  "mistakes": [{"quote": "说的话","speaker": "A或B","comment": "点评","type": "mistake"}],
  "nextTime": ["下次可以这样说……","记住……","避免……"],
  "diagnosis": {"verdict": "诊断结论","scoreA": 60,"scoreB": 70,"labelA": "情绪化但真诚","labelB": "逻辑强但缺乏共情","advice": "给这对cp的一句话建议"}
}

分析时要：
1. 客观中立，不偏袒任何一方
2. 找出真正的沟通问题（命名心理机制，如"情绪移位"、"防御性归因"等）
3. 幽默但不刻薄，有爱但不回避问题
4. 高光时刻要鼓励，失误要给出改进方向
5. nextTime里的建议要具体，给出可以直接说出口的话术`;

  const conversation = messages
    .map((m) => `${m.speaker === "A" ? "Ta（A）" : "我（B）"}：${m.text}`)
    .join("\n");

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1500,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: `请分析以下对话：\n\n${conversation}` }],
    }),
  });

  const data = await res.json();
  const raw = data.content?.find((c) => c.type === "text")?.text || "";
  const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());

  return Response.json(parsed);
}
