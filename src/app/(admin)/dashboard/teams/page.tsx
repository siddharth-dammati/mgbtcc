"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc, query, where, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getFilteredRowModel,
  ColumnDef
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, User, Users, Gamepad2, Phone, MessageSquare, Globe, ShieldCheck, ShieldAlert, FileText, X } from "lucide-react";

type Team = {
  teamId: string;
  squadName: string;
  captainUid: string;
  status: "Pending" | "Approved" | "Rejected";
  currentStage: string;
  detectedLocation?: string;
  createdAt: string;
  isCompleted?: boolean;
};

export default function TeamsManagementPage() {
  const [data, setData] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [teamPlayers, setTeamPlayers] = useState<any[]>([]);
  const [loadingPlayers, setLoadingPlayers] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [teamsSnap, playersSnap] = await Promise.all([
        getDocs(collection(db, "teams")),
        getDocs(collection(db, "players"))
      ]);

      const players = playersSnap.docs.map(doc => doc.data());
      const playersByTeam = players.reduce((acc: any, player: any) => {
        if (!acc[player.teamId]) acc[player.teamId] = [];
        acc[player.teamId].push(player);
        return acc;
      }, {});

      const teams = teamsSnap.docs.map(doc => {
        const t = doc.data() as Team;
        const roster = playersByTeam[t.teamId] || [];
        const mainPlayers = roster.filter((p: any) => !p.isSubstitute);
        const allVerified = roster.every((p: any) => p.locationVerified);
        
        t.isCompleted = mainPlayers.length === 4 && allVerified && roster.length > 0;
        return t;
      });

      // Sort: Completed first, then by date descending
      teams.sort((a, b) => {
        if (a.isCompleted && !b.isCompleted) return -1;
        if (!a.isCompleted && b.isCompleted) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

      setData(teams);
    } catch (error) {
      console.error("Error fetching teams", error);
      toast.error("Failed to load teams");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateStatus = async (teamId: string, status: Team["status"]) => {
    try {
      await updateDoc(doc(db, "teams", teamId), { status });
      toast.success(`Team status updated to ${status}`);
      setData(prev => prev.map(t => t.teamId === teamId ? { ...t, status } : t));
      if (selectedTeam?.teamId === teamId) {
        setSelectedTeam(prev => prev ? { ...prev, status } : null);
      }
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleViewDetails = async (team: Team) => {
    setSelectedTeam(team);
    setLoadingPlayers(true);
    setTeamPlayers([]);
    try {
      const q = query(collection(db, "players"), where("teamId", "==", team.teamId));
      const snap = await getDocs(q);
      setTeamPlayers(snap.docs.map(d => d.data()));
    } catch (error) {
      toast.error("Failed to load player details");
    } finally {
      setLoadingPlayers(false);
    }
  };

  const columns: ColumnDef<Team>[] = [
    {
      accessorKey: "squadName",
      header: "Squad Name",
      cell: ({ row }) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded bg-white/5 border border-white/10 flex items-center justify-center font-bold text-white text-xs shrink-0">
              {row.getValue<string>("squadName").substring(0, 2).toUpperCase()}
            </div>
            <span className="font-bold text-white tracking-wide">{row.getValue("squadName")}</span>
          </div>
          {row.original.isCompleted && (
            <div className="flex items-center gap-1 mt-1 ml-11 text-[10px] text-emerald-500 font-bold uppercase tracking-widest">
              <ShieldCheck className="size-3" /> Fully Verified
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <Badge 
            variant="outline"
            className={`
              ${status === "Approved" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30" : ""}
              ${status === "Rejected" ? "bg-destructive/10 text-destructive border-destructive/30" : ""}
              ${status === "Pending" ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/30" : ""}
            `}
          >
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "currentStage",
      header: "Stage",
      cell: ({ row }) => (
        <span className="text-muted-foreground font-medium bg-white/5 px-3 py-1 rounded-full text-xs border border-white/5">
          {row.getValue("currentStage")}
        </span>
      )
    },
    {
      accessorKey: "createdAt",
      header: "Registered On",
      cell: ({ row }) => {
        const dateStr = row.getValue("createdAt") as string;
        try {
          return <span className="text-muted-foreground text-sm">{format(new Date(dateStr), "MMM d, yyyy")}</span>;
        } catch {
          return dateStr;
        }
      }
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const team = row.original;
        return (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="h-8 border-white/10 text-white hover:bg-white/10 transition-all" onClick={() => handleViewDetails(team)}>
              <FileText className="size-4 mr-1" />
              Dossier
            </Button>
            <Button size="sm" variant="outline" className="h-8 border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10 hover:text-emerald-500 transition-all" onClick={() => handleUpdateStatus(team.teamId, "Approved")} disabled={team.status === "Approved"}>Approve</Button>
            <Button size="sm" variant="outline" className="h-8 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive transition-all" onClick={() => handleUpdateStatus(team.teamId, "Rejected")} disabled={team.status === "Rejected"}>Reject</Button>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
  });

  const handleCleanup = async () => {
    if (!confirm("Are you sure you want to delete all orphaned players (players whose team no longer exists)?")) return;
    
    setLoading(true);
    try {
      const [teamsSnap, playersSnap] = await Promise.all([
        getDocs(collection(db, "teams")),
        getDocs(collection(db, "players"))
      ]);

      // Get all valid team IDs
      const validTeamIds = new Set(teamsSnap.docs.map(doc => doc.id));
      
      let deletedCount = 0;
      
      // Find orphaned players and delete them
      for (const playerDoc of playersSnap.docs) {
        const playerData = playerDoc.data();
        if (!validTeamIds.has(playerData.teamId)) {
          await deleteDoc(doc(db, "players", playerDoc.id));
          deletedCount++;
        }
      }
      
      toast.success(`Cleanup complete. Removed ${deletedCount} orphaned players.`);
      fetchData(); // Refresh UI
    } catch (error) {
      console.error("Cleanup error", error);
      toast.error("An error occurred during database cleanup.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h2 className="font-heading text-2xl font-bold text-white tracking-wider">TEAM MANAGEMENT</h2>
        <p className="text-muted-foreground font-medium text-sm mt-1">Manage and approve registered squads.</p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search squads..."
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="pl-10 bg-white/[0.02] border-white/10 focus-visible:ring-primary/50 text-white"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={handleCleanup} className="w-full sm:w-auto border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors">
            Cleanup Database
          </Button>
          <Button variant="outline" onClick={fetchData} className="w-full sm:w-auto border-white/10 hover:bg-white/5 transition-colors">
            Refresh Data
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden">
        <Table>
          <TableHeader className="bg-black/40">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-white/5 hover:bg-transparent">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="text-muted-foreground font-bold uppercase tracking-wider text-[10px] h-12">
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32 text-center relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="border-white/5 hover:bg-white/5 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32 text-center text-muted-foreground">
                  No teams found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="flex items-center justify-end space-x-2">
        <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} className="bg-white/[0.02] border-white/10 hover:bg-white/10">Previous</Button>
        <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} className="bg-white/[0.02] border-white/10 hover:bg-white/10">Next</Button>
      </div>

      <Dialog open={selectedTeam !== null} onOpenChange={(open) => !open && setSelectedTeam(null)}>
        <DialogContent className="max-w-[95vw] sm:max-w-[95vw] md:max-w-[95vw] lg:max-w-[95vw] w-full max-h-[95vh] bg-[#0a0a0c] border-white/10 text-white overflow-y-auto p-0">
          <div className="p-6 border-b border-white/10 bg-black/40 flex items-center justify-between sticky top-0 z-10 backdrop-blur-xl">
            <div>
              <DialogTitle className="text-xl font-heading font-bold text-white tracking-wider flex items-center gap-3">
                {selectedTeam?.squadName}
              </DialogTitle>
              <p className="text-muted-foreground text-xs mt-1">
                Team Dossier & Verification Records
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Badge 
                variant="outline"
                className={`text-xs px-3 py-1
                  ${selectedTeam?.status === "Approved" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30" : ""}
                  ${selectedTeam?.status === "Rejected" ? "bg-destructive/10 text-destructive border-destructive/30" : ""}
                  ${selectedTeam?.status === "Pending" ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/30" : ""}
                `}
              >
                {selectedTeam?.status}
              </Badge>
              <Button variant="ghost" size="icon" onClick={() => setSelectedTeam(null)} className="text-muted-foreground hover:text-white rounded-full">
                <X className="size-5" />
              </Button>
            </div>
          </div>
          
          <div className="p-6 space-y-6 bg-[#0a0a0c]">
            <div>
              <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                <Users className="size-3 text-white" /> Active Roster
              </h3>
              {loadingPlayers ? (
                <div className="flex justify-center py-12">
                  <div className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <AnimatePresence>
                    {teamPlayers.map((p, i) => (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        key={p.playerId} 
                        className={`p-4 rounded-xl border flex flex-col relative ${p.isCaptain ? 'border-yellow-500/50 bg-yellow-500/5 shadow-[0_0_15px_rgba(234,179,8,0.1)]' : p.isSubstitute ? 'border-dashed border-white/10 bg-white/[0.01]' : 'border-white/10 bg-white/[0.03]'}`}
                      >
                        <div className="flex justify-between items-start mb-4 gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-white text-base truncate flex items-center gap-2">
                              {p.fullName}
                            </p>
                            <p className="text-xs text-primary font-bold flex items-center gap-1 mt-0.5 truncate">
                              <Gamepad2 className="size-3 shrink-0" /> <span className="truncate">{p.inGameName || "N/A"}</span>
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1 shrink-0">
                            {p.isCaptain ? (
                              <Badge className="bg-yellow-500 text-black border-yellow-500 hover:bg-yellow-400 font-black text-[10px] tracking-widest px-2 py-0.5 uppercase shadow-[0_0_10px_rgba(234,179,8,0.5)]">CAPTAIN</Badge>
                            ) : p.isSubstitute ? (
                              <Badge variant="outline" className="border-white/20 text-muted-foreground text-[10px] bg-black/50">SUBSTITUTE</Badge>
                            ) : (
                              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[10px]">MAIN PLAYER</Badge>
                            )}
                          </div>
                        </div>

                        {/* EXPLICIT LOCATION STATUS */}
                        <div className={`mb-4 p-2.5 rounded-lg border flex items-start gap-2 ${p.locationVerified ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : 'bg-destructive/10 border-destructive/30 text-destructive'}`}>
                          {p.locationVerified ? <ShieldCheck className="size-4 mt-0.5 shrink-0" /> : <ShieldAlert className="size-4 mt-0.5 shrink-0" />}
                          <div className="flex flex-col min-w-0">
                            <span className="text-[10px] font-bold uppercase tracking-wider">
                              {p.locationVerified ? "Location Verified" : "Location Warning"}
                            </span>
                            <span className="text-xs font-medium truncate mt-0.5">
                              {p.detectedLocation || "Unknown Location"}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2 text-xs flex-1">
                          <div className="flex items-center justify-between py-1 border-b border-white/5 gap-2">
                            <span className="text-muted-foreground flex items-center gap-1.5 shrink-0"><User className="size-3" /> UID</span>
                            <span className="text-white font-mono truncate">{p.freeFireUid}</span>
                          </div>
                          <div className="flex items-center justify-between py-1 border-b border-white/5 gap-2">
                            <span className="text-muted-foreground flex items-center gap-1.5 shrink-0"><Phone className="size-3" /> Phone</span>
                            <span className="text-white truncate">{p.mobileNumber}</span>
                          </div>
                          <div className="flex items-center justify-between py-1 border-b border-white/5 gap-2">
                            <span className="text-muted-foreground flex items-center gap-1.5 shrink-0"><MessageSquare className="size-3" /> Discord</span>
                            <span className="text-white truncate text-right">{p.discordUsername}</span>
                          </div>
                          <div className="flex items-center justify-between py-1 gap-2">
                            <span className="text-muted-foreground flex items-center gap-1.5 shrink-0"><Globe className="size-3" /> Lang</span>
                            <span className="text-white truncate">{p.primaryLanguage}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
          <div className="p-6 border-t border-white/10 bg-black/40 flex justify-end sticky bottom-0 z-10 backdrop-blur-xl">
            <Button variant="outline" onClick={() => setSelectedTeam(null)} className="border-white/20 text-white hover:bg-white/10 uppercase tracking-widest text-xs font-bold px-8">
              Close Dossier
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
