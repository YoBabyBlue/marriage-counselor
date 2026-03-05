"use client";
import { useState, useRef, useEffect } from "react";

export default function ArgumentCoach() {
  const [messages, setMessages] = useState([]);
  const [inputA, setInputA] = useState("");
  const [inputB, setInputB] = useState("");
  const [activeInput, setActiveInput] = useState("A");
  const [analyzing, setAnalyzing] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");
  const [view, setView] = useState("record");
  const chatRef = useRef(null);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  const addMessage = (speaker) => {
    const text = (speaker === "A" ? inputA : inputB).trim();
    if (!text) return;
    setMessages((prev) => [...prev, { speaker, text, id: Date.now() }]);
    if (speaker === "A") setInputA(""); else setInputB("");
    setActiveInput(speaker === "A" ? "B" : "A");
  };

  const handleKeyDown = (e, speaker) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); addMessage(speaker); }
  };

  const analyze = async () => {
    if (messages.length < 2) { setError("至少得说两句话才能分析嘛～"); return; }
    setError(""); setAnalyzing(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
      });
      const parsed = await res.json();
      setReport(parsed); setView("report");
    } catch (e) {
      setError("分析失败了，可能咨询师今天也有点emo😅 请重试");
    } finally { setAnalyzing(false); }
  };

  const reset = () => {
    setMessages([]); setReport(null); setView("record");
    setError(""); setInputA(""); setInputB("");
  };

  const accentA = "#f87171", accentB = "#60a5fa";

  return (
    <div style={{ fontFamily: "'Noto Serif SC', Georgia, serif", minHeight: "100vh", background: "linear-gradient(135deg, #fdf6f0 0%, #fce8e8 40%, #e8f0fc 100%)" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;600;700&display=swap');
        .fade-in { animation: fadeIn 0.4s ease forwards; }
        @keyframes fadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        .pulse { animation: pulse 2s infinite; }
        @keyframes pulse { 0%,100%{opacity:1;} 50%{opacity:0.4;} }
        .card { background:rgba(255,255,255,0.88); backdrop-filter:blur(12px); border-radius:20px; box-shadow:0 4px 30px rgba(0,0,0,0.06); }
        .score-bar { transition: width 1.2s cubic-bezier(.4,0,.2,1); }
        textarea:focus { outline:none; }
        * { box-sizing: border-box; }
      `}</style>
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "24px 16px 100px" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }} className="fade-in">
          <div style={{ fontSize: 42, marginBottom: 8 }}>🛋️</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#2d2d2d", margin: 0 }}>心理咨询室</h1>
          <p style={{ fontSize: 13, color: "#999", marginTop: 6, letterSpacing: 1 }}>婚姻咨询</p>
        </div>
        <div className="card fade-in" style={{ padding: 4, display: "flex", gap: 4, marginBottom: 20 }}>
          {["record", "report"].map((tab) => (
            <button key={tab} onClick={() => tab === "report" && report ? setView("report") : setView("record")} style={{ flex: 1, padding: "10px 0", borderRadius: 14, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: view === tab ? 700 : 400, transition: "all 0.3s", background: view === tab ? (tab === "record" ? "linear-gradient(135deg,#f87171,#fb923c)" : "linear-gradient(135deg,#60a5fa,#818cf8)") : "transparent", color: view === tab ? "#fff" : "#aaa" }}>
              {tab === "record" ? "📝 记录对话" : `📋 查看报告${report ? " ✓" : ""}`}
            </button>
          ))}
        </div>
        {view === "record" && (
          <div className="fade-in">
            <div ref={chatRef} className="card" style={{ minHeight: 200, maxHeight: 300, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
              {messages.length === 0 ? (
                <div style={{ textAlign: "center", color: "#ccc", fontSize: 14, margin: "auto" }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>💬</div>
                  点击输入框开始记录对话<br />
                  <span style={{ fontSize: 12 }}>A = 对方 · B = 你自己</span><br />
                  <span style={{ fontSize: 12 }}>🎙️ 可用键盘麦克风语音输入</span>
                </div>
              ) : messages.map((msg) => (
                <div key={msg.id} className="fade-in" style={{ display: "flex", justifyContent: msg.speaker === "B" ? "flex-end" : "flex-start" }}>
                  <div style={{ maxWidth: "75%", padding: "10px 14px", borderRadius: msg.speaker === "B" ? "18px 18px 4px 18px" : "18px 18px 18px 4px", background: msg.speaker === "A" ? "#fff0f0" : "#e8f4ff", border: `1px solid ${msg.speaker === "A" ? "#fcc" : "#bde0ff"}`, fontSize: 14, color: "#333", lineHeight: 1.5 }}>
                    <div style={{ fontSize: 11, color: msg.speaker === "A" ? accentA : accentB, marginBottom: 4, fontWeight: 600 }}>{msg.speaker === "A" ? "Ta (A)" : "我 (B)"}</div>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
            <div className="card" style={{ padding: 16, marginBottom: 16 }}>
              <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                {["A", "B"].map((s) => (
                  <button key={s} onClick={() => setActiveInput(s)} style={{ flex: 1, padding: "8px 0", borderRadius: 12, border: `2px solid ${activeInput === s ? (s === "A" ? accentA : accentB) : "#eee"}`, background: activeInput === s ? (s === "A" ? "#fff0f0" : "#e8f4ff") : "#fafafa", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: activeInput === s ? 700 : 400, color: activeInput === s ? (s === "A" ? accentA : accentB) : "#ccc", transition: "all 0.2s" }}>
                    {s === "A" ? "Ta 说 (A)" : "我说 (B)"}
                  </button>
                ))}
              </div>
              {["A", "B"].map((s) => activeInput !== s ? null : (
                <div key={s}>
                  <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
                    <textarea value={s === "A" ? inputA : inputB} onChange={(e) => s === "A" ? setInputA(e.target.value) : setInputB(e.target.value)} onKeyDown={(e) => handleKeyDown(e, s)} placeholder={s === "A" ? "Ta说了什么…" : "我说了什么…"} rows={2} style={{ flex: 1, border: `1.5px solid ${s === "A" ? "#fcc" : "#bde0ff"}`, borderRadius: 12, padding: "10px 14px", fontFamily: "inherit", fontSize: 14, resize: "none", background: s === "A" ? "#fff8f8" : "#f0f8ff", color: "#333" }} />
                    <button onClick={() => addMessage(s)} style={{ width: 44, height: 44, borderRadius: 12, border: "none", flexShrink: 0, background: s === "A" ? "linear-gradient(135deg,#f87171,#fb923c)" : "linear-gradient(135deg,#60a5fa,#818cf8)", color: "#fff", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>↑</button>
                  </div>
                  <div style={{ fontSize: 11, color: "#bbb", marginTop: 8 }}>🎙️ 语音输入：点击输入框 → 键盘麦克风键说话</div>
                </div>
              ))}
            </div>
            {error && <div style={{ color: accentA, fontSize: 13, textAlign: "center", marginBottom: 12 }}>{error}</div>}
            <button onClick={analyze} disabled={analyzing || messages.length < 2} style={{ width: "100%", padding: "16px 0", borderRadius: 16, border: "none", background: analyzing || messages.length < 2 ? "#e5e7eb" : "linear-gradient(135deg,#f87171 0%,#fb923c 50%,#818cf8 100%)", color: analyzing || messages.length < 2 ? "#aaa" : "#fff", fontSize: 16, fontWeight: 700, fontFamily: "inherit", cursor: analyzing || messages.length < 2 ? "not-allowed" : "pointer", transition: "all 0.3s", letterSpacing: 1 }}>
              {analyzing ? <span><span className="pulse" style={{ display: "inline-block", marginRight: 8 }}>●</span>咨询师正在思考…</span> : "🔍 开始复盘"}
            </button>
            {messages.length > 0 && <button onClick={reset} style={{ width: "100%", marginTop: 10, padding: "10px 0", borderRadius: 12, border: "1.5px solid #eee", background: "transparent", color: "#bbb", fontSize: 13, fontFamily: "inherit", cursor: "pointer" }}>重新开始</button>}
          </div>
        )}
        {view === "report" && report && (
          <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="card" style={{ padding: 20, textAlign: "center" }}>
              <div style={{ fontSize: 11, color: "#bbb", letterSpacing: 2, marginBottom: 8 }}>咨询师诊断</div>
              <div style={{ fontSize: 17, fontWeight: 700, color: "#333", lineHeight: 1.6 }}>{report.summary}</div>
            </div>
            <div className="card" style={{ padding: 20 }}>
              <div style={{ fontSize: 12, color: "#bbb", letterSpacing: 2, marginBottom: 14 }}>沟通评分</div>
              {[{ label: "Ta (A)", score: report.diagnosis.scoreA, tag: report.diagnosis.labelA, color: accentA }, { label: "我 (B)", score: report.diagnosis.scoreB, tag: report.diagnosis.labelB, color: accentB }].map((p) => (
                <div key={p.label} style={{ marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 13, color: "#555" }}>{p.label} · <span style={{ color: p.color, fontSize: 12 }}>{p.tag}</span></span>
                    <span style={{ fontSize: 16, fontWeight: 700, color: p.color }}>{p.score}</span>
                  </div>
                  <div style={{ background: "#f3f4f6", borderRadius: 8, height: 8, overflow: "hidden" }}>
                    <div className="score-bar" style={{ width: `${p.score}%`, height: "100%", background: `linear-gradient(90deg,${p.color},${p.color}99)`, borderRadius: 8 }} />
                  </div>
                </div>
              ))}
            </div>
            {report.highlights?.length > 0 && <div className="card" style={{ padding: 20 }}><div style={{ fontSize: 12, color: "#bbb", letterSpacing: 2, marginBottom: 14 }}>✨ 高光时刻</div><div style={{ display: "flex", flexDirection: "column", gap: 12 }}>{report.highlights.map((h, i) => <div key={i} style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 14, padding: "12px 14px" }}><div style={{ fontSize: 13, color: "#92400e", fontWeight: 600, marginBottom: 4 }}>{h.speaker === "A" ? "Ta" : "我"} 说：「{h.quote}」</div><div style={{ fontSize: 12, color: "#a16207", lineHeight: 1.5 }}>💡 {h.comment}</div></div>)}</div></div>}
            {report.mistakes?.length > 0 && <div className="card" style={{ padding: 20 }}><div style={{ fontSize: 12, color: "#bbb", letterSpacing: 2, marginBottom: 14 }}>💥 踩雷时刻</div><div style={{ display: "flex", flexDirection: "column", gap: 12 }}>{report.mistakes.map((m, i) => <div key={i} style={{ background: "#fff1f2", border: "1px solid #fecdd3", borderRadius: 14, padding: "12px 14px" }}><div style={{ fontSize: 13, color: "#9f1239", fontWeight: 600, marginBottom: 4 }}>{m.speaker === "A" ? "Ta" : "我"} 说：「{m.quote}」</div><div style={{ fontSize: 12, color: "#be123c", lineHeight: 1.5 }}>⚠️ {m.comment}</div></div>)}</div></div>}
            <div className="card" style={{ padding: 20 }}><div style={{ fontSize: 12, color: "#bbb", letterSpacing: 2, marginBottom: 14 }}>📚 下次可以这样做</div><div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{report.nextTime.map((tip, i) => <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 13, color: "#555", lineHeight: 1.6 }}><span style={{ color: "#818cf8", flexShrink: 0, marginTop: 2 }}>▸</span>{tip}</div>)}</div></div>
            <div className="card" style={{ padding: 20, background: "linear-gradient(135deg,rgba(248,113,113,0.08),rgba(129,140,248,0.08))", textAlign: "center" }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>🩺</div>
              <div style={{ fontSize: 12, color: "#bbb", letterSpacing: 2, marginBottom: 10 }}>咨询师最终裁决</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#333", marginBottom: 12 }}>{report.diagnosis.verdict}</div>
              <div style={{ fontSize: 13, color: "#818cf8", background: "rgba(129,140,248,0.1)", borderRadius: 12, padding: "10px 16px", lineHeight: 1.6 }}>{report.diagnosis.advice}</div>
            </div>
            <button onClick={reset} style={{ width: "100%", padding: "14px 0", borderRadius: 16, border: "none", background: "linear-gradient(135deg,#f87171,#818cf8)", color: "#fff", fontSize: 14, fontWeight: 700, fontFamily: "inherit", cursor: "pointer" }}>开始新一轮复盘 🔄</button>
          </div>
        )}
      </div>
    </div>
  );
}
