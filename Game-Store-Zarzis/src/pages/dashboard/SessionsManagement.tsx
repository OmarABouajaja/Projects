import { useState, useEffect, useRef, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { useConsoles } from "@/hooks/useConsoles";
import { usePricing } from "@/hooks/usePricing";
import { useClients, useCreateClient, useClientByPhone } from "@/hooks/useClients";
import { useStartSession, useEndSession, useTodaySessions, useActiveSessions, useAddGameToSession } from "@/hooks/useGamingSessions";
import { useCreatePointsTransaction } from "@/hooks/usePointsTransactions";
import { useStoreSettings, useUpdateStoreSetting } from "@/hooks/useStoreSettings";
import { useGameShortcuts, useCreateGameShortcut, useDeleteGameShortcut } from "@/hooks/useGameShortcuts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "@/components/ui/sheet";
import { toast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { Gamepad2, Play, Square, Plus, Clock, Gift, User, Star, MoreVertical, Timer, Bell, BellOff, AlertTriangle, Wrench, Edit, Trash2, DollarSign, Zap, Coffee } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { HelpTooltip } from "@/components/ui/help-tooltip";
import { useData } from "@/contexts/DataContext";
import { useNavigate } from "react-router-dom";
import { ShortcutManagerDialog } from "@/components/dashboard/ShortcutManagerDialog";
import { QuickSaleMenu } from "@/components/dashboard/QuickSaleMenu";
import { SchemaStatus } from "@/components/dashboard/SchemaStatus";
import { ClientSearch } from "@/components/dashboard/ClientSearch";

// Redundant local playBeep removed - handled globally in DashboardLayout

const SessionsManagement = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Local State
  const [isStartDialogOpen, setIsStartDialogOpen] = useState(false);
  const [isEndDialogOpen, setIsEndDialogOpen] = useState(false);
  const [isExtendDialogOpen, setIsExtendDialogOpen] = useState(false);
  const [selectedConsole, setSelectedConsole] = useState<string | null>(null);
  const [selectedPricing, setSelectedPricing] = useState<string>("");
  const [selectedClientForSession, setSelectedClientForSession] = useState<any>(null); // For start dialog
  const [isCreatingClient, setIsCreatingClient] = useState(false);
  const [newClientPhone, setNewClientPhone] = useState("");
  const [newClientName, setNewClientName] = useState("");
  const [gameNotes, setGameNotes] = useState("");
  const [isShortcutsDialogOpen, setIsShortcutsDialogOpen] = useState(false);
  const [newShortcutName, setNewShortcutName] = useState("");
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [gamesInSession, setGamesInSession] = useState(0);
  const [isManagerOpen, setIsManagerOpen] = useState(false);
  const [pointsEarned, setPointsEarned] = useState(0);

  // Data Hooks
  const { data: consoles } = useConsoles();
  const { data: pricing } = usePricing();
  const { data: activeSessions } = useActiveSessions();
  const { data: storeSettingsData } = useStoreSettings();
  const { gameShortcuts, deleteGameShortcut, isLoading: isDataLoading, clients } = useData();

  // Mutations
  const startSession = useStartSession();
  const endSession = useEndSession();
  const createPointsTransaction = useCreatePointsTransaction();
  const addGameToSession = useAddGameToSession();
  const createClient = useCreateClient();
  const updateSetting = useUpdateStoreSetting();


  // Keyboard shortcuts for Console Instant Start & Game Selection
  useEffect(() => {
    // If a dialog is open, we disable global console shortcuts to avoid accidental starts while typing
    if (isStartDialogOpen || isEndDialogOpen || isExtendDialogOpen || isShortcutsDialogOpen) return;

    const handleKeyDown = async (e: KeyboardEvent) => {
      // Only trigger if not typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const pressedKey = e.key.toUpperCase();

      // 0. Global Actions
      if (pressedKey === 'K') {
        e.preventDefault();
        setIsManagerOpen(true);
        return;
      }
      if (pressedKey === 'C') {
        e.preventDefault();
        setIsCafeMenuOpen(true);
        return;
      }

      // 1. Console Shortcuts (Instant Start / Context Action)
      if (consoles && pricing) {
        const targetConsole = consoles.find(c => c.shortcut_key === pressedKey);

        if (targetConsole) {
          e.preventDefault();

          // Determine Action based on status
          const isActive = targetConsole.status === 'in_use' || activeSessions?.some(s => s.console_id === targetConsole.id);
          const session = activeSessions?.find(s => s.console_id === targetConsole.id);

          if (targetConsole.status === 'maintenance') {
            toast({ title: "Maintenance", description: `${targetConsole.name} is in maintenance mode.`, variant: "destructive" });
            return;
          }

          if (isActive && session) {
            // Already active? Open extension dialog
            openExtendDialog(session);
            return;
          }

          // Auto-start logic (Available)
          // Find applicable pricing
          let applicablePricing = targetConsole.default_pricing_id
            ? pricing.find(p => p.id === targetConsole.default_pricing_id)
            : null;

          if (!applicablePricing && storeSettingsData) {
            const consoleType = (targetConsole.console_type || '').toUpperCase();
            const globalDefaultKey = consoleType === 'PS5' ? 'default_pricing_ps5' : 'default_pricing_ps4';
            const globalDefaultId = (storeSettingsData as any)[globalDefaultKey];

            if (globalDefaultId && globalDefaultId !== 'none') {
              applicablePricing = pricing.find(p => p.id === globalDefaultId);
            }
          }

          if (!applicablePricing) {
            const targetType = (targetConsole.console_type || '').toUpperCase();
            applicablePricing = pricing.find(p => p.console_type.toUpperCase() === targetType && p.price_type === 'hourly')
              || pricing.find(p => p.console_type.toUpperCase() === targetType);
          }

          if (!applicablePricing) {
            toast({ title: "Configuration Error", description: `Aucun tarif trouvé pour ${targetConsole.name}.`, variant: "destructive" });
            openStartDialog(targetConsole.id);
            return;
          }

          try {
            toast({ title: "Starting Session...", description: `Launching ${targetConsole.name}` });
            await startSession.mutateAsync({
              console_id: targetConsole.id,
              pricing_id: applicablePricing.id,
              session_type: applicablePricing.price_type,
              staff_id: user?.id || '',
              notes: "Quick Start via Shortcut"
            });
          } catch (err: any) {
            toast({ title: "Start Failed", description: err.message, variant: "destructive" });
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isStartDialogOpen, isEndDialogOpen, isExtendDialogOpen, isShortcutsDialogOpen, consoles, pricing, user, startSession, activeSessions, storeSettingsData]);

  // ⌨️ Dialog-specific Keyboard Listeners
  useEffect(() => {
    if (!isStartDialogOpen && !isEndDialogOpen && !isExtendDialogOpen) return;

    const handleDialogKeys = (e: KeyboardEvent) => {
      // Don't trigger if typing in input FIELDS
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        // Exception: Handle 'Enter' to submit if in Start Dialog
        if (e.key === 'Enter' && isStartDialogOpen) {
          handleStartSession();
        }
        return;
      }

      const key = e.key;

      if (isStartDialogOpen && gameShortcuts) {
        const pressedKey = key.toUpperCase();
        const matched = gameShortcuts.find(s => s.shortcut_key === pressedKey);
        if (matched) {
          setGameNotes(matched.name);
          toast({ title: "Game Selected", description: matched.name });
        }
      }

      if (isExtendDialogOpen) {
        if (key === '+' || key === 'Enter') {
          e.preventDefault();
          handleExtendSession();
        }
      }

      if (isEndDialogOpen) {
        if (key === '+') {
          e.preventDefault();
          setGamesInSession(prev => prev + 1);
        } else if (key === '-') {
          e.preventDefault();
          const startTime = new Date(selectedSession?.start_time || 0).getTime();
          const now = new Date().getTime();
          const elapsedMinutes = (now - startTime) / 60000;
          const tarifDuration = selectedSession?.pricing?.game_duration_minutes || 0;
          const minGames = (tarifDuration > 0 && elapsedMinutes < tarifDuration) ? 0 : 1;
          setGamesInSession(prev => Math.max(minGames, prev - 1));
        } else if (key === 'Enter') {
          e.preventDefault();
          handleEndSession();
        }
      }
    };

    window.addEventListener('keydown', handleDialogKeys);
    return () => window.removeEventListener('keydown', handleDialogKeys);
  }, [isStartDialogOpen, isEndDialogOpen, isExtendDialogOpen, gameShortcuts, selectedSession, gamesInSession]);





  // Settings
  const freeGameThreshold = storeSettingsData?.free_game_threshold?.games_required || 5;

  const getConsoleSession = (consoleId: string) => {
    return activeSessions?.find((s: any) => s.console_id === consoleId);
  };

  // Alarm State (Now handled globally in DashboardLayout)
  const [overdueSessions, setOverdueSessions] = useState<string[]>([]); // Visual highlights only

  useEffect(() => {
    if (!activeSessions) return;
    const now = new Date().getTime();
    const newOverdue: string[] = [];

    activeSessions.forEach((session: any) => {
      if (!session.start_time) return;
      const startTime = new Date(session.start_time).getTime();
      const elapsedMinutes = (now - startTime) / (1000 * 60);
      let isOverdue = false;

      if (session.session_type === 'hourly') {
        const limitMinutes = session.pricing?.game_duration_minutes || 0;
        const extraTime = session.extra_time_minutes || 0;
        const totalLimit = limitMinutes + extraTime;
        if (totalLimit > 0 && elapsedMinutes > totalLimit) isOverdue = true;
      } else if (session.session_type === 'per_game') {
        const durationPerGame = session.pricing?.game_duration_minutes || 15;
        const totalGames = session.games_played || 1;
        const expectedDuration = totalGames * durationPerGame;
        if (elapsedMinutes > (expectedDuration + 5)) isOverdue = true;
      }

      if (isOverdue) newOverdue.push(session.id);
    });
    setOverdueSessions(newOverdue);
  }, [activeSessions]);

  // Live Points Calculation for End Dialog
  const [estimatedPoints, setEstimatedPoints] = useState(0);

  useEffect(() => {
    if (!selectedSession || storeSettingsData?.points_system_enabled === false) {
      setEstimatedPoints(0);
      return;
    }

    const calculate = () => {
      const pricingInfo = selectedSession.pricing;
      if (!pricingInfo) return 0;

      if (selectedSession.session_type === 'hourly') {
        const startTime = new Date(selectedSession.start_time);
        const now = new Date();
        const diffMs = now.getTime() - startTime.getTime();
        const hoursPlayed = Math.ceil(diffMs / (1000 * 60 * 60)); // Match handleEndSession logic
        const totalAmount = hoursPlayed * Number(pricingInfo.price);
        const pointsPerDT = storeSettingsData?.points_config?.points_per_dt || 1;
        return Math.floor(totalAmount * pointsPerDT);
      } else {
        // Per game
        const totalGames = gamesInSession;
        let freeGames = 0;
        if (storeSettingsData?.free_games_enabled !== false) {
          if (totalGames >= freeGameThreshold + 1) {
            freeGames = Math.floor(totalGames / (freeGameThreshold + 1));
          }
        }
        const actualPaidGames = totalGames - freeGames;
        return actualPaidGames * Number(pricingInfo.points_earned || 1);
      }
    };

    setEstimatedPoints(calculate());
  }, [selectedSession, gamesInSession, storeSettingsData]);

  const handleMuteSession = (sessionId: string) => {
    // Note: Global muting is handled by DashboardLayout
    toast({ title: "Mute feature moved", description: "Alarms are now global. Check layout for muting." });
  };

  const handleStartSession = async () => {
    if (!selectedConsole || !selectedPricing || !user) return;

    try {
      await startSession.mutateAsync({
        console_id: selectedConsole,
        pricing_id: selectedPricing,
        session_type: pricing?.find((p) => p.id === selectedPricing)?.price_type || "hourly",
        staff_id: user.id,
        client_id: null, // Always walk-in at start
        notes: gameNotes,
      });

      toast({ title: "Session started!" });
      setIsStartDialogOpen(false);
      resetForm();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleExtendSession = async () => {
    if (!selectedSession) return;

    try {
      const pricingInfo = selectedSession.pricing;
      if (selectedSession.session_type === 'per_game') {
        // Add 1 game (default if not specified or specify in pricing)
        // For per_game, extension usually means adding 1 more item.
        await addGameToSession.mutateAsync({
          session_id: selectedSession.id,
          games_played: (selectedSession.games_played || 1) + 1,
          extra_time_minutes: selectedSession.extra_time_minutes || 0
        });
        toast({ title: "Extended", description: "Added 1 game to session." });
      } else {
        // Add configurable minutes from pricing
        const minsToAdd = pricingInfo?.game_duration_minutes || 30;
        await addGameToSession.mutateAsync({
          session_id: selectedSession.id,
          games_played: selectedSession.games_played,
          extra_time_minutes: (selectedSession.extra_time_minutes || 0) + minsToAdd
        });
        toast({ title: "Extended", description: `Added ${minsToAdd} minutes to session.` });
      }
      setIsExtendDialogOpen(false);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  }

  const handleExtendProlongation = async () => {
    if (!selectedSession) return;

    try {
      // Use extra_time_minutes as a counter for prolongations in per_game sessions
      await addGameToSession.mutateAsync({
        session_id: selectedSession.id,
        games_played: selectedSession.games_played,
        extra_time_minutes: (selectedSession.extra_time_minutes || 0) + 1
      });
      toast({ title: "Prolongation Added", description: "Football extra time recorded." });
      setIsExtendDialogOpen(false);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleEndSession = async () => {
    if (!selectedSession) return;

    const session = selectedSession;
    const pricingInfo = session.pricing;
    let totalAmount = 0;
    const extraAmount = 0;
    let calculatedPoints = 0;

    if (session.session_type === "hourly") {
      const startTime = new Date(session.start_time);
      const endTime = new Date();
      // Calculate duration including any extra time added manually? 
      // Usually hourly is just "time played". 
      // If extra_time_minutes is used for "pre-paid" extension, it implies logical duration.
      // But for pay at end, we just use actual duration.
      const diffMs = endTime.getTime() - startTime.getTime();
      const hoursPlayed = diffMs / (1000 * 60 * 60);

      // Basic calculation: ceiling to nearest hour or half-hour? 
      // Let's stick to simple ceiling hour for now or exact logic
      totalAmount = Math.ceil(hoursPlayed) * Number(pricingInfo.price);
      // Standard Store Policy: Clients earn points based on settings
      if (storeSettingsData?.points_system_enabled !== false) {
        // Simple counting: Points per DT (default 1)
        const pointsPerDT = storeSettingsData?.points_config?.points_per_dt || 1;
        calculatedPoints = Math.floor(totalAmount * pointsPerDT);
      }
    } else {
      // Per game
      // Use the actual games count from DB (which includes extensions)
      const totalGames = gamesInSession;
      const prolongationCount = session.extra_time_minutes || 0;
      const prolongationFee = Number(pricingInfo.extra_time_price || 0);

      let freeGames = 0;
      if (storeSettingsData?.free_games_enabled !== false) {
        if (totalGames >= freeGameThreshold + 1) {
          freeGames = Math.floor(totalGames / (freeGameThreshold + 1));
        }
      }

      const actualPaidGames = totalGames - freeGames;
      totalAmount = (actualPaidGames * Number(pricingInfo.price)) + (prolongationCount * prolongationFee);

      if (storeSettingsData?.points_system_enabled !== false) {
        calculatedPoints = actualPaidGames * Number(pricingInfo.points_earned || 1);
      }
    }

    setPointsEarned(calculatedPoints);

    try {
      let clientId = selectedClientForSession?.id;

      // Create client if in creation mode
      if (isCreatingClient && newClientName && newClientPhone) {
        const newClient = await createClient.mutateAsync({
          phone: newClientPhone,
          name: newClientName,
        });
        clientId = newClient.id;
      }

      await endSession.mutateAsync({
        session_id: session.id,
        console_id: session.console_id,
        total_amount: totalAmount,
        games_played: gamesInSession,
        extra_amount: extraAmount,
        points_earned: calculatedPoints,
        client_id: clientId,
      });

      // Award points if system is enabled and client selected
      if (storeSettingsData?.points_system_enabled !== false && clientId && calculatedPoints > 0) {
        await createPointsTransaction.mutateAsync({
          client_id: clientId,
          amount: calculatedPoints,
          transaction_type: "earned",
          description: `Gaming Session on ${session.console?.station_number ? 'Console #' + session.console.station_number : 'Console'}`,
          reference_type: "session",
          reference_id: session.id,
          staff_id: user.id
        });
      }

      setPointsEarned(0); // Reset after use
      toast({
        title: "Session ended!",
        description: `Total: ${totalAmount.toFixed(3)} DT`
      });
      setIsEndDialogOpen(false);
      setSelectedSession(null);
      resetForm(); // Important: reset client states after ending
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const resetForm = () => {
    setSelectedConsole(null);
    setSelectedPricing("");
    setSelectedClientForSession(null);
    setIsCreatingClient(false);
    setNewClientPhone("");
    setNewClientName("");
    setGameNotes("");
  }

  const getSessionDuration = (startTime: string) => {
    const start = new Date(startTime);
    const now = new Date();
    const diff = now.getTime() - start.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const openStartDialog = (consoleId: string) => {
    setSelectedConsole(consoleId);

    // Auto-select Pricing according to the hierarchy:
    // 1. Console-specific default
    // 2. Global default for console type
    // 3. First hourly rate for type
    const targetConsoleObj = consoles?.find(c => c.id === consoleId);
    let pricingToSelect = "";

    if (targetConsoleObj?.default_pricing_id) {
      pricingToSelect = targetConsoleObj.default_pricing_id;
    } else if (storeSettingsData && targetConsoleObj) {
      const type = targetConsoleObj.console_type.toUpperCase();
      const key = type === 'PS5' ? 'default_pricing_ps5' : 'default_pricing_ps4';
      const globalId = (storeSettingsData as any)[key];

      if (globalId && globalId !== 'none') {
        pricingToSelect = globalId;
      }
    }

    // Still empty? Last fallback
    if (!pricingToSelect && targetConsoleObj && pricing) {
      const type = targetConsoleObj.console_type.toUpperCase();
      const fallback = pricing.find(p => p.console_type.toUpperCase() === type && p.price_type === 'hourly')
        || pricing.find(p => p.console_type.toUpperCase() === type);
      if (fallback) pricingToSelect = fallback.id;
    }

    // console.log("🎯 Auto-selecting pricing:", pricingToSelect);
    setSelectedPricing(pricingToSelect);
    setIsStartDialogOpen(true);
  };

  const openEndDialog = (session: any) => {
    setSelectedSession(session);

    let initialGames = session.games_played || 1;

    // 🧮 Pre-count logic with average time
    if (session.session_type === 'per_game') {
      const startTime = new Date(session.start_time).getTime();
      const now = new Date().getTime();
      const elapsedMinutes = (now - startTime) / 60000;
      const tarifDuration = session.pricing?.game_duration_minutes || 0;

      if (tarifDuration > 0) {
        // Use Math.ceil to count "started" games (e.g. 35 mins / 30 mins = 2 games)
        const estimatedByTime = Math.ceil(elapsedMinutes / tarifDuration);
        const currentDbValue = session.games_played || 1;
        initialGames = Math.max(currentDbValue, estimatedByTime);
      }
    }

    setGamesInSession(initialGames);
    setIsEndDialogOpen(true);
  };


  const openExtendDialog = (session: any) => {
    setSelectedSession(session);
    setIsExtendDialogOpen(true);
  }

  const handleSetShortcutDefault = async (pricingId: string, consoleType: string) => {
    const key = consoleType === 'PS5' ? 'default_pricing_ps5' : 'default_pricing_ps4';
    try {
      await updateSetting.mutateAsync({ key, value: pricingId });
      toast({
        title: "Tarif par défaut mis à jour",
        description: `Nouveau raccourci configuré pour ${consoleType}.`,
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  // Sound Toggle State
  const [isSoundMuted, setIsSoundMuted] = useState(() => {
    const stored = localStorage.getItem('sound_muted');
    return stored === 'true';
  });
  const [isCafeMenuOpen, setIsCafeMenuOpen] = useState(false);
  const [isQuickRefOpen, setIsQuickRefOpen] = useState(false);

  const toggleSound = () => {
    const newState = !isSoundMuted;
    setIsSoundMuted(newState);
    localStorage.setItem('sound_muted', String(newState));
    toast({
      title: newState ? "Sound Muted" : "Sound Enabled",
      description: newState ? "Alarms will be silent." : "You will hear alarms for overdue sessions."
    });
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <SchemaStatus />

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-2xl sm:text-3xl font-bold mb-1">Gaming Sessions</h1>
                <HelpTooltip content={t('help.sessions')} />
              </div>
              <p className="text-muted-foreground text-sm">
                Manage PS4/PS5 sessions.
              </p>
            </div>

            {/* Global Actions */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={toggleSound}
                className={isSoundMuted ? "text-muted-foreground" : "text-primary border-primary/20 bg-primary/10"}
                title={isSoundMuted ? "Unmute Alarms" : "Mute Alarms"}
              >
                {isSoundMuted ? <BellOff className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
              </Button>

              <Sheet open={isCafeMenuOpen} onOpenChange={setIsCafeMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="border-primary/30 text-primary hover:bg-primary/10">
                    <Coffee className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Café Menu</span>
                  </Button>
                </SheetTrigger>
              </Sheet>

              <Sheet open={isQuickRefOpen} onOpenChange={setIsQuickRefOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="border-secondary/30 text-secondary hover:bg-secondary/10">
                    <Zap className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Tarifs & Raccourcis</span>
                  </Button>
                </SheetTrigger>
                <SheetContent className="glass-modal border-white/10 w-full sm:max-w-[540px] overflow-y-auto">
                  <SheetHeader className="mb-6">
                    <SheetTitle className="flex items-center gap-2 text-2xl">
                      <Zap className="w-6 h-6 text-secondary fill-secondary" />
                      Référence Rapide Tarifs
                    </SheetTitle>
                    <SheetDescription>
                      Consultez vos tarifs et configurez les raccourcis par défaut (Auto-Start).
                      <br />
                      <span className="text-xs text-muted-foreground mt-2 block">
                        Cliquez sur <Zap className="w-3 h-3 inline text-secondary" /> pour définir le tarif par défaut.
                      </span>
                    </SheetDescription>
                  </SheetHeader>

                  <div className="space-y-8">
                    {/* Visual List Only (No Redundant Dropdowns) */}
                    {['PS4', 'PS5'].map(type => (
                      <div key={type} className="space-y-4">
                        <div className="flex items-center justify-between border-b border-white/10 pb-2">
                          <h3 className="font-bold text-lg flex items-center gap-2">
                            <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/20">{type}</Badge>
                            Tarifs disponibles
                          </h3>
                        </div>

                        <div className="grid gap-3">
                          {pricing?.filter(p => {
                            const pType = p.console_type.toUpperCase();
                            return type === 'PS4' ? (pType === 'PS4' || pType === 'PS4_PRO') : pType === 'PS5';
                          }).map(p => {
                            const isDefault = storeSettingsData?.[type === 'PS5' ? 'default_pricing_ps5' : 'default_pricing_ps4'] === p.id;

                            return (
                              <div key={p.id} className={`p-4 rounded-xl border transition-all flex items-center justify-between group ${isDefault ? 'bg-secondary/20 border-secondary/50 shadow-[0_0_15px_rgba(234,179,8,0.1)]' : 'bg-black/20 border-white/5'
                                }`}>
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-white">{p.name}</span>
                                    {isDefault && <Badge className="bg-secondary text-black text-[10px] h-4">DÉFAUT</Badge>}
                                  </div>
                                  <div className="flex items-center gap-3 text-xs text-muted-foreground uppercase tracking-wider">
                                    <span>{p.price_type === 'hourly' ? '⏱️ Temps' : '🎮 Par Jeu'}</span>
                                    <span>•</span>
                                    <span className="font-bold text-primary">{p.price.toFixed(3)} DT</span>
                                  </div>
                                </div>

                                <Button
                                  size="sm"
                                  variant={isDefault ? "hero" : "ghost"}
                                  disabled={isDefault}
                                  className={isDefault ? "h-9 w-9 p-0" : "opacity-0 group-hover:opacity-100 h-9 px-3"}
                                  onClick={() => handleSetShortcutDefault(p.id, type)}
                                >
                                  {isDefault ? <Star className="w-4 h-4 fill-current" /> : (
                                    <>
                                      <Zap className="w-4 h-4 mr-2" />
                                      <span className="text-xs">Définir défaut</span>
                                    </>
                                  )}
                                </Button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </SheetContent>
              </Sheet>

              {user?.role === 'owner' && (
                <Button variant="outline" size="sm" onClick={() => setIsManagerOpen(true)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Gérer Raccourcis
                </Button>
              )}
            </div>
          </div>

          <ShortcutManagerDialog isOpen={isManagerOpen} onOpenChange={setIsManagerOpen} />

          {/* Active Shortcuts (Flash/Fast Tarifs) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {['PS4', 'PS5'].map(type => {
              const defaultId = storeSettingsData?.[type === 'PS5' ? 'default_pricing_ps5' : 'default_pricing_ps4'];
              const defaultPricing = pricing?.find(p => p.id === defaultId);

              return (
                <Card key={type} className="glass-card border-none bg-gradient-to-br from-primary/5 to-secondary/5">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                        <Zap className="w-6 h-6 text-primary fill-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-muted-foreground">Raccourci {type} (1-9)</h3>
                        {defaultPricing ? (
                          <p className="font-bold text-lg">{defaultPricing.name}</p>
                        ) : (
                          <p className="text-sm italic text-muted-foreground">Non configuré</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      {defaultPricing && (
                        <>
                          <p className="font-bold text-xl text-primary">{defaultPricing.price.toFixed(3)} <span className="text-sm">DT</span></p>
                          <p className="text-[10px] uppercase text-muted-foreground">{defaultPricing.price_type === 'hourly' ? '/ Heure' : '/ Partie'}</p>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Console Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
            {consoles?.map((console) => {
              const session = getConsoleSession(console.id);
              const isMaintenance = console.status === "maintenance";
              // A console is active if it has a session OR its status is set to in_use
              const isActive = !!session || console.status === "in_use";
              const isOverdue = session && overdueSessions.includes(session.id);

              return (
                <div key={console.id} className="relative group">
                  <div
                    className={`glass-card rounded-xl p-2 sm:p-3 md:p-4 transition-all h-full flex flex-col items-center justify-center relative ${isOverdue
                      ? "border-red-600 bg-red-600/20 animate-pulse shadow-[0_0_15px_rgba(220,38,38,0.5)]"
                      : isMaintenance
                        ? "border-muted bg-muted/10 opacity-60 grayscale cursor-not-allowed"
                        : isActive
                          ? "border-red-500/50 bg-red-500/10 cursor-pointer hover:scale-105"
                          : "border-green-500/50 bg-green-500/10 hover:border-green-500 cursor-pointer hover:scale-105"
                      }`}
                    onClick={() => !isActive && !isMaintenance && openStartDialog(console.id)}
                  >
                    {/* Status Icon */}
                    <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center mb-2 sm:mb-3 ${isOverdue ? "bg-red-600 animate-bounce" : isMaintenance ? "bg-muted/20" : isActive ? "bg-red-500/20" : "bg-green-500/20"
                      }`}>
                      {isOverdue ? (
                        <AlertTriangle className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                      ) : isMaintenance ? (
                        <Wrench className="w-6 h-6 sm:w-7 sm:h-7 text-muted-foreground" />
                      ) : (
                        <Gamepad2 className={`w-6 h-6 sm:w-7 sm:h-7 ${isActive ? "text-red-500" : "text-green-500"}`} />
                      )}
                    </div>

                    <h3 className="font-display font-bold text-base sm:text-lg mb-1">#{console.station_number}</h3>
                    <Badge variant="outline" className="mb-1 sm:mb-2 text-[10px] uppercase">{console.console_type}</Badge>

                    {isActive && session ? (
                      <div className="text-center space-y-1 w-full">
                        <div className={`flex items-center justify-center gap-1 text-xs font-mono py-1 rounded ${isOverdue ? "bg-red-600 text-white font-bold" : "text-red-400 bg-black/20"
                          }`}>
                          <Clock className="w-3 h-3" />
                          {getSessionDuration(session.start_time)}
                        </div>

                        {session.session_type === 'per_game' && (
                          <div className="text-xs font-bold text-primary">
                            {session.games_played} Game{session.games_played > 1 ? 's' : ''}
                          </div>
                        )}

                        <p className="text-[10px] text-muted-foreground truncate w-full px-2">
                          {session.pricing?.name || "Session"}
                          {session.extra_time_minutes > 0 && session.session_type === 'per_game' && (
                            <span className="ml-1 text-primary font-bold">
                              (Ex +{session.extra_time_minutes})
                            </span>
                          )}
                        </p>

                        {isOverdue && (
                          <p className="text-[10px] text-red-500 font-bold uppercase animate-pulse">TIME UP!</p>
                        )}
                      </div>
                    ) : isMaintenance ? (
                      <span className="text-xs text-muted-foreground font-bold italic uppercase">Maintenance</span>
                    ) : (
                      <span className="text-xs text-green-500 font-bold">AVAILABLE</span>
                    )}
                  </div>

                  {/* Session Actions - Always Visible on Mobile, Hover on Desktop */}
                  {isActive && session && (
                    <div className="absolute -bottom-2 sm:-bottom-3 left-0 right-0 flex justify-center gap-2 sm:gap-3 pb-2 z-20">
                      <Button
                        size="sm"
                        variant="hero"
                        className="h-10 w-10 sm:h-11 sm:w-11 rounded-full shadow-lg border-primary/50 bg-background/90 backdrop-blur-sm hover:scale-110 transition-transform touch-manipulation"
                        onClick={(e) => { e.stopPropagation(); openExtendDialog(session); }}
                        aria-label="Extend session"
                      >
                        <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="h-10 w-10 sm:h-11 sm:w-11 rounded-full shadow-lg border-red-500/50 bg-background/90 backdrop-blur-sm hover:scale-110 transition-transform touch-manipulation"
                        onClick={(e) => { e.stopPropagation(); openEndDialog(session); }}
                        aria-label="End session"
                      >
                        <Square className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Start Session Dialog */}
        <Dialog open={isStartDialogOpen} onOpenChange={setIsStartDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Start New Session</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* Game Shortcuts - Desktop Only per request */}
              {gameShortcuts && gameShortcuts.length > 0 && (
                <div className="hidden md:block">
                  <Label className="mb-2 block">Quick Start (Keys 1-9)</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {gameShortcuts.filter(s => s.is_active).map(shortcut => (
                      <div
                        key={shortcut.id}
                        className={`p-2 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors flex flex-col items-center gap-1 relative ${gameNotes === shortcut.name ? 'ring-2 ring-primary bg-primary/10' : ''}`}
                        onClick={() => setGameNotes(shortcut.name)}
                      >
                        {shortcut.shortcut_key && (
                          <span className="absolute top-1 right-1 text-[10px] font-mono bg-background border px-1 rounded opacity-70">
                            {shortcut.shortcut_key}
                          </span>
                        )}
                        <span className="text-xl">{shortcut.icon || '🎮'}</span>
                        <span className="text-xs font-medium text-center truncate w-full">{shortcut.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <Label>Game Title / Notes</Label>
                <Input
                  placeholder="e.g. FIFA 24, Maintenance check..."
                  value={gameNotes}
                  onChange={(e) => setGameNotes(e.target.value)}
                />
              </div>

              <div>
                <Label className="mb-2 block">Pricing Configuration</Label>

                {/* 🚀 Quick Pricing Reference Grid */}
                {selectedConsole && (
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {pricing?.filter(p => {
                      const c = consoles?.find(con => con.id === selectedConsole);
                      return c && p.console_type.toLowerCase() === c.console_type.toLowerCase();
                    }).map(p => (
                      <button
                        key={p.id}
                        type="button"
                        disabled={startSession.isPending}
                        className={`p-3 border rounded-xl transition-all flex flex-col items-center justify-center gap-1 group relative overflow-hidden ${selectedPricing === p.id
                          ? 'border-primary bg-primary/20 ring-2 ring-primary/50 shadow-[0_0_15px_rgba(234,179,8,0.2)]'
                          : 'bg-black/20 border-white/5 hover:border-primary/50 hover:bg-black/40'
                          } ${startSession.isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={() => setSelectedPricing(p.id)}
                      >
                        {selectedPricing === p.id && (
                          <div className="absolute top-1 right-1">
                            <Star className="w-3 h-3 text-primary fill-primary" />
                          </div>
                        )}
                        <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded ${p.price_type === 'hourly' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'
                          }`}>
                          {p.price_type === 'hourly' ? '⏱️ TEMPS' : '🎮 PAR JEU'}
                        </span>
                        <span className="text-lg font-bold text-white leading-tight">{p.price.toFixed(3)} <span className="text-xs">DT</span></span>
                        <span className="text-[10px] text-muted-foreground truncate w-full px-1">{p.name}</span>
                      </button>
                    ))}
                  </div>
                )}

                <Select value={selectedPricing} onValueChange={setSelectedPricing}>
                  <SelectTrigger className="bg-black/40 border-white/10 h-11">
                    <SelectValue placeholder="Choisir un tarif..." />
                  </SelectTrigger>
                  <SelectContent className="glass-modal border-white/10">
                    {pricing?.filter(p => !selectedConsole || (consoles?.find(c => c.id === selectedConsole)?.console_type && p.console_type === consoles?.find(c => c.id === selectedConsole)?.console_type))
                      .map((p) => (
                        <SelectItem key={p.id} value={p.id} className="focus:bg-primary/20 cursor-pointer">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[9px] h-4 uppercase">{p.price_type === 'per_game' ? 'Jeu' : 'H'}</Badge>
                            <span>{p.name} - <span className="font-bold text-primary">{p.price.toFixed(3)} DT</span></span>
                          </div>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant="hero"
                className="w-full"
                onClick={handleStartSession}
                disabled={!selectedPricing || startSession.isPending}
              >
                <Play className="w-4 h-4" />
                Start Session
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Extend Session Dialog */}
        <Dialog open={isExtendDialogOpen} onOpenChange={setIsExtendDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Extend Session</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-center p-6 bg-secondary/10 rounded-xl mb-4">
                {selectedSession?.session_type === 'per_game' ? (
                  <div className="text-center">
                    <Gamepad2 className="w-10 h-10 text-secondary mx-auto mb-2" />
                    <p className="text-lg font-bold">Add Another Game</p>
                    <p className="text-sm text-muted-foreground">Rate: +{selectedSession.pricing?.price?.toFixed(3)} DT</p>
                    <p className="text-sm text-muted-foreground mt-1">Current: {selectedSession.games_played} Games</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <Timer className="w-10 h-10 text-secondary mx-auto mb-2" />
                    <p className="text-lg font-bold">Add {selectedSession?.pricing?.game_duration_minutes || 30} Minutes</p>
                    <p className="text-sm text-muted-foreground">Rate: +{selectedSession?.pricing?.extra_time_price?.toFixed(3) || '0.000'} DT</p>
                    <p className="text-sm text-muted-foreground mt-1">Current Duration: {getSessionDuration(selectedSession?.start_time || new Date().toISOString())}</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-3">
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleExtendSession}
                  disabled={addGameToSession.isPending}
                >
                  <Plus className="w-5 h-5 mr-2" />
                  {selectedSession?.session_type === 'per_game' ? "Add Another Match" : "Confirm Extension"}
                </Button>

                {selectedSession?.session_type === 'per_game' && (
                  <Button
                    className="w-full bg-primary/20 text-primary border-primary/30 hover:bg-primary/30"
                    variant="outline"
                    size="lg"
                    onClick={handleExtendProlongation}
                    disabled={addGameToSession.isPending}
                  >
                    <Timer className="w-5 h-5 mr-2" />
                    Add Prolongation (+{selectedSession.pricing?.extra_time_price?.toFixed(3) || '0.000'} DT)
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* End Session Dialog */}
        <Dialog open={isEndDialogOpen} onOpenChange={setIsEndDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>End Session</DialogTitle>
            </DialogHeader>
            {selectedSession && (
              <div className="space-y-4">
                <div className="glass-card rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="font-display text-xl font-bold">
                    {getSessionDuration(selectedSession.start_time)}
                  </p>
                </div>

                {selectedSession.session_type === 'per_game' && (
                  <div className="space-y-4">
                    <div>
                      <Label>Total Games Played</Label>
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            // Calculate elapsed time in minutes
                            const startTime = new Date(selectedSession.start_time).getTime();
                            const now = new Date().getTime();
                            const elapsedMinutes = (now - startTime) / 60000;

                            // Check "avg tarif time" (game duration from pricing)
                            // Default to 0 if not set (which means no threshold, so maybe strict? or loose? 
                            // User said: "put 0 only if the avg tarif time isn't passed". 
                            // If duration is missing, we assume we can't verify, so enforce 1 to be safe? 
                            // Or maybe pricing.game_duration_minutes is standard 30?
                            const tarifDuration = selectedSession.pricing?.game_duration_minutes || 0;

                            // Allow 0 only if elapsed time is LESS than the tariff duration
                            const minGames = (tarifDuration > 0 && elapsedMinutes < tarifDuration) ? 0 : 1;

                            setGamesInSession(Math.max(minGames, gamesInSession - 1));
                          }}
                          aria-label="Decrease games"
                        >
                          -
                        </Button>
                        <span className={`font-display text-2xl font-bold w-12 text-center ${gamesInSession === 0 ? 'text-muted-foreground' : ''}`}>
                          {gamesInSession}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setGamesInSession(gamesInSession + 1)}
                          aria-label="Increase games"
                        >
                          +
                        </Button>
                      </div>
                    </div>

                    {/* Free Game Calculation */}
                    {storeSettingsData?.free_games_enabled !== false && gamesInSession >= freeGameThreshold + 1 && (
                      <div className="glass-card rounded-lg p-3 border-secondary/30">
                        <div className="flex items-center gap-2 text-secondary">
                          <Gift className="w-5 h-5" />
                          <span className="font-medium">Free Game Linked!</span>
                        </div>
                        <p className="text-sm text-secondary mt-1">
                          {Math.floor(gamesInSession / (freeGameThreshold + 1))} free game(s) available.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-3 pt-2 border-t">
                  <Label>Client (Mandatory for Points)</Label>

                  {!isCreatingClient ? (
                    <ClientSearch
                      onSelect={setSelectedClientForSession}
                      selectedClient={selectedClientForSession}
                      onCreateNew={() => setIsCreatingClient(true)}
                    />
                  ) : (
                    <div className="space-y-3 bg-muted/30 p-3 rounded-lg border animate-in fade-in slide-in-from-top-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-semibold uppercase text-primary">New Client</Label>
                        <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => setIsCreatingClient(false)}>Cancel</Button>
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        <Input
                          placeholder="Client Name"
                          value={newClientName}
                          onChange={(e) => setNewClientName(e.target.value)}
                        />
                        <Input
                          placeholder="Phone Number"
                          value={newClientPhone}
                          onChange={(e) => setNewClientPhone(e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                  {selectedClientForSession && storeSettingsData?.points_system_enabled !== false && (
                    <div className="bg-green-500/10 p-3 rounded-lg border border-green-500/20 text-xs space-y-1">
                      <div className="flex justify-between items-center text-green-700 dark:text-green-400">
                        <span>Current Balance:</span>
                        <span className="font-bold">
                          {(Array.isArray(clients) ? clients.find(c => c.id === selectedClientForSession.id)?.points : selectedClientForSession.points) ?? 0} pts
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-green-600 dark:text-green-500 font-medium border-t border-green-500/20 pt-1 mt-1">
                        <span>Points to be earned:</span>
                        <span>+{estimatedPoints} pts</span>
                      </div>
                    </div>
                  )}
                </div>

                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={handleEndSession}
                  disabled={endSession.isPending || (isCreatingClient && (!newClientName || !newClientPhone))}
                >
                  <Square className="w-4 h-4 mr-2" />
                  {endSession.isPending ? "Ending..." : "Stop & Calculate Payment"}
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Quick Sale Café Menu */}
        <QuickSaleMenu
          isOpen={isCafeMenuOpen}
          onOpenChange={setIsCafeMenuOpen}
          clientId={null} // Can be linked to active session client if needed
        />
      </DashboardLayout>
    </ProtectedRoute >
  );
};

export default SessionsManagement;