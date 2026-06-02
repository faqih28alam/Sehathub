"use client";

import { useState } from "react";
import { useFaqItems, useCreateFaqItem, useDeleteFaqItem } from "@/hooks/use-ai";

const CATEGORIES = ["general", "booking", "payment", "health", "doctor", "other"];

export default function AiFaqAdminPage() {
  const { data: faqs, isLoading } = useFaqItems();
  const { mutateAsync: createFaq, isPending: creating } = useCreateFaqItem();
  const { mutateAsync: deleteFaq } = useDeleteFaqItem();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ question: "", answer: "", category: "general" });
  const [formError, setFormError] = useState("");
  const [catFilter, setCatFilter] = useState("");

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.question.trim() || !form.answer.trim()) {
      setFormError("Pertanyaan dan jawaban wajib diisi");
      return;
    }
    setFormError("");
    await createFaq(form);
    setForm({ question: "", answer: "", category: "general" });
    setShowForm(false);
  }

  const filtered = catFilter
    ? (faqs ?? []).filter((f) => f.category === catFilter)
    : (faqs ?? []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[26px] font-bold text-neutral-dark">AI — Kelola FAQ</h2>
          <p className="text-[14px] text-neutral-muted mt-1">
            FAQ ini digunakan sebagai konteks untuk chatbot pasien.
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-brand-pink text-white rounded-btn h-[40px] px-4 text-[14px] font-bold hover:bg-brand-pink-hover"
        >
          + Tambah FAQ
        </button>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setCatFilter("")}
          className={`text-[13px] px-3 py-1 rounded-full font-medium transition-colors ${
            catFilter === "" ? "bg-brand-pink text-white" : "bg-gray-100 text-neutral-muted hover:bg-gray-200"
          }`}
        >
          Semua
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCatFilter(catFilter === c ? "" : c)}
            className={`text-[13px] px-3 py-1 rounded-full font-medium capitalize transition-colors ${
              catFilter === c ? "bg-brand-pink text-white" : "bg-gray-100 text-neutral-muted hover:bg-gray-200"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* FAQ list */}
      <div className="space-y-3">
        {isLoading && (
          <p className="text-neutral-muted text-[14px]">Memuat...</p>
        )}
        {!isLoading && filtered.length === 0 && (
          <div className="bg-white border border-neutral-border rounded-card shadow-card p-8 text-center text-neutral-muted text-[14px]">
            Belum ada FAQ. Tambahkan item pertama untuk mengaktifkan chatbot.
          </div>
        )}
        {filtered.map((faq) => (
          <div
            key={faq.id}
            className="bg-white border border-neutral-border rounded-card shadow-card p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-neutral-muted capitalize">
                    {faq.category}
                  </span>
                  {!faq.isActive && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                      Nonaktif
                    </span>
                  )}
                </div>
                <p className="text-[15px] font-bold text-neutral-dark mb-1">{faq.question}</p>
                <p className="text-[14px] text-neutral-muted">{faq.answer}</p>
              </div>
              <button
                onClick={() => deleteFaq(faq.id)}
                className="text-[12px] text-red-500 hover:text-red-700 font-medium shrink-0 mt-1"
              >
                Hapus
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-card shadow-card w-full max-w-lg p-6">
            <h3 className="text-[18px] font-bold text-neutral-dark mb-4">Tambah FAQ</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              {formError && (
                <p className="text-[13px] text-brand-pink bg-[#FFE5EB] border border-brand-pink rounded px-3 py-2">
                  {formError}
                </p>
              )}
              <div>
                <label className="block text-[14px] font-bold text-neutral-dark mb-1">Kategori</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full h-[40px] border border-neutral-border rounded px-3 text-[14px] focus:outline-none focus:border-brand-pink"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c} className="capitalize">{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[14px] font-bold text-neutral-dark mb-1">Pertanyaan *</label>
                <input
                  value={form.question}
                  onChange={(e) => setForm({ ...form, question: e.target.value })}
                  className="w-full h-[40px] border border-neutral-border rounded px-3 text-[14px] focus:outline-none focus:border-brand-pink"
                  placeholder="How do I book an appointment?"
                />
              </div>
              <div>
                <label className="block text-[14px] font-bold text-neutral-dark mb-1">Jawaban *</label>
                <textarea
                  value={form.answer}
                  onChange={(e) => setForm({ ...form, answer: e.target.value })}
                  rows={4}
                  className="w-full border border-neutral-border rounded px-3 py-2 text-[14px] focus:outline-none focus:border-brand-pink resize-none"
                  placeholder="You can book via our website or WhatsApp..."
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 bg-brand-pink text-white h-[40px] rounded-btn text-[14px] font-bold hover:bg-brand-pink-hover disabled:opacity-60"
                >
                  {creating ? "Menyimpan..." : "Simpan FAQ"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 border border-neutral-border h-[40px] rounded-btn text-[14px] font-medium hover:border-brand-pink"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
