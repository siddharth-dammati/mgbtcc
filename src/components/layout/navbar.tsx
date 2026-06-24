"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/use-auth";
import { Trophy, LogOut, ShieldAlert } from "lucide-react";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export function Navbar() {
  const { user, role } = useAuthStore();
  const router = useRouter();
  
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");

  const handleLogout = async () => {
    await auth.signOut();
    router.push("/login");
  };

  const handleAdminSubmit = () => {
    if (adminPassword === "mbg@2026tcc") {
      sessionStorage.setItem("adminAccess", "granted");
      setIsAdminModalOpen(false);
      setAdminPassword("");
      toast.success("Admin access granted.");
      router.push("/dashboard");
    } else {
      toast.error("Incorrect password.");
      setAdminPassword("");
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-black/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="size-8 rounded-lg bg-gradient-to-br from-primary to-yellow-600 flex items-center justify-center text-black shadow-[0_0_15px_rgba(234,179,8,0.2)] group-hover:shadow-[0_0_20px_rgba(234,179,8,0.4)] transition-all">
              <Trophy className="size-5" />
            </div>
            <span className="font-heading text-xl font-bold tracking-wider text-white">
              MUNNA BHAI <span className="text-primary">GAMING</span>
            </span>
          </Link>
          <nav className="hidden md:flex gap-8 items-center text-sm font-bold text-muted-foreground uppercase tracking-wider">
            <Link href="/#about" className="hover:text-white transition-colors">About</Link>
            <Link href="/#rules" className="hover:text-white transition-colors">Rules</Link>
            <Link href="/#schedule" className="hover:text-white transition-colors">Schedule</Link>
            <Link href="/leaderboard" className="hover:text-primary transition-colors flex items-center gap-1.5">
              Leaderboard
            </Link>
          </nav>
          <div className="flex items-center gap-2 md:gap-4">
            {user ? (
              <>
                <Button variant="ghost" onClick={() => setIsAdminModalOpen(true)} className="hidden md:flex text-muted-foreground hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 uppercase text-xs tracking-wider font-bold">
                  Admin
                </Button>
                <Button render={<Link href="/my-squad" />} className="bg-primary/10 text-primary hover:bg-primary hover:text-black border border-primary/20 transition-colors uppercase text-xs tracking-wider font-bold">
                  My Squad
                </Button>
                <Button variant="ghost" size="icon" onClick={handleLogout} className="text-muted-foreground hover:text-destructive hover:bg-destructive/10" title="Logout">
                  <LogOut className="size-5" />
                </Button>
              </>
            ) : (
              <Button render={<Link href="/login" />} className="bg-primary hover:bg-primary/90 text-black shadow-[0_0_15px_rgba(234,179,8,0.3)] transition-all hover:shadow-[0_0_25px_rgba(234,179,8,0.5)] uppercase text-xs tracking-wider font-bold">
                Login
              </Button>
            )}
          </div>
        </div>
      </header>

      <Dialog open={isAdminModalOpen} onOpenChange={setIsAdminModalOpen}>
        <DialogContent className="sm:max-w-md bg-[#0a0a0c] border-white/10">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <ShieldAlert className="size-5 text-primary" /> Admin Authentication
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Please enter the master password to access the tournament dashboard.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input 
              type="password" 
              placeholder="Enter password..." 
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdminSubmit()}
              className="bg-white/5 border-white/10 text-white"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAdminModalOpen(false)} className="border-white/10">Cancel</Button>
            <Button onClick={handleAdminSubmit} className="bg-primary hover:bg-primary/90 text-black font-bold">Verify</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
