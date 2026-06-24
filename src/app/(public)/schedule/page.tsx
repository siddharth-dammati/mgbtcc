"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Swords, Clock } from "lucide-react";
import { motion } from "framer-motion";

type Match = {
  matchId: string;
  matchName: string;
  stageId: string;
  scheduledTime: string;
  status: string;
  teams: string[];
};

export default function PublicSchedulePage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [teamsMap, setTeamsMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const tSnap = await getDocs(collection(db, "teams"));
        const map: Record<string, string> = {};
        tSnap.docs.forEach(doc => {
          const data = doc.data();
          map[data.teamId] = data.squadName;
        });
        setTeamsMap(map);

        const mSnap = await getDocs(query(collection(db, "matches"), orderBy("scheduledTime", "asc")));
        setMatches(mSnap.docs.map(d => d.data() as Match));
      } catch (error) {
        console.error("Error fetching schedule", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl min-h-[calc(100vh-8rem)]">
      <div className="mb-12 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center justify-center p-4 rounded-full bg-secondary/10 text-secondary mb-6 shadow-[0_0_30px_rgba(59,130,246,0.3)]"
        >
          <CalendarDays className="size-10" />
        </motion.div>
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="font-heading text-4xl md:text-5xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70"
        >
          TOURNAMENT SCHEDULE
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-4 text-muted-foreground"
        >
          Upcoming battles and live stages.
        </motion.p>
      </div>

      <div className="space-y-6">
        {loading ? (
          <p className="text-center text-muted-foreground">Loading schedule...</p>
        ) : matches.length === 0 ? (
          <Card className="border-border/50 bg-card/40 backdrop-blur-md p-12 text-center">
            <Swords className="size-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-bold text-white mb-2">No Matches Scheduled</h3>
            <p className="text-muted-foreground">The admin hasn't scheduled any matches yet. Stay tuned!</p>
          </Card>
        ) : (
          matches.map((match, idx) => (
            <motion.div 
              key={match.matchId}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
            >
              <Card className="border-border/50 bg-card/40 backdrop-blur-md overflow-hidden hover:bg-card/60 transition-colors">
                <CardHeader className="pb-4 border-b border-border/50 bg-background/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant="outline" className="border-secondary/50 text-secondary">{match.stageId}</Badge>
                      <Badge variant="secondary" className="bg-primary/20 text-primary hover:bg-primary/30">{match.status}</Badge>
                    </div>
                    <CardTitle className="text-2xl text-white">{match.matchName}</CardTitle>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground bg-background/50 px-4 py-2 rounded-lg border border-border/50">
                    <Clock className="size-4" />
                    <span className="font-medium">{new Date(match.scheduledTime).toLocaleString()}</span>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Participating Squads</h4>
                  <div className="flex flex-wrap gap-2">
                    {match.teams && match.teams.length > 0 ? (
                      match.teams.map(teamId => (
                        <div key={teamId} className="px-3 py-1.5 rounded-full bg-background/80 border border-border/50 text-sm font-medium text-white flex items-center gap-2">
                          <div className="size-2 rounded-full bg-primary animate-pulse" />
                          {teamsMap[teamId] || "Unknown Squad"}
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground italic">Teams to be announced.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
