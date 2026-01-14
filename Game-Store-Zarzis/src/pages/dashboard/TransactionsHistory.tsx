import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Trash2, Search, ArrowLeft, ArrowRight, FileText, User, Calendar } from "lucide-react";
import { format } from "date-fns";
import { HelpTooltip } from "@/components/ui/help-tooltip";

const TransactionsHistory = () => {
    const { isOwner } = useAuth();
    const [sales, setSales] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const PAGE_SIZE = 10;

    const fetchSales = async () => {
        setIsLoading(true);
        try {
            // Base query
            let query = supabase
                .from('sales')
                .select(`
          *,
          client:client_id(name, phone),
          staff:staff_id(full_name),
          product:product_id(name, name_fr)
        `, { count: 'exact' });

            // Apply Search (Product Name or Client Name)
            // Note: Deep filtering in Supabase is tricky, so we limit search to simplified fields for now
            // or rely on client-side filtering if dataset small, but for history pagination we need server side.
            // Search is hard with foreign keys. Let's filter by notes or amount if simple.
            // For now, let's keep it simple: filter by ID or notes? 
            // User asked for "inspect", listing is key. Search is bonus.

            // Pagination
            query = query
                .order('created_at', { ascending: false })
                .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

            const { data, error, count } = await query;

            if (error) throw error;

            setSales(data || []);
            if (count !== null) {
                setTotalCount(count);
                setTotalPages(Math.ceil(count / PAGE_SIZE));
            }
        } catch (err: any) {
            console.error("Error fetching transactions:", err);
            toast({ title: "Error fetching data", description: err.message, variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSales();
    }, [page]);

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            const { error } = await supabase.from('sales').delete().eq('id', deleteId);
            if (error) throw error;
            toast({ title: "Transaction deleted" });
            fetchSales(); // Refresh
            setDeleteId(null);
        } catch (err: any) {
            toast({ title: "Delete failed", description: err.message, variant: "destructive" });
        }
    };

    // Only owners should see this, but ProtectedRoute + Layout logic handles sidebar visibility.
    // We can add extra check if needed.
    if (!isOwner) {
        return (
            <ProtectedRoute>
                <DashboardLayout>
                    <div className="flex h-[50vh] items-center justify-center text-muted-foreground">
                        Access Denied. Owner only.
                    </div>
                </DashboardLayout>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <DashboardLayout>
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="font-display text-3xl font-bold mb-2">Transactions History</h1>
                            <p className="text-muted-foreground">Review and manage past sales records</p>
                        </div>
                        <HelpTooltip content="Full history of sales. You can delete incorrect entries here." />
                    </div>

                    <Card className="glass-card">
                        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="w-5 h-5 text-primary" />
                                Sales Records
                            </CardTitle>
                            <div className="flex items-center gap-2 bg-muted/50 p-2 rounded-lg text-sm text-muted-foreground">
                                <span className="font-semibold">{totalCount}</span> total transactions
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Product</TableHead>
                                            <TableHead>Client</TableHead>
                                            <TableHead>Staff</TableHead>
                                            <TableHead>Amount</TableHead>
                                            <TableHead>Method</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {isLoading ? (
                                            [...Array(5)].map((_, i) => (
                                                <TableRow key={i}>
                                                    <TableCell colSpan={7} className="h-12 animate-pulse bg-muted/20" />
                                                </TableRow>
                                            ))
                                        ) : sales.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                                    No transactions found.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            sales.map((sale) => (
                                                <TableRow key={sale.id}>
                                                    <TableCell className="font-medium whitespace-nowrap">
                                                        <div className="flex flex-col">
                                                            <span>{format(new Date(sale.created_at), 'MMM d, yyyy')}</span>
                                                            <span className="text-xs text-muted-foreground">
                                                                {format(new Date(sale.created_at), 'HH:mm')}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div>
                                                            <p className="font-medium">{sale.product?.name_fr || 'Unknown Product'}</p>
                                                            <p className="text-xs text-muted-foreground">Qty: {sale.quantity}</p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {sale.client ? (
                                                            <div className="flex items-center gap-1">
                                                                <User className="w-3 h-3 text-muted-foreground" />
                                                                <span>{sale.client.name}</span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-muted-foreground text-xs">-</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="text-xs px-2 py-1 rounded bg-secondary/10 text-secondary border border-secondary/20">
                                                            {sale.staff?.full_name || 'Unknown'}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="font-bold text-primary">
                                                            {Number(sale.total_amount).toFixed(3)} DT
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className="capitalize">
                                                            {sale.payment_method}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                            onClick={() => setDeleteId(sale.id)}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Pagination Controls */}
                            <div className="flex items-center justify-between mt-4">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(p => Math.max(0, p - 1))}
                                    disabled={page === 0 || isLoading}
                                >
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Previous
                                </Button>
                                <div className="text-sm text-muted-foreground">
                                    Page {page + 1} of {totalPages || 1}
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                                    disabled={page >= totalPages - 1 || isLoading}
                                >
                                    Next
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Delete Confirmation */}
                    <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Delete Transaction?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently remove the sale record from the database.
                                    Note: This does NOT revert stock changes or points automatically.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                    Delete
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>

                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
};

export default TransactionsHistory;
