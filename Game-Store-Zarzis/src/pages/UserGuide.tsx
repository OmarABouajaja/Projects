import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import Navbar from "@/components/Navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Book, Shield, Monitor, Gamepad2, Users, DollarSign, Settings, Bell } from "lucide-react";

// User Guide Content
const guideContent = {
    fr: {
        title: "Guide Utilisateur Complet",
        sections: {
            dashboard: "Tableau de Bord",
            sessions: "Gestion des Sessions",
            sales: "Ventes & Caisse",
            staff: "Gestion du Personnel",
            security: "Sécurité & Appareils"
        },
        content: {
            dashboard: [
                {
                    title: "Vue d'ensemble",
                    text: "Le tableau de bord est votre centre de commandement. Il affiche les indicateurs clés en temps réel (revenus, sessions actives, alertes de stock)."
                },
                {
                    title: "Changement de Langue",
                    text: "Utilisez le sélecteur dans la barre de navigation pour basculer entre Français, Anglais et Arabe. L'interface s'adapte automatiquement (LTR/RTL)."
                }
            ],
            sessions: [
                {
                    title: "Lancer une Session",
                    text: "Cliquez sur 'Sessions' > 'Nouvelle Session'. Sélectionnez la console et le client. Le chronomètre démarre automatiquement."
                },
                {
                    title: "Programme Jeu Gratuit",
                    text: "Le système suit automatiquement les parties. Après X parties (configurable), un indicateur 'Jeu Gratuit' apparaît."
                }
            ],
            security: [
                {
                    title: "Poste de Travail (Work Station)",
                    text: "Pour la sécurité, l'option 'Autorisation Poste de Travail' dans les Paramètres permet de désigner ce PC comme poste principal. Cela active le pointage automatique."
                }
            ]
        }
    },
    en: {
        title: "Complete User Guide",
        sections: {
            dashboard: "Dashboard",
            sessions: "Session Management",
            sales: "Sales & Cashier",
            staff: "Staff Management",
            security: "Security & Devices"
        },
        content: {
            dashboard: [
                {
                    title: "Overview",
                    text: "The dashboard is your command center. It displays key real-time metrics (revenue, active sessions, stock alerts)."
                },
                {
                    title: "Changing Language",
                    text: "Use the selector in the navbar to switch between French, English, and Arabic. The interface adapts automatically (LTR/RTL)."
                }
            ],
            sessions: [
                {
                    title: "Starting a Session",
                    text: "Click 'Sessions' > 'New Session'. Select the console and client. The timer starts automatically."
                },
                {
                    title: "Free Game Program",
                    text: "The system automatically tracks games. After X games (configurable), a 'Free Game' indicator appears."
                }
            ],
            security: [
                {
                    title: "Work Station Authorization",
                    text: "For security, the 'Work Station Authorization' option in Settings allows designating this PC as a main station. This enables automatic clock-in."
                }
            ]
        }
    },
    ar: {
        title: "دليل المستخدم الشامل",
        sections: {
            dashboard: "لوحة التحكم",
            sessions: "إدارة الجلسات",
            sales: "المبيعات والكاشير",
            staff: "إدارة الموظفين",
            security: "الأمان والأجهزة"
        },
        content: {
            dashboard: [
                {
                    title: "نظرة عامة",
                    text: "لوحة التحكم هي مركز القيادة الخاص بك. تعرض المؤشرات الرئيسية في الوقت الفعلي (الإيرادات، الجلسات النشطة، تنبيهات المخزون)."
                },
                {
                    title: "تغيير اللغة",
                    text: "استخدم المحدد في شريط التنقل للتبديل بين الفرنسية، الإنجليزية والعربية. تتكيف الواجهة تلقائيًا (يمين لليسار)."
                }
            ],
            sessions: [
                {
                    title: "بدء جلسة",
                    text: "انقر فوق 'جلسات' > 'جلسة جديدة'. اختر الجهاز والعميل. يبدأ المؤقت تلقائيًا."
                },
                {
                    title: "برنامج اللعبة المجانية",
                    text: "يتتبع النظام الألعاب تلقائيًا. بعد عدد X من الألعاب (قابل للتكوين)، يظهر مؤشر 'لعبة مجانية'."
                }
            ],
            security: [
                {
                    title: "تصريح محطة العمل",
                    text: "للأمان، يسمح خيار 'تصريح محطة العمل' في الإعدادات بتعيين هذا الكمبيوتر كمحطة رئيسية. هذا يفعل تسجيل الدخول التلقائي."
                }
            ]
        }
    }
};

const UserGuide = () => {
    const { language, dir } = useLanguage();
    const content = guideContent[language] || guideContent.fr;
    const isRTL = dir === 'rtl';

    return (
        <div className="min-h-screen bg-background pb-20">
            <Navbar />

            <div className="max-w-4xl mx-auto px-4 py-8 pt-24">
                <div className="flex items-center gap-3 mb-8">
                    <Book className="w-8 h-8 text-primary" />
                    <h1 className="text-3xl font-bold font-display">{content.title}</h1>
                </div>

                <Tabs defaultValue="dashboard" className="w-full">
                    <TabsList className="flex flex-wrap h-auto p-1 bg-muted/50 mb-6">
                        <TabsTrigger value="dashboard" className="gap-2"><Monitor className="w-4 h-4" /> {content.sections.dashboard}</TabsTrigger>
                        <TabsTrigger value="sessions" className="gap-2"><Gamepad2 className="w-4 h-4" /> {content.sections.sessions}</TabsTrigger>
                        <TabsTrigger value="security" className="gap-2"><Shield className="w-4 h-4" /> {content.sections.security}</TabsTrigger>
                    </TabsList>

                    <ScrollArea className="h-[600px] rounded-md border p-4 bg-card/50 backdrop-blur-sm">

                        <TabsContent value="dashboard" className="mt-0 space-y-4">
                            {content.content.dashboard.map((item, idx) => (
                                <Card key={idx} className="glass-card">
                                    <CardHeader>
                                        <CardTitle className="text-lg text-primary">{item.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-muted-foreground">{item.text}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </TabsContent>

                        <TabsContent value="sessions" className="mt-0 space-y-4">
                            {content.content.sessions.map((item, idx) => (
                                <Card key={idx} className="glass-card border-l-4 border-l-green-500">
                                    <CardHeader>
                                        <CardTitle className="text-lg text-green-600 dark:text-green-400">{item.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-muted-foreground">{item.text}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </TabsContent>

                        <TabsContent value="security" className="mt-0 space-y-4">
                            {content.content.security.map((item, idx) => (
                                <Card key={idx} className="glass-card border-l-4 border-l-purple-500">
                                    <CardHeader>
                                        <CardTitle className="text-lg text-purple-600 dark:text-purple-400">{item.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-muted-foreground">{item.text}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </TabsContent>

                    </ScrollArea>
                </Tabs>
            </div>
        </div>
    );
};

export default UserGuide;
