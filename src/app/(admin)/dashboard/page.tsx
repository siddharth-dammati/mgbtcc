"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ShieldAlert, CheckCircle2, Swords } from "lucide-react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from "recharts";

const registrationData = [
  { name: "Day 1", squads: 42 },
  { name: "Day 2", squads: 85 },
  { name: "Day 3", squads: 145 },
  { name: "Day 4", squads: 190 },
  { name: "Day 5", squads: 220 },
  { name: "Day 6", squads: 260 },
  { name: "Day 7", squads: 288 },
];

const languageData = [
  { name: "Hindi", players: 600 },
  { name: "English", players: 320 },
  { name: "Telugu", players: 185 },
  { name: "Tamil", players: 45 },
];

const BAR_COLORS = ['#eab308', '#ef4444', '#f97316', '#10b981'];

export default function DashboardOverview() {
  const [stats, setStats] = useState({
    totalSquads: 0,
    totalPlayers: 0,
    pending: 0,
    approved: 0,
  });

  useEffect(() => {
    async function fetchStats() {
      try {
        const teamsSnapshot = await getDocs(collection(db, "teams"));
        const playersSnapshot = await getDocs(collection(db, "players"));
        
        let pending = 0;
        let approved = 0;
        
        teamsSnapshot.forEach(doc => {
          const data = doc.data();
          if (data.status === "Pending") pending++;
          if (data.status === "Approved") approved++;
        });

        setStats({
          totalSquads: teamsSnapshot.size,
          totalPlayers: playersSnapshot.size,
          pending,
          approved,
        });
      } catch (error) {
        console.error("Error fetching stats", error);
      }
    }
    
    fetchStats();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <div>
        <h2 className="font-heading text-2xl font-bold text-white tracking-wider">OVERVIEW</h2>
        <p className="text-muted-foreground text-sm mt-1">Tournament status and key metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div variants={itemVariants}>
          <Card className="border-white/10 bg-white/[0.02] relative overflow-hidden group hover:bg-white/[0.04] transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Squads</CardTitle>
              <Users className="size-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-white">{stats.totalSquads}</div>
              <p className="text-xs text-primary font-bold mt-1">out of 288 slots</p>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <Card className="border-white/10 bg-white/[0.02] relative overflow-hidden group hover:bg-white/[0.04] transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Pending Approval</CardTitle>
              <ShieldAlert className="size-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-white">{stats.pending}</div>
              <p className="text-xs text-secondary font-bold mt-1">Requires review</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="border-white/10 bg-white/[0.02] relative overflow-hidden group hover:bg-white/[0.04] transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Approved Squads</CardTitle>
              <CheckCircle2 className="size-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-white">{stats.approved}</div>
              <p className="text-xs text-emerald-500 font-bold mt-1">Ready for brackets</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="border-white/10 bg-white/[0.02] relative overflow-hidden group hover:bg-white/[0.04] transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Players</CardTitle>
              <Swords className="size-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-white">{stats.totalPlayers}</div>
              <p className="text-xs text-orange-500 font-bold mt-1">Across all squads</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={itemVariants}>
          <Card className="border-white/10 bg-white/[0.02]">
            <CardHeader>
              <CardTitle className="font-heading tracking-wide flex items-center gap-2 text-sm">
                <div className="size-1.5 bg-primary rounded-full" />
                REGISTRATION TRENDS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={registrationData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorSquads" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#eab308" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0a0a0c', borderColor: '#27272a', borderRadius: '8px' }}
                      itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                    />
                    <Area type="monotone" dataKey="squads" stroke="#eab308" strokeWidth={2} fillOpacity={1} fill="url(#colorSquads)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="border-white/10 bg-white/[0.02]">
            <CardHeader>
              <CardTitle className="font-heading tracking-wide flex items-center gap-2 text-sm">
                <div className="size-1.5 bg-secondary rounded-full" />
                LANGUAGE DEMOGRAPHICS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={languageData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }} barSize={30}>
                    <XAxis dataKey="name" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0a0a0c', borderColor: '#27272a', borderRadius: '8px' }}
                      cursor={{fill: 'rgba(255,255,255,0.02)'}}
                    />
                    <Bar dataKey="players" radius={[4, 4, 0, 0]}>
                      {languageData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
