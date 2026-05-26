export default function PatientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className="w-64 bg-white border-r border-neutral-border p-6 flex flex-col gap-2">
        <h1 className="text-[20px] font-bold text-brand-pink mb-6">SehatHub</h1>
        <nav className="text-[14px] text-neutral-muted">
          <p className="font-bold text-neutral-dark">Portal Pasien</p>
        </nav>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
