"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Link from "next/link";
import { Trophy, Users, Swords, Medal, Gamepad2, Megaphone, Video, Camera, Share2, MonitorPlay, MessageCircle } from "lucide-react";

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] bg-[#050505]">
      {/* Hero Section */}
      <section className="relative flex-1 flex flex-col items-center justify-center overflow-hidden py-24 lg:py-36">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_20%,rgba(234,179,8,0.15),rgba(0,0,0,0))]" />
        <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-black to-transparent z-10" />
        
        <div className="container relative z-20 mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 text-sm font-bold text-white mb-6 tracking-[0.2em] uppercase"
          >
            MUNNA BHAI GAMING (MBG) PRESENTS
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1, type: "spring" }}
            className="mx-auto max-w-6xl font-heading text-6xl font-black tracking-tighter sm:text-7xl md:text-8xl lg:text-9xl leading-none"
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-yellow-400 to-yellow-600 drop-shadow-[0_0_30px_rgba(234,179,8,0.4)]">
              TELUGU
            </span>
            <br />
            <span className="text-white text-5xl sm:text-6xl md:text-7xl lg:text-8xl">
              COMMUNITY
            </span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-yellow-400 to-yellow-600 drop-shadow-[0_0_30px_rgba(234,179,8,0.4)]">
              CHAMPIONSHIP
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mx-auto mt-10 max-w-2xl text-sm md:text-base text-muted-foreground font-bold tracking-[0.15em] uppercase"
          >
            ONE COMMUNITY. ONE STAGE. ENDLESS OPPORTUNITIES.
          </motion.p>
        </div>
      </section>

      {/* Tournament Stages */}
      <section id="format" className="relative py-24 bg-black border-t border-white/5 z-20">
        <div className="container mx-auto px-4">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="flex flex-col lg:flex-row items-stretch justify-center gap-4 lg:gap-2"
          >
            {/* Stage 1 */}
            <motion.div variants={itemVariants} className="flex-1 border border-purple-500/30 rounded-xl bg-purple-500/5 p-6 flex flex-col items-center text-center relative overflow-hidden group hover:border-purple-500/60 transition-colors">
              <div className="absolute top-0 w-full h-1 bg-purple-500" />
              <div className="bg-purple-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-full mb-4">STAGE 1</div>
              <h3 className="font-heading font-bold text-white text-lg tracking-wider mb-2">OPEN QUALIFIERS</h3>
              <Users className="size-8 text-purple-400 mb-4" />
              <p className="text-3xl font-black text-white mb-1">288 <span className="text-sm text-muted-foreground font-bold">TEAMS</span></p>
              <p className="text-xs text-muted-foreground font-medium mb-4">24 GROUPS × 12 TEAMS</p>
              <div className="mt-auto w-full">
                <p className="text-[10px] uppercase tracking-widest text-white/70 mb-2">TOP 6 QUALIFY</p>
                <div className="bg-purple-500 text-white font-bold py-2 rounded-md">144 TEAMS</div>
              </div>
            </motion.div>

            {/* Arrow */}
            <div className="hidden lg:flex items-center justify-center text-yellow-500/50">
              <span className="text-3xl font-black">»</span>
            </div>

            {/* Stage 2 */}
            <motion.div variants={itemVariants} className="flex-1 border border-blue-500/30 rounded-xl bg-blue-500/5 p-6 flex flex-col items-center text-center relative overflow-hidden group hover:border-blue-500/60 transition-colors">
              <div className="absolute top-0 w-full h-1 bg-blue-500" />
              <div className="bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-full mb-4">STAGE 2</div>
              <h3 className="font-heading font-bold text-white text-lg tracking-wider mb-2">ROUND 2</h3>
              <Users className="size-8 text-blue-400 mb-4" />
              <p className="text-3xl font-black text-white mb-1">144 <span className="text-sm text-muted-foreground font-bold">TEAMS</span></p>
              <p className="text-xs text-muted-foreground font-medium mb-4">12 GROUPS × 12 TEAMS</p>
              <div className="mt-auto w-full">
                <p className="text-[10px] uppercase tracking-widest text-white/70 mb-2">TOP 4 QUALIFY</p>
                <div className="bg-blue-600 text-white font-bold py-2 rounded-md">48 TEAMS</div>
              </div>
            </motion.div>

            {/* Arrow */}
            <div className="hidden lg:flex items-center justify-center text-yellow-500/50">
              <span className="text-3xl font-black">»</span>
            </div>

            {/* Stage 3 */}
            <motion.div variants={itemVariants} className="flex-1 border border-green-500/30 rounded-xl bg-green-500/5 p-6 flex flex-col items-center text-center relative overflow-hidden group hover:border-green-500/60 transition-colors">
              <div className="absolute top-0 w-full h-1 bg-green-500" />
              <div className="bg-green-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-full mb-4">STAGE 3</div>
              <h3 className="font-heading font-bold text-white text-lg tracking-wider mb-2">QUARTER FINALS</h3>
              <Users className="size-8 text-green-400 mb-4" />
              <p className="text-3xl font-black text-white mb-1">48 <span className="text-sm text-muted-foreground font-bold">TEAMS</span></p>
              <p className="text-xs text-muted-foreground font-medium mb-4">4 GROUPS × 12 TEAMS</p>
              <div className="mt-auto w-full">
                <p className="text-[10px] uppercase tracking-widest text-white/70 mb-2">TOP 6 QUALIFY</p>
                <div className="bg-green-700 text-white font-bold py-2 rounded-md">24 TEAMS</div>
              </div>
            </motion.div>

            {/* Arrow */}
            <div className="hidden lg:flex items-center justify-center text-yellow-500/50">
              <span className="text-3xl font-black">»</span>
            </div>

            {/* Stage 4 */}
            <motion.div variants={itemVariants} className="flex-1 border border-orange-500/30 rounded-xl bg-orange-500/5 p-6 flex flex-col items-center text-center relative overflow-hidden group hover:border-orange-500/60 transition-colors">
              <div className="absolute top-0 w-full h-1 bg-orange-500" />
              <div className="bg-orange-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-full mb-4">STAGE 4</div>
              <h3 className="font-heading font-bold text-white text-lg tracking-wider mb-2">SEMI FINALS</h3>
              <Users className="size-8 text-orange-400 mb-4" />
              <p className="text-3xl font-black text-white mb-1">24 <span className="text-sm text-muted-foreground font-bold">TEAMS</span></p>
              <p className="text-xs text-muted-foreground font-medium mb-4">2 GROUPS × 12 TEAMS</p>
              <div className="mt-auto w-full">
                <p className="text-[10px] uppercase tracking-widest text-white/70 mb-2">TOP 6 QUALIFY</p>
                <div className="bg-orange-600 text-white font-bold py-2 rounded-md">12 TEAMS</div>
              </div>
            </motion.div>

            {/* Arrow */}
            <div className="hidden lg:flex items-center justify-center text-yellow-500/50">
              <span className="text-3xl font-black">»</span>
            </div>

            {/* Stage 5 */}
            <motion.div variants={itemVariants} className="flex-1 border-2 border-yellow-500/50 rounded-xl bg-yellow-500/10 p-6 flex flex-col items-center text-center relative overflow-hidden group hover:border-yellow-500 transition-colors shadow-[0_0_30px_rgba(234,179,8,0.15)]">
              <div className="absolute top-0 w-full h-2 bg-gradient-to-r from-yellow-400 to-yellow-600" />
              <div className="bg-yellow-500 text-black text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-full mb-4">STAGE 5</div>
              <h3 className="font-heading font-bold text-yellow-500 text-lg tracking-wider mb-2">GRAND FINALS</h3>
              <Trophy className="size-10 text-yellow-400 mb-2 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]" />
              <p className="text-4xl font-black text-white mb-4">12 <span className="text-sm text-yellow-500/80 font-bold">TEAMS</span></p>
              <div className="mt-auto w-full">
                <div className="border border-yellow-500/50 bg-black text-yellow-500 font-black tracking-widest py-3 rounded-md">
                  CHAMPION<br/><span className="text-[10px] text-white">WILL BE CROWNED</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Prize Pool & Call Out Section */}
      <section className="py-12 bg-[#050505] relative z-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            
            {/* Prize Pool Box */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="border border-yellow-500/30 bg-black/50 p-8 flex flex-col justify-center relative overflow-hidden rounded-xl"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-600 to-yellow-400" />
              <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="text-center md:text-left">
                  <p className="text-sm font-bold text-white uppercase tracking-widest mb-1">TOTAL PRIZE POOL</p>
                  <p className="text-6xl font-black font-heading text-yellow-500 drop-shadow-[0_0_20px_rgba(234,179,8,0.3)]">
                    ₹10,000
                  </p>
                </div>
                
                <div className="flex items-center gap-6 text-center">
                  <div>
                    <p className="text-[10px] text-muted-foreground font-bold tracking-widest uppercase mb-1">CHAMPIONS</p>
                    <Trophy className="size-6 text-yellow-400 mx-auto mb-1" />
                    <p className="text-2xl font-black text-white font-heading">₹5,000</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground font-bold tracking-widest uppercase mb-1">RUNNER-UPS</p>
                    <Medal className="size-6 text-zinc-300 mx-auto mb-1" />
                    <p className="text-xl font-black text-white font-heading">₹3,000</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground font-bold tracking-widest uppercase mb-1">THIRD PLACE</p>
                    <Medal className="size-6 text-amber-600 mx-auto mb-1" />
                    <p className="text-xl font-black text-white font-heading">₹2,000</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Callout Box */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="border border-white/10 bg-black/50 p-8 flex flex-col justify-between relative overflow-hidden rounded-xl"
            >
              <div className="flex items-start gap-4 mb-6">
                <Megaphone className="size-8 text-primary shrink-0" />
                <div>
                  <h3 className="text-xl font-black font-heading text-white uppercase tracking-wide">
                    CALL OUT TO ALL TELUGU ESPORTS PLAYERS!
                  </h3>
                  <div className="flex flex-wrap gap-4 mt-4 text-[10px] uppercase font-bold text-muted-foreground tracking-widest">
                    <span className="flex items-center gap-1.5"><Gamepad2 className="size-3 text-yellow-500" /> SHOW YOUR SKILLS</span>
                    <span className="flex items-center gap-1.5"><Users className="size-3 text-blue-500" /> REPRESENT COMMUNITY</span>
                    <span className="flex items-center gap-1.5"><Swords className="size-3 text-red-500" /> COMPETE AGAINST THE BEST</span>
                  </div>
                </div>
              </div>
              <Button size="lg" asChild className="w-full h-14 bg-yellow-500 hover:bg-yellow-400 text-black font-black uppercase tracking-widest text-sm rounded-none border border-yellow-500">
                <Link href="/register">REGISTER NOW & SHARE WITH SQUAD!</Link>
              </Button>
            </motion.div>

          </div>
        </div>
      </section>
    </div>
  );
}
