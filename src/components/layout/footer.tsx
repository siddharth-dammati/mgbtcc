import Link from "next/link";
import { Trophy, Video, Camera, Share2, MonitorPlay, MessageCircle } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full bg-black border-t border-white/5 py-8 md:py-12 mt-auto relative z-20">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="col-span-1 md:col-span-2">
          <Link href="/" className="flex items-center gap-2 mb-4 group">
            <div className="size-8 rounded-lg bg-gradient-to-br from-primary to-yellow-600 flex items-center justify-center text-black shadow-[0_0_15px_rgba(234,179,8,0.2)] group-hover:shadow-[0_0_20px_rgba(234,179,8,0.4)] transition-all">
              <Trophy className="size-5" />
            </div>
            <span className="font-heading text-xl font-bold tracking-wider text-white">
              MUNNA BHAI <span className="text-primary">GAMING</span>
            </span>
          </Link>
          <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
            The ultimate tournament management platform for Free Fire esports. Experience premium competition, designed exclusively for the Telugu Community.
          </p>
          <div className="flex items-center gap-4 mt-6">
            <a href="#" className="p-2 bg-red-600/10 text-red-600 hover:bg-red-600 hover:text-white rounded-md transition-colors">
              <Video className="size-5" />
            </a>
            <a href="#" className="p-2 bg-pink-600/10 text-pink-600 hover:bg-pink-600 hover:text-white rounded-md transition-colors">
              <Camera className="size-5" />
            </a>
            <a href="#" className="p-2 bg-blue-600/10 text-blue-600 hover:bg-blue-600 hover:text-white rounded-md transition-colors">
              <Share2 className="size-5" />
            </a>
            <a href="#" className="p-2 bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-black rounded-md transition-colors">
              <MonitorPlay className="size-5" />
            </a>
            <a href="#" className="p-2 bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500 hover:text-white rounded-md transition-colors">
              <MessageCircle className="size-5" />
            </a>
          </div>
        </div>
        <div className="space-y-4">
          <h3 className="font-heading text-sm font-semibold tracking-wider uppercase text-white/80">Tournament</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/register" className="hover:text-primary transition-colors">Register Squad</Link></li>
            <li><Link href="/leaderboard" className="hover:text-primary transition-colors">Leaderboard</Link></li>
            <li><Link href="/#schedule" className="hover:text-primary transition-colors">Schedule</Link></li>
            <li><Link href="/#rules" className="hover:text-primary transition-colors">Rules</Link></li>
          </ul>
        </div>
        <div className="space-y-4">
          <h3 className="font-heading text-sm font-semibold tracking-wider uppercase text-white/80">Support</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
            <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
          </ul>
        </div>
      </div>
      <div className="container mx-auto px-4 mt-8 pt-8 border-t border-white/5 text-center text-xs text-muted-foreground flex flex-col md:flex-row justify-between items-center gap-4">
        <p>© {new Date().getFullYear()} Munna Bhai Gaming. All rights reserved.</p>
        <p className="font-bold tracking-[0.2em] uppercase text-white/30">ONE COMMUNITY. ONE STAGE.</p>
      </div>
    </footer>
  );
}
