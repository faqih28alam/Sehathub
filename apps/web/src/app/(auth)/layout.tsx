export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-[440px]">
        <div className="mb-8 text-center">
          <h1 className="text-[28px] font-bold text-brand-pink">SehatHub</h1>
          <p className="text-[14px] text-neutral-muted mt-1">
            Layanan kesehatan digital terpercaya
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
