import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Gamepad2, Mail, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";
import PSBackground from "@/components/PSBackground";

// API URL - ensure https:// prefix
const rawApiUrl = import.meta.env.VITE_API_URL || 'https://bck.gamestorezarzis.com.tn';
const API_BASE_URL = rawApiUrl.startsWith('http') ? rawApiUrl : `https://${rawApiUrl}`;

// Get current language from localStorage
const getLanguage = (): 'fr' | 'en' | 'ar' => {
    const stored = localStorage.getItem('language');
    if (stored === 'en' || stored === 'ar') return stored;
    return 'fr';
};

const translations = {
    fr: {
        title: "Réinitialiser le Mot de Passe",
        subtitle: "Entrez votre email pour recevoir les instructions de récupération",
        emailLabel: "Adresse Email",
        emailPlaceholder: "nom@exemple.com",
        sendButton: "Envoyer le Lien",
        sendingButton: "Envoi en cours...",
        backToLogin: "Retour à la Connexion",
        successTitle: "Vérifiez votre email",
        successMessage: "Nous avons envoyé les instructions de récupération à",
        errorSending: "Erreur lors de l'envoi de l'email de récupération",
        errorGeneric: "Une erreur s'est produite. Veuillez réessayer.",
    },
    en: {
        title: "Reset Password",
        subtitle: "Enter your email to receive recovery instructions",
        emailLabel: "Email Address",
        emailPlaceholder: "name@example.com",
        sendButton: "Send Reset Link",
        sendingButton: "Sending Link...",
        backToLogin: "Back to Login",
        successTitle: "Check your email",
        successMessage: "We have sent password recovery instructions to",
        errorSending: "Error sending recovery email",
        errorGeneric: "An error occurred. Please try again.",
    },
    ar: {
        title: "إعادة تعيين كلمة المرور",
        subtitle: "أدخل بريدك الإلكتروني لتلقي تعليمات الاسترداد",
        emailLabel: "عنوان البريد الإلكتروني",
        emailPlaceholder: "الاسم@مثال.com",
        sendButton: "إرسال رابط إعادة التعيين",
        sendingButton: "جاري الإرسال...",
        backToLogin: "العودة إلى تسجيل الدخول",
        successTitle: "تحقق من بريدك الإلكتروني",
        successMessage: "لقد أرسلنا تعليمات استرداد كلمة المرور إلى",
        errorSending: "خطأ في إرسال البريد الإلكتروني للاسترداد",
        errorGeneric: "حدث خطأ. يرجى المحاولة مرة أخرى.",
    }
};

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);
    const [error, setError] = useState("");

    const lang = getLanguage();
    const t = translations[lang];
    const isRTL = lang === 'ar';

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            // Try backend API first (uses MailerSend)
            const response = await fetch(`${API_BASE_URL}/email/password-reset`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, lang }),
            });

            if (response.ok) {
                setIsSent(true);
                return;
            }

            // If backend fails, try Supabase as fallback
            console.warn('Backend API failed, trying Supabase fallback...');
            const { error: supabaseError } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });

            if (supabaseError) {
                throw supabaseError;
            }

            setIsSent(true);
        } catch (err: any) {
            console.error('Password reset error:', err);
            setError(err.message || t.errorGeneric);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={`min-h-screen bg-background relative flex items-center justify-center p-4 ${isRTL ? 'rtl' : 'ltr'}`}>
            <PSBackground />

            <div className="relative z-10 w-full max-w-md">
                <div className="glass-card rounded-2xl p-8 neon-border">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-primary/20 mb-4">
                            <Gamepad2 className="w-8 h-8 text-primary" />
                        </div>
                        <h1 className="font-display text-2xl font-bold mb-2">{t.title}</h1>
                        <p className="text-muted-foreground text-sm">
                            {t.subtitle}
                        </p>
                    </div>

                    {isSent ? (
                        <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-4">
                            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto text-green-500">
                                <CheckCircle className="w-8 h-8" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="font-semibold text-lg">{t.successTitle}</h3>
                                <p className="text-muted-foreground">
                                    {t.successMessage} <strong>{email}</strong>
                                </p>
                            </div>
                            <Link to="/management-gs-zarzis">
                                <Button variant="outline" className="w-full">
                                    {t.backToLogin}
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleReset} className="space-y-4">
                            {error && (
                                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center flex items-center justify-center gap-2">
                                    <AlertCircle className="w-4 h-4" />
                                    {error}
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="email">{t.emailLabel}</Label>
                                <div className="relative">
                                    <Mail className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground`} />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder={t.emailPlaceholder}
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className={isRTL ? 'pr-10' : 'pl-10'}
                                        required
                                        dir={isRTL ? 'rtl' : 'ltr'}
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                variant="hero"
                                className="w-full"
                                disabled={isLoading}
                            >
                                {isLoading ? t.sendingButton : t.sendButton}
                            </Button>

                            <div className="mt-4 text-center">
                                <Link
                                    to="/management-gs-zarzis"
                                    className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
                                >
                                    <ArrowLeft className={`w-4 h-4 ${isRTL ? 'ml-1 rotate-180' : 'mr-1'}`} />
                                    {t.backToLogin}
                                </Link>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
