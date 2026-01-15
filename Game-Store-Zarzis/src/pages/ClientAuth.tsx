import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, User, Phone, ArrowLeft, Key, CheckCircle, Smartphone, Mail, Gamepad2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Client } from '@/types';
import { toast } from '@/hooks/use-toast';
import { isValidEmail, isValidPhone, isValidName } from '@/utils/validation';

const API_URL = import.meta.env.VITE_API_URL || 'https://bck.gamestorezarzis.com.tn';

const ClientAuth = () => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [step, setStep] = useState<'phone' | 'verify'>('phone');
  const { t } = useLanguage();

  // Get settings from context
  const { clients, addClient, settings } = useData();
  const navigate = useNavigate();

  // Check if SMS is enabled (default to true if not set)
  const smsEnabled = settings?.auth_config?.enable_sms_verification ?? true;

  // Data State
  const [phone, setPhone] = useState('');
  const [loginEmail, setLoginEmail] = useState(''); // New state for email login
  const [otpCode, setOtpCode] = useState('');
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
  });

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Determine identifier based on mode
  const getIdentifier = () => smsEnabled ? phone : loginEmail; // For login
  const getRegisterIdentifier = () => smsEnabled ? phone : registerData.email; // For register (email is already in registerData)

  // Helper to send OTP
  const sendOtp = async (identifier: string, type: 'sms' | 'email') => {
    const res = await fetch(`${API_URL}/verify/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, type })
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to send code');
    }
    return res.json();
  };

  // Helper to verify OTP
  const verifyOtp = async (identifier: string, code: string) => {
    const res = await fetch(`${API_URL}/verify/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, code })
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.detail || data.message || 'Invalid code');
    return data;
  };

  // ----- Login Logic -----
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const identifier = getIdentifier();
    const type = smsEnabled ? 'sms' : 'email';

    try {
      if (step === 'phone') {
        if (!identifier) throw new Error(`Please enter your ${smsEnabled ? 'phone number' : 'email'}`);

        // STRICT VALIDATION
        if (smsEnabled) {
          if (!isValidPhone(identifier)) {
            throw new Error('Please enter a valid Tunisian phone number (8 digits, e.g., 22 333 444)');
          }
        } else {
          if (!isValidEmail(identifier)) {
            throw new Error('Please enter a valid email address');
          }
        }

        // Check if client exists
        let client = clients.find(c => smsEnabled ? c.phone === identifier : c.email === identifier);

        if (!client) {
          // Try direct lookup for clients outside the first 100 fetched
          const { data, error } = await supabase
            .from('clients')
            .select('*')
            .eq(smsEnabled ? 'phone' : 'email', identifier)
            .maybeSingle();

          if (data && !error) {
            client = data;
          }
        }

        if (!client) {
          throw new Error('Account not found. Please register.');
        }

        // Send OTP
        await sendOtp(identifier, type);
        setStep('verify');
        toast({ title: "Code Sent", description: `Check your ${smsEnabled ? 'messages' : 'email'}` });
      } else {
        // Verify OTP
        await verifyOtp(identifier, otpCode);

        // Login
        let client = clients.find(c => smsEnabled ? c.phone === identifier : c.email === identifier);

        if (!client) {
          const { data } = await supabase
            .from('clients')
            .select('*')
            .eq(smsEnabled ? 'phone' : 'email', identifier)
            .maybeSingle();
          client = data;
        }

        localStorage.setItem('client_user', JSON.stringify(client));
        toast({ title: "Welcome Back!", description: "Logged in successfully" });
        navigate('/');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  // ----- Register Logic -----
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const identifier = getRegisterIdentifier();
    const type = smsEnabled ? 'sms' : 'email';

    try {
      if (step === 'phone') {
        // Basic Validation
        if (!registerData.name || !identifier) {
          throw new Error('Please fill in required fields');
        }

        if (!isValidName(registerData.name)) {
          throw new Error('Please enter a valid name (minimum 2 characters)');
        }

        if (smsEnabled) {
          if (!isValidPhone(identifier)) {
            throw new Error('Invalid phone number format');
          }
          // Check email if provided
          if (registerData.email && !isValidEmail(registerData.email)) {
            throw new Error('Invalid email format');
          }
        } else {
          if (!isValidEmail(identifier)) {
            throw new Error('Invalid email format');
          }
          // Check phone if provided (and it is provided often)
          if (phone && !isValidPhone(phone)) {
            throw new Error('Invalid phone number format');
          }
        }

        // Check existing via direct lookup 
        const { data: existingClient } = await supabase
          .from('clients')
          .select('email,phone')
          .or(`email.eq."${smsEnabled ? registerData.email : identifier}",phone.eq."${smsEnabled ? identifier : phone}"`)
          .maybeSingle();

        if (existingClient) {
          if (existingClient.email === (smsEnabled ? registerData.email : identifier)) {
            throw new Error('This email is already registered. Please login.');
          }
          if (existingClient.phone === (smsEnabled ? identifier : phone)) {
            throw new Error('This phone number is already registered. Please login or contact staff to link your email.');
          }
        }

        // Send OTP
        await sendOtp(identifier, type);
        setStep('verify');
        toast({ title: "Code Sent", description: `Check your ${smsEnabled ? 'messages' : 'email'}` });
      } else {
        // Verify OTP
        await verifyOtp(identifier, otpCode);

        // Create Account
        const newClient: Omit<Client, 'id' | 'created_at' | 'updated_at'> = {
          name: registerData.name,
          email: registerData.email,
          phone: smsEnabled ? phone : (phone || `email_${Date.now()}@placeholder.com`),
          points: 0,
          total_spent: 0,
          total_games_played: 0
        };

        if (!smsEnabled && !phone) {
          newClient.phone = phone || `no-phone-${Date.now()}`;
        }

        addClient(newClient as any);

        // Auto Login
        toast({ title: "Account Created", description: "Welcome to Game Store Zarzis!" });
        setActiveTab('login');
        setStep('phone');
        setOtpCode('');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const resetFlow = (tab: 'login' | 'register') => {
    setActiveTab(tab);
    setStep('phone');
    setError('');
    setOtpCode('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-bl from-primary/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-accent/5 to-transparent rounded-full blur-3xl" />
      </div>

      <Card className="w-full max-w-md relative backdrop-blur-xl bg-card/80 border-border/50 shadow-2xl">
        <CardHeader className="text-center pb-4">
          {/* Logo */}
          <Link to="/" className="mx-auto mb-4 block">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border border-primary/30 shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
              <img
                src="/gamestorelogocmp.png"
                alt="Game Store Zarzis"
                className="w-10 h-10 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                }}
              />
              <Gamepad2 className="w-8 h-8 text-primary hidden" />
            </div>
          </Link>
          <CardTitle className="text-2xl font-bold font-display bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {t("client.portal")}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {activeTab === 'login'
              ? (smsEnabled ? t("client.sms_login") : t("client.email_login"))
              : t("client.create_account")
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => resetFlow(v as any)}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4">
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {step === 'phone' ? (
                  <div className="space-y-2">
                    <Label>{smsEnabled ? 'Phone Number' : 'Email Address'}</Label>
                    <div className="relative">
                      {smsEnabled ? (
                        <>
                          <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            type="tel"
                            placeholder="+216..."
                            className="pl-9"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                          />
                        </>
                      ) : (
                        <>
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            type="email"
                            placeholder="you@example.com"
                            className="pl-9"
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                            required
                          />
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 text-center">
                    <Label>Enter Verification Code</Label>
                    <Input
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="123456"
                      className="text-center text-xl tracking-widest font-mono"
                      required
                    />
                    <Button type="button" variant="link" size="sm" onClick={() => setStep('phone')}>
                      Change {smsEnabled ? 'Phone Number' : 'Email'}
                    </Button>
                  </div>
                )}

                {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (step === 'phone' ? 'Send Code' : 'Verify & Login')}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register" className="space-y-4">
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                {step === 'phone' && (
                  <>
                    <div className="space-y-2">
                      <Label>Full Name</Label>
                      <Input
                        value={registerData.name}
                        onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                        required
                      />
                    </div>

                    {/* If SMS is disabled, Email comes first and is required */}
                    {!smsEnabled ? (
                      <>
                        <div className="space-y-2">
                          <Label>Email (Required for Verification)</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              type="email"
                              value={registerData.email}
                              onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                              placeholder="you@example.com"
                              className="pl-9"
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Phone Number (Contact info)</Label>
                          <div className="relative">
                            <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              type="tel"
                              placeholder="+216..."
                              className="pl-9"
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              required={true} // DB still requires it for now
                            />
                          </div>
                          <p className="text-[10px] text-muted-foreground">Verification code will be sent to your email.</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="space-y-2">
                          <Label>Phone Number (Required for SMS)</Label>
                          <div className="relative">
                            <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              type="tel"
                              placeholder="+216..."
                              className="pl-9"
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              required={true}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Email (Optional)</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              type="email"
                              value={registerData.email}
                              onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                              placeholder="you@example.com"
                              className="pl-9"
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </>
                )}

                {step === 'verify' && (
                  <div className="space-y-2 text-center">
                    <Label>Enter Verification Code</Label>
                    <p className="text-xs text-muted-foreground mb-2">Sent to {smsEnabled ? phone : registerData.email}</p>
                    <Input
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="123456"
                      className="text-center text-xl tracking-widest font-mono"
                      required
                    />
                    <Button type="button" variant="link" size="sm" onClick={() => setStep('phone')}>
                      Back
                    </Button>
                  </div>
                )}

                {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (step === 'phone' ? 'Send Verification Code' : 'Verify & Register')}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientAuth;
