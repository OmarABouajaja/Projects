import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Users, Plus, Edit, Trash2, Crown, User, Mail, Shield,
  Clock, AlertTriangle, CheckCircle, Loader2, Phone,
  Zap, ShieldCheck, Send
} from "lucide-react";
import { UserPlus, Key } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { createStaffMember } from "@/services/adminService";

interface StaffMember {
  id: string;
  email: string;
  role: "owner" | "worker";
  full_name?: string;
  phone?: string;
  created_at: string;
  last_sign_in?: string;
  is_invited?: boolean;
  invitation_sent_at?: string;
}

const StaffManagement = () => {
  const { user, isOwner, session } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<StaffMember | null>(null);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    full_name: "",
    phone: "",
    role: "worker" as "owner" | "worker"
  });
  const [skipEmail, setSkipEmail] = useState(false);

  const generatePassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  // Fetch staff members
  const fetchStaffMembers = async () => {
    try {
      setIsLoading(true);
      const { data: userRoles, error: rolesError } = await supabase
        .from("user_roles")
        .select("*")
        .order("created_at", { ascending: false });

      if (rolesError) throw rolesError;

      const staffData: StaffMember[] = [];

      // Get user details for each role
      for (const role of userRoles || []) {
        // Get profile data
        const { data: profileData } = await supabase
          .from("profiles")
          .select("full_name, created_at, is_active, phone")
          .eq("id", role.user_id)
          .single();

        let userEmail = "Email non disponible";
        let userFullName = "Nom non disponible";

        // Get actual email
        if (role.user_id === user?.id) {
          // Current logged-in user
          userEmail = user.email || userEmail;
        } else if (profileData?.email) {
          // Email stored in profile
          userEmail = profileData.email;
        } else if (profileData?.full_name) {
          // Use full name as fallback
          userFullName = profileData.full_name;
        }

        staffData.push({
          id: role.user_id,
          email: userEmail,
          role: role.role as "owner" | "worker",
          full_name: profileData?.full_name || userFullName,
          phone: profileData?.phone,
          created_at: profileData?.created_at || role.created_at || new Date().toISOString(),
          last_sign_in: role.user_id === user?.id ? user.last_sign_in_at : profileData?.last_sign_in_at,
          is_invited: (!profileData || !profileData.full_name) && role.user_id !== user?.id
        });
      }

      setStaffMembers(staffData);
    } catch (error: any) {
      console.error("Error fetching staff:", error);
      toast({
        title: "Erreur",
        description: error?.message || "Impossible de charger la liste du personnel.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffMembers();
  }, []);

  // Only owners can access this page
  if (!isOwner) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
              <p className="text-muted-foreground">Only owners can manage staff.</p>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingUser) {
        // Update existing user role
        const { error } = await supabase
          .from("user_roles")
          .update({ role: formData.role })
          .eq("user_id", editingUser.id);

        if (error) throw error;

        toast({
          title: "✅ Rôle mis à jour",
          description: `Le rôle de ${editingUser.email} a été modifié.`
        });

        // Refresh the list
        await fetchStaffMembers();

      } else {
        const tempPassword = generatePassword();
        const rawUrl = import.meta.env.VITE_API_URL || 'https://bck.gamestorezarzis.com.tn';
        const API_URL = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`;
        const { user_id, email_sent: apiEmailSent } = await createStaffMember({
          email: formData.email,
          password: tempPassword,
          role: formData.role,
          full_name: formData.full_name || "Staff Member",
          phone: formData.phone
        }, session?.access_token || "");

        // Copy password to clipboard
        try {
          await navigator.clipboard.writeText(tempPassword);
        } catch (err) {
          console.warn("Failed to copy to clipboard:", err);
        }

        toast({
          title: apiEmailSent ? "✅ Invitation envoyée par email" : "✅ Compte créé (Email en attente)",
          description: (
            <div className="space-y-2">
              <p>
                {apiEmailSent
                  ? `L'invitation personnalisée a été envoyée à ${formData.email}.`
                  : `Le compte a été créé, mais l'envoi de l'email a échoué. Utilisez le mot de passe ci-dessous.`}
              </p>
              <div className="bg-black/20 p-3 rounded-lg border border-primary/20">
                <p className="text-xs text-muted-foreground mb-1">Mot de passe temporaire à donner au staff :</p>
                <div className="flex items-center gap-2">
                  <code className="text-sm font-mono bg-black/30 px-2 py-1 rounded flex-1">{tempPassword}</code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(tempPassword);
                      toast({ title: "📋 Copié!", description: "Mot de passe copié" });
                    }}
                    className="px-2 py-1 text-xs bg-primary/20 hover:bg-primary/30 rounded"
                  >
                    Copier
                  </button>
                </div>
              </div>
              <div className="mt-2 text-[11px] text-yellow-500 bg-yellow-500/10 p-2 rounded border border-yellow-500/20">
                <strong>💡 Note sur le domaine de Test :</strong>
                <p>Si vous utilisez un domaine de test MailerSend, l'email ne sera reçu <strong>QUE par vous-même</strong>. Les autres adresses le bloqueront.</p>
              </div>
            </div>
          ),
          duration: 20000,
        });

        // Refresh the list
        await fetchStaffMembers();
      }

      setIsDialogOpen(false);
      setEditingUser(null);
      setFormData({ email: "", full_name: "", phone: "", role: "worker" });

    } catch (error: any) {
      console.error("Staff management error:", error);
      toast({
        title: "❌ Erreur",
        description: error?.message || "Une erreur s'est produite lors de la création du compte.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const canDeleteMember = (member: StaffMember) => {
    const isNotSelf = member.id !== user?.id;
    const isNotLastOwner = !(member.role === 'owner' && staffMembers.filter(m => m.role === 'owner').length <= 1);
    return isNotSelf && isNotLastOwner;
  };

  const handleDelete = async (userId: string) => {
    const member = staffMembers.find(m => m.id === userId);
    if (!member) return;

    // Prevent deleting yourself
    if (userId === user?.id) {
      toast({
        title: "Action impossible",
        description: "Vous ne pouvez pas vous supprimer vous-même.",
        variant: "destructive"
      });
      return;
    }

    // Prevent deleting the last owner
    const ownerCount = staffMembers.filter(m => m.role === 'owner').length;
    if (member.role === 'owner' && ownerCount <= 1) {
      toast({
        title: "Action impossible",
        description: "Il doit y avoir au moins un propriétaire.",
        variant: "destructive"
      });
      return;
    }

    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer ${member.email} du personnel ? Cette action est irréversible.`)) {
      return;
    }

    try {
      setIsSubmitting(true);

      // Delete from user_roles table
      const { error: roleError } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId);

      if (roleError) throw roleError;

      // Also try to delete from profiles (won't fail if it doesn't exist)
      await supabase
        .from("profiles")
        .delete()
        .eq("id", userId);

      toast({
        title: "🗑️ Membre supprimé",
        description: `${member.email} a été retiré du personnel.`
      });

      // Refresh the list
      await fetchStaffMembers();

    } catch (error: any) {
      console.error("Delete staff error:", error);
      toast({
        title: "❌ Erreur",
        description: "Impossible de supprimer le membre du personnel.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-3xl font-bold mb-2">Gestion du Personnel</h1>
              <p className="text-muted-foreground">
                Gérez les comptes employés et leurs permissions d'accès
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => {
                  setEditingUser(null);
                  setFormData({ email: "", full_name: "", phone: "", role: "worker" });
                }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Inviter du Personnel
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none bg-transparent">
                <div className="relative p-6 sm:p-8 glass-card border-white/20 dark:border-white/10 overflow-hidden">
                  {/* Decorative Background Elements */}
                  <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
                  <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-secondary/20 blur-[100px] rounded-full pointer-events-none" />

                  <DialogHeader className="relative mb-6">
                    <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                      {editingUser ? "Modifier le Rôle" : "Nouvel Invité"}
                    </DialogTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {editingUser ? "Ajustez les accès de votre collaborateur" : "Ajoutez un membre à votre équipe de choc"}
                    </p>
                  </DialogHeader>

                  <form onSubmit={handleSubmit} className="relative space-y-6">
                    {/* Basic Info Section */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Adresse Email Professionnelle</Label>
                        <div className="relative group/field">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within/field:text-primary transition-all duration-300" />
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="employe@exemple.com"
                            required
                            disabled={!!editingUser}
                            className="pl-10 h-12 bg-white/5 border-white/10 focus:border-primary/50 focus:ring-primary/20 transition-all rounded-xl placeholder:text-white/20"
                          />
                        </div>
                      </div>

                      {!editingUser && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="full_name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Nom Complet</Label>
                            <div className="relative group/field">
                              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within/field:text-primary transition-all duration-300" />
                              <Input
                                id="full_name"
                                value={formData.full_name}
                                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                placeholder="John Doe"
                                className="pl-10 h-12 bg-white/5 border-white/10 focus:border-primary/50 focus:ring-primary/20 transition-all rounded-xl placeholder:text-white/20"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="phone" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Téléphone</Label>
                            <div className="relative group/field">
                              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within/field:text-secondary transition-all duration-300" />
                              <Input
                                id="phone"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="23 456 789"
                                className="pl-10 h-12 bg-white/5 border-white/10 focus:border-secondary/50 focus:ring-secondary/20 transition-all rounded-xl placeholder:text-white/20"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Role Selection Section */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Sélection du Rôle</Label>
                        <Select
                          value={formData.role}
                          onValueChange={(value: "owner" | "worker") =>
                            setFormData({ ...formData, role: value })
                          }
                        >
                          <SelectTrigger className="h-12 bg-white/5 border-white/10 focus:border-primary/50 focus:ring-primary/20 transition-all rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-900/95 border-white/10 backdrop-blur-xl">
                            <SelectItem value="worker" className="focus:bg-primary/20 focus:text-primary transition-colors cursor-pointer">
                              <div className="flex items-center gap-2">
                                <Shield className="w-4 h-4 opacity-50" />
                                <span>Employé (Caissier)</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="owner" className="focus:bg-primary/20 focus:text-primary transition-colors cursor-pointer">
                              <div className="flex items-center gap-2">
                                <Crown className="w-4 h-4 opacity-50" />
                                <span>Propriétaire (Admin)</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Permission Infographic */}
                      <div className="grid grid-cols-1 gap-3">
                        <div className={`p-4 rounded-xl border transition-all duration-500 overflow-hidden relative ${formData.role === 'worker'
                          ? 'bg-secondary/10 border-secondary/30 scale-100 shadow-[0_0_20px_rgba(var(--secondary),0.1)]'
                          : 'bg-white/5 border-white/5 scale-[0.98] opacity-40'
                          }`}>
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${formData.role === 'worker' ? 'bg-secondary/20' : 'bg-white/10'}`}>
                              <Zap className="w-4 h-4 text-secondary" />
                            </div>
                            <div>
                              <p className="font-bold text-sm mb-1">Employé (Standard)</p>
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                Accès aux opérations quotidiennes : sessions, ventes, clients et pointage.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className={`p-4 rounded-xl border transition-all duration-500 overflow-hidden relative ${formData.role === 'owner'
                          ? 'bg-primary/10 border-primary/30 scale-100 shadow-[0_0_20px_rgba(var(--primary),0.1)]'
                          : 'bg-white/5 border-white/5 scale-[0.98] opacity-40'
                          }`}>
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${formData.role === 'owner' ? 'bg-primary/20' : 'bg-white/10'}`}>
                              <ShieldCheck className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <p className="font-bold text-sm mb-1">Propriétaire (Total)</p>
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                Contrôle absolu : configuration du magasin, finances et gestion d'équipe.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      {!editingUser && (
                        <div className="flex items-center space-x-2 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded-xl my-4">
                          <input
                            type="checkbox"
                            id="skipEmail"
                            checked={skipEmail}
                            onChange={(e) => setSkipEmail(e.target.checked)}
                            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary bg-black/50"
                          />
                          <label htmlFor="skipEmail" className="text-xs text-yellow-500 cursor-pointer select-none">
                            Créer sans envoyer d'email (Urgence / Test)
                          </label>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-white/10">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setIsDialogOpen(false)}
                        disabled={isSubmitting}
                        className="hover:bg-white/10 rounded-xl px-6"
                      >
                        Annuler
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className={`rounded-xl px-8 h-11 transition-all duration-300 shadow-lg ${formData.role === 'owner'
                          ? 'bg-primary hover:bg-primary/90 shadow-primary/20'
                          : 'bg-secondary hover:bg-secondary/90 shadow-secondary/20'
                          }`}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            <span>Traitement...</span>
                          </>
                        ) : (
                          <>
                            {editingUser ? (
                              <>
                                <Edit className="w-4 h-4 mr-2" />
                                <span>Mettre à jour</span>
                              </>
                            ) : (
                              <>
                                <Send className="w-4 h-4 mr-2" />
                                <span>Envoyer l'Explosion !</span>
                              </>
                            )}
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Staff Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Crown className="w-8 h-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold text-primary">
                      {staffMembers.filter(s => s.role === 'owner').length}
                    </p>
                    <p className="text-sm text-muted-foreground">Propriétaires</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <User className="w-8 h-8 text-secondary" />
                  <div>
                    <p className="text-2xl font-bold text-secondary">
                      {staffMembers.filter(s => s.role === 'worker').length}
                    </p>
                    <p className="text-sm text-muted-foreground">Employés</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Users className="w-8 h-8 text-accent" />
                  <div>
                    <p className="text-2xl font-bold text-accent">
                      {staffMembers.length}
                    </p>
                    <p className="text-sm text-muted-foreground">Total Personnel</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">
                      {staffMembers.filter(s => s.last_sign_in).length}
                    </p>
                    <p className="text-sm text-muted-foreground">Actifs</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Permissions Info */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Permissions et Rôles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Crown className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-primary">Propriétaire (Owner)</h4>
                      <p className="text-sm text-muted-foreground">Accès complet à toutes les fonctionnalités</p>
                    </div>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-13">
                    <li>• Gestion du personnel</li>
                    <li>• Configuration de la boutique</li>
                    <li>• Gestion des prix et services</li>
                    <li>• Accès aux statistiques complètes</li>
                    <li>• Gestion du blog</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                      <User className="w-5 h-5 text-secondary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-secondary">Employé (Worker)</h4>
                      <p className="text-sm text-muted-foreground">Accès aux opérations quotidiennes</p>
                    </div>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-13">
                    <li>• Gestion des sessions de jeu</li>
                    <li>• Traitement des demandes de service</li>
                    <li>• Gestion des ventes et clients</li>
                    <li>• Pointage des horaires</li>
                    <li>• Accès en lecture aux statistiques</li>
                  </ul>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="text-blue-800 dark:text-blue-200 font-medium mb-1">Considérations importantes</p>
                    <ul className="text-blue-700 dark:text-blue-300 space-y-1 text-xs">
                      <li>• Il doit toujours y avoir au moins un propriétaire dans le système</li>
                      <li>• Les nouveaux membres reçoivent un email d'invitation avec instructions</li>
                      <li>• Les rôles peuvent être modifiés à tout moment par un propriétaire</li>
                      <li>• La suppression d'un membre est irréversible</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Staff List */}
          <div className="space-y-4">
            <h2 className="font-display text-xl font-bold flex items-center gap-2">
              <Users className="w-5 h-5" />
              Membres du Personnel
            </h2>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                  <p className="text-muted-foreground">Chargement des membres du personnel...</p>
                </div>
              </div>
            ) : staffMembers.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-primary/50" />
                </div>
                <h3 className="text-xl font-bold mb-2">Aucun membre du personnel</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Invitez vos premiers employés pour commencer à gérer votre équipe.
                  Ils pourront accéder aux fonctionnalités selon leur rôle.
                </p>
                <Button onClick={() => setIsDialogOpen(true)} size="lg">
                  <Plus className="w-5 h-5 mr-2" />
                  Inviter le premier employé
                </Button>
              </div>
            ) : (
              <div className="grid gap-4">
                {staffMembers.map((member) => (
                  <Card key={member.id} className="glass-card">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                            {member.role === 'owner' ? (
                              <Crown className="w-6 h-6 text-primary" />
                            ) : (
                              <User className="w-6 h-6 text-secondary" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-medium text-sm sm:text-base truncate">{member.email}</h3>
                              {member.id === user?.id && (
                                <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
                                  <User className="w-3 h-3 mr-1" />
                                  C'est vous
                                </Badge>
                              )}
                              {member.is_invited && (
                                <Badge variant="outline" className="text-xs">
                                  <Mail className="w-3 h-3 mr-1" />
                                  Invité
                                </Badge>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <Badge variant={member.role === 'owner' ? 'default' : 'secondary'} className="flex items-center gap-1">
                                {member.role === 'owner' ? (
                                  <>
                                    <Crown className="w-3 h-3" />
                                    Propriétaire
                                  </>
                                ) : (
                                  <>
                                    <User className="w-3 h-3" />
                                    Employé
                                  </>
                                )}
                              </Badge>
                              <span className="text-xs text-muted-foreground hidden sm:inline">
                                Inscrit le {formatDate(member.created_at)}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              {member.last_sign_in ? (
                                <div className="flex items-center gap-1">
                                  <CheckCircle className="w-3 h-3 text-green-500" />
                                  <span>Dernière activité: {formatDate(member.last_sign_in)}</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-orange-500" />
                                  <span>Jamais connecté</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2 ml-4 flex-shrink-0">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingUser(member);
                              setFormData({
                                email: member.email,
                                full_name: member.full_name || "",
                                phone: member.phone || "",
                                role: member.role
                              });
                              setIsDialogOpen(true);
                            }}
                            disabled={isSubmitting}
                            className="hover:bg-blue-50 hover:border-blue-300"
                          >
                            <Edit className="w-4 h-4" />
                            <span className="hidden sm:inline ml-1">Modifier</span>
                          </Button>

                          {/* Don't allow deleting yourself or the last owner */}
                          {canDeleteMember(member) && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(member.id)}
                              disabled={isSubmitting}
                              className="hover:bg-red-50 hover:border-red-300 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span className="hidden sm:inline ml-1">Supprimer</span>
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default StaffManagement;
