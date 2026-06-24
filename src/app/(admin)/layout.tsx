"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/use-auth";
import { LayoutDashboard, Users, Trophy, Swords, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

import { useEffect } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, role, loading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else {
        // Enforce the admin password modal check
        const hasAccess = sessionStorage.getItem("adminAccess") === "granted";
        if (!hasAccess) {
          router.replace("/my-squad");
        }
      }
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    await auth.signOut();
    router.push("/login");
  };

  const navItems = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Teams", href: "/dashboard/teams", icon: Users },
    { name: "Matches", href: "/dashboard/matches", icon: Swords },
    { name: "Leaderboard", href: "/dashboard/leaderboard", icon: Trophy },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="size-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#050505]">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-black hidden md:flex flex-col z-10">
        <div className="h-16 flex items-center px-6 border-b border-white/5">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="size-8 rounded-md bg-gradient-to-br from-primary to-yellow-600 flex items-center justify-center text-black">
              <Trophy className="size-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-black tracking-wider text-white leading-tight">
                MBG
              </span>
              <span className="text-[10px] text-primary uppercase font-bold tracking-widest leading-none">
                Admin
              </span>
            </div>
          </Link>
        </div>
        
        <motion.nav 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="flex-1 py-6 px-4 space-y-1"
        >
          <div className="mb-4 px-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
            Menu
          </div>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <motion.div key={item.name} variants={itemVariants}>
                <Link
                  href={item.href}
                  className={`group relative flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive 
                      ? "bg-primary/10 text-primary font-bold" 
                      : "text-muted-foreground hover:bg-white/5 hover:text-white font-medium"
                  }`}
                >
                  <item.icon className={`size-5 transition-colors ${isActive ? "text-primary" : "text-muted-foreground group-hover:text-white"}`} />
                  <span>{item.name}</span>
                </Link>
              </motion.div>
            );
          })}
        </motion.nav>

        <div className="p-4 border-t border-white/5 bg-white/[0.02]">
          <div className="mb-4 px-2 flex items-center gap-3">
            <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
              {(user?.displayName || user?.email || "A")[0].toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-white truncate">{user?.displayName || user?.email}</p>
              <p className="text-[10px] uppercase tracking-widest text-primary font-bold">{role}</p>
            </div>
          </div>
          <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-white hover:bg-destructive/20 hover:border-destructive/50 border border-transparent transition-all" onClick={handleLogout}>
            <LogOut className="mr-2 size-4 text-destructive" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden z-10 relative">
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-black md:hidden">
           <span className="font-heading font-bold text-white">MBG <span className="text-primary">ADMIN</span></span>
        </header>
        <div className="flex-1 overflow-auto p-6 md:p-8 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {children}
        </div>
      </main>
    </div>
  );
}
