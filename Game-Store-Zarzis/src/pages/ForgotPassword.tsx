import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Gamepad2, Mail, ArrowLeft, CheckCircle } from "lucide-react";
import PSBackground from "@/components/PSBackground";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);
    const [error, setError] = useState("");

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });

            if (error) {
                throw error;
            }

            setIsSent(true);
        } catch (err: any) {
            setError(err.message || "Failed to send reset email");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background relative flex items-center justify-center p-4">
            <PSBackground />

            <div className="relative z-10 w-full max-w-md">
                <div className="glass-card rounded-2xl p-8 neon-border">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-primary/20 mb-4">
                            <Gamepad2 className="w-8 h-8 text-primary" />
                        </div>
                        <h1 className="font-display text-2xl font-bold mb-2">Reset Password</h1>
                        <p className="text-muted-foreground text-sm">
                            Enter your email to receive recovery instructions
                        </p>
                    </div>

                    {isSent ? (
                        <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-4">
                            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto text-green-500">
                                <CheckCircle className="w-8 h-8" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="font-semibold text-lg">Check your email</h3>
                                <p className="text-muted-foreground">
                                    We have sent password recovery instructions to <strong>{email}</strong>
                                </p>
                            </div>
                            <Link to="/staff-login">
                                <Button variant="outline" className="w-full">
                                    Back to Login
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleReset} className="space-y-4">
                            {error && (
                                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="name@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="pl-10"
                                        required
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                variant="hero"
                                className="w-full"
                                disabled={isLoading}
                            >
                                {isLoading ? "Sending Link..." : "Send Reset Link"}
                            </Button>

                            <div className="mt-4 text-center">
                                <Link
                                    to="/staff-login"
                                    className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
                                >
                                    <ArrowLeft className="w-4 h-4 mr-1" />
                                    Back to Login
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
