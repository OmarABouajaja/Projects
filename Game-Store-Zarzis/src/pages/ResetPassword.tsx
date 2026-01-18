import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Gamepad2, Lock, Eye, EyeOff, CheckCircle, AlertCircle, ArrowLeft, XCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import PSBackground from "@/components/PSBackground";

// Get current language from localStorage
const getLanguage = (): 'fr' | 'en' | 'ar' => {
    const stored = localStorage.getItem('language');
    if (stored === 'en' || stored === 'ar') return stored;
    return 'fr';
};

const translations = {
    fr: {
        title: "Définir un Nouveau Mot de Passe",
        subtitle: "Créez un nouveau mot de passe sécurisé pour votre compte",
        newPassword: "Nouveau Mot de Passe",
        confirmPassword: "Confirmer le Mot de Passe",
        minChars: "Min. 6 caractères",
        reenter: "Retapez le mot de passe",
        updateButton: "Mettre à Jour",
        updating: "Mise à jour...",
        successTitle: "Succès !",
        successMessage: "Votre mot de passe a été mis à jour. Redirection vers la connexion...",
        loginNow: "Se Connecter Maintenant",
        errorMismatch: "Les mots de passe ne correspondent pas",
        errorMinLength: "Le mot de passe doit contenir au moins 6 caractères",
        errorGeneric: "Échec de la mise à jour du mot de passe",
        errorExpiredTitle: "Lien Expiré ou Invalide",
        errorExpiredMessage: "Ce lien de réinitialisation a expiré ou est invalide. Veuillez demander un nouveau lien.",
        requestNewLink: "Demander un Nouveau Lien",
        backToLogin: "Retour à la Connexion",
    },
    en: {
        title: "Set New Password",
        subtitle: "Create a new secure password for your account",
        newPassword: "New Password",
        confirmPassword: "Confirm Password",
        minChars: "Min. 6 characters",
        reenter: "Re-enter password",
        updateButton: "Update Password",
        updating: "Updating...",
        successTitle: "Success!",
        successMessage: "Your password has been updated. Redirecting to login...",
        loginNow: "Login Now",
        errorMismatch: "Passwords do not match",
        errorMinLength: "Password must be at least 6 characters",
        errorGeneric: "Failed to update password",
        errorExpiredTitle: "Link Expired or Invalid",
        errorExpiredMessage: "This reset link has expired or is invalid. Please request a new link.",
        requestNewLink: "Request New Link",
        backToLogin: "Back to Login",
    },
    ar: {
        title: "تعيين كلمة مرور جديدة",
        subtitle: "إنشاء كلمة مرور جديدة وآمنة لحسابك",
        newPassword: "كلمة المرور الجديدة",
        confirmPassword: "تأكيد كلمة المرور",
        minChars: "الحد الأدنى 6 أحرف",
        reenter: "أعد إدخال كلمة المرور",
        updateButton: "تحديث كلمة المرور",
        updating: "جاري التحديث...",
        successTitle: "تم بنجاح!",
        successMessage: "تم تحديث كلمة المرور الخاصة بك. جاري إعادة التوجيه إلى تسجيل الدخول...",
        loginNow: "تسجيل الدخول الآن",
        errorMismatch: "كلمات المرور غير متطابقة",
        errorMinLength: "يجب أن تحتوي كلمة المرور على 6 أحرف على الأقل",
        errorGeneric: "فشل تحديث كلمة المرور",
        errorExpiredTitle: "الرابط منتهي الصلاحية أو غير صالح",
        errorExpiredMessage: "انتهت صلاحية رابط إعادة التعيين هذا أو أنه غير صالح. يرجى طلب رابط جديد.",
        requestNewLink: "طلب رابط جديد",
        backToLogin: "العودة إلى تسجيل الدخول",
    }
};

