"use client";

import { useState } from "react";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Trophy, Gamepad2, Users, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleGoogleSignIn() {
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Check if user document exists, if not create it
      const userDocRef = doc(db, "users", result.user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName,
          role: "Team Captain", // Default role for new signups
          createdAt: new Date().toISOString(),
        });
        toast.success("Account created successfully!");
      } else {
        toast.success("Successfully logged in!");
      }
      
      router.push("/my-squad");
    } catch (error: any) {
      toast.error(error.message || "Google sign in failed");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#050505]">
      {/* Background Effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 blur-[150px] rounded-full pointer-events-none opacity-50" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-yellow-500/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
        
        {/* Left Side - Branding */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col justify-center space-y-8 p-8"
        >
          <div>
            <h1 className="font-heading text-5xl md:text-7xl font-black text-white tracking-widest uppercase mb-4 leading-none">
              ENTER THE <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-yellow-500">
                ARENA
              </span>
            </h1>
            <p className="text-lg text-muted-foreground font-medium max-w-md">
              Sign in to manage your squad, track your tournament progress, and compete for the ultimate championship title.
            </p>
          </div>

          <div className="space-y-6 pt-8 border-t border-white/10">
            <div className="flex items-center gap-4 text-white/80">
              <div className="size-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                <Users className="size-5 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-white uppercase tracking-wider text-sm">Squad Management</h3>
                <p className="text-sm text-muted-foreground">Create or join a team instantly.</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-white/80">
              <div className="size-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                <Trophy className="size-5 text-yellow-500" />
              </div>
              <div>
                <h3 className="font-bold text-white uppercase tracking-wider text-sm">Live Brackets</h3>
                <p className="text-sm text-muted-foreground">Track your standing in real-time.</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Side - Login Card */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex items-center justify-center lg:justify-end"
        >
          <Card className="w-full max-w-md bg-black/60 backdrop-blur-2xl border-white/10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary to-yellow-500" />
            <CardContent className="p-10 text-center flex flex-col items-center">
              <div className="size-20 rounded-2xl bg-gradient-to-br from-primary/20 to-yellow-500/20 border border-white/10 flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(168,85,247,0.2)]">
                <Gamepad2 className="size-10 text-white" />
              </div>
              
              <h2 className="text-2xl font-bold text-white tracking-widest uppercase mb-2">Authentication</h2>
              <p className="text-sm text-muted-foreground mb-10">
                Use your Google account to securely sign in or register for the tournament. No passwords required.
              </p>

              <Button 
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full h-14 bg-white hover:bg-gray-100 text-black font-bold text-lg rounded-xl transition-all hover:scale-[1.02] active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] flex items-center justify-center gap-3 relative overflow-hidden group"
              >
                {isLoading ? (
                  <div className="size-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <svg className="size-6" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      <path d="M1 1h22v22H1z" fill="none"/>
                    </svg>
                    <span>Continue with Google</span>
                    <ArrowRight className="size-5 absolute right-6 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-black/50" />
                  </>
                )}
              </Button>

              <p className="text-[10px] text-muted-foreground mt-8 uppercase tracking-widest font-bold">
                Protected by Google OAuth
              </p>
            </CardContent>
          </Card>
        </motion.div>

      </div>
    </div>
  );
}
