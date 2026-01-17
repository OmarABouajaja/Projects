import { Suspense, useState, lazy } from "react";
import { lazyWithRetry } from "@/lib/lazyWithRetry";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { DataProvider } from "@/contexts/DataContext";
import { AnalyticsProvider } from "@/contexts/AnalyticsContext";
import { CartProvider } from "@/contexts/CartContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import LoadingScreen from "@/components/LoadingScreen";
import ErrorBoundary from "@/components/ErrorBoundary";
import ProtectedRoute from "@/components/ProtectedRoute";
import PSBackground from "@/components/PSBackground";
import CacheManager from "@/components/CacheManager";
import OfflineIndicator from "@/components/OfflineIndicator";

// Lazy load pages for better performance
const Index = lazyWithRetry(() => import("./pages/Index"));
const NotFound = lazyWithRetry(() => import("./pages/NotFound"));
const StaffAuth = lazyWithRetry(() => import("./pages/StaffAuth"));
const ClientAuth = lazyWithRetry(() => import("./pages/ClientAuth"));
const UserGuide = lazyWithRetry(() => import("./pages/UserGuide"));
const AuthCallback = lazyWithRetry(() => import("./pages/AuthCallback"));
const ForgotPassword = lazyWithRetry(() => import("./pages/ForgotPassword"));
const ResetPassword = lazyWithRetry(() => import("./pages/ResetPassword"));
const Checkout = lazyWithRetry(() => import("./pages/Checkout"));

