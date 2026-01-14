import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { useClients, useCreateClient, useClientByPhone } from "@/hooks/useClients";
import { usePointsTransactions, useCreatePointsTransaction, useRedeemPoints } from "@/hooks/usePointsTransactions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { HelpTooltip } from "@/components/ui/help-tooltip";
import { Users, Plus, Search, Star, Gamepad2, DollarSign, History, Gift, TrendingUp, TrendingDown } from "lucide-react";

const ClientsManagement = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { data: clients, isLoading } = useClients();
  const createClient = useCreateClient();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isRedeemDialogOpen, setIsRedeemDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [pointsToRedeem, setPointsToRedeem] = useState("");
  const [redeemDescription, setRedeemDescription] = useState("");

  // Points transactions for selected client
  const { data: transactions } = usePointsTransactions(selectedClient?.id);
  const createPointsTransaction = useCreatePointsTransaction();
  const redeemPoints = useRedeemPoints();

  const handleCreateClient = async () => {
    if (!name || !phone) {
      toast({ title: "Please fill all fields", variant: "destructive" });
      return;
    }

    try {
      await createClient.mutateAsync({ name, phone, email, notes });
      toast({ title: "Client created!" });
      setIsCreateDialogOpen(false);
      setName("");
      setPhone("");
      setEmail("");
      setNotes("");
    } catch (err: any) {
      if (err.message?.includes("duplicate")) {
        toast({ title: "Phone number already exists", variant: "destructive" });
      } else {
        toast({ title: "Error", description: err.message, variant: "destructive" });
      }
    }
  };

  const handleRedeemPoints = async () => {
    if (!selectedClient || !pointsToRedeem || !user) return;

    const points = parseInt(pointsToRedeem);
    if (points <= 0 || points > selectedClient.points) {
      toast({ title: "Invalid points amount", variant: "destructive" });
      return;
    }

    try {
      await redeemPoints.mutateAsync({
        client_id: selectedClient.id,
        points_to_redeem: points,
        description: redeemDescription || "Points redemption",
        staff_id: user.id,
      });

      toast({ title: "Points redeemed successfully!" });
      setIsRedeemDialogOpen(false);
      setSelectedClient(null);
      setPointsToRedeem("");
      setRedeemDescription("");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const openHistoryDialog = (client: any) => {
    setSelectedClient(client);
    setIsHistoryDialogOpen(true);
  };

  const openRedeemDialog = (client: any) => {
    setSelectedClient(client);
    setIsRedeemDialogOpen(true);
  };

  const filteredClients = clients?.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm)
  );

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-3xl font-bold mb-2">Clients</h1>
                <HelpTooltip content={t('help.clients')} />
              </div>
              <p className="text-muted-foreground">
                Manage customer accounts and loyalty points
              </p>
            </div>
            <Button variant="hero" onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4" />
              Add Client
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="glass-card rounded-xl p-4 text-center">
              <p className="text-3xl font-display font-bold text-primary">
                {clients?.length || 0}
              </p>
              <p className="text-sm text-muted-foreground">Total Clients</p>
            </div>
            <div className="glass-card rounded-xl p-4 text-center">
              <p className="text-3xl font-display font-bold text-secondary">
                {clients?.reduce((sum, c) => sum + c.points, 0) || 0}
              </p>
              <p className="text-sm text-muted-foreground">Total Points</p>
            </div>
            <div className="glass-card rounded-xl p-4 text-center">
              <p className="text-3xl font-display font-bold text-accent">
                {clients?.reduce((sum, c) => sum + c.total_games_played, 0) || 0}
              </p>
              <p className="text-sm text-muted-foreground">Total Games</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search by name or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Clients List */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredClients?.map((client) => (
              <Card key={client.id} className="glass-card">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold">{client.name}</h3>
                      <p className="text-sm text-muted-foreground">{client.phone}</p>
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-500/20">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="font-display font-bold text-yellow-600">{client.points || 0}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Gamepad2 className="w-4 h-4" />
                      <span>{client.total_games_played || 0} games</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <DollarSign className="w-4 h-4" />
                      <span>{Number(client.total_spent || 0).toFixed(3)} DT</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => openHistoryDialog(client)}
                    >
                      <History className="w-4 h-4 mr-1" />
                      History
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => openRedeemDialog(client)}
                      disabled={(client.points || 0) <= 0}
                    >
                      <Gift className="w-4 h-4 mr-1" />
                      Redeem
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Member since {new Date(client.created_at).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {(!filteredClients || filteredClients.length === 0) && (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No clients found</p>
            </div>
          )}
        </div>

        {/* Create Client Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Client</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Client name"
                />
              </div>
              <div>
                <Label>Phone *</Label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone number"
                />
              </div>
              <div>
                <Label>Email (Optional)</Label>
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  type="email"
                />
              </div>
              <div>
                <Label>Notes (Optional)</Label>
                <Input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. VIP, prefers PS5..."
                />
              </div>
              <Button
                variant="hero"
                className="w-full"
                onClick={handleCreateClient}
                disabled={createClient.isPending}
              >
                Create Client
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Redeem Points Dialog */}
        <Dialog open={isRedeemDialogOpen} onOpenChange={setIsRedeemDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Redeem Points</DialogTitle>
            </DialogHeader>
            {selectedClient && (
              <div className="space-y-4">
                <div className="glass-card rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">Client</p>
                  <p className="font-semibold">{selectedClient.name}</p>
                  <p className="text-sm text-muted-foreground">Current Balance: {selectedClient.points || 0} points</p>
                </div>

                <div>
                  <Label>Points to Redeem</Label>
                  <Input
                    type="number"
                    value={pointsToRedeem}
                    onChange={(e) => setPointsToRedeem(e.target.value)}
                    placeholder="Enter points amount"
                    max={selectedClient.points || 0}
                  />
                </div>

                <div>
                  <Label>Description (optional)</Label>
                  <Input
                    value={redeemDescription}
                    onChange={(e) => setRedeemDescription(e.target.value)}
                    placeholder="e.g., Free game redemption"
                  />
                </div>

                <Button
                  variant="hero"
                  className="w-full"
                  onClick={handleRedeemPoints}
                  disabled={redeemPoints.isPending || !pointsToRedeem}
                >
                  <Gift className="w-4 h-4 mr-2" />
                  Redeem Points
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Transaction History Dialog */}
        <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Points Transaction History</DialogTitle>
            </DialogHeader>
            {selectedClient && (
              <div className="space-y-4">
                <div className="glass-card rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">Client</p>
                  <p className="font-semibold">{selectedClient.name}</p>
                  <p className="text-sm text-muted-foreground">Current Balance: {selectedClient.points || 0} points</p>
                </div>

                <div className="space-y-2">
                  {transactions?.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {transaction.transaction_type === 'earned' ? (
                          <TrendingUp className="w-5 h-5 text-green-500" />
                        ) : transaction.transaction_type === 'spent' ? (
                          <TrendingDown className="w-5 h-5 text-red-500" />
                        ) : (
                          <Star className="w-5 h-5 text-blue-500" />
                        )}
                        <div>
                          <p className="font-medium capitalize">{transaction.transaction_type}</p>
                          <p className="text-sm text-muted-foreground">{transaction.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(transaction.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${transaction.amount > 0 ? 'text-green-500' : 'text-red-500'
                          }`}>
                          {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Balance: {transaction.balance_after}
                        </p>
                      </div>
                    </div>
                  ))}

                  {(!transactions || transactions.length === 0) && (
                    <div className="text-center py-8 text-muted-foreground">
                      <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No transactions found</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default ClientsManagement;