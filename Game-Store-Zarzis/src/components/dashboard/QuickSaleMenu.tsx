/**
 * QuickSaleMenu - Fast café/snacks POS interface
 * 
 * Accessible from Gaming Sessions page for quick in-store sales.
 * Shows consumable products grouped by category (Drinks, Snacks, Café)
 * with one-click add-to-cart functionality.
 * 
 * @component
 */

import { useState } from 'react';
import { useConsumablesByCategory } from '@/hooks/useConsumables';
import { useCreateSale } from '@/hooks/useSales';
import { useCreatePointsTransaction } from '@/hooks/usePointsTransactions';
import { useAuth } from '@/contexts/AuthContext';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Coffee, Trash2, ShoppingCart, Plus, Minus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import type { Product } from '@/types';

interface QuickSaleMenuProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    clientId?: string | null; // Optional: Link sale to client
}

interface CartItem {
    product: Product;
    quantity: number;
}

export const QuickSaleMenu = ({ isOpen, onOpenChange, clientId }: QuickSaleMenuProps) => {
    const { user } = useAuth();
    const { data: groupedConsumables, isLoading } = useConsumablesByCategory();
    const createSale = useCreateSale();
    const createPointsTransaction = useCreatePointsTransaction();

    const [cart, setCart] = useState<CartItem[]>([]);

    // ==========================================
    // 🛒 CART MANAGEMENT
    // ==========================================

    const addToCart = (product: Product) => {
        setCart((prevCart) => {
            const existingItem = prevCart.find((item) => item.product.id === product.id);
            if (existingItem) {
                return prevCart.map((item) =>
                    item.product.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prevCart, { product, quantity: 1 }];
        });
    };

    const removeFromCart = (productId: string) => {
        setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
    };

    const updateQuantity = (productId: string, delta: number) => {
        setCart((prevCart) =>
            prevCart
                .map((item) =>
                    item.product.id === productId
                        ? { ...item, quantity: Math.max(0, item.quantity + delta) }
                        : item
                )
                .filter((item) => item.quantity > 0)
        );
    };

    const clearCart = () => {
        setCart([]);
    };

    const getTotalAmount = () => {
        return cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    };

    const getTotalItems = () => {
        return cart.reduce((sum, item) => sum + item.quantity, 0);
    };

    // ==========================================
    // 💰 COMPLETE SALE
    // ==========================================

    const handleCompleteSale = async () => {
        if (cart.length === 0) {
            toast({
                title: 'Cart Empty',
                description: 'Add items before completing sale',
                variant: 'destructive',
            });
            return;
        }

        try {
            // Process each item as a separate sale (or combine if you prefer)
            // For simplicity, we'll create one sale per item
            for (const item of cart) {
                await createSale.mutateAsync({
                    product_id: item.product.id,
                    quantity: item.quantity,
                    unit_price: item.product.price,
                    total_amount: item.product.price * item.quantity,
                    payment_method: 'cash',
                    points_used: 0,
                    points_earned: (item.product.points_earned || 0) * item.quantity,
                    client_id: clientId || null,
                    staff_id: user?.id || null,
                    notes: null,
                });

                // Award points if client is associated
                if (clientId && item.product.points_earned > 0) {
                    await createPointsTransaction.mutateAsync({
                        client_id: clientId,
                        transaction_type: "earned",
                        amount: (item.product.points_earned || 0) * item.quantity,
                        description: `Quick Sale: ${item.product.name} x${item.quantity}`,
                        reference_type: "sale",
                        staff_id: user?.id || null,
                    });
                }
            }

            toast({
                title: 'Sale Complete!',
                description: `Sold ${getTotalItems()} item(s) for ${getTotalAmount().toFixed(3)} DT`,
            });

            clearCart();
            onOpenChange(false);
        } catch (error: any) {
            toast({
                title: 'Sale Failed',
                description: error.message || 'Could not complete sale',
                variant: 'destructive',
            });
        }
    };

    const categories = Object.keys(groupedConsumables || {}).sort();

    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent className="glass-modal border-white/10 w-[95vw] sm:w-[600px] overflow-y-auto">
                <SheetHeader className="mb-6">
                    <SheetTitle className="flex items-center gap-2 text-2xl">
                        <Coffee className="w-6 h-6 text-primary" />
                        Café Menu - Quick Sale
                    </SheetTitle>
                    <SheetDescription>
                        Select snacks and drinks for in-store purchase
                    </SheetDescription>
                </SheetHeader>

                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : categories.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        <Coffee className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p>No consumables available</p>
                        <p className="text-xs mt-2">Add products with type "Consumable" in Product Management</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Category Tabs */}
                        <Tabs defaultValue={categories[0]} className="w-full">
                            <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${Math.min(categories.length, 4)}, 1fr)` }}>
                                {categories.map((category) => (
                                    <TabsTrigger key={category} value={category} className="text-xs sm:text-sm">
                                        {category}
                                    </TabsTrigger>
                                ))}
                            </TabsList>

                            {categories.map((category) => (
                                <TabsContent key={category} value={category} className="space-y-3 mt-4">
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {groupedConsumables?.[category]?.map((product) => (
                                            <Card
                                                key={product.id}
                                                className="glass-card hover:border-primary/50 cursor-pointer transition-all group"
                                                onClick={() => addToCart(product)}
                                            >
                                                <CardContent className="p-3">
                                                    <div className="text-center space-y-2">
                                                        {/* Product Icon/Image */}
                                                        <div className="w-12 h-12 mx-auto rounded-full bg-primary/20 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                                                            {product.image_url ? (
                                                                <img src={product.image_url} alt={product.name} className="w-full h-full object-cover rounded-full" />
                                                            ) : (
                                                                <span>
                                                                    {category === 'Drinks' ? '🥤' : category === 'Snacks' ? '🍿' : category === 'Café' ? '☕' : category === 'Desserts' ? '🍰' : '🍔'}
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* Product Name */}
                                                        <p className="font-bold text-sm leading-tight">{product.name}</p>

                                                        {/* Price */}
                                                        <p className="text-primary font-bold">{product.price.toFixed(3)} DT</p>

                                                        {/* Stock Badge */}
                                                        {(product.stock_quantity || product.stock || 0) === 0 ? (
                                                            <Badge variant="destructive" className="text-[10px]">Out of Stock</Badge>
                                                        ) : (product.stock_quantity || product.stock || 0) <= (product.low_stock_threshold || 5) ? (
                                                            <Badge variant="outline" className="text-[10px] bg-yellow-500/20">Low: {product.stock_quantity || product.stock}</Badge>
                                                        ) : (
                                                            <Badge variant="outline" className="text-[10px]">{product.stock_quantity || product.stock} in stock</Badge>
                                                        )}

                                                        {/* Add Button */}
                                                        <Button
                                                            size="sm"
                                                            variant="default"
                                                            className="w-full h-8 text-xs"
                                                            disabled={(product.stock_quantity || product.stock || 0) === 0}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                addToCart(product);
                                                            }}
                                                        >
                                                            <Plus className="w-3 h-3 mr-1" />
                                                            Add
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </TabsContent>
                            ))}
                        </Tabs>

                        {/* Cart Summary */}
                        <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t border-white/10 pt-4 -mx-6 px-6 pb-2">
                            <div className="space-y-3">
                                {/* Cart Items */}
                                {cart.length > 0 && (
                                    <div className="max-h-32 overflow-y-auto space-y-2">
                                        {cart.map((item) => (
                                            <div key={item.product.id} className="flex items-center justify-between text-sm bg-muted/30 p-2 rounded">
                                                <span className="font-medium truncate flex-1">{item.product.name}</span>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-6 w-6"
                                                        onClick={() => updateQuantity(item.product.id, -1)}
                                                    >
                                                        <Minus className="w-3 h-3" />
                                                    </Button>
                                                    <span className="w-6 text-center font-bold">{item.quantity}</span>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-6 w-6"
                                                        onClick={() => updateQuantity(item.product.id, +1)}
                                                    >
                                                        <Plus className="w-3 h-3" />
                                                    </Button>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-6 w-6 text-destructive"
                                                        onClick={() => removeFromCart(item.product.id)}
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Total & Actions */}
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">{getTotalItems()} item(s)</p>
                                        <p className="text-2xl font-bold text-primary">{getTotalAmount().toFixed(3)} DT</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            onClick={clearCart}
                                            disabled={cart.length === 0}
                                            className="h-12"
                                        >
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Clear
                                        </Button>
                                        <Button
                                            variant="default"
                                            onClick={handleCompleteSale}
                                            disabled={cart.length === 0}
                                            className="h-12 bg-primary hover:bg-primary/90"
                                        >
                                            <ShoppingCart className="w-4 h-4 mr-2" />
                                            Complete Sale
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
};
