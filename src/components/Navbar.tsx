import Link from "next/link";
import { Cloud } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-white">
          <Cloud className="h-5 w-5 text-blue-400" />
          WeatherAI
        </Link>
      </div>
    </nav>
  );
}
