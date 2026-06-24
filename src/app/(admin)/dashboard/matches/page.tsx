"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, doc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { Swords, Eye, EyeOff, Plus, Clock, Users, Shield, Key } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const matchSchema = z.object({
  matchName: z.string().min(3, "Match name required"),
  stageId: z.string().min(2, "Stage required"),
  scheduledTime: z.string().min(1, "Date/Time required"),
  roomId: z.string().optional(),
  roomPassword: z.string().optional(),
  credentialsReleased: z.boolean().default(false),
  teams: z.array(z.string()).max(12, "Maximum 12 teams allowed per match"),
});

type Match = z.infer<typeof matchSchema> & { matchId: string; status: string };

export default function MatchesManagementPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [approvedTeams, setApprovedTeams] = useState<{ id: string; name: string }[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const form = useForm<z.infer<typeof matchSchema>>({
    resolver: zodResolver(matchSchema),
    defaultValues: {
      matchName: "",
      stageId: "Qualifiers",
      scheduledTime: "",
      roomId: "",
      roomPassword: "",
      credentialsReleased: false,
      teams: [],
    },
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const matchSnap = await getDocs(collection(db, "matches"));
      const matchData = matchSnap.docs.map((d) => d.data() as Match);
      setMatches(matchData.sort((a, b) => new Date(b.scheduledTime).getTime() - new Date(a.scheduledTime).getTime()));

      const teamsSnap = await getDocs(collection(db, "teams"));
      const teamsData = teamsSnap.docs
        .map((d) => d.data())
        .filter((t) => t.status === "Approved")
        .map((t) => ({ id: t.teamId, name: t.squadName }));
      setApprovedTeams(teamsData);
    } catch (error) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onSubmit = async (values: z.infer<typeof matchSchema>) => {
    try {
      const matchId = `match_${Date.now()}`;
      await setDoc(doc(db, "matches", matchId), {
        ...values,
        matchId,
        status: "Upcoming",
      });
      toast.success("Match created successfully");
      setIsDialogOpen(false);
      form.reset();
      fetchData();
    } catch (error) {
      toast.error("Error creating match");
    }
  };

  const toggleCredentials = async (matchId: string, currentVal: boolean) => {
    try {
      await updateDoc(doc(db, "matches", matchId), { credentialsReleased: !currentVal });
      toast.success("Credentials visibility updated");
      fetchData();
    } catch (error) {
      toast.error("Failed to update credentials");
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-bold text-white tracking-wider flex items-center gap-3">
            MATCH MANAGEMENT
          </h2>
          <p className="text-muted-foreground font-medium text-sm mt-1">Create matches, assign up to 12 squads, and release custom room IDs.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="h-11 px-6 bg-primary hover:bg-primary/90 text-black font-bold uppercase tracking-wider transition-all gap-2">
              <Plus className="size-4" /> Create Match
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[95vw] sm:max-w-2xl md:max-w-3xl lg:max-w-4xl bg-[#0a0a0c] border-white/10 text-white max-h-[90vh] overflow-y-auto p-0">
            <div className="p-6 border-b border-white/10 bg-black/40 sticky top-0 z-10 backdrop-blur-xl">
              <DialogTitle className="text-xl font-heading font-bold text-white tracking-wider flex items-center gap-3">
                <Swords className="size-5 text-primary" /> CREATE NEW MATCH
              </DialogTitle>
            </div>
            
            <div className="p-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="matchName" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-muted-foreground uppercase text-xs tracking-wider font-bold">Match Name</FormLabel>
                        <FormControl><Input {...field} className="bg-white/5 border-white/10 focus-visible:ring-primary/50 text-white" placeholder="e.g. Group A Match 1" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="stageId" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-muted-foreground uppercase text-xs tracking-wider font-bold">Stage</FormLabel>
                        <FormControl><Input {...field} className="bg-white/5 border-white/10 focus-visible:ring-primary/50 text-white" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="scheduledTime" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-muted-foreground uppercase text-xs tracking-wider font-bold">Date & Time</FormLabel>
                        <FormControl><Input type="datetime-local" {...field} className="bg-white/5 border-white/10 focus-visible:ring-primary/50 text-white" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="roomId" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-muted-foreground uppercase text-xs tracking-wider font-bold text-secondary flex items-center gap-2"><Shield className="size-3"/> Custom Room ID</FormLabel>
                        <FormControl><Input {...field} className="bg-white/5 border-white/10 focus-visible:ring-secondary/50 text-secondary font-mono" placeholder="Leave empty to add later" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="roomPassword" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-muted-foreground uppercase text-xs tracking-wider font-bold text-rose-400 flex items-center gap-2"><Key className="size-3"/> Room Password</FormLabel>
                        <FormControl><Input {...field} className="bg-white/5 border-white/10 focus-visible:ring-rose-400/50 text-rose-400 font-mono" placeholder="Leave empty to add later" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  
                  <FormField control={form.control} name="credentialsReleased" render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4">
                      <div className="space-y-1">
                        <FormLabel className="text-sm font-bold text-white flex items-center gap-2">
                          {field.value ? <Eye className="size-4 text-emerald-500" /> : <EyeOff className="size-4 text-muted-foreground" />}
                          Release Credentials
                        </FormLabel>
                        <p className="text-xs text-muted-foreground">If enabled, Team Captains will instantly see the Room ID and Password.</p>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="teams" render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel className="text-sm font-bold text-white flex items-center gap-2">
                          <Users className="size-4 text-primary" /> Assign Teams (Max 12)
                        </FormLabel>
                        <p className="text-xs text-muted-foreground mt-1">Select up to 12 approved teams. Selected: <span className="text-primary font-bold">{form.watch("teams").length}/12</span></p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-60 overflow-y-auto p-4 border border-white/10 rounded-xl bg-white/[0.02] scrollbar-thin scrollbar-thumb-white/10">
                        {approvedTeams.map((team) => (
                          <FormField key={team.id} control={form.control} name="teams" render={({ field }) => {
                            const isChecked = field.value?.includes(team.id);
                            return (
                              <FormItem key={team.id} className={`flex flex-row items-center space-x-3 space-y-0 p-3 rounded-lg border transition-colors cursor-pointer ${isChecked ? 'border-primary/50 bg-primary/10' : 'border-white/10 hover:border-white/20 hover:bg-white/5'}`}>
                                <FormControl>
                                  <input
                                    type="checkbox"
                                    className="accent-primary size-4 cursor-pointer"
                                    checked={isChecked}
                                    onChange={(e) => {
                                      const current = new Set(field.value);
                                      if (e.target.checked) {
                                        if (current.size < 12) current.add(team.id);
                                        else toast.error("Maximum 12 teams allowed");
                                      } else {
                                        current.delete(team.id);
                                      }
                                      field.onChange(Array.from(current));
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-medium text-sm text-white truncate cursor-pointer w-full">{team.name}</FormLabel>
                              </FormItem>
                            );
                          }} />
                        ))}
                        {approvedTeams.length === 0 && <p className="text-muted-foreground text-sm col-span-full text-center py-4">No approved teams available.</p>}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-black font-bold uppercase h-12 tracking-wider">Save Match</Button>
                </form>
              </Form>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center py-20">
            <div className="size-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : matches.length === 0 ? (
          <Card className="col-span-full border-white/10 bg-white/[0.02] p-12 text-center">
            <Swords className="size-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-xl text-white font-medium">No matches created yet.</p>
            <p className="text-muted-foreground">Click 'Create Match' to schedule the first game.</p>
          </Card>
        ) : (
          <AnimatePresence>
            {matches.map((match, i) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                key={match.matchId}
              >
                <Card className="border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-300 h-full flex flex-col relative overflow-hidden">
                  <CardHeader className="pb-4 border-b border-white/5 relative z-10">
                    <div className="flex justify-between items-start">
                      <div>
                        <Badge variant="outline" className="mb-2 bg-primary/10 text-primary border-primary/30 uppercase tracking-widest text-[10px]">{match.stageId}</Badge>
                        <CardTitle className="text-xl text-white font-bold">{match.matchName}</CardTitle>
                        <CardDescription className="flex items-center gap-1.5 mt-1 text-xs">
                          <Clock className="size-3" /> {new Date(match.scheduledTime).toLocaleString()}
                        </CardDescription>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Reveal ID/Pass</span>
                        <div className={`p-1 rounded-full border ${match.credentialsReleased ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-white/10 bg-black/50'}`}>
                          <Switch 
                            checked={match.credentialsReleased} 
                            onCheckedChange={() => toggleCredentials(match.matchId, match.credentialsReleased)} 
                            className="data-[state=checked]:bg-emerald-500"
                          />
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 p-5 relative z-10">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                        <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider text-[10px] flex items-center gap-2"><Users className="size-3" /> Teams Assigned</span>
                        <span className="font-bold text-white text-sm">{match.teams?.length || 0} <span className="text-muted-foreground">/ 12</span></span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-lg bg-secondary/5 border border-secondary/20">
                          <p className="text-[10px] uppercase tracking-widest font-bold text-secondary mb-1 flex items-center gap-1.5"><Shield className="size-3"/> Room ID</p>
                          <p className="font-mono text-white text-sm truncate">{match.roomId || <span className="text-muted-foreground text-xs italic">Pending</span>}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-rose-500/5 border border-rose-500/20">
                          <p className="text-[10px] uppercase tracking-widest font-bold text-rose-400 mb-1 flex items-center gap-1.5"><Key className="size-3"/> Password</p>
                          <p className="font-mono text-white text-sm truncate">{match.roomPassword || <span className="text-muted-foreground text-xs italic">Pending</span>}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
}