// Import Simple Dashboard lazy
const SimpleDashboard = lazyWithRetry(() => import("./pages/dashboard/DashboardOverview"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Simple test component
const TestComponent = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-3xl font-bold mb-4">Test Route Works!</h1>
      <p className="text-muted-foreground mb-4">This confirms routing is working.</p>
      <a href="/dashboard" className="px-4 py-2 bg-primary text-white rounded">Go to Dashboard</a>
    </div>
  </div>
);

const SessionsManagement = lazyWithRetry(() => import("./pages/dashboard/SessionsManagement"));
const ServicesManagement = lazyWithRetry(() => import("./pages/dashboard/ServicesManagement"));
const SalesManagement = lazyWithRetry(() => import("./pages/dashboard/SalesManagement"));
const ClientsManagement = lazyWithRetry(() => import("./pages/dashboard/ClientsManagement"));

// Owner-only pages
const ProductsManagement = lazyWithRetry(() => import("./pages/dashboard/ProductsManagement"));
const TransactionsHistory = lazyWithRetry(() => import("./pages/dashboard/TransactionsHistory"));
const PricingManagement = lazyWithRetry(() => import("./pages/dashboard/PricingManagement"));
const ConsoleManagement = lazyWithRetry(() => import("./pages/dashboard/ConsoleManagement"));
const StaffManagement = lazyWithRetry(() => import("./pages/dashboard/StaffManagement"));
const BlogManagement = lazyWithRetry(() => import("./pages/dashboard/BlogManagement"));
const ExpensesManagement = lazyWithRetry(() => import("./pages/dashboard/ExpensesManagement"));
const OrdersManagement = lazyWithRetry(() => import("./pages/dashboard/OrdersManagement"));
const StoreSettings = lazyWithRetry(() => import("./pages/dashboard/StoreSettings"));
const GameSettings = lazyWithRetry(() => import("./pages/dashboard/GameSettings"));
const StaffAttendance = lazyWithRetry(() => import("./pages/dashboard/StaffAttendance"));

// React Router future flags to suppress warnings
const routerFutureFlags = {
  v7_startTransition: true,
  v7_relativeSplatPath: true,
};

import { ConditionalCreatorCredit } from "@/components/ConditionalCreatorCredit";

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  // Suppress React DevTools warning in development only
  if (typeof window !== 'undefined' && import.meta.env.DEV) {
    const originalWarn = console.warn;
    console.warn = (...args: any[]) => {
      const message = typeof args[0] === 'string' ? args[0] : String(args[0] || '');
      if (message.includes('Download the React DevTools')) {
        return;
      }
      originalWarn(...args);
    };
  }

  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  return (
    <ErrorBoundary>
      {isLoading && <LoadingScreen onComplete={handleLoadingComplete} />}
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <LanguageProvider>
            <ThemeProvider>
              <DataProvider>
                <AnalyticsProvider>
                  <CartProvider>
                    <TooltipProvider>
                      <Toaster />
                      <Sonner />
                      <OfflineIndicator />
                      <CacheManager />
                      <BrowserRouter future={routerFutureFlags}>
                        <Suspense fallback={<div className="min-h-screen bg-background" />}>
                          <Routes>
                            {/* Test Routes - No auth required */}
                            <Route path="/test" element={<TestComponent />} />

                            {/* Public Routes */}
                            <Route path="/" element={<Index />} />
                            <Route path="/checkout" element={<Checkout />} />

                            {/* Client Routes */}
                            <Route path="/client-auth" element={<ClientAuth />} />

                            {/* Auth Callback - handles email confirmations */}
                            <Route path="/auth/callback" element={<AuthCallback />} />

                            {/* Staff Routes - Hidden Paths for better security */}
                            <Route path="/management-gs-zarzis" element={<StaffAuth />} />
                            <Route path="/admin-portal" element={<StaffAuth />} />
                            {/* Keep legacy for internal ease but hidden from UI */}
                            <Route path="/staff-login" element={<StaffAuth />} />
                            <Route path="/forgot-password" element={<ForgotPassword />} />
                            <Route path="/reset-password" element={<ResetPassword />} />

                            {/* Staff Dashboard Routes */}
                            {/* Hidden User Guide */}
                            <Route path="/user-guide" element={<UserGuide />} />

                            <Route
                              path="/dashboard"
                              element={
                                <ProtectedRoute>
                                  <SimpleDashboard />
                                </ProtectedRoute>
                              }
                            />
                            <Route
                              path="/dashboard/sessions"
                              element={
                                <ProtectedRoute>
                                  <SessionsManagement />
                                </ProtectedRoute>
                              }
                            />
                            <Route
                              path="/dashboard/services"
                              element={
                                <ProtectedRoute>
                                  <ServicesManagement />
                                </ProtectedRoute>
                              }
                            />
                            <Route
                              path="/dashboard/sales"
                              element={
                                <ProtectedRoute>
                                  <SalesManagement />
                                </ProtectedRoute>
                              }
                            />
                            <Route
                              path="/dashboard/clients"
                              element={
                                <ProtectedRoute>
                                  <ClientsManagement />
                                </ProtectedRoute>
                              }
                            />

                            {/* Owner-only routes */}
                            <Route
                              path="/dashboard/products"
                              element={
                                <ProtectedRoute>
                                  <ProductsManagement />
                                </ProtectedRoute>
                              }
                            />
                            <Route
                              path="/dashboard/transactions"
                              element={
                                <ProtectedRoute>
                                  <TransactionsHistory />
                                </ProtectedRoute>
                              }
                            />
                            <Route
                              path="/dashboard/pricing"
                              element={
                                <ProtectedRoute>
                                  <PricingManagement />
                                </ProtectedRoute>
                              }
                            />
                            <Route
                              path="/dashboard/consoles"
                              element={
                                <ProtectedRoute>
                                  <ConsoleManagement />
                                </ProtectedRoute>
                              }
                            />
                            <Route
                              path="/dashboard/staff"
                              element={
                                <ProtectedRoute>
                                  <StaffManagement />
                                </ProtectedRoute>
                              }
                            />
                            <Route
                              path="/dashboard/attendance"
                              element={
                                <ProtectedRoute>
                                  <StaffAttendance />
                                </ProtectedRoute>
                              }
                            />
                            <Route
                              path="/dashboard/blog"
                              element={
                                <ProtectedRoute>
                                  <BlogManagement />
                                </ProtectedRoute>
                              }
                            />
                            <Route
                              path="/dashboard/expenses"
                              element={
                                <ProtectedRoute>
                                  <ExpensesManagement />
                                </ProtectedRoute>
                              }
                            />
                            <Route
                              path="/dashboard/orders"
                              element={
                                <ProtectedRoute>
                                  <OrdersManagement />
                                </ProtectedRoute>
                              }
                            />
                            <Route
                              path="/dashboard/settings"
                              element={
                                <ProtectedRoute>
                                  <StoreSettings />
                                </ProtectedRoute>
                              }
                            />

                            {/* Fallback */}
                            <Route path="*" element={<NotFound />} />
                          </Routes>
                        </Suspense>
                        <ConditionalCreatorCredit />
                      </BrowserRouter>
                    </TooltipProvider>
                  </CartProvider>
                </AnalyticsProvider>
              </DataProvider>
            </ThemeProvider>
          </LanguageProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
