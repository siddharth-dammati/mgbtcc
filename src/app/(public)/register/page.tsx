"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { doc, setDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/store/use-auth";
import { CheckCircle2, ShieldAlert, Trophy, MapPin, Loader2 } from "lucide-react";

const LANGUAGES = ["English", "Hindi", "Telugu", "Tamil", "Kannada", "Malayalam", "Marathi", "Bengali", "Gujarati", "Punjabi", "Urdu", "Odia", "Assamese", "Other"] as const;

const playerSchema = z.object({
  fullName: z.string().min(2, "Required"),
  inGameName: z.string().min(2, "Required"),
  dob: z.string().min(1, "Required"),
  freeFireUid: z.string().min(5, "Required"),
  primaryLanguage: z.enum(LANGUAGES),
  mobileNumber: z.string().min(10, "Required"),
  discordUsername: z.string().min(3, "Required"),
});

const formSchema = z.object({
  squadName: z.string().min(3, "Squad name must be at least 3 characters"),
  logoDesign: z.number().min(0).max(4),
  captainDetails: playerSchema,
});

const DESIGNS = [
  "bg-gradient-to-br from-purple-600 to-blue-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)] border-primary",
  "bg-gradient-to-tr from-emerald-500 to-teal-700 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)] border-emerald-500",
  "bg-gradient-to-bl from-rose-500 to-orange-600 text-white shadow-[0_0_15px_rgba(244,63,94,0.5)] border-rose-500",
  "bg-gradient-to-r from-slate-800 to-zinc-900 text-primary shadow-[0_0_15px_rgba(255,255,255,0.2)] border-zinc-700 font-mono",
  "bg-gradient-to-t from-yellow-500 to-amber-700 text-black shadow-[0_0_15px_rgba(234,179,8,0.5)] border-yellow-500 font-serif font-black",
];

function generateTeamCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export default function RegisterSquadPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [locationStatus, setLocationStatus] = useState<"pending" | "verifying" | "success" | "failed">("pending");
  const [detectedState, setDetectedState] = useState("Unknown");
  const [hasRegistered, setHasRegistered] = useState(false);
  const [checkingRegistration, setCheckingRegistration] = useState(true);

  useEffect(() => {
    if (!user) {
      setCheckingRegistration(false);
      return;
    }
    const checkRegistration = async () => {
      try {
        // Check if user is a captain OR a player in any squad
        const teamQ = query(collection(db, "teams"), where("captainUid", "==", user.uid));
        const teamSnap = await getDocs(teamQ);
        
        const playerQ = query(collection(db, "players"), where("userUid", "==", user.uid));
        const playerSnap = await getDocs(playerQ);

        if (!teamSnap.empty || !playerSnap.empty) {
          setHasRegistered(true);
        }
      } catch (error) {
        console.error("Error checking registration:", error);
      } finally {
        setCheckingRegistration(false);
      }
    };
    checkRegistration();
  }, [user]);

  useEffect(() => {
    if (navigator.geolocation) {
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
        (err) => {
          setLocationStatus("failed");
        }
      );
    } else {
      setLocationStatus("failed");
    }
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      squadName: "",
      logoDesign: 0,
      captainDetails: { fullName: "", inGameName: "", dob: "", freeFireUid: "", primaryLanguage: "Telugu", mobileNumber: "", discordUsername: "" },
    },
  });

  const watchSquadName = form.watch("squadName");
  const watchLogoDesign = form.watch("logoDesign");
  const firstWord = watchSquadName.split(" ")[0]?.toUpperCase() || "SQUAD";

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
      toast.error("You must be logged in to register a squad");
      router.push("/login");
      return;
    }

    setIsLoading(true);
    try {
      const teamId = `team_${Date.now()}`;
      const teamCode = generateTeamCode();
      
      // Save Team
      await setDoc(doc(db, "teams", teamId), {
        teamId,
        squadName: values.squadName,
        logoDesign: values.logoDesign,
        captainUid: user.uid,
        status: "Pending",
        currentStage: "Registered",
        teamCode: teamCode,
        createdAt: new Date().toISOString(),
      });

      // Save Captain as Player 1
      const playerId = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await setDoc(doc(db, "players", playerId), {
        ...values.captainDetails,
        playerId,
        teamId,
        userUid: user.uid,
        isSubstitute: false,
        isCaptain: true,
        detectedLocation: detectedState,
        locationVerified: locationStatus === "success",
      });

      // Notification
      await setDoc(doc(collection(db, "notifications")), {
        title: "Squad Created",
        message: `Your squad ${values.squadName} has been created! Share your Team Code: ${teamCode} with your teammates so they can join.`,
        createdAt: new Date().toISOString(),
        targetUsers: [user.uid]
      });

      toast.success("Squad created successfully!");
      router.push("/my-squad");
    } catch (error: any) {
      toast.error(error.message || "Failed to create squad");
    } finally {
      setIsLoading(false);
    }
  }

  const nextStep = async () => {
    let valid = false;
    if (step === 1) {
      valid = await form.trigger(["squadName", "logoDesign"]);
    }
    if (valid) setStep(2);
  };

  const prevStep = () => setStep(1);

  if (checkingRegistration) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="size-8 text-yellow-500 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">Please <span className="text-yellow-500 cursor-pointer hover:underline" onClick={() => router.push('/login')}>log in</span> to register a squad.</p>
      </div>
    );
  }

  if (hasRegistered) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-2xl text-center">
        <Card className="border-border/50 bg-card/40 backdrop-blur-md p-8 shadow-[0_0_30px_rgba(234,179,8,0.2)]">
          <CardHeader>
            <CardTitle className="text-3xl font-heading text-white">Already in a Squad</CardTitle>
            <CardDescription className="text-base mt-2">You are already part of a registered squad.</CardDescription>
          </CardHeader>
          <CardContent className="mt-6">
            <Button className="h-12 px-8 bg-yellow-500 hover:bg-yellow-400 text-black font-bold uppercase tracking-wider" onClick={() => router.push('/my-squad')}>
              Go to My Squad
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="text-center mb-10">
        <h1 className="font-heading text-4xl md:text-5xl font-black text-white tracking-wider mb-4 uppercase">Create Your <span className="text-yellow-500">Squad</span></h1>
        <p className="text-muted-foreground text-sm uppercase tracking-widest font-bold">Step {step} of 2</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8"
              >
                <Card className="border-white/10 bg-black/40 backdrop-blur-md shadow-[0_0_30px_rgba(234,179,8,0.1)]">
                  <CardHeader>
                    <CardTitle className="text-yellow-500">Team Identity</CardTitle>
                    <CardDescription>Give your squad a name and choose a badge.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="squadName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white font-bold uppercase text-xs tracking-wider">Squad Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Hyderabad Ninjas" className="bg-white/5 border-white/10 text-white h-12 focus-visible:ring-yellow-500" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-4">
                      <FormLabel className="text-white font-bold uppercase text-xs tracking-wider">Squad Badge Preview</FormLabel>
                      <div className="flex flex-col items-center justify-center p-8 border border-dashed border-white/20 rounded-xl bg-white/[0.02]">
                        <div className={`size-32 rounded-2xl flex items-center justify-center border-4 transition-all duration-500 ${DESIGNS[watchLogoDesign]}`}>
                          <span className="text-4xl">{firstWord[0] || "?"}</span>
                        </div>
                        <p className="mt-6 text-xl font-heading font-bold text-white tracking-wider">{watchSquadName || "YOUR SQUAD"}</p>
                      </div>

                      <FormField
                        control={form.control}
                        name="logoDesign"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-muted-foreground text-xs uppercase">Select Badge Style</FormLabel>
                            <div className="flex gap-3 flex-wrap">
                              {DESIGNS.map((_, i) => (
                                <button
                                  key={i}
                                  type="button"
                                  onClick={() => field.onChange(i)}
                                  className={`size-12 rounded-lg border-2 transition-all ${
                                    field.value === i ? 'border-yellow-500 scale-110 shadow-[0_0_15px_rgba(234,179,8,0.5)]' : 'border-white/10 hover:border-white/30'
                                  } ${DESIGNS[i]}`}
                                />
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end">
                  <Button type="button" onClick={nextStep} className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold uppercase tracking-wider h-12 px-8">
                    Next: Captain Details
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8"
              >
                <div className="p-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm flex items-start gap-4">
                  {locationStatus === "verifying" ? (
                    <div className="size-10 rounded-full bg-yellow-500/20 flex items-center justify-center shrink-0">
                      <div className="size-5 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : locationStatus === "success" ? (
                    <div className="size-10 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="size-5 text-emerald-500" />
                    </div>
                  ) : (
                    <div className="size-10 rounded-full bg-destructive/20 flex items-center justify-center shrink-0">
                      <ShieldAlert className="size-5 text-destructive" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-white font-bold text-sm flex items-center gap-2">
                      <MapPin className="size-4 text-muted-foreground" /> Location Verification
                    </h3>
                    <p className="text-muted-foreground text-xs mt-1">
                      {locationStatus === "verifying" && "Checking your region..."}
                      {locationStatus === "success" && `Verified: ${detectedState}. You are eligible.`}
                      {locationStatus === "failed" && `Detected: ${detectedState}. Warning: If you are not in AP/TS, your team may be disqualified.`}
                    </p>
                  </div>
                </div>

                <Card className="border-white/10 bg-black/40 backdrop-blur-md">
                  <CardHeader>
                    <CardTitle className="text-yellow-500">Captain Details</CardTitle>
                    <CardDescription>Enter your player information. You will be assigned as Player 1.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField control={form.control} name="captainDetails.fullName" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold text-muted-foreground uppercase">Full Name</FormLabel>
                          <FormControl><Input {...field} className="bg-white/5 border-white/10" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="captainDetails.inGameName" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold text-muted-foreground uppercase">In-Game Name</FormLabel>
                          <FormControl><Input {...field} className="bg-white/5 border-white/10" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="captainDetails.freeFireUid" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold text-muted-foreground uppercase">Free Fire UID</FormLabel>
                          <FormControl><Input {...field} className="bg-white/5 border-white/10 font-mono" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="captainDetails.dob" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold text-muted-foreground uppercase">Date of Birth</FormLabel>
                          <FormControl><Input type="date" {...field} className="bg-white/5 border-white/10" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="captainDetails.primaryLanguage" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold text-muted-foreground uppercase">Language</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-white/5 border-white/10"><SelectValue /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {LANGUAGES.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="captainDetails.mobileNumber" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold text-muted-foreground uppercase">Mobile Number (WhatsApp)</FormLabel>
                          <FormControl><Input {...field} className="bg-white/5 border-white/10 font-mono" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="captainDetails.discordUsername" render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel className="text-xs font-bold text-muted-foreground uppercase">Discord Username</FormLabel>
                          <FormControl><Input {...field} className="bg-white/5 border-white/10 font-mono" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-between items-center pt-6 border-t border-white/10">
                  <Button type="button" variant="ghost" onClick={prevStep} className="text-muted-foreground hover:text-white uppercase tracking-wider font-bold">
                    Back
                  </Button>
                  <Button type="submit" disabled={isLoading} className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold uppercase tracking-wider h-12 px-8">
                    {isLoading ? <Loader2 className="mr-2 size-5 animate-spin" /> : "Create Squad"}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </Form>
    </div>
  );
}
