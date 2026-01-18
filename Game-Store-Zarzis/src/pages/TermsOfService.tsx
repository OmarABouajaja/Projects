import { useLanguage } from "@/contexts/LanguageContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Shield, Scale, AlertCircle, HelpCircle } from "lucide-react";

const TermsOfService = () => {
    const { t } = useLanguage();

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 rounded-xl bg-primary/10 text-primary">
                        <Scale className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-display font-bold">Terms of Service</h1>
                        <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
                    </div>
                </div>

                <Card className="glass-card">
                    <CardHeader>
                        <CardTitle>Agreement to Terms</CardTitle>
                    </CardHeader>
                    <CardContent className="prose dark:prose-invert max-w-none space-y-4 text-sm md:text-base">
                        <p>
                            By accessing or using the services provided by <strong>Game Store Zarzis</strong> ("we," "us," or "our"),
                            you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
                        </p>
                    </CardContent>
                </Card>

                <div className="grid md:grid-cols-2 gap-6">
                    <Card className="glass-card">
                        <CardHeader className="flex flex-row items-center gap-3">
                            <Shield className="w-5 h-5 text-primary" />
                            <CardTitle className="text-lg">Gaming Lounge Rules</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm space-y-2 text-muted-foreground">
                            <ul className="list-disc pl-4 space-y-2">
                                <li>Respect other players and staff members at all times.</li>
                                <li>Equipment damage caused by misuse will be charged to the client.</li>
                                <li>No food or drink near the gaming consoles.</li>
                                <li>Session time stops only when you notify the staff.</li>
                                <li>We reserve the right to refuse service to anyone violating these rules.</li>
                            </ul>
                        </CardContent>
                    </Card>

                    <Card className="glass-card">
                        <CardHeader className="flex flex-row items-center gap-3">
                            <AlertCircle className="w-5 h-5 text-primary" />
                            <CardTitle className="text-lg">Account & Points</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm space-y-2 text-muted-foreground">
                            <ul className="list-disc pl-4 space-y-2">
                                <li>Loyalty points are non-transferable and have no cash value.</li>
                                <li>We reserve the right to correct point balances in case of system errors.</li>
                                <li>Accounts inactive for more than 12 months may be archived.</li>
                                <li>You are responsible for maintaining the confidentiality of your account details.</li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>

                <Card className="glass-card">
                    <CardHeader>
                        <CardTitle>Services & Repairs</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm md:text-base">
                        <p>
                            <strong>Warranty:</strong> All repairs come with a 30-day warranty covering the specific repair performed and parts replaced.
                            This warranty does not cover physical damage or water damage occurring after the repair.
                        </p>
                        <p>
                            <strong>Data Privacy:</strong> While we take every precaution to protect your data, we recommend backing up your device
                            before submitting it for repair. We are not responsible for data loss.
                        </p>
                        <p>
                            <strong>Unclaimed Devices:</strong> Devices left for more than 90 days after repair completion notification may be
                            disposed of to recover costs.
                        </p>
                    </CardContent>
                </Card>

                <Card className="glass-card">
                    <CardHeader>
                        <CardTitle>Contact Us</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center gap-4">
                        <HelpCircle className="w-10 h-10 text-muted-foreground" />
                        <div>
                            <p>Have questions about these terms?</p>
                            <p className="text-muted-foreground">Visit our store in Zarzis or contact us via phone.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default TermsOfService;
