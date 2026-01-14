import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { usePricing, useUpdatePricing, useCreatePricing, useDeletePricing } from "@/hooks/usePricing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, Clock, Gamepad2, Edit, Save, X, Plus, Trash2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const PricingManagement = () => {
  const { isOwner } = useAuth();
  const { t } = useLanguage();
  const { data: pricing, isLoading } = usePricing();
  const updatePricing = useUpdatePricing();
  const createPricing = useCreatePricing();
  const deletePricing = useDeletePricing();

  const [editingPricing, setEditingPricing] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // New Pricing State
  const [isCallbacksOpen, setIsCallbacksOpen] = useState(false);
  const [newPricing, setNewPricing] = useState({
    name: "",
    name_fr: "",
    name_ar: "",
    console_type: "ps5",
    price_type: "hourly",
    price: 0,
    game_duration_minutes: 15,
    extra_time_price: 0,
    points_earned: 10,
    is_active: true,
    sort_order: 0
  });

  // Only owners can access this page
  if (!isOwner) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
              <p className="text-muted-foreground">Only owners can manage pricing.</p>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  const handleEditPrice = (price: any) => {
    setEditingPricing({ ...price });
    setIsEditDialogOpen(true);
  };

  const handleUpdatePricing = async () => {
    if (!editingPricing) return;
    try {
      if (!editingPricing.name) {
        toast({ title: "Validation Error", description: "Name is required", variant: "destructive" });
        return;
      }

      await updatePricing.mutateAsync({
        ...editingPricing
      });

      toast({ title: "✅ Success", description: "Pricing configuration updated." });
      setIsEditDialogOpen(false);
      setEditingPricing(null);
    } catch (error) {
      console.error("Error updating pricing:", error);
      toast({ title: "❌ Error", description: "Failed to update pricing", variant: "destructive" });
    }
  };

  const handleCreatePricing = async () => {
    try {
      if (!newPricing.name) {
        toast({ title: "Validation Error", description: "Name is required", variant: "destructive" });
        return;
      }

      await createPricing.mutateAsync({
        ...newPricing,
        name_fr: newPricing.name_fr || newPricing.name,
        name_ar: newPricing.name_ar || newPricing.name,
      });

      toast({ title: "Active", description: "New pricing added successfully." });
      setIsCallbacksOpen(false);
      setNewPricing({
        name: "",
        name_fr: "",
        name_ar: "",
        console_type: "ps5",
        price_type: "hourly",
        price: 0,
        game_duration_minutes: 15,
        extra_time_price: 0,
        points_earned: 10,
        is_active: true,
        sort_order: 0
      });

    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  }

  const handleDeletePricing = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;

    try {
      await deletePricing.mutateAsync(id);
      toast({ title: "Deleted", description: "Pricing removed." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  }

  const ps4Pricing = pricing?.filter(p => p.console_type === 'ps4') || [];
  const ps5Pricing = pricing?.filter(p => p.console_type === 'ps5') || [];
  const otherPricing = pricing?.filter(p => !['ps4', 'ps5'].includes(p.console_type)) || [];

  const PricingCard = ({ price }: { price: any }) => (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">{price.name}</CardTitle>
            {price.price_type === 'per_game' && <Badge variant="outline" className="text-xs">Game</Badge>}
          </div>
          <div className="flex gap-2">
            <Badge variant={price.console_type === 'ps5' ? 'default' : 'secondary'}>
              {price.console_type?.toUpperCase()}
            </Badge>
            <Button size="sm" variant="destructive" className="h-6 w-6 p-0" onClick={() => handleDeletePricing(price.id, price.name)}>
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="font-medium">{price.price.toFixed(3)} DT</span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleEditPrice(price)}
            >
              <Edit className="w-3 h-3" />
            </Button>
          </div>

          {price.game_duration_minutes && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {price.price_type === 'hourly' ? 'Extension' : 'Avg Match'}: {price.game_duration_minutes} mins
              </span>
            </div>
          )}

          {price.extra_time_price && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground font-bold text-primary">
                {price.price_type === 'hourly' ? t('pricing.extra') : "Prolongation"}: +{price.extra_time_price.toFixed(3)} DT
              </span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {t('pricing.points')}: {price.points_earned || 0}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <h1 className="font-display text-3xl font-bold mb-2">{t('pricing.title')}</h1>
              <p className="text-muted-foreground">
                {t('pricing.subtitle')}
              </p>
            </div>

            <Dialog open={isCallbacksOpen} onOpenChange={setIsCallbacksOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Pricing
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Pricing Configuration</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Name (Internal/Display)</Label>
                      <Input value={newPricing.name} onChange={e => setNewPricing({ ...newPricing, name: e.target.value })} placeholder="e.g., FIFA 25 Match" />
                    </div>
                    <div className="space-y-2">
                      <Label>Console Type</Label>
                      <Select value={newPricing.console_type} onValueChange={v => setNewPricing({ ...newPricing, console_type: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ps4">PS4</SelectItem>
                          <SelectItem value="ps5">PS5</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Pricing Type</Label>
                      <Select value={newPricing.price_type} onValueChange={v => setNewPricing({ ...newPricing, price_type: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hourly">Hourly Rate</SelectItem>
                          <SelectItem value="per_game">Per Game Match</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Price (DT)</Label>
                      <Input type="number" step="0.5" value={newPricing.price} onChange={e => setNewPricing({ ...newPricing, price: parseFloat(e.target.value) })} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>
                        {newPricing.price_type === 'hourly' ? "Extension Unit (Mins)" : "Avg Match Duration (Mins)"}
                      </Label>
                      <Input
                        type="number"
                        value={newPricing.game_duration_minutes}
                        onChange={e => setNewPricing({ ...newPricing, game_duration_minutes: parseInt(e.target.value) })}
                      />
                      <p className="text-xs text-muted-foreground">
                        {newPricing.price_type === 'hourly' ? "Time added per extension click" : "Standard time for one match"}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label>
                        {newPricing.price_type === 'hourly' ? "Extension Price (DT)" : "Prolongation Fee (DT)"}
                      </Label>
                      <Input
                        type="number"
                        step="0.5"
                        value={newPricing.extra_time_price}
                        onChange={e => setNewPricing({ ...newPricing, extra_time_price: parseFloat(e.target.value) })}
                      />
                      <p className="text-xs text-muted-foreground">
                        {newPricing.price_type === 'hourly' ? "Price per extension unit" : "Fee for Extra Time/Penalties"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Points Earned</Label>
                    <Input type="number" value={newPricing.points_earned} onChange={e => setNewPricing({ ...newPricing, points_earned: parseInt(e.target.value) })} />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCallbacksOpen(false)}>Cancel</Button>
                  <Button onClick={handleCreatePricing} disabled={!newPricing.name || newPricing.price <= 0}>Create Pricing</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Edit Pricing Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Pricing Configuration</DialogTitle>
                </DialogHeader>
                {editingPricing && (
                  <div className="space-y-4 py-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Name (Display)</Label>
                        <Input value={editingPricing.name} onChange={e => setEditingPricing({ ...editingPricing, name: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Console Type</Label>
                        <Select value={editingPricing.console_type} onValueChange={v => setEditingPricing({ ...editingPricing, console_type: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ps4">PS4</SelectItem>
                            <SelectItem value="ps5">PS5</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Pricing Type</Label>
                        <Select value={editingPricing.price_type} onValueChange={v => setEditingPricing({ ...editingPricing, price_type: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="hourly">Hourly Rate</SelectItem>
                            <SelectItem value="per_game">Per Game Match</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Price (DT)</Label>
                        <Input type="number" step="0.5" value={editingPricing.price} onChange={e => setEditingPricing({ ...editingPricing, price: parseFloat(e.target.value) })} />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>
                          {editingPricing.price_type === 'hourly' ? "Extension Unit (Mins)" : "Avg Match Duration (Mins)"}
                        </Label>
                        <Input
                          type="number"
                          value={editingPricing.game_duration_minutes}
                          onChange={e => setEditingPricing({ ...editingPricing, game_duration_minutes: parseInt(e.target.value) })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>
                          {editingPricing.price_type === 'hourly' ? "Extension Price (DT)" : "Prolongation Fee (DT)"}
                        </Label>
                        <Input
                          type="number"
                          step="0.5"
                          value={editingPricing.extra_time_price}
                          onChange={e => setEditingPricing({ ...editingPricing, extra_time_price: parseFloat(e.target.value) })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Points Earned</Label>
                      <Input type="number" value={editingPricing.points_earned} onChange={e => setEditingPricing({ ...editingPricing, points_earned: parseInt(e.target.value) })} />
                    </div>
                  </div>
                )}
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleUpdatePricing} disabled={!editingPricing?.name || editingPricing?.price < 0}>
                    Save Changes
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Pricing Tabs */}
          <Tabs defaultValue="ps5" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="ps5">{t('pricing.ps5')}</TabsTrigger>
              <TabsTrigger value="ps4">{t('pricing.ps4')}</TabsTrigger>
              <TabsTrigger value="other">{t('pricing.other')}</TabsTrigger>
            </TabsList>

            <TabsContent value="ps5" className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Gamepad2 className="w-5 h-5 text-primary" />
                <h2 className="font-display text-xl font-bold">{t('pricing.ps5')}</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {isLoading ? (
                  <div className="col-span-full flex items-center justify-center py-8">
                    <div className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : ps5Pricing.length === 0 ? (
                  <div className="col-span-full text-center py-8">
                    <DollarSign className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-muted-foreground">No PS5 pricing configured</p>
                  </div>
                ) : (
                  ps5Pricing.map((price) => (
                    <PricingCard key={price.id} price={price} />
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="ps4" className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Gamepad2 className="w-5 h-5 text-secondary" />
                <h2 className="font-display text-xl font-bold">PS4 Gaming Sessions</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {ps4Pricing.length === 0 ? (
                  <div className="col-span-full text-center py-8">
                    <DollarSign className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-muted-foreground">No PS4 pricing configured</p>
                  </div>
                ) : (
                  ps4Pricing.map((price) => (
                    <PricingCard key={price.id} price={price} />
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="other" className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-accent" />
                <h2 className="font-display text-xl font-bold">Other Services</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {otherPricing.length === 0 ? (
                  <div className="col-span-full text-center py-8">
                    <DollarSign className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-muted-foreground">No other services configured</p>
                  </div>
                ) : (
                  otherPricing.map((price) => (
                    <PricingCard key={price.id} price={price} />
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>

        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default PricingManagement;
