"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Medal, Star } from "lucide-react";
import { motion } from "framer-motion";

type LeaderboardEntry = {
  teamId: string;
  squadName: string;
  matchesPlayed: number;
  placementPoints: number;
  killPoints: number;
  totalPoints: number;
  rank?: number;
};

// Mock data fallback if Firestore is empty
const MOCK_DATA: LeaderboardEntry[] = [
  { teamId: "1", squadName: "Team Liquid", matchesPlayed: 5, placementPoints: 45, killPoints: 30, totalPoints: 75, rank: 1 },
  { teamId: "2", squadName: "Navi", matchesPlayed: 5, placementPoints: 35, killPoints: 25, totalPoints: 60, rank: 2 },
  { teamId: "3", squadName: "FaZe Clan", matchesPlayed: 5, placementPoints: 20, killPoints: 35, totalPoints: 55, rank: 3 },
  { teamId: "4", squadName: "TSM", matchesPlayed: 5, placementPoints: 25, killPoints: 20, totalPoints: 45, rank: 4 },
  { teamId: "5", squadName: "Cloud9", matchesPlayed: 5, placementPoints: 15, killPoints: 10, totalPoints: 25, rank: 5 },
];

export default function LeaderboardPage() {
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const q = query(collection(db, "leaderboards"), orderBy("totalPoints", "desc"), limit(50));
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
          setData(MOCK_DATA);
        } else {
          const fetched = snapshot.docs.map((doc, index) => ({
            ...(doc.data() as LeaderboardEntry),
            rank: index + 1
          }));
          setData(fetched);
        }
      } catch (error) {
        console.error("Error fetching leaderboard", error);
        setData(MOCK_DATA);
      } finally {
        setLoading(false);
      }
    }
    
    fetchLeaderboard();
  }, []);

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl min-h-[calc(100vh-8rem)]">
      <div className="mb-12 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center justify-center p-4 rounded-full bg-primary/10 text-primary mb-6 shadow-[0_0_30px_rgba(168,85,247,0.3)]"
        >
          <Trophy className="size-10" />
        </motion.div>
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="font-heading text-4xl md:text-5xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70"
        >
          GLOBAL LEADERBOARD
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-4 text-muted-foreground"
        >
          Top squads battling for the ultimate prize.
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card className="border-border/50 bg-card/40 backdrop-blur-md overflow-hidden shadow-[0_0_20px_rgba(0,0,0,0.5)]">
          <Table>
            <TableHeader className="bg-background/80">
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead className="w-[100px] text-center font-bold text-white">RANK</TableHead>
                <TableHead className="font-bold text-white">SQUAD</TableHead>
                <TableHead className="text-center font-bold text-white">MATCHES</TableHead>
                <TableHead className="text-center font-bold text-white">PLACEMENT PTS</TableHead>
                <TableHead className="text-center font-bold text-white">KILL PTS</TableHead>
                <TableHead className="text-center font-bold text-primary">TOTAL PTS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    Loading leaderboard data...
                  </TableCell>
                </TableRow>
              ) : (
                data.map((entry, idx) => (
                  <TableRow 
                    key={entry.teamId}
                    className={`border-border/50 transition-colors hover:bg-white/5 ${
                      idx === 0 ? "bg-yellow-500/10" : idx === 1 ? "bg-slate-300/10" : idx === 2 ? "bg-amber-700/10" : ""
                    }`}
                  >
                    <TableCell className="text-center">
                      {idx === 0 ? (
                        <Medal className="size-6 text-yellow-400 mx-auto drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]" />
                      ) : idx === 1 ? (
                        <Medal className="size-6 text-slate-300 mx-auto" />
                      ) : idx === 2 ? (
                        <Medal className="size-6 text-amber-600 mx-auto" />
                      ) : (
                        <span className="font-heading font-bold text-muted-foreground">{entry.rank}</span>
                      )}
                    </TableCell>
                    <TableCell className="font-bold text-white text-lg flex items-center gap-2">
                      {idx === 0 && <Star className="size-4 text-yellow-400 fill-yellow-400" />}
                      {entry.squadName}
                    </TableCell>
                    <TableCell className="text-center text-muted-foreground">{entry.matchesPlayed}</TableCell>
                    <TableCell className="text-center text-muted-foreground">{entry.placementPoints}</TableCell>
                    <TableCell className="text-center text-muted-foreground">{entry.killPoints}</TableCell>
                    <TableCell className="text-center font-black text-primary text-xl">{entry.totalPoints}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </motion.div>
    </div>
  );
}
