"use client";

import { useEffect, useState } from "react";
import { collection, query, where, getDocs, doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuthStore } from "@/store/use-auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert, CheckCircle2, AlertTriangle, Key, Copy, Users, UserPlus, MapPin, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

const LANGUAGES = ["English", "Hindi", "Telugu", "Tamil", "Kannada", "Malayalam", "Marathi", "Bengali", "Gujarati", "Punjabi", "Urdu", "Odia", "Assamese", "Other"] as const;

const joinSchema = z.object({
  teamCode: z.string().length(6, "Team Code must be exactly 6 characters").toUpperCase(),
  isSubstitute: z.boolean(),
  fullName: z.string().min(2, "Required"),
  inGameName: z.string().min(2, "Required"),
  dob: z.string().min(1, "Required"),
  freeFireUid: z.string().min(5, "Required"),
  primaryLanguage: z.enum(LANGUAGES),
  mobileNumber: z.string().min(10, "Required"),
  discordUsername: z.string().min(3, "Required"),
});

export default function MySquadDashboard() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [team, setTeam] = useState<any>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [joining, setJoining] = useState(false);
  
  const [locationStatus, setLocationStatus] = useState<"pending" | "verifying" | "success" | "failed">("pending");
  const [detectedState, setDetectedState] = useState("Unknown");

  const form = useForm<z.infer<typeof joinSchema>>({
    resolver: zodResolver(joinSchema),
    defaultValues: {
      teamCode: "",
      isSubstitute: false,
      fullName: "",
      inGameName: "",
      dob: "",
      freeFireUid: "",
      primaryLanguage: "Telugu",
      mobileNumber: "",
      discordUsername: "",
    },
  });

  const fetchSquadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // 1. Check if user is a Captain (owns a team)
      let teamData = null;
      const teamQ = query(collection(db, "teams"), where("captainUid", "==", user.uid));
      const teamSnap = await getDocs(teamQ);

      if (!teamSnap.empty) {
        teamData = teamSnap.docs[0].data();
      } else {
        // 2. Check if user is a Player (joined a team)
        const playerQ = query(collection(db, "players"), where("userUid", "==", user.uid));
        const playerSnap = await getDocs(playerQ);
        
        if (!playerSnap.empty) {
          const playerData = playerSnap.docs[0].data();
          const parentTeamQ = query(collection(db, "teams"), where("teamId", "==", playerData.teamId));
          const parentTeamSnap = await getDocs(parentTeamQ);
          if (!parentTeamSnap.empty) {
            teamData = parentTeamSnap.docs[0].data();
          }
        }
      }

      if (teamData) {
        setTeam(teamData);
        // Get players
        const playersQ = query(collection(db, "players"), where("teamId", "==", teamData.teamId));
        const playersSnap = await getDocs(playersQ);
        setPlayers(playersSnap.docs.map(d => d.data()));

        // Get matches
        const matchesQ = query(collection(db, "matches"), where("teams", "array-contains", teamData.teamId));
        const matchesSnap = await getDocs(matchesQ);
        setMatches(matchesSnap.docs.map(d => d.data()));
      }
    } catch (error) {
      console.error("Error loading squad data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSquadData();
  }, [user]);

  useEffect(() => {
    if (isJoinModalOpen && navigator.geolocation) {
      setLocationStatus("verifying");
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`);
            const data = await res.json();
            const state = data.address?.state || "Unknown Location";
            setDetectedState(state);
            const stateLower = state.toLowerCase();
            if (stateLower.includes("andhra") || stateLower.includes("telangana")) {
              setLocationStatus("success");
            } else {
              setLocationStatus("failed");
            }
          } catch (e) {
            setLocationStatus("failed");
          }
        },
        () => setLocationStatus("failed")
      );
    }
  }, [isJoinModalOpen]);

  const onJoinSubmit = async (values: z.infer<typeof joinSchema>) => {
    if (!user) return;
    setJoining(true);
    try {
      // Find Team by Code
      const teamQ = query(collection(db, "teams"), where("teamCode", "==", values.teamCode.toUpperCase()));
      const teamSnap = await getDocs(teamQ);

      if (teamSnap.empty) {
        toast.error("Invalid Team Code. Please check and try again.");
        setJoining(false);
        return;
      }

      const targetTeam = teamSnap.docs[0].data();

      // Check current roster size
      const playersQ = query(collection(db, "players"), where("teamId", "==", targetTeam.teamId));
      const playersSnap = await getDocs(playersQ);
      
      const mainPlayersCount = playersSnap.docs.filter(d => !d.data().isSubstitute).length;
      const subPlayersCount = playersSnap.docs.filter(d => d.data().isSubstitute).length;

      if (values.isSubstitute && subPlayersCount >= 1) {
        toast.error("This squad already has a substitute player.");
        setJoining(false);
        return;
      }
      if (!values.isSubstitute && mainPlayersCount >= 4) {
        toast.error("This squad's main roster is already full (4/4).");
        setJoining(false);
        return;
      }

      // Add Player
      const playerId = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await setDoc(doc(db, "players", playerId), {
        playerId,
        teamId: targetTeam.teamId,
        userUid: user.uid,
        isCaptain: false,
        isSubstitute: values.isSubstitute,
        fullName: values.fullName,
        inGameName: values.inGameName,
        dob: values.dob,
        freeFireUid: values.freeFireUid,
        primaryLanguage: values.primaryLanguage,
        mobileNumber: values.mobileNumber,
        discordUsername: values.discordUsername,
        detectedLocation: detectedState,
        locationVerified: locationStatus === "success",
      });

      toast.success(`Successfully joined ${targetTeam.squadName}!`);
      setIsJoinModalOpen(false);
      fetchSquadData();

    } catch (error) {
      toast.error("An error occurred while joining the squad.");
    } finally {
      setJoining(false);
    }
  };

  const copyCode = () => {
    if (team?.teamCode) {
      navigator.clipboard.writeText(team.teamCode);
      toast.success("Team Code copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="size-10 text-primary animate-spin" />
      </div>
    );
  }

  if (!team) {
    return (
      <div className="container mx-auto px-4 py-20 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="font-heading text-4xl md:text-6xl font-black text-white tracking-wider mb-4 uppercase">
            SQUAD <span className="text-yellow-500">DASHBOARD</span>
          </h1>
          <p className="text-muted-foreground uppercase tracking-widest font-bold">You are not currently in a squad.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="border-white/10 bg-black/40 backdrop-blur-md shadow-[0_0_30px_rgba(234,179,8,0.1)] hover:border-yellow-500/50 transition-colors">
            <CardContent className="p-8 text-center flex flex-col items-center h-full">
              <Users className="size-16 text-yellow-500 mb-6" />
              <h2 className="text-2xl font-bold text-white mb-2 uppercase tracking-wide">Create a Squad</h2>
              <p className="text-muted-foreground mb-8">Become the Captain. Create a new squad identity and invite your friends to join using a Team Code.</p>
              <Button onClick={() => router.push("/register")} className="mt-auto w-full h-12 bg-yellow-500 hover:bg-yellow-400 text-black font-bold uppercase tracking-wider">
                Create Squad
              </Button>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-black/40 backdrop-blur-md shadow-[0_0_30px_rgba(168,85,247,0.1)] hover:border-primary/50 transition-colors">
            <CardContent className="p-8 text-center flex flex-col items-center h-full">
              <UserPlus className="size-16 text-primary mb-6" />
              <h2 className="text-2xl font-bold text-white mb-2 uppercase tracking-wide">Join a Squad</h2>
              <p className="text-muted-foreground mb-8">Already have a team? Ask your Captain for the 6-character Team Code to join their roster.</p>
              
              <Dialog open={isJoinModalOpen} onOpenChange={setIsJoinModalOpen}>
                  <Button onClick={() => setIsJoinModalOpen(true)} className="mt-auto w-full h-12 bg-primary hover:bg-primary/90 text-black font-bold uppercase tracking-wider text-sm transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:shadow-[0_0_25px_rgba(168,85,247,0.5)] border border-primary/50">
                    Join via Code
                  </Button>
                <DialogContent className="max-w-md bg-[#0a0a0c] border-white/10 text-white max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-heading text-primary uppercase">Join Squad</DialogTitle>
                  </DialogHeader>
                  
                  <div className="p-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm flex items-start gap-3 mb-4">
                    {locationStatus === "verifying" ? (
                      <Loader2 className="size-5 text-primary animate-spin shrink-0" />
                    ) : locationStatus === "success" ? (
                      <CheckCircle2 className="size-5 text-emerald-500 shrink-0" />
                    ) : (
                      <ShieldAlert className="size-5 text-destructive shrink-0" />
                    )}
                    <div>
                      <p className="text-white font-bold text-xs uppercase">Location Verification</p>
                      <p className="text-muted-foreground text-[10px]">
                        {locationStatus === "verifying" && "Checking region..."}
                        {locationStatus === "success" && `Verified: ${detectedState}`}
                        {locationStatus === "failed" && `Detected: ${detectedState}. Warning: Registration is for AP/TS residents.`}
                      </p>
                    </div>
                  </div>

                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onJoinSubmit)} className="space-y-4">
                      <FormField control={form.control} name="teamCode" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs uppercase text-muted-foreground font-bold">Team Code</FormLabel>
                          <FormControl><Input placeholder="e.g. A1B2C3" className="bg-white/5 border-white/10 font-mono text-center text-xl tracking-widest uppercase h-14" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      
                      <FormField control={form.control} name="isSubstitute" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs uppercase text-muted-foreground font-bold">Role</FormLabel>
                          <Select onValueChange={(val) => field.onChange(val === "true")} defaultValue={field.value ? "true" : "false"}>
                            <FormControl>
                              <SelectTrigger className="bg-white/5 border-white/10"><SelectValue /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="false">Main Player</SelectItem>
                              <SelectItem value="true">Substitute Player</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField control={form.control} name="fullName" render={({ field }) => (
                          <FormItem><FormLabel className="text-[10px] uppercase text-muted-foreground">Full Name</FormLabel><FormControl><Input className="bg-white/5 border-white/10 h-8 text-xs" {...field} /></FormControl></FormItem>
                        )} />
                        <FormField control={form.control} name="inGameName" render={({ field }) => (
                          <FormItem><FormLabel className="text-[10px] uppercase text-muted-foreground">IGN</FormLabel><FormControl><Input className="bg-white/5 border-white/10 h-8 text-xs" {...field} /></FormControl></FormItem>
                        )} />
                        <FormField control={form.control} name="freeFireUid" render={({ field }) => (
                          <FormItem><FormLabel className="text-[10px] uppercase text-muted-foreground">FF UID</FormLabel><FormControl><Input className="bg-white/5 border-white/10 h-8 text-xs font-mono" {...field} /></FormControl></FormItem>
                        )} />
                        <FormField control={form.control} name="dob" render={({ field }) => (
                          <FormItem><FormLabel className="text-[10px] uppercase text-muted-foreground">DOB</FormLabel><FormControl><Input type="date" className="bg-white/5 border-white/10 h-8 text-xs" {...field} /></FormControl></FormItem>
                        )} />
                        <FormField control={form.control} name="mobileNumber" render={({ field }) => (
                          <FormItem><FormLabel className="text-[10px] uppercase text-muted-foreground">Mobile</FormLabel><FormControl><Input className="bg-white/5 border-white/10 h-8 text-xs font-mono" {...field} /></FormControl></FormItem>
                        )} />
                        <FormField control={form.control} name="discordUsername" render={({ field }) => (
                          <FormItem><FormLabel className="text-[10px] uppercase text-muted-foreground">Discord</FormLabel><FormControl><Input className="bg-white/5 border-white/10 h-8 text-xs font-mono" {...field} /></FormControl></FormItem>
                        )} />
                      </div>

                      <Button type="submit" disabled={joining} className="w-full h-12 bg-primary hover:bg-primary/90 text-black font-bold uppercase tracking-wider mt-4">
                        {joining ? <Loader2 className="animate-spin size-5" /> : "Join Squad"}
                      </Button>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const isCaptain = team.captainUid === user?.uid;

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading text-4xl font-bold text-white tracking-wider flex items-center gap-4">
            {team.squadName}
            {team.status === "Approved" ? (
              <Badge className="bg-emerald-500/20 text-emerald-500 border-emerald-500/50 hover:bg-emerald-500/30">Approved</Badge>
            ) : team.status === "Rejected" ? (
              <Badge variant="destructive">Rejected</Badge>
            ) : (
              <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-500 border-yellow-500/50 hover:bg-yellow-500/30 text-xs">Pending Review</Badge>
            )}
          </h1>
          <p className="text-muted-foreground mt-2">Manage your tournament journey.</p>
        </div>
        
        {isCaptain && (
          <div className="bg-white/5 border border-yellow-500/30 rounded-xl p-4 flex items-center gap-4 shadow-[0_0_20px_rgba(234,179,8,0.1)]">
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Your Team Code</p>
              <p className="text-2xl font-mono font-black text-yellow-500 tracking-widest">{team.teamCode}</p>
            </div>
            <Button size="icon" variant="outline" className="border-yellow-500/50 text-yellow-500 hover:bg-yellow-500 hover:text-black shrink-0" onClick={copyCode}>
              <Copy className="size-4" />
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Roster Column */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-border/50 bg-card/40 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>Roster ({players.filter(p => !p.isSubstitute).length}/4)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Main Players</h3>
                {players.filter(p => !p.isSubstitute).map(p => (
                  <div key={p.playerId} className="flex justify-between items-center p-3 rounded-lg bg-background/50 border border-border/50">
                    <div>
                      <p className="text-sm font-bold text-white flex items-center gap-2">
                        {p.fullName} {p.isCaptain && <span className="text-[10px] bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded-full">CAPTAIN</span>}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono mt-1">UID: {p.freeFireUid}</p>
                    </div>
                    {p.locationVerified ? (
                      <CheckCircle2 className="size-4 text-emerald-500" />
                    ) : (
                      <ShieldAlert className="size-4 text-destructive" />
                    )}
                  </div>
                ))}
                {players.filter(p => !p.isSubstitute).length < 4 && isCaptain && (
                  <div className="p-3 rounded-lg border border-dashed border-white/20 text-center bg-white/[0.01]">
                    <p className="text-xs text-muted-foreground">Waiting for players to join using Team Code...</p>
                  </div>
                )}
              </div>
              
              <div className="space-y-2 pt-4 border-t border-white/5">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Substitute (1)</h3>
                {players.filter(p => p.isSubstitute).map(p => (
                  <div key={p.playerId} className="flex justify-between items-center p-3 rounded-lg bg-background/50 border border-border/50">
                    <div>
                      <p className="text-sm font-bold text-secondary">{p.fullName}</p>
                      <p className="text-xs text-muted-foreground font-mono mt-1">UID: {p.freeFireUid}</p>
                    </div>
                    {p.locationVerified ? (
                      <CheckCircle2 className="size-4 text-emerald-500" />
                    ) : (
                      <ShieldAlert className="size-4 text-destructive" />
                    )}
                  </div>
                ))}
                {players.filter(p => p.isSubstitute).length === 0 && isCaptain && (
                  <div className="p-3 rounded-lg border border-dashed border-white/20 text-center bg-white/[0.01]">
                    <p className="text-xs text-muted-foreground">Waiting for substitute to join...</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Matches Column */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="font-heading text-2xl font-bold text-white">Assigned Matches</h2>
          
          {team.status !== "Approved" && (
            <div className="p-4 rounded-xl border border-yellow-500/50 bg-yellow-500/10 text-yellow-200 flex items-start gap-3">
              <AlertTriangle className="size-5 shrink-0 mt-0.5" />
              <p className="text-sm">This squad is currently under review. Matches and room credentials will not be assigned until approved by the administrators.</p>
            </div>
          )}

          {matches.length === 0 ? (
            <Card className="border-border/50 bg-card/40 backdrop-blur-md">
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">No matches assigned yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {matches.map(match => (
                <motion.div key={match.matchId} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <Card className={`border-border/50 bg-card/40 backdrop-blur-md overflow-hidden ${match.credentialsReleased ? 'border-primary/50 shadow-[0_0_15px_rgba(168,85,247,0.15)]' : ''}`}>
                    <CardHeader className="pb-3 border-b border-border/50 bg-background/30">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl text-white">{match.matchName}</CardTitle>
                          <CardDescription>{match.stageId} • {new Date(match.scheduledTime).toLocaleString()}</CardDescription>
                        </div>
                        <Badge variant="outline" className="border-primary/50 text-primary">{match.status}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                      {match.credentialsReleased ? (
                        <div className="p-4 rounded-xl border border-primary/50 bg-primary/5 space-y-4">
                          <div className="flex items-center gap-2 text-primary font-bold mb-2">
                            <Key className="size-4" />
                            <span>Room Credentials Released</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Room ID</p>
                              <div className="p-3 rounded-md bg-background border border-border/50 font-mono text-lg text-white select-all">
                                {match.roomId}
                              </div>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Password</p>
                              <div className="p-3 rounded-md bg-background border border-border/50 font-mono text-lg text-white select-all">
                                {match.roomPassword}
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="p-6 rounded-xl border border-dashed border-border/50 text-center">
                          <Key className="size-8 mx-auto text-muted-foreground opacity-50 mb-3" />
                          <p className="text-sm text-muted-foreground font-medium">Room credentials are hidden.</p>
                          <p className="text-xs text-muted-foreground mt-1">The admin will release the Room ID and Password closer to the match start time.</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