const ResetPassword = () => {
    const navigate = useNavigate();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [linkError, setLinkError] = useState<string | null>(null);

    const lang = getLanguage();
    const t = translations[lang];
    const isRTL = lang === 'ar';

    useEffect(() => {
        // Check for error in URL hash (Supabase returns errors this way)
        const hash = window.location.hash;

        if (hash) {
            const params = new URLSearchParams(hash.substring(1));
            const errorCode = params.get('error_code');
            const errorDescription = params.get('error_description');

            if (errorCode || params.get('error')) {
                console.error('Reset password error:', errorCode, errorDescription);
                setLinkError(errorDescription?.replace(/\+/g, ' ') || 'Link expired or invalid');
                return;
            }

            // Check if we have a valid recovery token
            const accessToken = params.get('access_token');
            const type = params.get('type');

            if (type === 'recovery' && accessToken) {
                // Set the session from the recovery token
                supabase.auth.setSession({
                    access_token: accessToken,
                    refresh_token: params.get('refresh_token') || '',
                }).then(({ error }) => {
                    if (error) {
                        console.error('Session error:', error);
                        setLinkError(error.message);
                    }
                });
            }
        }
    }, []);

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError(t.errorMismatch);
            return;
        }

        if (password.length < 6) {
            setError(t.errorMinLength);
            return;
        }

        setIsLoading(true);

        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) throw error;

            setIsSuccess(true);
            toast({
                title: t.successTitle,
                description: t.successMessage,
            });

            // Redirect after 3 seconds
            setTimeout(() => {
                navigate("/management-gs-zarzis");
            }, 3000);

        } catch (err: any) {
            setError(err.message || t.errorGeneric);
        } finally {
            setIsLoading(false);
        }
    };

    // Show error state if link is expired/invalid
    if (linkError) {
        return (
            <div className={`min-h-screen bg-background relative flex items-center justify-center p-4 ${isRTL ? 'rtl' : 'ltr'}`}>
                <PSBackground />

                <div className="relative z-10 w-full max-w-md">
                    <div className="glass-card rounded-2xl p-8 neon-border">
                        <div className="text-center space-y-6">
                            <div className="w-16 h-16 bg-destructive/20 rounded-full flex items-center justify-center mx-auto">
                                <XCircle className="w-8 h-8 text-destructive" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="font-semibold text-lg text-destructive">{t.errorExpiredTitle}</h3>
                                <p className="text-muted-foreground text-sm">
                                    {t.errorExpiredMessage}
                                </p>
                            </div>
                            <div className="space-y-3">
                                <Link to="/forgot-password">
                                    <Button variant="hero" className="w-full">
                                        {t.requestNewLink}
                                    </Button>
                                </Link>
                                <Link to="/management-gs-zarzis">
                                    <Button variant="outline" className="w-full">
                                        {t.backToLogin}
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen bg-background relative flex items-center justify-center p-4 ${isRTL ? 'rtl' : 'ltr'}`}>
            <PSBackground />

            <div className="relative z-10 w-full max-w-md">
                <div className="glass-card rounded-2xl p-8 neon-border">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-primary/20 mb-4">
                            <Gamepad2 className="w-8 h-8 text-primary" />
                        </div>
                        <h1 className="font-display text-2xl font-bold mb-2">{t.title}</h1>
                        <p className="text-muted-foreground text-sm">
                            {t.subtitle}
                        </p>
                    </div>

                    {isSuccess ? (
                        <div className="text-center space-y-6 animate-in fade-in zoom-in">
                            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto text-green-500">
                                <CheckCircle className="w-8 h-8" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="font-semibold text-lg text-green-400">{t.successTitle}</h3>
                                <p className="text-muted-foreground">
                                    {t.successMessage}
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => navigate("/management-gs-zarzis")}
                            >
                                {t.loginNow}
                            </Button>
                        </div>
                    ) : (
                        <form onSubmit={handleUpdatePassword} className="space-y-4">
                            {error && (
                                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="password">{t.newPassword}</Label>
                                <div className="relative">
                                    <Lock className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground`} />
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className={`${isRTL ? 'pr-10 pl-10' : 'pl-10 pr-10'}`}
                                        placeholder={t.minChars}
                                        required
                                        dir={isRTL ? 'rtl' : 'ltr'}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className={`absolute ${isRTL ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground`}
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">{t.confirmPassword}</Label>
                                <div className="relative">
                                    <Lock className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground`} />
                                    <Input
                                        id="confirmPassword"
                                        type={showPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className={isRTL ? 'pr-10' : 'pl-10'}
                                        placeholder={t.reenter}
                                        required
                                        dir={isRTL ? 'rtl' : 'ltr'}
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                variant="hero"
                                className="w-full mt-2"
                                disabled={isLoading}
                            >
                                {isLoading ? t.updating : t.updateButton}
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

export default ResetPassword;
