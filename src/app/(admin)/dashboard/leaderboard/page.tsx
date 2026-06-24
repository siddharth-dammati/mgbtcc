"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Save, Trophy, Medal, Crosshair, Target, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type TeamStat = {
  teamId: string;
  squadName: string;
  matchesPlayed: number;
  placementPoints: number;
  killPoints: number;
  totalPoints: number;
};

export default function AdminLeaderboardPage() {
  const [teamStats, setTeamStats] = useState<TeamStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const teamsSnap = await getDocs(collection(db, "teams"));
      const approvedTeams = teamsSnap.docs
        .map((d) => d.data())
        .filter((t) => t.status === "Approved");

      const lbSnap = await getDocs(collection(db, "leaderboards"));
      const lbMap = new Map<string, any>();
      lbSnap.docs.forEach((d) => lbMap.set(d.id, d.data()));

      const merged: TeamStat[] = approvedTeams.map((team) => {
        const lbEntry = lbMap.get(team.teamId) || {
          matchesPlayed: 0,
          placementPoints: 0,
          killPoints: 0,
          totalPoints: 0,
        };
        return {
          teamId: team.teamId,
          squadName: team.squadName,
          matchesPlayed: lbEntry.matchesPlayed,
          placementPoints: lbEntry.placementPoints,
          killPoints: lbEntry.killPoints,
          totalPoints: lbEntry.totalPoints,
        };
      });

      merged.sort((a, b) => b.totalPoints - a.totalPoints);
      setTeamStats(merged);
    } catch (error) {
      toast.error("Failed to load leaderboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdate = (index: number, field: keyof TeamStat, value: string) => {
    const numValue = parseInt(value) || 0;
    const newStats = [...teamStats];
    newStats[index] = { ...newStats[index], [field]: numValue };
    setTeamStats(newStats);
  };

  const handleSave = async (stat: TeamStat) => {
    setSavingId(stat.teamId);
    try {
      await setDoc(doc(db, "leaderboards", stat.teamId), {
        teamId: stat.teamId,
        squadName: stat.squadName,
        matchesPlayed: stat.matchesPlayed,
        placementPoints: stat.placementPoints,
        killPoints: stat.killPoints,
        totalPoints: stat.totalPoints,
      });
      toast.success(`Scores updated for ${stat.squadName}`);
    } catch (error) {
      toast.error(`Failed to update scores for ${stat.squadName}`);
    } finally {
      setSavingId(null);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h2 className="font-heading text-2xl font-bold text-white tracking-wider flex items-center gap-3">
          SCORE MANAGEMENT
        </h2>
        <p className="text-muted-foreground font-medium text-sm mt-1">Manually update the placement, kill, and total points for approved squads.</p>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden">
        <Table>
          <TableHeader className="bg-black/40">
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead className="w-[80px] text-center font-bold text-muted-foreground uppercase text-[10px] tracking-wider h-14">Rank</TableHead>
              <TableHead className="w-[250px] font-bold text-muted-foreground uppercase text-[10px] tracking-wider">Squad Name</TableHead>
              <TableHead className="w-[120px] text-center font-bold text-muted-foreground uppercase text-[10px] tracking-wider"><GamepadIcon /> Matches</TableHead>
              <TableHead className="w-[130px] text-center font-bold text-muted-foreground uppercase text-[10px] tracking-wider"><MedalIcon /> Placement Pts</TableHead>
              <TableHead className="w-[120px] text-center font-bold text-muted-foreground uppercase text-[10px] tracking-wider"><KillIcon /> Kill Pts</TableHead>
              <TableHead className="w-[140px] text-center font-bold text-primary uppercase text-[10px] tracking-wider"><TotalIcon /> Total Pts</TableHead>
              <TableHead className="text-right pr-6 font-bold text-muted-foreground uppercase text-[10px] tracking-wider">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                </TableCell>
              </TableRow>
            ) : teamStats.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">No approved squads found. Approve squads in Team Management first.</TableCell>
              </TableRow>
            ) : (
              <AnimatePresence>
                {teamStats.map((stat, idx) => (
                  <motion.tr 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={stat.teamId} 
                    className="border-white/5 hover:bg-white/5 transition-colors group"
                  >
                    <TableCell className="text-center font-heading font-black text-xl text-white/50 group-hover:text-white transition-colors">
                      {idx === 0 ? <span className="text-yellow-500">1</span> :
                       idx === 1 ? <span className="text-zinc-300">2</span> :
                       idx === 2 ? <span className="text-amber-600">3</span> : 
                       idx + 1}
                    </TableCell>
                    <TableCell className="font-bold text-white text-lg tracking-wide">{stat.squadName}</TableCell>
                    <TableCell>
                      <Input 
                        type="number" 
                        min="0"
                        value={stat.matchesPlayed} 
                        onChange={(e) => handleUpdate(idx, "matchesPlayed", e.target.value)}
                        className="bg-white/5 border-white/10 h-10 text-center font-mono focus-visible:ring-primary/50"
                      />
                    </TableCell>
                    <TableCell>
                      <Input 
                        type="number" 
                        min="0"
                        value={stat.placementPoints} 
                        onChange={(e) => handleUpdate(idx, "placementPoints", e.target.value)}
                        className="bg-white/5 border-white/10 h-10 text-center font-mono focus-visible:ring-primary/50"
                      />
                    </TableCell>
                    <TableCell>
                      <Input 
                        type="number" 
                        min="0"
                        value={stat.killPoints} 
                        onChange={(e) => handleUpdate(idx, "killPoints", e.target.value)}
                        className="bg-white/5 border-white/10 h-10 text-center font-mono focus-visible:ring-primary/50 text-rose-400"
                      />
                    </TableCell>
                    <TableCell>
                      <Input 
                        type="number" 
                        min="0"
                        value={stat.totalPoints} 
                        onChange={(e) => handleUpdate(idx, "totalPoints", e.target.value)}
                        className="bg-primary/10 border-primary/30 text-white font-black h-12 text-center text-lg focus-visible:ring-primary"
                      />
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <Button 
                        size="sm" 
                        onClick={() => handleSave(stat)} 
                        disabled={savingId === stat.teamId}
                        className="bg-white/10 hover:bg-primary text-white hover:text-black transition-all font-bold uppercase text-xs"
                      >
                        {savingId === stat.teamId ? (
                          <div className="size-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <>
                            <Save className="size-4 mr-2" />
                            Save
                          </>
                        )}
                      </Button>
                    </TableCell>
                  </motion.tr>
                ))}
              </AnimatePresence>
            )}
          </TableBody>
        </Table>
      </div>
    </motion.div>
  );
}

// Mini Icon Helpers
function GamepadIcon() { return <Target className="size-3 inline-block mr-1 text-muted-foreground" /> }
function MedalIcon() { return <Medal className="size-3 inline-block mr-1 text-muted-foreground" /> }
function KillIcon() { return <Crosshair className="size-3 inline-block mr-1 text-rose-400" /> }
function TotalIcon() { return <ChevronUp className="size-3 inline-block mr-1 text-primary" /> }
