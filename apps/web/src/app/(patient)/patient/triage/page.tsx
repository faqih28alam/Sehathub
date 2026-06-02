"use client";

import { useState } from "react";
import { useTriage, type TriageResult } from "@/hooks/use-ai";

const URGENCY_CONFIG = {
  emergency: {
    label: "DARURAT",
    color: "bg-red-100 border-red-400 text-red-800",
    badge: "bg-red-500 text-white",
    icon: "🚨",
  },
  urgent: {
    label: "SEGERA",
    color: "bg-orange-100 border-orange-400 text-orange-800",
    badge: "bg-orange-500 text-white",
    icon: "⚠️",
  },
  routine: {
    label: "BUAT JANJI",
    color: "bg-blue-100 border-blue-400 text-blue-800",
    badge: "bg-blue-500 text-white",
    icon: "📅",
  },
  "self-care": {
    label: "PERAWATAN MANDIRI",
    color: "bg-green-100 border-green-400 text-green-800",
    badge: "bg-green-600 text-white",
    icon: "🏠",
  },
};

export default function TriagePage() {
  const [symptoms, setSymptoms] = useState("");
  const [language, setLanguage] = useState<"en" | "id">("en");
  const [result, setResult] = useState<TriageResult | null>(null);

  const { mutateAsync: triage, isPending, error } = useTriage();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!symptoms.trim()) return;
    const res = await triage({ symptoms, language });
    setResult(res);
  }

  const cfg = result ? URGENCY_CONFIG[result.urgency] : null;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-[26px] font-bold text-neutral-dark">Triage Gejala</h2>
        <p className="text-[14px] text-neutral-muted mt-1">
          Deskripsikan gejala Anda — AI kami akan membantu menilai tingkat urgensi.
        </p>
      </div>

      <div className="bg-white border border-neutral-border rounded-card shadow-card p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            {(["en", "id"] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLanguage(l)}
                className={`text-[13px] px-3 py-1 rounded-full font-medium transition-colors ${
                  language === l
                    ? "bg-brand-pink text-white"
                    : "bg-gray-100 text-neutral-muted hover:bg-gray-200"
                }`}
              >
                {l === "en" ? "English" : "Bahasa Indonesia"}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-[14px] font-bold text-neutral-dark mb-1">
              {language === "en" ? "Describe your symptoms" : "Deskripsikan gejala Anda"}
            </label>
            <textarea
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              rows={5}
              placeholder={
                language === "en"
                  ? "e.g. I have had a fever of 38.5°C for 2 days, headache, and mild sore throat..."
                  : "mis. Saya demam 38.5°C selama 2 hari, sakit kepala, dan tenggorokan sedikit sakit..."
              }
              className="w-full border border-neutral-border rounded px-3 py-2 text-[14px] focus:outline-none focus:border-brand-pink resize-none"
            />
          </div>

          {error && (
            <p className="text-[13px] text-brand-pink">Gagal memproses — coba lagi.</p>
          )}

          <button
            type="submit"
            disabled={isPending || !symptoms.trim()}
            className="w-full bg-brand-pink text-white h-[40px] rounded-btn text-[16px] font-bold hover:bg-brand-pink-hover disabled:opacity-60 transition-colors"
          >
            {isPending ? "Menganalisis..." : language === "en" ? "Assess Symptoms" : "Nilai Gejala"}
          </button>
        </form>
      </div>

      {result && cfg && (
        <div className={`border-2 rounded-card p-6 space-y-4 ${cfg.color}`}>
          <div className="flex items-center gap-3">
            <span className="text-[32px]">{cfg.icon}</span>
            <div>
              <span className={`text-[12px] font-bold px-3 py-1 rounded-full ${cfg.badge}`}>
                {cfg.label}
              </span>
              <p className="text-[16px] font-bold mt-1">{result.summary}</p>
            </div>
          </div>

          {result.recommendations.length > 0 && (
            <div>
              <p className="text-[14px] font-bold mb-2">
                {language === "en" ? "Recommendations" : "Rekomendasi"}
              </p>
              <ul className="space-y-1">
                {result.recommendations.map((r, i) => (
                  <li key={i} className="text-[14px] flex gap-2">
                    <span>•</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.seekEmergencyIf.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded p-3">
              <p className="text-[13px] font-bold text-red-700 mb-1">
                {language === "en" ? "Seek emergency care if:" : "Segera ke IGD jika:"}
              </p>
              <ul className="space-y-0.5">
                {result.seekEmergencyIf.map((s, i) => (
                  <li key={i} className="text-[13px] text-red-700 flex gap-2">
                    <span>⚠</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.urgency !== "self-care" && result.urgency !== "emergency" && (
            <a
              href="/patient/dashboard"
              className="inline-block bg-brand-pink text-white h-[40px] px-6 rounded-btn text-[14px] font-bold hover:bg-brand-pink-hover leading-[40px]"
            >
              Book an Appointment →
            </a>
          )}
        </div>
      )}

      <p className="text-[12px] text-neutral-muted text-center">
        ⚠ This is an AI-powered assessment tool only. Always consult a qualified doctor for medical advice.
      </p>
    </div>
  );
}
