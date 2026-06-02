"use client";

import { useState, useRef, useEffect } from "react";
import { useFaqQuery, type FaqAnswer } from "@/hooks/use-ai";

interface Message {
  role: "user" | "assistant";
  text: string;
  sources?: number[];
}

const SUGGESTED = [
  "How do I book an appointment?",
  "What payment methods do you accept?",
  "Do you accept international insurance?",
  "What are your clinic hours?",
  "How do I get a prescription refill?",
];

export default function FaqPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: "Hello! I'm the SehatHub AI assistant. Ask me anything about our clinic — booking, payments, services, and more.",
    },
  ]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const { mutateAsync: askFaq, isPending } = useFaqQuery();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(question?: string) {
    const q = (question ?? input).trim();
    if (!q) return;
    setInput("");

    setMessages((prev) => [...prev, { role: "user", text: q }]);

    try {
      const res: FaqAnswer = await askFaq(q);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: res.answer, sources: res.sources },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Sorry, I couldn't process your question. Please try again or contact us directly." },
      ]);
    }
  }

  return (
    <div className="max-w-2xl flex flex-col h-[calc(100vh-160px)]">
      <div className="mb-4">
        <h2 className="text-[26px] font-bold text-neutral-dark">FAQ — Tanya Klinik</h2>
        <p className="text-[14px] text-neutral-muted mt-1">
          Tanya apa saja tentang layanan, booking, dan pembayaran SehatHub.
        </p>
      </div>

      {/* Chat window */}
      <div className="flex-1 bg-white border border-neutral-border rounded-card shadow-card overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] px-4 py-2.5 rounded-[12px] text-[14px] ${
                msg.role === "user"
                  ? "bg-brand-pink text-white rounded-br-[4px]"
                  : "bg-gray-100 text-neutral-dark rounded-bl-[4px]"
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.text}</p>
              {msg.sources && msg.sources.length > 0 && (
                <p className="text-[11px] opacity-60 mt-1">
                  Based on FAQ #{msg.sources.join(", #")}
                </p>
              )}
            </div>
          </div>
        ))}

        {isPending && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-[12px] rounded-bl-[4px] px-4 py-2.5">
              <div className="flex gap-1 items-center h-5">
                <span className="w-2 h-2 bg-neutral-muted rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 bg-neutral-muted rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 bg-neutral-muted rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggested questions */}
      {messages.length === 1 && (
        <div className="flex gap-2 flex-wrap mt-2">
          {SUGGESTED.map((s) => (
            <button
              key={s}
              onClick={() => handleSend(s)}
              className="text-[12px] px-3 py-1.5 rounded-full border border-neutral-border bg-white text-neutral-muted hover:border-brand-pink hover:text-brand-pink transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <form
        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
        className="flex gap-2 mt-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question..."
          disabled={isPending}
          className="flex-1 h-[40px] border border-neutral-border rounded px-3 text-[14px] focus:outline-none focus:border-brand-pink disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={isPending || !input.trim()}
          className="bg-brand-pink text-white h-[40px] px-5 rounded-btn text-[14px] font-bold hover:bg-brand-pink-hover disabled:opacity-60"
        >
          Kirim
        </button>
      </form>
    </div>
  );
}
