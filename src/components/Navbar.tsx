"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Cloud } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Dashboard", icon: Cloud },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <span className="flex items-center gap-2 text-lg font-semibold text-white">
          <Cloud className="h-5 w-5 text-blue-400" />
          WeatherAI
        </span>

        <div className="flex items-center gap-1">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                pathname === href
                  ? "bg-white/10 text-white"
                  : "text-slate-400 hover:text-white"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
