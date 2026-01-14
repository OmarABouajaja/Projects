import React, { useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Plus, Edit, Trash2, Calendar, Receipt,
    TrendingDown, CreditCard, Wallet, Pencil
} from "lucide-react";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
    DialogFooter, DialogTrigger
} from "@/components/ui/dialog";
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useExpenses, useCreateExpense, useUpdateExpense, useDeleteExpense } from "@/hooks/useExpenses";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const ExpensesManagement = () => {
    const { role, user } = useAuth();
    const { data: expenses, isLoading } = useExpenses();
    const createExpense = useCreateExpense();
    const updateExpense = useUpdateExpense();
    const deleteExpense = useDeleteExpense();
    const { toast } = useToast();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState<any>(null);
    const [formData, setFormData] = useState({
        description: "",
        amount: "",
        category: "daily",
        date: new Date().toISOString().split('T')[0]
    });

    if (role !== "owner") {
        return <div>Access Denied</div>;
    }

    const handleOpenAdd = () => {
        setEditingExpense(null);
        setFormData({
            description: "",
            amount: "",
            category: "daily",
            date: new Date().toISOString().split('T')[0]
        });
        setIsDialogOpen(true);
    };

    const handleOpenEdit = (expense: any) => {
        setEditingExpense(expense);
        setFormData({
            description: expense.description,
            amount: expense.amount.toString(),
            category: expense.category,
            date: expense.date
        });
        setIsDialogOpen(true);
    };

    const handleSubmit = async () => {
        if (!formData.description || !formData.amount) {
            toast({ title: "Validation Error", description: "Please fill all fields", variant: "destructive" });
            return;
        }

        try {
            const payload = {
                description: formData.description,
                amount: parseFloat(formData.amount),
                category: formData.category as any,
                date: formData.date,
                staff_id: user?.id || ""
            };

            if (editingExpense) {
                await updateExpense.mutateAsync({ id: editingExpense.id, ...payload });
                toast({ title: "✅ Success", description: "Expense updated" });
            } else {
                await createExpense.mutateAsync(payload);
                toast({ title: "✅ Success", description: "Expense added" });
            }
            setIsDialogOpen(false);
        } catch (error) {
            toast({ title: "❌ Error", description: "Operation failed", variant: "destructive" });
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this expense?")) {
            await deleteExpense.mutateAsync(id);
            toast({ title: "✅ Deleted", description: "Expense removed" });
        }
    };

    const [activeTab, setActiveTab] = useState("daily");

    // Filter Logic
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const filteredExpenses = expenses?.filter(e => {
        const d = new Date(e.date);

        // Basic Type Check
        if (activeTab === 'daily') {
            // For daily, show current month's daily expenses
            return e.category === 'daily' && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        }
        if (activeTab === 'monthly') {
            // For monthly, show current year's monthly expenses (or all?) - let's show all for now or current month?
            // "Monthly" usually means recurring, so showing active ones or history. 
            // Let's show filtered by category.
            return e.category === 'monthly';
        }
        if (activeTab === 'yearly') {
            return e.category === 'yearly' && d.getFullYear() === currentYear;
        }
        return true;
    }) || [];

    // Calculations
    const allCurrentMonth = expenses?.filter(e => {
        const d = new Date(e.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }) || [];

    const totalDaily = allCurrentMonth.filter(e => e.category === 'daily').reduce((sum, e) => sum + e.amount, 0);
    const totalMonthly = allCurrentMonth.filter(e => e.category === 'monthly').reduce((sum, e) => sum + e.amount, 0);

    // Yearly calculation (Total of all expenses this year)
    const allCurrentYear = expenses?.filter(e => {
        const d = new Date(e.date);
        return d.getFullYear() === currentYear;
    }) || [];
    const totalYearly = allCurrentYear.reduce((sum, e) => sum + e.amount, 0);

    return (
        <ProtectedRoute>
            <DashboardLayout>
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="font-display text-3xl font-bold mb-2">Charges & Expenses</h1>
                            <p className="text-muted-foreground">Manage operating costs. View: {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</p>
                        </div>
                        <Button onClick={handleOpenAdd} className="gap-2">
                            <Plus className="w-4 h-4" /> Add Expense
                        </Button>
                    </div>

                    {/* Summary Cards - Dynamic based on active tab or global */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="glass-card border-l-4 border-l-red-500">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-red-100 rounded-full">
                                        <Wallet className="w-6 h-6 text-red-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Daily (This Month)</p>
                                        <p className="text-2xl font-bold">{totalDaily.toFixed(3)} DT</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="glass-card border-l-4 border-l-orange-500">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-orange-100 rounded-full">
                                        <CreditCard className="w-6 h-6 text-orange-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Monthly Fixed</p>
                                        <p className="text-2xl font-bold">{totalMonthly.toFixed(3)} DT</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="glass-card border-l-4 border-l-primary">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-primary/10 rounded-full">
                                        <TrendingDown className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Total Yearly (Pro)</p>
                                        <p className="text-2xl font-bold">{totalYearly.toFixed(3)} DT</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="glass-card">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <Receipt className="w-5 h-5 text-primary" />
                                    Expense List
                                </CardTitle>
                                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-[400px]">
                                    <TabsList className="grid w-full grid-cols-3">
                                        <TabsTrigger value="daily">Daily</TabsTrigger>
                                        <TabsTrigger value="monthly">Monthly</TabsTrigger>
                                        <TabsTrigger value="yearly">Yearly</TabsTrigger>
                                    </TabsList>
                                </Tabs>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {isLoading ? (
                                    <div className="py-8 text-center text-muted-foreground text-sm">Loading expenses...</div>
                                ) : filteredExpenses && filteredExpenses.length > 0 ? (
                                    <div className="grid grid-cols-1 gap-4">
                                        {filteredExpenses.map((expense) => (
                                            <div key={expense.id} className="flex items-center justify-between p-4 rounded-lg bg-black/20 border border-white/5 hover:bg-black/40 transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className={`p-2 rounded-lg ${expense.category === 'yearly' ? 'bg-purple-500/20 text-purple-500' :
                                                        expense.category === 'monthly' ? 'bg-orange-500/20 text-orange-500' :
                                                            'bg-red-500/20 text-red-500'}`}>
                                                        <Calendar className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{expense.description}</p>
                                                        <div className="flex items-center gap-3 mt-1">
                                                            <span className="text-xs text-muted-foreground">{expense.date}</span>
                                                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full uppercase font-bold border ${expense.category === 'yearly' ? 'border-purple-500/30 text-purple-500' :
                                                                expense.category === 'monthly' ? 'border-orange-500/30 text-orange-500' :
                                                                    'border-red-500/30 text-red-500'
                                                                }`}>
                                                                {expense.category}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className="text-lg font-bold text-red-500">-{expense.amount.toFixed(3)} DT</span>
                                                    <div className="flex items-center gap-1">
                                                        <Button size="sm" variant="ghost" onClick={() => handleOpenEdit(expense)}>
                                                            <Pencil className="w-3 h-3" />
                                                        </Button>
                                                        <Button size="sm" variant="ghost" onClick={() => handleDelete(expense.id)} className="text-red-500 hover:text-red-400">
                                                            <Trash2 className="w-3 h-3" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-12 text-center">
                                        <Receipt className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-20" />
                                        <p className="text-muted-foreground text-sm">No expenses found for this category.</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingExpense ? "Edit Expense" : "Add New Expense"}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-2">
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Input
                                    placeholder="e.g., Monthly Rent, Electricity, Repair Parts"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Amount (DT)</Label>
                                    <Input
                                        type="number"
                                        step="0.5"
                                        value={formData.amount}
                                        onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Category</Label>
                                    <Select value={formData.category} onValueChange={v => setFormData({ ...formData, category: v })}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="daily">Daily / Regular</SelectItem>
                                            <SelectItem value="monthly">Monthly Fixed</SelectItem>
                                            <SelectItem value="yearly">Yearly</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Date</Label>
                                <Input
                                    type="date"
                                    value={formData.date}
                                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleSubmit}>Save Expense</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </DashboardLayout>
        </ProtectedRoute>
    );
};

export default ExpensesManagement;
