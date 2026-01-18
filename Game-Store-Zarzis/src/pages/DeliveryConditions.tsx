import { useLanguage } from "@/contexts/LanguageContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, MapPin, Clock, Package } from "lucide-react";

const DeliveryConditions = () => {
    const { t } = useLanguage();

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 rounded-xl bg-primary/10 text-primary">
                        <Truck className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-display font-bold">Delivery Conditions</h1>
                        <p className="text-muted-foreground">Shipping options, zones, and expected times.</p>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    <Card className="glass-card md:col-span-3">
                        <CardHeader>
                            <CardTitle>Delivery Methods</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4 md:grid-cols-2">
                            <div className="p-4 rounded-lg bg-background/50 border border-border/50 flex items-start gap-4">
                                <MapPin className="w-6 h-6 text-primary mt-1" />
                                <div>
                                    <h3 className="font-bold text-lg mb-1">Local Delivery (Zarzis)</h3>
                                    <p className="text-sm text-muted-foreground mb-2">Fast delivery within Zarzis city limits.</p>
                                    <ul className="text-sm space-y-1">
                                        <li className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                            Cost: <strong>7.000 DT</strong>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                            Time: Same day (if ordered before 16:00)
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            <div className="p-4 rounded-lg bg-background/50 border border-border/50 flex items-start gap-4">
                                <Package className="w-6 h-6 text-primary mt-1" />
                                <div>
                                    <h3 className="font-bold text-lg mb-1">Rapid Post (Tunisia Wide)</h3>
                                    <p className="text-sm text-muted-foreground mb-2">Secure shipping to all 24 governorates.</p>
                                    <ul className="text-sm space-y-1">
                                        <li className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                            Cost: <strong>10.000 DT</strong>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                            Time: 24-48 Hours
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card className="glass-card">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-primary" />
                            Processing Times
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm md:text-base">
                        <p>
                            Orders are verified and processed within <strong>24 hours</strong> of placement (excluding Sundays and holidays).
                            You will receive an updated status via email or phone once your order is prepared.
                        </p>
                        <p className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-600 dark:text-yellow-400 text-sm">
                            <strong>Note:</strong> Orders containing "Digital Products" are delivered instantly via email/SMS after payment confirmation.
                        </p>
                    </CardContent>
                </Card>

                <Card className="glass-card">
                    <CardHeader>
                        <CardTitle>Return Policy</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm text-muted-foreground">
                        <p>
                            We want you to be completely satisfied with your purchase. If you receive a defective or incorrect item,
                            please contact us within <strong>48 hours</strong> of delivery.
                        </p>
                        <ul className="list-disc pl-4 space-y-1">
                            <li>Items must be returned in their original packaging.</li>
                            <li>Software and digital codes are non-refundable once redeemed or revealed.</li>
                            <li>Return shipping costs for non-defective items are the responsibility of the customer.</li>
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default DeliveryConditions;
