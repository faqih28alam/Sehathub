"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLogout } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/patient/dashboard", label: "Dashboard" },
  { href: "/patient/prescriptions", label: "Resep Saya" },
];

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { mutate: logout } = useLogout();

  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className="w-64 bg-white border-r border-neutral-border p-6 flex flex-col">
        <h1 className="text-[20px] font-bold text-brand-pink mb-8">SehatHub</h1>
        <nav className="flex flex-col gap-1 flex-1">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "px-3 py-2 rounded text-[14px] font-medium transition-colors",
                pathname.startsWith(item.href)
                  ? "bg-brand-pink-light text-brand-pink font-bold"
                  : "text-neutral-muted hover:bg-gray-100 hover:text-neutral-dark"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <button
          onClick={() => logout()}
          className="text-[13px] text-neutral-muted hover:text-brand-pink mt-4 text-left"
        >
          Keluar
        </button>
      </aside>
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
}
