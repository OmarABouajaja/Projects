// I need to see the hook file first to add the mutation.
// Abort replacement, switch to read file.
import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { useServicesCatalog, useCreateServiceCatalog, useUpdateServiceCatalog } from "@/hooks/useServicesCatalog";
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
import { Wrench, Plus, Edit } from "lucide-react";

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

  const { data: servicesCatalog } = useServicesCatalog();
  const createService = useCreateServiceCatalog();
  const updateService = useUpdateServiceCatalog();
  const { deleteServiceMutation } = useServicesCatalog() as any; // Assuming it exists or I'll add it

  const { data: serviceRequests, isLoading } = useServiceRequests();
  const createRequest = useCreateServiceRequest();
  const updateRequest = useUpdateServiceRequest();

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
          name_fr: newServiceName, // default to same name
          name_ar: newServiceName,
          is_complex: isNewServiceComplex,
          is_active: true,
          sort_order: 0,
          category: "custom"
        });
        finalServiceId = newService.id;
        isComplex = isNewServiceComplex;
      } else {
        const selectedService = servicesCatalog?.find((s) => s.id === formData.service_id);
        isComplex = selectedService?.is_complex || false;
      }

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
      const request = serviceRequests?.find(r => r.id === requestId);
      if (!request) return;

      // Permission checks based on role and service complexity
      if (!isOwner && request.is_complex && newStatus === "completed") {
        toast({
          title: "Permission denied",
          description: "Only the owner can complete complex service requests",
          variant: "destructive"
        });
        return;
      }

      if (!isOwner && request.is_complex && newStatus === "in_progress") {
        toast({
          title: "Permission denied",
          description: "Only the owner can start working on complex services",
          variant: "destructive"
        });
        return;
      }

      const updates: any = { id: requestId, status: newStatus };

      if (newStatus === "in_progress" && !request.started_at) {
        updates.started_at = new Date().toISOString();
        updates.assigned_to = user?.id;
      }

      if (newStatus === "completed") {
        updates.completed_at = new Date().toISOString();
        if (finalCost !== undefined) {
          updates.final_cost = finalCost;
        }
      }

      await updateRequest.mutateAsync(updates);

      // Send notification on status change
      sendServiceRequestNotification({
        clientName: request.client_name,
        clientPhone: request.client_phone,
        deviceType: request.device_type,
        deviceBrand: request.device_brand,
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

  const filteredRequests = serviceRequests?.filter((r) => {
    if (filter === "all") return true;
    if (filter === "active") return ["pending", "in_progress", "waiting_parts"].includes(r.status);
    if (filter === "simple") return !r.is_complex;
    if (filter === "complex") return r.is_complex;
    if (filter === "my_work") return r.assigned_to === user?.id || (!r.assigned_to && !r.is_complex);
    return r.status === filter;
  });

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-3xl font-bold mb-2">Service Requests</h1>
                <HelpTooltip content={t('help.services')} />
              </div>
              <p className="text-muted-foreground">
                Manage repair and service requests
              </p>
            </div>
            <Button variant="hero" onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4" />
              New Request
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="requests">Service Requests</TabsTrigger>
              <TabsTrigger value="catalog" disabled={!isOwner}>Service Catalog</TabsTrigger>
            </TabsList>

            <TabsContent value="requests" className="space-y-6">
              <div className="flex gap-2 flex-wrap">
                {[
                  { key: "all", label: "All" },
                  { key: "active", label: "Active" },
                  { key: "my_work", label: isOwner ? "All My Work" : "My Simple Work" },
                  { key: "simple", label: "Simple Services" },
                  ...(isOwner ? [{ key: "complex", label: "Complex Services" }] : []),
                  { key: "pending", label: "Pending" },
                  { key: "in_progress", label: "In Progress" },
                  { key: "completed", label: "Completed" }
                ].map(({ key, label }) => (
                  <Button
                    key={key}
                    variant={filter === key ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter(key)}
                  >
                    {label}
                  </Button>
                ))}
              </div>

              {/* Requests List */}
              <div className="space-y-4">
                {filteredRequests?.map((request) => (
                  <div
                    key={request.id}
                    className="glass-card rounded-xl p-4 cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => setSelectedRequest(request)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{request.service?.name_fr || "Service"}</h3>
                          <Badge className={statusColors[request.status]}>
                            {statusLabels[request.status]}
                          </Badge>
                          {request.is_complex && (
                            <Badge variant="outline" className="border-secondary text-secondary">
                              Complex
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Client: {request.client_name} - {request.client_phone}
                        </p>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {request.issue_description}
                        </p>
                        {request.device_brand && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Device: {request.device_brand} {request.device_model}
                          </p>
                        )}
                      </div>
                      <div className="text-right text-sm">
                        <p className="text-muted-foreground">
                          {new Date(request.created_at).toLocaleDateString()}
                        </p>
                        {request.estimated_cost && (
                          <p className="font-medium">{request.estimated_cost} DT</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {(!filteredRequests || filteredRequests.length === 0) && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Wrench className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No service requests found</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="catalog">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold">Manage Services</h2>
                  <Button onClick={() => {
                    setEditingCatalogItem(null);
                    setCatalogFormData({ name: "", name_fr: "", price: "", is_complex: false, image_url: "", category: "console" });
                    setIsCatalogDialogOpen(true);
                  }}>
                    <Plus className="w-4 h-4 mr-2" /> Add Service Template
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {servicesCatalog?.map((item) => (
                    <Card key={item.id} className="glass-card">
                      <CardHeader className="p-4 pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{item.name_fr || item.name}</CardTitle>
                            <Badge variant="outline" className="mt-1">{item.category}</Badge>
                          </div>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" onClick={() => {
                              setEditingCatalogItem(item);
                              setCatalogFormData({
                                name: item.name,
                                name_fr: item.name_fr || item.name,
                                price: item.price?.toString() || "",
                                is_complex: item.is_complex,
                                image_url: item.image_url || "",
                                category: item.category
                              });
                              setIsCatalogDialogOpen(true);
                            }}>
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        {item.image_url && (
                          <div className="w-full h-24 mb-2 rounded bg-muted overflow-hidden">
                            <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="flex justify-between items-center text-sm">
                          <span className="font-bold text-primary">{item.price || 0} DT</span>
                          {item.is_complex && <Badge className="bg-secondary/20 text-secondary border-secondary/50">Complex</Badge>}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Catalog Edit Dialog */}
        <Dialog open={isCatalogDialogOpen} onOpenChange={setIsCatalogDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingCatalogItem ? "Edit ServiceTemplate" : "Add Service Template"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Name (EN)</Label>
                  <Input value={catalogFormData.name} onChange={e => setCatalogFormData({ ...catalogFormData, name: e.target.value })} />
                </div>
                <div>
                  <Label>Name (FR)</Label>
                  <Input value={catalogFormData.name_fr} onChange={e => setCatalogFormData({ ...catalogFormData, name_fr: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Price (DT)</Label>
                  <Input type="number" step="0.5" value={catalogFormData.price} onChange={e => setCatalogFormData({ ...catalogFormData, price: e.target.value })} />
                </div>
                <div>
                  <Label>Category</Label>
                  <Select value={catalogFormData.category} onValueChange={v => setCatalogFormData({ ...catalogFormData, category: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="phone">Phone Repair</SelectItem>
                      <SelectItem value="console">Console Repair</SelectItem>
                      <SelectItem value="controller">Controller Repair</SelectItem>
                      <SelectItem value="pc">PC Repair</SelectItem>
                      <SelectItem value="accounts">Gaming Accounts</SelectItem>
                      <SelectItem value="sales">Hardware Sales</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Image URL</Label>
                <Input value={catalogFormData.image_url} onChange={e => setCatalogFormData({ ...catalogFormData, image_url: e.target.value })} placeholder="https://..." />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="cat-complex" checked={catalogFormData.is_complex} onCheckedChange={v => setCatalogFormData({ ...catalogFormData, is_complex: !!v })} />
                <Label htmlFor="cat-complex">Is Complex Service?</Label>
              </div>
              <Button className="w-full" onClick={async () => {
                const data = {
                  ...catalogFormData,
                  price: parseFloat(catalogFormData.price) || 0,
                  is_active: true,
                  sort_order: 0,
                  name_ar: catalogFormData.name_fr // Fallback
                };
                if (editingCatalogItem) {
                  await updateService.mutateAsync({ id: editingCatalogItem.id, ...data });
                  toast({ title: "Template updated" });
                } else {
                  await createService.mutateAsync(data as any);
                  toast({ title: "Template created" });
                }
                setIsCatalogDialogOpen(false);
              }}>
                {editingCatalogItem ? "Update" : "Create"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Create Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>New Service Request</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-3">
                <Label>Service *</Label>
                <div className="flex gap-2">
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
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select service" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_new" className="text-primary font-bold">
                        + Add New Service Type
                      </SelectItem>
                      {servicesCatalog?.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name_fr} {s.is_complex && "(Complex)"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {isCreatingNewService && (
                  <div className="pl-4 border-l-2 border-primary/20 space-y-3 py-2 bg-secondary/5 rounded-r-lg">
                    <div>
                      <Label className="text-xs text-muted-foreground">New Service Name</Label>
                      <Input
                        placeholder="e.g. PS5 HDMI Repair"
                        value={newServiceName}
                        onChange={(e) => setNewServiceName(e.target.value)}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="complex-check"
                        checked={isNewServiceComplex}
                        onCheckedChange={(c) => setIsNewServiceComplex(c as boolean)}
                      />
                      <Label htmlFor="complex-check" className="cursor-pointer">
                        Is Complex Service?
                        <span className="block text-xs text-muted-foreground font-normal">
                          Complex services require time and owner steps. Basic are instant.
                        </span>
                      </Label>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Client Name *</Label>
                  <Input
                    value={formData.client_name}
                    onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input
                    value={formData.client_phone}
                    onChange={(e) => setFormData({ ...formData, client_phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Device Type</Label>
                  <Input
                    placeholder="Phone, PS4..."
                    value={formData.device_type}
                    onChange={(e) => setFormData({ ...formData, device_type: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Brand</Label>
                  <Input
                    placeholder="Apple..."
                    value={formData.device_brand}
                    onChange={(e) => setFormData({ ...formData, device_brand: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Model</Label>
                  <Input
                    placeholder="iPhone 14..."
                    value={formData.device_model}
                    onChange={(e) => setFormData({ ...formData, device_model: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label>Issue Description *</Label>
                <Textarea
                  value={formData.issue_description}
                  onChange={(e) => setFormData({ ...formData, issue_description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Estimated Cost (DT)</Label>
                  <Input
                    type="number"
                    step="0.001"
                    value={formData.estimated_cost}
                    onChange={(e) => setFormData({ ...formData, estimated_cost: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Priority</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(v) => setFormData({ ...formData, priority: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                variant="hero"
                className="w-full"
                onClick={handleCreateRequest}
                disabled={createRequest.isPending || (isCreatingNewService && createService.isPending)}
              >
                {isCreatingNewService ? "Create Service & Request" : "Create Request"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* View/Update Dialog */}
        <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Service Request Details</DialogTitle>
            </DialogHeader>
            {selectedRequest && (
              <div className="space-y-4">
                <div className="glass-card rounded-lg p-4 space-y-2">
                  <p><strong>Service:</strong> {selectedRequest.service?.name_fr}</p>
                  <p><strong>Client:</strong> {selectedRequest.client_name} - {selectedRequest.client_phone}</p>
                  {selectedRequest.device_brand && (
                    <p><strong>Device:</strong> {selectedRequest.device_brand} {selectedRequest.device_model}</p>
                  )}
                  <p><strong>Issue:</strong> {selectedRequest.issue_description}</p>
                  {selectedRequest.estimated_cost && (
                    <p><strong>Estimated Cost:</strong> {selectedRequest.estimated_cost} DT</p>
                  )}
                  <div className="flex items-center gap-2">
                    <strong>Status:</strong>
                    <Badge className={statusColors[selectedRequest.status]}>
                      {statusLabels[selectedRequest.status]}
                    </Badge>
                  </div>
                </div>

                {/* Status Actions */}
                {selectedRequest.status !== "completed" && selectedRequest.status !== "cancelled" && (
                  <div className="space-y-3">
                    {/* Role-based action hints */}
                    {selectedRequest.is_complex && !isOwner && (
                      <div className="glass-card rounded-lg p-3 border-orange-500/30">
                        <p className="text-sm text-orange-600 font-medium">Complex Service</p>
                        <p className="text-xs text-muted-foreground">
                          This requires owner approval. You can only update status to pending owner review.
                        </p>
                      </div>
                    )}

                    <div className="flex gap-2 flex-wrap">
                      {selectedRequest.status === "pending" && (
                        <Button
                          onClick={() => handleStatusUpdate(selectedRequest.id, "in_progress")}
                          disabled={selectedRequest.is_complex && !isOwner}
                        >
                          {selectedRequest.is_complex && !isOwner ? "Request Owner Review" : "Start Working"}
                        </Button>
                      )}
                      {selectedRequest.status === "in_progress" && (
                        <>
                          {isOwner && (
                            <Button
                              variant="outline"
                              onClick={() => handleStatusUpdate(selectedRequest.id, "waiting_parts")}
                            >
                              Waiting Parts
                            </Button>
                          )}
                          <Button
                            variant="hero"
                            onClick={() => handleStatusUpdate(selectedRequest.id, "completed", selectedRequest.estimated_cost)}
                            disabled={selectedRequest.is_complex && !isOwner}
                          >
                            {selectedRequest.is_complex && !isOwner ? "Mark Ready for Owner" : "Mark Complete"}
                          </Button>
                        </>
                      )}
                      {selectedRequest.status === "waiting_parts" && isOwner && (
                        <Button
                          onClick={() => handleStatusUpdate(selectedRequest.id, "in_progress")}
                        >
                          Continue Working
                        </Button>
                      )}
                      <Button
                        variant="destructive"
                        onClick={() => handleStatusUpdate(selectedRequest.id, "cancelled")}
                        disabled={selectedRequest.is_complex && !isOwner && selectedRequest.status === "in_progress"}
                      >
                        Cancel
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