import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { useServicesCatalog, useCreateServiceCatalog, useUpdateServiceCatalog, useDeleteServiceCatalog } from "@/hooks/useServicesCatalog";
import { useServiceRequests, useCreateServiceRequest, useUpdateServiceRequest } from "@/hooks/useServiceRequests";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { HelpTooltip } from "@/components/ui/help-tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { sendServiceRequestNotification } from "@/services/emailService";
import { Wrench, Plus, Edit, AlertCircle, Trash2 } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-500 border-yellow-500/50",
  in_progress: "bg-blue-500/20 text-blue-500 border-blue-500/50",
  waiting_parts: "bg-orange-500/20 text-orange-500 border-orange-500/50",
  completed: "bg-green-500/20 text-green-500 border-green-500/50",
  cancelled: "bg-red-500/20 text-red-500 border-red-500/50",
};

const statusLabels: Record<string, string> = {
  pending: "Pending",
  in_progress: "In Progress",
  waiting_parts: "Waiting Parts",
  completed: "Completed",
  cancelled: "Cancelled",
};

const ServicesManagement = () => {
  const { user, role } = useAuth();
  const { t } = useLanguage();
  const isOwner = role === "owner";

  const { data: servicesCatalogRaw } = useServicesCatalog();
  const createService = useCreateServiceCatalog();
  const updateService = useUpdateServiceCatalog();
  const deleteService = useDeleteServiceCatalog();

  // Normalize servicesCatalog to guarantee it's always an array
  const servicesCatalog = Array.isArray(servicesCatalogRaw) ? servicesCatalogRaw : [];

  const { data: serviceRequestsRaw, isLoading, isError, error } = useServiceRequests();
  const createRequest = useCreateServiceRequest();
  const updateRequest = useUpdateServiceRequest();

  // Normalize serviceRequests
  const serviceRequests = Array.isArray(serviceRequestsRaw) ? serviceRequestsRaw : [];

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [filter, setFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<string>("requests");

  // Catalog Edit State
  const [editingCatalogItem, setEditingCatalogItem] = useState<any>(null);
  const [isCatalogDialogOpen, setIsCatalogDialogOpen] = useState(false);
  const [catalogFormData, setCatalogFormData] = useState({
    name: "",
    name_fr: "",
    price: "",
    is_complex: false,
    image_url: "",
    category: "console"
  });
  const [formData, setFormData] = useState({
    service_id: "",
    client_name: "",
    client_phone: "",
    device_type: "",
    device_brand: "",
    device_model: "",
    issue_description: "",
    estimated_cost: "",
    priority: "normal",
  });

  // Dynamic Service Creation State
  const [isCreatingNewService, setIsCreatingNewService] = useState(false);
  const [newServiceName, setNewServiceName] = useState("");
  const [isNewServiceComplex, setIsNewServiceComplex] = useState(false);

  const handleCreateRequest = async () => {
    if (!user) return;

    // Validation
    if (!formData.service_id && !isCreatingNewService) {
      toast({ title: "Please select a service", variant: "destructive" });
      return;
    }
    if (isCreatingNewService && !newServiceName) {
      toast({ title: "Please enter a service name", variant: "destructive" });
      return;
    }
    if (!formData.client_name || !formData.issue_description) {
      toast({ title: "Please fill required client fields", variant: "destructive" });
      return;
    }

    try {
      let finalServiceId = formData.service_id;
      let isComplex = false;

      // Create new service if needed
      if (isCreatingNewService) {
        const newService = await createService.mutateAsync({
          name: newServiceName,
          name_fr: newServiceName,
          name_ar: newServiceName,
          is_complex: isNewServiceComplex,
          is_active: true,
          sort_order: 0,
          category: "custom"
        });
        finalServiceId = newService?.id;
        isComplex = isNewServiceComplex;
      } else {
        const selectedService = servicesCatalog.find((s) => s.id === formData.service_id);
        isComplex = selectedService?.is_complex || false;
      }

      if (!finalServiceId) throw new Error("Could not determine service ID");

      const reqResponse = await createRequest.mutateAsync({
        ...formData,
        service_id: finalServiceId,
        estimated_cost: formData.estimated_cost ? parseFloat(formData.estimated_cost) : null,
        staff_id: user.id,
        is_complex: isComplex,
        assigned_to: isComplex ? null : user.id,
        status: "pending",
      } as any);

      // Send background notification
      sendServiceRequestNotification({
        clientName: formData.client_name,
        clientPhone: formData.client_phone,
        deviceType: formData.device_type,
        deviceBrand: formData.device_brand,
        deviceModel: formData.device_model,
        issueDescription: formData.issue_description,
        requestId: reqResponse.id,
        status: "pending"
      });

      toast({ title: "Service request created!" });
      setIsCreateDialogOpen(false);

      // Reset
      setFormData({
        service_id: "",
        client_name: "",
        client_phone: "",
        device_type: "",
        device_brand: "",
        device_model: "",
        issue_description: "",
        estimated_cost: "",
        priority: "normal",
      });
      setIsCreatingNewService(false);
      setNewServiceName("");
      setIsNewServiceComplex(false);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleStatusUpdate = async (requestId: string, newStatus: string, finalCost?: number) => {
    try {
      const request = serviceRequests.find(r => r.id === requestId);
      if (!request) return;

      // Permission checks
      if (!isOwner && request.is_complex && newStatus === "completed") {
        toast({ title: "Permission denied", description: "Only owner can complete complex requests", variant: "destructive" });
        return;
      }

      const updates: any = { id: requestId, status: newStatus };

      if (newStatus === "in_progress" && !request.started_at) {
        updates.started_at = new Date().toISOString();
        updates.assigned_to = user?.id;
      }

      if (newStatus === "completed") {
        updates.completed_at = new Date().toISOString();
        if (finalCost !== undefined) updates.final_cost = finalCost;
      }

      await updateRequest.mutateAsync(updates);

      sendServiceRequestNotification({
        clientName: request.client_name,
        clientPhone: request.client_phone,
        deviceType: request.device_type || "",
        deviceBrand: request.device_brand || "",
        deviceModel: request.device_model || "",
        issueDescription: request.issue_description,
        requestId: request.id,
        status: newStatus
      });

      toast({ title: "Status updated!" });
      setSelectedRequest(null);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  // Safe filtering
  const filteredRequests = serviceRequests.filter((r) => {
    if (!r) return false;
    if (filter === "all") return true;
    if (filter === "active") return ["pending", "in_progress", "waiting_parts"].includes(r.status);
    if (filter === "simple") return !r.is_complex;
    if (filter === "complex") return r.is_complex;
    if (filter === "my_work") return r.assigned_to === user?.id || (!r.assigned_to && !r.is_complex);
    return r.status === filter;
  });

  // Helper to extract service name safely (handles Join being an array or object)
  const getServiceName = (request: any) => {
    const service = request?.service;
    if (Array.isArray(service)) return service[0]?.name_fr || "Service";
    return service?.name_fr || "Service";
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-3xl font-bold mb-1">Service Requests</h1>
                <HelpTooltip content={t('help.services')} />
              </div>
              <p className="text-muted-foreground text-sm">
                Manage repair and service requests
              </p>
            </div>
            <Button variant="hero" onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4" />
              New Request
            </Button>
          </div>

          {isError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error Loading Data</AlertTitle>
              <AlertDescription>
                We couldn't load your service requests.
                {error && <p className="mt-2 text-xs font-mono">{(error as any).message || String(error)}</p>}
              </AlertDescription>
            </Alert>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="requests">Requests List</TabsTrigger>
              <TabsTrigger value="catalog" disabled={!isOwner}>Catalog Editor</TabsTrigger>
            </TabsList>

            <TabsContent value="requests" className="space-y-6">
              <div className="flex gap-2 flex-wrap">
                {[
                  { key: "all", label: "All" },
                  { key: "active", label: "Active" },
                  { key: "my_work", label: "My Work" },
                  { key: "simple", label: "Simple" },
                  ...(isOwner ? [{ key: "complex", label: "Complex" }] : []),
                  { key: "pending", label: "Pending" },
                  { key: "in_progress", label: "In Progress" },
                  { key: "completed", label: "Completed" }
                ].map(({ key, label }) => (
                  <Button
                    key={key}
                    variant={filter === key ? "default" : "outline"}
                    size="sm"
                    className="rounded-full"
                    onClick={() => setFilter(key)}
                  >
                    {label}
                  </Button>
                ))}
              </div>

              <div className="grid gap-4">
                {filteredRequests.map((request) => (
                  <div
                    key={request.id}
                    className="glass-card rounded-xl p-4 cursor-pointer hover:border-primary/50 transition-all group"
                    onClick={() => setSelectedRequest(request)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h3 className="font-semibold truncate max-w-[200px]">{getServiceName(request)}</h3>
                          <Badge className={statusColors[request.status] || "bg-gray-500/20 text-gray-500 border-gray-500/50"}>
                            {statusLabels[request.status] || request.status}
                          </Badge>
                          {request.is_complex && (
                            <Badge variant="outline" className="text-[10px] uppercase border-secondary text-secondary">
                              Complex
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm font-medium mb-1">
                          {request.client_name}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
                          {request.issue_description}
                        </p>
                        {request.device_brand && (
                          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                            <span className="px-1.5 py-0.5 rounded bg-muted">
                              {request.device_brand} {request.device_model}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[10px] text-muted-foreground mb-1">
                          {request.created_at ? new Date(request.created_at).toLocaleDateString() : 'No date'}
                        </p>
                        {request.estimated_cost && (
                          <p className="font-bold text-primary">{request.estimated_cost} DT</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {filteredRequests.length === 0 && !isLoading && (
                  <div className="text-center py-16 glass-card rounded-2xl opacity-60">
                    <Wrench className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-lg font-medium">No services found</p>
                    <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="catalog">
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-secondary/10 p-4 rounded-xl">
                  <div>
                    <h2 className="text-xl font-bold">Catalog Management</h2>
                    <p className="text-sm text-muted-foreground">Configure standard service types</p>
                  </div>
                  <Button onClick={() => {
                    setEditingCatalogItem(null);
                    setCatalogFormData({ name: "", name_fr: "", price: "", is_complex: false, image_url: "", category: "console" });
                    setIsCatalogDialogOpen(true);
                  }}>
                    <Plus className="w-4 h-4 mr-2" /> Add Template
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {servicesCatalog.map((item) => (
                    <Card key={item.id} className="glass-card overflow-hidden hover:border-primary/30 transition-colors">
                      <CardHeader className="p-4 pb-2">
                        <div className="flex items-start">
                          <div className="min-w-0 flex-1">
                            <CardTitle className="text-lg truncate">{item.name_fr || item.name}</CardTitle>
                            <Badge variant="outline" className="text-[10px] mt-1">{item.category}</Badge>
                          </div>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
                              setEditingCatalogItem(item);
                              setCatalogFormData({
                                name: item.name || "",
                                name_fr: item.name_fr || item.name || "",
                                price: item.price?.toString() || "",
                                is_complex: !!item.is_complex,
                                image_url: item.image_url || "",
                                category: item.category || "phone"
                              });
                              setIsCatalogDialogOpen(true);
                            }}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:bg-destructive/10"
                              onClick={async () => {
                                if (confirm(`Remove "${item.name_fr || item.name}" from catalog?`)) {
                                  try {
                                    await deleteService.mutateAsync(item.id);
                                    toast({ title: "Template removed" });
                                  } catch (e: any) {
                                    toast({ title: "Delete failed", description: e.message, variant: "destructive" });
                                  }
                                }
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        {item.image_url && (
                          <div className="w-full h-24 mb-3 rounded-lg overflow-hidden border border-border/20 bg-muted">
                            <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-primary font-mono">{item.price || 0} DT</span>
                          {item.is_complex && <Badge variant="secondary" className="text-[10px] bg-amber-500/10 text-amber-500">Complex</Badge>}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Dialogs remain mostly same but with better internal safety */}
        <Dialog open={isCatalogDialogOpen} onOpenChange={setIsCatalogDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingCatalogItem ? "Edit Template" : "New Template"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">Name (EN)</Label>
                  <Input value={catalogFormData.name} onChange={e => setCatalogFormData({ ...catalogFormData, name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Name (FR)</Label>
                  <Input value={catalogFormData.name_fr} onChange={e => setCatalogFormData({ ...catalogFormData, name_fr: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">Base Price (DT)</Label>
                  <Input type="number" step="0.5" value={catalogFormData.price} onChange={e => setCatalogFormData({ ...catalogFormData, price: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Category</Label>
                  <Select value={catalogFormData.category} onValueChange={v => setCatalogFormData({ ...catalogFormData, category: v })}>
                    <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="phone">Phone Repair</SelectItem>
                      <SelectItem value="console">Console Repair</SelectItem>
                      <SelectItem value="controller">Controller Repair</SelectItem>
                      <SelectItem value="pc">PC Repair</SelectItem>
                      <SelectItem value="accounts">Accounts</SelectItem>
                      <SelectItem value="sales">Sales</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Image URL (Optional)</Label>
                <Input value={catalogFormData.image_url} onChange={e => setCatalogFormData({ ...catalogFormData, image_url: e.target.value })} placeholder="https://..." />
              </div>
              <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg">
                <Checkbox id="cat-complex-fixed" checked={catalogFormData.is_complex} onCheckedChange={v => setCatalogFormData({ ...catalogFormData, is_complex: !!v })} />
                <div className="grid gap-0.5 leading-none">
                  <Label htmlFor="cat-complex-fixed" className="text-sm font-medium">Complex Service</Label>
                  <p className="text-[10px] text-muted-foreground">Requires owner verification</p>
                </div>
              </div>
              <Button className="w-full mt-2" onClick={async () => {
                const finalData = {
                  ...catalogFormData,
                  price: parseFloat(catalogFormData.price) || 0,
                  is_active: true,
                  sort_order: 0,
                  name_ar: catalogFormData.name_fr
                };
                try {
                  if (editingCatalogItem) {
                    await updateService.mutateAsync({ id: editingCatalogItem.id, ...finalData });
                    toast({ title: "Template updated" });
                  } else {
                    await createService.mutateAsync(finalData as any);
                    toast({ title: "Template created" });
                  }
                  setIsCatalogDialogOpen(false);
                } catch (e: any) {
                  toast({ title: "Operation failed", description: e.message, variant: "destructive" });
                }
              }} disabled={updateService.isPending || createService.isPending}>
                {editingCatalogItem ? "Save Changes" : "Create Template"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Create Request Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>New Service Request</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-3">
                <Label>Service *</Label>
                <Select
                  value={isCreatingNewService ? "_new" : formData.service_id}
                  onValueChange={(v) => {
                    if (v === "_new") {
                      setIsCreatingNewService(true);
                      setFormData(prev => ({ ...prev, service_id: "" }));
                    } else {
                      setIsCreatingNewService(false);
                      setFormData(prev => ({ ...prev, service_id: v }));
                    }
                  }}
                >
                  <SelectTrigger><SelectValue placeholder="Select service" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_new" className="text-primary font-bold">+ Custom Service</SelectItem>
                    {servicesCatalog.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name_fr} {s.is_complex && "(Complex)"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {isCreatingNewService && (
                  <div className="p-4 border-2 border-dashed border-primary/20 rounded-xl space-y-3 bg-primary/5">
                    <div className="space-y-2">
                      <Label className="text-xs">Service Name</Label>
                      <Input placeholder="e.g. PS5 HDMI" value={newServiceName} onChange={(e) => setNewServiceName(e.target.value)} />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="new-complex" checked={isNewServiceComplex} onCheckedChange={(c) => setIsNewServiceComplex(!!c)} />
                      <Label htmlFor="new-complex" className="text-sm">Is Complex Service?</Label>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Client Name *</Label>
                  <Input value={formData.client_name} onChange={(e) => setFormData({ ...formData, client_name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input value={formData.client_phone} onChange={(e) => setFormData({ ...formData, client_phone: e.target.value })} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs">Device Type</Label>
                  <Input placeholder="PS5..." value={formData.device_type} onChange={(e) => setFormData({ ...formData, device_type: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Brand</Label>
                  <Input placeholder="Sony..." value={formData.device_brand} onChange={(e) => setFormData({ ...formData, device_brand: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Model</Label>
                  <Input placeholder="Slim..." value={formData.device_model} onChange={(e) => setFormData({ ...formData, device_model: e.target.value })} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Issue Description *</Label>
                <Textarea value={formData.issue_description} onChange={(e) => setFormData({ ...formData, issue_description: e.target.value })} rows={3} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Est. Cost (DT)</Label>
                  <Input type="number" step="0.5" value={formData.estimated_cost} onChange={(e) => setFormData({ ...formData, estimated_cost: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select value={formData.priority} onValueChange={(v) => setFormData({ ...formData, priority: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button variant="hero" className="w-full" onClick={handleCreateRequest} disabled={createRequest.isPending}>
                Create Service Request
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* View/Update Details Dialog */}
        <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Request Details</DialogTitle>
            </DialogHeader>
            {selectedRequest && (
              <div className="space-y-6 pt-4">
                <div className="glass-card rounded-2xl p-5 space-y-4 border-primary/20 bg-primary/5">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-lg font-bold">{getServiceName(selectedRequest)}</h4>
                      <p className="text-xs text-muted-foreground">ID: {selectedRequest.id.slice(0, 8)}</p>
                    </div>
                    <Badge className={statusColors[selectedRequest.status] || ""}>
                      {statusLabels[selectedRequest.status] || selectedRequest.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm pt-2">
                    <div className="space-y-1">
                      <p className="text-muted-foreground text-[10px] uppercase font-bold">Client</p>
                      <p className="font-medium">{selectedRequest.client_name}</p>
                      <p className="text-xs">{selectedRequest.client_phone}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground text-[10px] uppercase font-bold">Device</p>
                      <p className="font-medium">{selectedRequest.device_brand || '---'} {selectedRequest.device_model || ''}</p>
                      <p className="text-xs">{selectedRequest.device_type || 'General'}</p>
                    </div>
                    <div className="col-span-2 space-y-1">
                      <p className="text-muted-foreground text-[10px] uppercase font-bold">Problem</p>
                      <p className="italic underline decoration-primary/30 underline-offset-4">{selectedRequest.issue_description}</p>
                    </div>
                  </div>
                </div>

                {!["completed", "cancelled"].includes(selectedRequest.status) && (
                  <div className="space-y-4">
                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Update Status</Label>

                    {selectedRequest.is_complex && !isOwner && (
                      <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-600 text-[10px] font-medium leading-tight">
                        ⚠️ COMPLEX SERVICE: Requires owner verification for progression.
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      {selectedRequest.status === "pending" && (
                        <Button
                          className="col-span-2"
                          onClick={() => handleStatusUpdate(selectedRequest.id, "in_progress")}
                          disabled={selectedRequest.is_complex && !isOwner}
                        >
                          {selectedRequest.is_complex && !isOwner ? "Awaiting Owner" : "Start Repair"}
                        </Button>
                      )}
                      {selectedRequest.status === "in_progress" && (
                        <>
                          <Button
                            variant="outline"
                            onClick={() => handleStatusUpdate(selectedRequest.id, "waiting_parts")}
                          >
                            Wait for Parts
                          </Button>
                          <Button
                            variant="hero"
                            onClick={() => handleStatusUpdate(selectedRequest.id, "completed", selectedRequest.estimated_cost)}
                            disabled={selectedRequest.is_complex && !isOwner}
                          >
                            Complete Repair
                          </Button>
                        </>
                      )}
                      {selectedRequest.status === "waiting_parts" && (
                        <Button
                          className="col-span-2"
                          onClick={() => handleStatusUpdate(selectedRequest.id, "in_progress")}
                        >
                          Resume Repair
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => handleStatusUpdate(selectedRequest.id, "cancelled")}
                      >
                        Cancel Request
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default ServicesManagement;