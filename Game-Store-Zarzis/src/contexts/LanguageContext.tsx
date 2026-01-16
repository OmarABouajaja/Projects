import { createContext, useContext, useState, ReactNode } from "react";
import helpTranslations from "@/translations/help.json";

type Language = "fr" | "en" | "ar";

interface Translations {
  [key: string]: {
    fr: string;
    en: string;
    ar: string;
  };
}

export const translations: Translations = {
  // Navbar
  "nav.home": { fr: "Accueil", en: "Home", ar: "الرئيسية" },
  "nav.services": { fr: "Services", en: "Services", ar: "الخدمات" },
  "nav.gaming": { fr: "Zone Gaming", en: "Gaming Zone", ar: "منطقة الألعاب" },
  "nav.about": { fr: "À Propos", en: "About", ar: "من نحن" },
  "nav.contact": { fr: "Contact", en: "Contact", ar: "اتصل بنا" },
  "nav.book": { fr: "Réserver", en: "Book Now", ar: "احجز الآن" },
  "nav.blog": { fr: "Blog", en: "Blog", ar: "المدونة" },
  "nav.cart": { fr: "Panier", en: "Cart", ar: "السلة" },
  "nav.shop": { fr: "Boutique", en: "Shop", ar: "المتجر" },
  "nav.categories": { fr: "Catégories", en: "Categories", ar: "الفئات" },
  "nav.management": { fr: "Gestion", en: "Management", ar: "الإدارة" },
  "nav.staff_login": { fr: "Espace Personnel", en: "Staff Login", ar: "دخول الموظفين" },
  "nav.client_portal": { fr: "Espace Client", en: "Client Portal", ar: "بوابة العملاء" },
  "nav.attendance": { fr: "Présence", en: "Attendance", ar: "الحضور" },
  "nav.client_dashboard": { fr: "Tableau de Bord", en: "Dashboard", ar: "لوحة التحكم" },
  "nav.login": { fr: "Se connecter", en: "Login", ar: "تسجيل الدخول" },
  "nav.logged_in": { fr: "Connecté", en: "Logged In", ar: "تم الدخول" },
  "hero.cta_client": { fr: "Mon Espace Fidélité", en: "My Loyalty Space", ar: "فضاء الولاء" },

  // Client Auth
  "client.portal": { fr: "Espace Client Premium", en: "Premium Client Portal", ar: "بوابة المشتركين المميزة" },
  "client.join_loyalty": { fr: "Rejoignez la Communauté Game Store Zarzis", en: "Join the Game Store Zarzis Community", ar: "انضم إلى مجتمع Game Store Zarzis" },
  "client.loyalty_desc": { fr: "Gagnez des points, débloquez des parties gratuites et suivez vos statistiques en temps réel.", en: "Earn points, unlock free games, and track your stats in real-time.", ar: "اكسب النقاط، افتح ألعاباً مجانية وتابع إحصائياتك في الوقت الفعلي." },
  "client.back_to_shop": { fr: "Retour à la Boutique", en: "Back to Shop", ar: "العودة إلى المتجر" },
  "client.benefit_points": { fr: "Points de Fidélité", en: "Loyalty Points", ar: "نقاط الولاء" },
  "client.benefit_history": { fr: "Historique Complet", en: "Full History", ar: "سجل الألعاب" },
  "client.benefit_booking": { fr: "Réservations Prioritaires", en: "Priority Booking", ar: "حجز أولوي" },
  "client.sms_login": { fr: "Connexion par SMS Rapide", en: "Quick SMS Login", ar: "تسجيل دخول سريع بالرسائل" },
  "client.email_login": { fr: "Connexion par Email", en: "Email Login", ar: "تسجيل دخول بالبريد" },
  "client.create_account": { fr: "Créer un Nouveau Compte", en: "Create New Account", ar: "إنشاء حساب جديد" },
  "client.full_name": { fr: "Nom Complet", en: "Full Name", ar: "الاسم الكامل" },
  "client.phone_number": { fr: "Numéro de Téléphone", en: "Phone Number", ar: "رقم الهاتف" },
  "client.email_address": { fr: "Adresse Email", en: "Email Address", ar: "البريد الإلكتروني" },
  "client.verification_code": { fr: "Code de Vérification", en: "Verification Code", ar: "رمز التحقق" },
  "client.send_code": { fr: "Envoyer le Code", en: "Send Code", ar: "إرسال الرمز" },
  "client.verify_login": { fr: "Vérifier & Connecter", en: "Verify & Login", ar: "تحقق ودخول" },
  "client.verify_register": { fr: "Vérifier & Créer le Compte", en: "Verify & Create Account", ar: "تحقق وإنشاء حساب" },
  "client.change_method": { fr: "Changer {method}", en: "Change {method}", ar: "تغيير {method}" },
  "client.login": { fr: "Connexion", en: "Login", ar: "تسجيل الدخول" },
  "client.register": { fr: "Inscription", en: "Register", ar: "التسجيل" },
  "client.back_home": { fr: "Retour à l'Accueil", en: "Back to Home", ar: "العودة للرئيسية" },
  "client.change_phone": { fr: "Changer le numéro", en: "Change Phone Number", ar: "تغيير رقم الهاتف" },
  "client.change_email": { fr: "Changer l'email", en: "Change Email", ar: "تغيير البريد الإلكتروني" },
  "client.stay_logged_in": { fr: "Rester connecté", en: "Stay logged in", ar: "البقاء مسجلاً" },

  // 404 / Error Pages
  "error.404.title": { fr: "Page Non Trouvée", en: "Page Not Found", ar: "الصفحة غير موجودة" },
  "error.404.code": { fr: "404", en: "404", ar: "٤٠٤" },
  "error.404.subtitle": { fr: "Oups ! Cette page n'existe pas", en: "Oops! This page doesn't exist", ar: "عذراً! هذه الصفحة غير موجودة" },
  "error.404.description": { fr: "La page que vous cherchez a peut-être été déplacée ou n'existe plus.", en: "The page you're looking for might have been moved or no longer exists.", ar: "الصفحة التي تبحث عنها ربما تم نقلها أو لم تعد موجودة." },
  "error.back_home": { fr: "Retour à l'Accueil", en: "Back to Home", ar: "العودة للرئيسية" },
  "error.gaming_zone": { fr: "Zone Gaming", en: "Gaming Zone", ar: "منطقة الألعاب" },
  "error.contact_us": { fr: "Contactez-nous", en: "Contact Us", ar: "اتصل بنا" },

  // Notifications
  "notifications.title": { fr: "Notifications", en: "Notifications", ar: "الإشعارات" },
  "notifications.enable": { fr: "Activer les notifications", en: "Enable Notifications", ar: "تفعيل الإشعارات" },
  "notifications.session_ending": { fr: "Session se termine bientôt", en: "Session ending soon", ar: "الجلسة ستنتهي قريباً" },
  "notifications.new_order": { fr: "Nouvelle commande reçue", en: "New order received", ar: "تم استلام طلب جديد" },
  "notifications.repair_ready": { fr: "Réparation terminée", en: "Repair completed", ar: "تم إنهاء الإصلاح" },
  "notifications.daily_recap": { fr: "Récapitulatif quotidien", en: "Daily Recap", ar: "ملخص يومي" },

  // Hero
  "hero.badge": { fr: "Réparation Tech & Zone Gaming", en: "Tech Repair & Gaming Zone", ar: "إصلاح التقنية ومنطقة الألعاب" },
  "hero.title1": { fr: "JOUE.", en: "PLAY.", ar: "العب." },
  "hero.title2": { fr: " RÉPARE.", en: " FIX.", ar: " أصلح." },
  "hero.title3": { fr: " RÉPÈTE.", en: " REPEAT.", ar: " كرر." },
  "hero.subtitle": { fr: "Votre destination ultime pour les réparations tech, les sessions gaming épiques et des moments inoubliables entre amis à Zarzis.", en: "Your ultimate destination for tech repairs, epic gaming sessions, and unforgettable moments with friends in Zarzis.", ar: "وجهتك المثالية لإصلاح التقنية وجلسات الألعاب الملحمية واللحظات التي لا تُنسى مع الأصدقاء في جرجيس." },
  "hero.cta1": { fr: "Commencer à Jouer", en: "Start Gaming", ar: "ابدأ اللعب" },
  "hero.cta2": { fr: "Demander un Devis", en: "Get Repair Quote", ar: "احصل على عرض سعر" },
  "hero.stat1.value": { fr: "10", en: "10", ar: "١٠" },
  "hero.stat1.label": { fr: "Postes Gaming", en: "Gaming Stations", ar: "محطات ألعاب" },
  "hero.stat2.value": { fr: "08h-02h", en: "08h-02h", ar: "٠٨-٠٢" },
  "hero.stat2.label": { fr: "Horaires", en: "Opening Hours", ar: "ساعات العمل" },
  "hero.stat3.value": { fr: "30j", en: "30d", ar: "٣٠ يوم" },
  "hero.stat3.label": { fr: "Garantie Réparation", en: "Repair Warranty", ar: "ضمان الإصلاح" },

  // Services
  "services.badge": { fr: "Nos Services", en: "What We Offer", ar: "ما نقدمه" },
  "services.title1": { fr: "Réparations", en: "Expert", ar: "إصلاحات" },
  "services.title2": { fr: " Expertes", en: " Tech Repairs", ar: " احترافية" },
  "services.subtitle": { fr: "De l'écran fissuré aux problèmes complexes, nos techniciens experts réparent tout avec précision.", en: "From cracked screens to complex hardware issues, our skilled technicians fix it all with precision.", ar: "من الشاشات المكسورة إلى مشاكل الأجهزة المعقدة، يقوم فنيونا المهرة بإصلاح كل شيء بدقة." },
  "services.phone.title": { fr: "Réparation Téléphones", en: "Phone Repair", ar: "إصلاح الهواتف" },
  "services.phone.desc": { fr: "iPhones et tous les smartphones - écrans, batteries, dommages d'eau et plus.", en: "iPhones and all smartphones - screens, batteries, water damage recovery, and more.", ar: "آيفون وجميع الهواتف الذكية - شاشات، بطاريات، أضرار المياه والمزيد." },
  "services.pc.title": { fr: "Réparation PC", en: "PC Repair", ar: "إصلاح الكمبيوتر" },
  "services.pc.desc": { fr: "Mises à niveau matériel, suppression de virus et configurations personnalisées.", en: "Hardware upgrades, virus removal, and custom builds for gamers.", ar: "ترقية الأجهزة، إزالة الفيروسات، والتجميعات المخصصة للاعبين." },
  "services.console.title": { fr: "Réparation Consoles", en: "Console Repair", ar: "إصلاح الأجهزة" },
  "services.console.desc": { fr: "PS4, PS5 - nettoyage profond, réparation lecteur CD, problèmes de manettes.", en: "PS4, PS5 - deep cleaning, CD reader repair, controller drift issues.", ar: "PS4، PS5 - تنظيف عميق، إصلاح قارئ الأقراص، مشاكل أذرع التحكم." },
  "services.controller.title": { fr: "Réparation Manettes", en: "Controller Repair", ar: "إصلاح أذرع التحكم" },
  "services.controller.desc": { fr: "Manettes PS4 et PS5 - drift analogique, boutons, et tous les problèmes.", en: "PS4 and PS5 controllers - analog drift, buttons, and all issues fixed.", ar: "أذرع تحكم PS4 وPS5 - انحراف الأناlog، الأزرار، وجميع المشاكل." },
  "services.accounts.title": { fr: "Services Comptes", en: "Account Services", ar: "خدمات الحسابات" },
  "services.accounts.desc": { fr: "Création comptes PSN, Apple iCloud, enregistrement téléphones.", en: "PSN account creation, Apple iCloud setup, phone registration.", ar: "إنشاء حسابات PSN، إعداد Apple iCloud، تسجيل الهواتف." },
  "services.sales.title": { fr: "Vente & Achat", en: "Sales & Purchase", ar: "بيع وشراء" },
  "services.sales.desc": { fr: "Manettes, téléphones, CDs, consoles PlayStation et accessoires.", en: "Controllers, phones, CDs, PlayStation consoles and accessories.", ar: "أذرع التحكم، الهواتف، الأقراص، أجهزة بلايستيشن والإكسسوارات." },
  "services.default_desc": { fr: "Service de réparation professionnel avec garantie.", en: "Professional repair service with warranty.", ar: "خدمة إصلاح احترافية مع الضمان." },
  "services.learn": { fr: "En Savoir Plus", en: "Learn More", ar: "اعرف المزيد" },
  "services.book_now": { fr: "Réserver", en: "Book Now", ar: "احجز الآن" },

  // Dashboard
  "dashboard.welcome": { fr: "Bienvenue", en: "Welcome", ar: "مرحباً" },
  "dashboard.loading": { fr: "Chargement du tableau de bord...", en: "Loading dashboard...", ar: "جاري تحميل لوحة التحكم..." },
  "dashboard.real_time": { fr: "Mise à jour temps réel", en: "Real-time updates", ar: "تحديثات فورية" },
  "dashboard.revenue_total": { fr: "Total des revenus", en: "Total Revenue", ar: "إجمالي الإيرادات" },
  "dashboard.expenses": { fr: "Charges", en: "Expenses", ar: "المصاريف" },
  "dashboard.net_profit": { fr: "Bénéfice net", en: "Net Profit", ar: "صافي الربح" },
  "dashboard.top_product": { fr: "Produit phare", en: "Top Product", ar: "المنتج الأفضل" },
  "dashboard.total_registered": { fr: "Total enregistrés", en: "Total Registered", ar: "إجمالي المسجلين" },
  "dashboard.financial_overview": { fr: "Aperçu Financier Complet", en: "Complete Financial Overview", ar: "نظرة شاملة مالية" },
  "dashboard.operational_dashboard": { fr: "Tableau de Bord Opérationnel", en: "Operational Dashboard", ar: "لوحة التحكم التشغيلية" },
  "dashboard.monthly_revenue": { fr: "Revenus Mensuels", en: "Monthly Revenue", ar: "الإيرادات الشهرية" },
  "dashboard.profit_margin": { fr: "Marge Bénéficiaire", en: "Profit Margin", ar: "هامش الربح" },
  "dashboard.active_clients": { fr: "Clients Actifs", en: "Active Clients", ar: "العملاء النشطين" },
  "dashboard.customer_satisfaction": { fr: "Satisfaction Client", en: "Customer Satisfaction", ar: "رضا العملاء" },
  "dashboard.today_revenue": { fr: "Revenus du Jour", en: "Today's Revenue", ar: "إيرادات اليوم" },
  "dashboard.gaming_revenue": { fr: "Revenus Gaming", en: "Gaming Revenue", ar: "إيرادات الألعاب" },
  "dashboard.available_consoles": { fr: "Consoles Disponibles", en: "Available Consoles", ar: "الأجهزة المتاحة" },
  "dashboard.pending_services": { fr: "Services en Attente", en: "Pending Services", ar: "الخدمات المعلقة" },
  "dashboard.active_sessions": { fr: "Sessions Actives", en: "Active Sessions", ar: "الجلسات النشطة" },
  "dashboard.quick_actions": { fr: "Actions Rapides", en: "Quick Actions", ar: "الإجراءات السريعة" },
  "dashboard.management_overview": { fr: "Aperçu de Gestion", en: "Management Overview", ar: "نظرة عامة على الإدارة" },
  "dashboard.new_session": { fr: "Nouvelle Session", en: "New Session", ar: "جلسة جديدة" },
  "dashboard.start_gaming": { fr: "Démarrer Gaming", en: "Start Gaming", ar: "بدء اللعب" },
  "dashboard.sell_product": { fr: "Vendre Produit", en: "Sell Product", ar: "بيع منتج" },
  "dashboard.process_sale": { fr: "Traiter Vente", en: "Process Sale", ar: "معالجة البيع" },
  "dashboard.service_request": { fr: "Demande Service", en: "Service Request", ar: "طلب خدمة" },
  "dashboard.manage_repair": { fr: "Gérer Réparation", en: "Manage Repair", ar: "إدارة الإصلاح" },
  "dashboard.client_points": { fr: "Points Clients", en: "Client Points", ar: "نقاط العملاء" },
  "dashboard.check_loyalty": { fr: "Vérifier Fidélité", en: "Check Loyalty", ar: "فحص الولاء" },
  "dashboard.products": { fr: "Produits", en: "Products", ar: "المنتجات" },
  "dashboard.inventory_management": { fr: "Gestion Inventaire", en: "Inventory Management", ar: "إدارة المخزون" },
  "dashboard.pricing": { fr: "Tarifs", en: "Pricing", ar: "التسعير" },
  "dashboard.price_config": { fr: "Configuration Prix", en: "Price Configuration", ar: "تكوين الأسعار" },
  "dashboard.staff": { fr: "Personnel", en: "Staff", ar: "الموظفين" },
  "dashboard.user_management": { fr: "Gestion Utilisateurs", en: "User Management", ar: "إدارة المستخدمين" },
  "dashboard.blog": { fr: "Blog", en: "Blog", ar: "المدونة" },
  "dashboard.share_repairs": { fr: "Partager Réparations", en: "Share Repairs", ar: "مشاركة الإصلاحات" },
  "dashboard.excellent": { fr: "Excellent", en: "Excellent", ar: "ممتاز" },
  "dashboard.stable": { fr: "Stable", en: "Stable", ar: "مستقر" },
  "dashboard.available": { fr: "Disponible", en: "Available", ar: "متاح" },
  "dashboard.available_colon": { fr: "Disponible :", en: "Available:", ar: "متاح:" },
  "dashboard.to_process": { fr: "À Traiter", en: "To Process", ar: "للمعالجة" },
  "dashboard.consoles": { fr: "Consoles", en: "Consoles", ar: "الأجهزة" },

  // Dashboard Analytics & Charts
  "dashboard.chart.daily_breakdown": { fr: "Détail Revenus Journaliers", en: "Daily Revenue Breakdown", ar: "تفاصيل الإيرادات اليومية" },
  "dashboard.chart.weekly_trend": { fr: "Tendance Hebdomadaire", en: "Weekly Revenue Trend", ar: "اتجاه الإيرادات الأسبوعية" },
  "dashboard.chart.monthly_trend": { fr: "Tendance Mensuelle", en: "Monthly Revenue Trend", ar: "اتجاه الإيرادات الشهرية" },
  "dashboard.chart.net_profit_today": { fr: "Bénéfice Net Aujourd'hui", en: "Today's Net Profit", ar: "صافي ربح اليوم" },
  "dashboard.chart.net_profit_weekly": { fr: "Bénéfice Net Hebdo", en: "Weekly Net Profit", ar: "صافي الربح الأسبوعي" },
  "dashboard.chart.net_profit_monthly": { fr: "Bénéfice Net Mensuel", en: "Monthly Net Profit", ar: "صافي الربح الشهري" },
  "dashboard.chart.net_profit_yearly": { fr: "Bénéfice Net Annuel", en: "Yearly Net Profit", ar: "صافي الربح السنوي" },

  // Dashboard Inventory
  "dashboard.inventory.alerts": { fr: "Alertes Stocks", en: "Inventory Alerts", ar: "تنبيهات المخزون" },
  "dashboard.inventory.healthy": { fr: "Niveaux de stock sains", en: "Stock levels are healthy", ar: "مستويات المخزون جيدة" },
  "dashboard.inventory.low_stock": { fr: "Rupture imminente", en: "Low Stock", ar: "مخزون منخفض" },
  "dashboard.inventory.restock": { fr: "Réapprovisionner", en: "Restock", ar: "إعادة التعبئة" },
  "dashboard.inventory.left": { fr: "restants", en: "left in stock", ar: "متبقي" },
  "dashboard.checking_stock": { fr: "Vérification stocks...", en: "Checking stock...", ar: "جاري فحص المخزون..." },

  // Dashboard General
  "dashboard.recent_sales": { fr: "Ventes Récentes", en: "Recent Sales", ar: "المبيعات الأخيرة" },
  "dashboard.no_sales": { fr: "Aucune vente enregistrée.", en: "No sales recorded yet.", ar: "لم يتم تسجيل مبيعات." },
  "dashboard.margin_analysis": { fr: "Analyse des Marges", en: "Margin Analysis", ar: "تحليل الهوامش" },
  "dashboard.top_margin_categories": { fr: "Top Catégories par Marge", en: "Top Margin Categories", ar: "أفضل الفئات حسب الهامش" },
  "dashboard.share_recap": { fr: "Partager Récap", en: "Share Recap", ar: "مشاركة الملخص" },
  "dashboard.recap_copied": { fr: "Récap copié !", en: "Recap copied!", ar: "تم نسخ الملخص!" },
  "dashboard.recap_desc": { fr: "Prêt à être collé.", en: "Ready to paste.", ar: "جاهز للصق." },
  "dashboard.welcome_user": { fr: "Heureux de vous revoir,", en: "Happy to see you again,", ar: "سعداء برؤيتك مجدداً،" },
  "dashboard.manage_daily": { fr: "Gérez vos opérations quotidiennes.", en: "Manage your daily operations.", ar: "أدر عملياتك اليومية." },
  "dashboard.financial_analysis_desc": { fr: "Analyses financières et métriques de performance en temps réel", en: "Real-time financial analysis and performance metrics", ar: "تحليل مالي ومقاييس أداء في الوقت الفعلي" },
  "dashboard.gross": { fr: "Brut", en: "Gross", ar: "الإجمالي" },
  "dashboard.exp": { fr: "Dép", en: "Exp", ar: "مصاريف" },
  "dashboard.healthy": { fr: "Sain", en: "Healthy", ar: "جيد" },
  "dashboard.low_margin": { fr: "Marge Faible", en: "Low Margin", ar: "هامش منخفض" },

  // Client Dashboard (Integrated)
  "client.dashboard.power_points": { fr: "Power Points", en: "Power Points", ar: "نقاط القوة" },
  "client.dashboard.milestone": { fr: "Bonus Milestone", en: "Bonus Milestone", ar: "معالم المكافأة" },
  "client.dashboard.overview": { fr: "Aperçu", en: "Overview", ar: "نظرة عامة" },
  "client.dashboard.shop": { fr: "Boutique", en: "Shop", ar: "المتجر" },
  "client.dashboard.activity": { fr: "Activités", en: "Activities", ar: "الأنشطة" },
  "client.dashboard.repairs": { fr: "Réparations", en: "Repairs", ar: "الإصلاحات" },
  "client.dashboard.orders": { fr: "Commandes", en: "Orders", ar: "الطلبات" },
  "client.dashboard.no_repairs": { fr: "Aucune réparation", en: "No repairs", ar: "لا توجد إصلاحات" },
  "client.dashboard.no_orders": { fr: "Aucune commande", en: "No orders", ar: "لا توجد طلبات" },
  "client.dashboard.no_activity": { fr: "Flux de données vide", en: "Empty data stream", ar: "تدفق بيانات فارغ" },
  "client.dashboard.shop_empty": { fr: "Boutique vide pour le moment", en: "Shop empty for now", ar: "المتجر فارغ حالياً" },
  "client.dashboard.take": { fr: "Prendre", en: "Take", ar: "خذ" },
  "client.dashboard.locked": { fr: "Bloqué", en: "Locked", ar: "مقفل" },
  "client.dashboard.connected": { fr: "Connecté", en: "Connected", ar: "متصل" },
  "client.dashboard.logout": { fr: "Déconnexion", en: "Logout", ar: "تسجيل الخروج" },
  "client.dashboard.redeem_success": { fr: "Demande d'échange envoyée ! Veuillez en informer le personnel.", en: "Redemption request sent! Please inform the staff.", ar: "تم إرسال طلب الاستبدال! يرجى إبلاغ الموظفين." },
  "client.dashboard.redeem_error": { fr: "Coins insuffisants ! Il vous manque {amount} coins.", en: "Insufficient coins! You need {amount} more.", ar: "عملات غير كافية! تحتاج إلى {amount} أكثر." },
  "client.dashboard.explore_all": { fr: "Explorer tout l'inventaire", en: "Explore all inventory", ar: "استكشف كل المخزون" },
  "client.dashboard.sessions_left": { fr: "Plus que {amount} sessions", en: "{amount} sessions left", ar: "تبقت {amount} جلسات" },
  "client.dashboard.system_update": { fr: "Mise à jour système", en: "System Update", ar: "تحديث النظام" },

  // Onboarding
  "onboarding.client.welcome": { fr: "Bienvenue sur votre Espace Client", en: "Welcome to your Client Space", ar: "مرحباً بك في مساحتك الخاصة" },
  "onboarding.client.subtitle": { fr: "Découvrez vos avantages exclusifs et suivez vos activités en temps réel.", en: "Discover your exclusive benefits and track your activities in real-time.", ar: "اكتشف مزاياك الحصرية وتابع أنشطتك في الوقت الفعلي." },
  "onboarding.client.xp.title": { fr: "Système de Points (XP)", en: "Points System (XP)", ar: "نظام النقاط (XP)" },
  "onboarding.client.xp.desc": { fr: "Gagnez des points à chaque session ou achat et échangez-les contre des récompenses.", en: "Earn points with every session or purchase and redeem them for rewards.", ar: "اكسب نقاطاً مع كل جلسة أو عملية شراء واستبدلها بمكافآت." },
  "onboarding.client.rewards.title": { fr: "Récompenses & Boutique", en: "Rewards & Shop", ar: "المكافآت والمتجر" },
  "onboarding.client.rewards.desc": { fr: "Échangez vos points contre des boissons, du temps de jeu ou des snacks.", en: "Exchange your points for drinks, game time, or snacks.", ar: "استبدل نقاطك بمشروبات، وقت لعب، أو وجبات خفيفة." },
  "onboarding.client.bonus.title": { fr: "Bonus de Fidélité", en: "Loyalty Bonus", ar: "مكافأة الولاء" },
  "onboarding.client.bonus.desc": { fr: "Suivez votre progression vers votre prochaine session gratuite.", en: "Track your progress towards your next free session.", ar: "تابع تقدمك نحو جلستك المجانية التالية." },
  "onboarding.client.getStarted": { fr: "Commencer l'expérience", en: "Start Experience", ar: "ابدأ التجربة" },

  // Store Settings
  "settings.title": { fr: "Paramètres du Magasin", en: "Store Settings", ar: "إعدادات المتجر" },
  "settings.subtitle": { fr: "Gérez les horaires d'ouverture et la configuration du magasin", en: "Manage opening hours and store configuration", ar: "إدارة ساعات العمل وتكوين المتجر" },
  "settings.hours": { fr: "Horaires d'Ouverture", en: "Opening Hours", ar: "ساعات العمل" },
  "settings.schedule": { fr: "Planning Hebdomadaire", en: "Weekly Schedule", ar: "الجدول الأسبوعي" },
  "settings.special": { fr: "Horaires Spéciaux", en: "Special Hours", ar: "ساعات خاصة" },
  "settings.loyalty": { fr: "Configuration Fidélité", en: "Loyalty Configuration", ar: "تكوين الولاء" },
  "settings.save": { fr: "Sauvegarder", en: "Save Changes", ar: "حفظ التغييرات" },
  "settings.saveShort": { fr: "Enregistrer", en: "Save", ar: "حفظ" },
  "settings.saveSuccessTitle": { fr: "✅ Paramètres sauvegardés", en: "✅ Settings saved", ar: "✅ تم حفظ الإعدادات" },
  "settings.saveSuccessDescription": { fr: "Les modifications ont été enregistrées avec succès.", en: "Changes have been saved successfully.", ar: "تم حفظ التغييرات بنجاح." },
  "settings.saveErrorTitle": { fr: "❌ Erreur", en: "❌ Error", ar: "❌ خطأ" },
  "settings.saveErrorDescription": { fr: "Impossible de sauvegarder les modifications.", en: "Could not save changes.", ar: "تعذر حفظ التغييرات." },

  "settings.tabs.hours": { fr: "Horaires", en: "Hours", ar: "ساعات" },
  "settings.tabs.pointsAndPricing": { fr: "Points & Tarifs", en: "Points & Pricing", ar: "النقاط والأسعار" },
  "settings.tabs.loyalty": { fr: "Fidélité", en: "Loyalty", ar: "الولاء" },

  "settings.defaultHours.title": { fr: "Horaires par Défaut", en: "Default Operating Hours", ar: "ساعات العمل الافتراضية" },
  "settings.defaultHours.openingTime": { fr: "Heure d'ouverture", en: "Opening Time", ar: "وقت الفتح" },
  "settings.defaultHours.closingTime": { fr: "Heure de fermeture", en: "Closing Time", ar: "وقت الإغلاق" },
  "settings.defaultHours.infoMessage": { fr: "Le magasin est ouvert de {open} à {close} tous les jours (si non spécifié).", en: "Store operates from {open} to {close} daily (unless specified).", ar: "المتجر يعمل من {open} إلى {close} يومياً (ما لم يحدد خلاف ذلك)." },

  "settings.weeklySchedule.loading": { fr: "Chargement du planning...", en: "Loading schedule...", ar: "جاري تحميل الجدول..." },
  "settings.weeklySchedule.openDays": { fr: "Jours ouverts", en: "Open Days", ar: "أيام العمل" },
  "settings.weeklySchedule.nightServices": { fr: "Services nocturnes", en: "Night Services", ar: "الخدمات الليلية" },
  "settings.weeklySchedule.withBreak": { fr: "Avec pause", en: "With Break", ar: "مع استراحة" },
  "settings.weeklySchedule.specialEvents": { fr: "Événements spéciaux", en: "Special Events", ar: "أحداث خاصة" },
  "settings.weeklySchedule.validationStatus": { fr: "Statut validation", en: "Validation Status", ar: "حالة التحقق" },

  "settings.quickActions.title": { fr: "Actions Rapides & Préréglages", en: "Quick Actions & Presets", ar: "إجراءات سريعة وإعدادات مسبقة" },
  "settings.quickActions.defaultHours": { fr: "Horaires par Défaut", en: "Default Hours", ar: "ساعات افتراضية" },
  "settings.quickActions.closeWeekends": { fr: "Fermer Weekends", en: "Close Weekends", ar: "إغلاق عطلة نهاية الأسبوع" },
  "settings.quickActions.standardHours": { fr: "Horaires Standards", en: "Standard Hours", ar: "ساعات قياسية" },
  "settings.quickActions.24hService": { fr: "Service 24h", en: "24h Service", ar: "خدمة 24 ساعة" },
  "settings.quickActions.simplifiedActions": { fr: "Actions rapides simplifiées", en: "Simplified Quick Actions", ar: "إجراءات سريعة مبسطة" },
  "settings.quickActions.simplifiedActionsDescription": { fr: "Appliquez les horaires par défaut, fermez les weekends, etc.", en: "Apply default hours, close weekends, etc.", ar: "تطبيق ساعات افتراضية، إغلاق عطلات نهاية الأسبوع، إلخ." },
  "settings.quickActions.conflictWarning": { fr: "Attention: Conflits détectés dans les horaires", en: "Warning: Schedule conflicts detected", ar: "تحذير: تم اكتشاف تعارض في الجدول" },
  "settings.defaultHoursAppliedTitle": { fr: "✅ Horaires par défaut appliqués", en: "✅ Default hours applied", ar: "✅ تم تطبيق الساعات الافتراضية" },
  "settings.defaultHoursAppliedDescription": { fr: "Tous les jours utilisent maintenant les horaires par défaut.", en: "All days now use default hours.", ar: "جميع الأيام تستخدم الآن الساعات الافتراضية." },
  "settings.presetAppliedTitle": { fr: "✅ Préréglage appliqué", en: "✅ Preset applied", ar: "✅ تم تطبيق الإعداد المسبق" },
  "settings.closeWeekendsDescription": { fr: "Les weekends sont maintenant fermés.", en: "Weekends are now closed.", ar: "عطلات نهاية الأسبوع مغلقة الآن." },
  "settings.standardPresetAppliedTitle": { fr: "✅ Planning standard appliqué", en: "✅ Standard schedule applied", ar: "✅ تم تطبيق الجدول القياسي" },
  "settings.standardPresetDescription": { fr: "Horaires d'affaires standards configurés.", en: "Standard business hours configured.", ar: "تم تكوين ساعات العمل القياسية." },
  "settings.24hPresetAppliedTitle": { fr: "✅ Service 24h appliqué", en: "✅ 24h Service applied", ar: "✅ تم تطبيق خدمة 24 ساعة" },
  "settings.24hPresetDescription": { fr: "Ouverture 8h-2h (journée suivante) tous les jours.", en: "Open 8am-2am (next day) daily.", ar: "مفتوح 8 ص - 2 ص (اليوم التالي) يومياً." },

  "settings.detailedWeeklyPlanning.title": { fr: "Planning Hebdomadaire Détaillé", en: "Detailed Weekly Planning", ar: "التخطيط الأسبوعي المفصل" },
  "settings.detailedWeeklyPlanning.description": { fr: "Configurez les horaires spécifiques pour chaque jour.", en: "Configure specific hours for each day.", ar: "تكوين ساعات محددة لكل يوم." },
  "settings.detailedWeeklyPlanning.lunchBreak": { fr: "Pause déjeuner", en: "Lunch Break", ar: "استراحة الغداء" },
  "settings.detailedWeeklyPlanning.closedAllDay": { fr: "Fermé toute la journée", en: "Closed all day", ar: "مغلق طوال اليوم" },
  "settings.detailedWeeklyPlanning.nightService": { fr: "Service de nuit (jusqu'à {close} j+1)", en: "Night service (until {close} next day)", ar: "خدمة ليلية (حتى {close} اليوم التالي)" },
  "settings.detailedWeeklyPlanning.closingBeforeOpening": { fr: "Heure de fermeture avant ouverture", en: "Closing time before opening", ar: "وقت الإغلاق قبل الفتح" },
  "settings.detailedWeeklyPlanning.breakEndBeforeStart": { fr: "Heure de fin de pause avant début", en: "Break end time before start", ar: "وقت انتهاء الاستراحة قبل البدء" },
  "settings.detailedWeeklyPlanning.serviceUntilNextDay": { fr: "Service jusqu'à {close} le lendemain", en: "Service until {close} next day", ar: "الخدمة حتى {close} اليوم التالي" },
  "settings.detailedWeeklyPlanning.wellDeservedRest": { fr: "Repos bien mérité", en: "Well deserved rest", ar: "راحة مستحقة" },

  "settings.weeklyOverview.title": { fr: "Planning Hebdomadaire", en: "Weekly Schedule", ar: "الجدول الأسبوعي" },
  "settings.weeklyOverview.subtitle": { fr: "Vue d'ensemble de vos horaires d'ouverture", en: "Overview of your opening hours", ar: "نظرة عامة على ساعات العمل" },
  "settings.weeklyOverview.openDays": { fr: "Jours ouverts", en: "Open Days", ar: "أيام العمل" },
  "settings.weeklyOverview.nightServices": { fr: "Services nocturnes", en: "Night Services", ar: "الخدمات الليلية" },
  "settings.weeklyOverview.withBreak": { fr: "Avec pause", en: "With Break", ar: "مع استراحة" },
  "settings.weeklyOverview.averagePerDay": { fr: "Moyenne/jour", en: "Average/day", ar: "متوسط/يوم" },

  "settings.tips.title": { fr: "Conseils d'utilisation", en: "Usage Tips", ar: "نصائح الاستخدام" },
  "settings.tips.tip1": { fr: "• Utilisez les actions rapides pour configurer plusieurs jours", en: "• Use quick actions to configure multiple days", ar: "• استخدم الإجراءات السريعة لتكوين عدة أيام" },
  "settings.tips.tip2": { fr: "• Activez les pauses déjeuner pour les fermetures temporaires", en: "• Enable lunch breaks for temporary closures", ar: "• تفعيل استراحات الغداء للإغلاقات المؤقتة" },
  "settings.tips.tip3": { fr: "• Pour le service 24h : ouvrez à 08:00 et fermez à 02:00", en: "• For 24h service: open at 08:00 and close at 02:00", ar: "• لخدمة 24 ساعة: افتح في 08:00 وأغلق في 02:00" },
  "settings.tips.tip4": { fr: "• Les horaires spécifiques l'emportent sur les défauts", en: "• Specific hours override defaults", ar: "• الساعات المحددة تتجاوز الافتراضية" },
  "settings.tips.tip5": { fr: "• Les jours fermés n'acceptent pas de réservations", en: "• Closed days do not accept reservations", ar: "• الأيام المغلقة لا تقبل الحجوزات" },
  "settings.tips.tip6": { fr: "• Les services nocturnes sont parfaits pour les équipes", en: "• Night services are perfect for shift teams", ar: "• الخدمات الليلية مثالية للفرق" },

  "settings.specialHours.title": { fr: "Horaires Spéciaux (Vacances & Événements)", en: "Special Hours (Holidays & Events)", ar: "ساعات خاصة (عطلات وأحداث)" },
  "settings.specialHours.add": { fr: "Ajouter", en: "Add", ar: "إضافة" },
  "settings.specialHours.noSpecialHoursConfigured": { fr: "Aucun horaire spécial configuré", en: "No special hours configured", ar: "لم يتم تكوين ساعات خاصة" },
  "settings.specialHours.addSpecialHoursDescription": { fr: "Ajoutez des horaires pour les jours fériés ou événements", en: "Add hours for holidays or events", ar: "أضف ساعات للعطلات أو الأحداث" },
  "settings.specialHours.infoDescription": { fr: "Configurez des horaires spécifiques pour les jours fériés. Ces horaires remplaceront le planning normal.", en: "Configure specific hours for holidays. These override standard schedule.", ar: "تكوين ساعات محددة للعطلات. هذه تتجاوز الجدول القياسي." },
  "settings.specialHours.addSpecialHour": { fr: "Ajouter un horaire spécial", en: "Add Special Hour", ar: "إضافة ساعة خاصة" },
  "settings.specialHours.eventName": { fr: "Nom de l'événement", en: "Event Name", ar: "اسم الحدث" },
  "settings.specialHours.eventNamePlaceholder": { fr: "Jour de l'An, Ramadan...", en: "New Year, Ramadan...", ar: "رأس السنة، رمضان..." },
  "settings.specialHours.openThatDay": { fr: "Ouvert ce jour-là", en: "Open that day", ar: "مفتوح في ذلك اليوم" },
  "settings.specialHours.closedThatDay": { fr: "Fermé ce jour-là", en: "Closed that day", ar: "مغلق في ذلك اليوم" },
  "settings.specialHours.openingTime": { fr: "Heure d'ouverture", en: "Opening Time", ar: "وقت الفتح" },
  "settings.specialHours.closingTime": { fr: "Heure de fermeture", en: "Closing Time", ar: "وقت الإغلاق" },
  "settings.specialHours.noteOptional": { fr: "Note (optionnel)", en: "Note (optional)", ar: "ملاحظة (اختياري)" },
  "settings.specialHours.notePlaceholder": { fr: "Raison...", en: "Reason...", ar: "السبب..." },
  "settings.specialHours.errorTitle": { fr: "Erreur", en: "Error", ar: "خطأ" },
  "settings.specialHours.errorMessage": { fr: "Veuillez remplir tous les champs requis.", en: "Please fill all required fields.", ar: "يرجى ملء جميع الحقول المطلوبة." },
  "settings.specialHours.addSuccessTitle": { fr: "✅ Horaire spécial ajouté", en: "✅ Special hour added", ar: "✅ تم إضافة ساعة خاصة" },
  "settings.specialHours.addSuccessDescription": { fr: "{name} a été configuré.", en: "{name} configured.", ar: "تم تكوين {name}." },
  "settings.specialHours.removeSuccessTitle": { fr: "🗑️ Horaire spécial supprimé", en: "🗑️ Special hour removed", ar: "🗑️ تم إزالة الساعة الخاصة" },

  // Device Configuration
  "settings.deviceConfig.title": { fr: "Configuration de l'Appareil", en: "Device Configuration", ar: "تكوين الجهاز" },
  "settings.deviceConfig.workStation": { fr: "Autorisation Poste de Travail", en: "Work Station Authorization", ar: "تصريح محطة العمل" },
  "settings.deviceConfig.description": { fr: "Identifiez cet appareil spécifique comme 'Poste de Travail'. Le personnel qui se connecte ici verra sa présence suivie automatiquement.", en: "Identify this specific device as a 'Work Station'. Staff logging in here will have their attendance automatically tracked.", ar: "تعريف هذا الجهاز كمحطة عمل. سيتم تتبع حضور الموظفين الذين يسجلون الدخول من هنا تلقائياً." },
  "settings.deviceConfig.authorized": { fr: "Cet appareil est autorisé", en: "This device is authorized", ar: "هذا الجهاز مصرح به" },
  "settings.deviceConfig.revokeQuote": { fr: "Êtes-vous sûr ? Le personnel ne sera plus suivi depuis cet appareil.", en: "Are you sure? Staff will no longer be tracked from this device.", ar: "هل أنت متأكد؟ لن يتم تتبع الموظفين من هذا الجهاز بعد الآن." },
  "settings.deviceConfig.revoke": { fr: "Révoquer l'Autorisation", en: "Revoke Authorization", ar: "إلغاء التصريح" },
  "settings.deviceConfig.authorize": { fr: "Autoriser comme Poste", en: "Authorize as Work Station", ar: "تصريح كمحطة عمل" },
  "settings.deviceConfig.authorizedSuccess": { fr: "Appareil Autorisé", en: "Device Authorized", ar: "تم تصريح الجهاز" },
  "settings.deviceConfig.authorizedDesc": { fr: "Ce PC est maintenant un Poste de Travail.", en: "This PC is now a Work Station.", ar: "هذا الكمبيوتر أصبح الآن محطة عمل." },
  "settings.deviceConfig.deauthorizedSuccess": { fr: "Appareil Désautorisé", en: "Device Deauthorized", ar: "تم إلغاء تصريح الجهاز" },

  "settings.pointsSystem.title": { fr: "Configuration du Système de Points", en: "Points System Configuration", ar: "تكوين نظام النقاط" },
  "settings.pointsSystem.pointsPerDT": { fr: "Points par 1 DT dépense", en: "Points per 1 DT spent", ar: "نقاط لكل 1 دينار يتم إنفاقه" },
  "settings.pointsSystem.pointsPerDTDescription": { fr: "Les clients gagnent {points} points pour chaque 1 DT", en: "Customers earn {points} points for every 1 DT", ar: "يكسب العملاء {points} نقاط لكل 1 دينار" },
  "settings.pointsSystem.dtPerPoint": { fr: "Coût DT par point", en: "DT cost per point", ar: "تكلفة الدينار لكل نقطة" },
  "settings.pointsSystem.dtPerPointDescription": { fr: "Les clients paient {dt} DT par point lors de l'échange", en: "Customers pay {dt} DT per point when redeeming", ar: "يدفع العملاء {dt} دينار لكل نقطة عند الاستبدال" },
  "settings.pointsSystem.exampleSpend": { fr: "Client dépense 10 DT → Gagne {points} points", en: "Customer spends 10 DT → Earns {points} points", ar: "العميل ينفق 10 دينار → يكسب {points} نقاط" },
  "settings.pointsSystem.exampleRedeem": { fr: "Client échange 50 points → Paie {dt} DT", en: "Customer redeems 50 points → Pays {dt} DT", ar: "العميل يستبدل 50 نقطة → يدفع {dt} دينار" },

  "settings.freeGameProgram.title": { fr: "Programme Jeu Gratuit", en: "Free Game Program", ar: "برنامج اللعبة المجانية" },
  "settings.freeGameProgram.gamesRequired": { fr: "Parties requises pour jeu gratuit", en: "Games required for free game", ar: "الألعاب المطلوبة للحصول على لعبة مجانية" },
  "common.nextDayAbbr": { fr: "j+1", en: "next day", ar: "اليوم التالي" },
  "common.info": { fr: "Info", en: "Info", ar: "معلومات" },
  "common.online": { fr: "En ligne", en: "Online", ar: "متصل" },
  "common.welcome_back": { fr: "Heureux de vous revoir", en: "Welcome back", ar: "مرحباً بعودتك" },
  "common.weekend": { fr: "Weekend", en: "Weekend", ar: "عطلة نهاية الأسبوع" },
  "common.weekday": { fr: "Semaine", en: "Weekday", ar: "أيام الأسبوع" },
  "common.night": { fr: "Nocturne", en: "Night", ar: "ليليل" },
  "common.open": { fr: "Ouvert", en: "Open", ar: "مفتوح" },
  "common.closed": { fr: "Fermé", en: "Closed", ar: "مغلق" },
  "common.opening": { fr: "Ouverture", en: "Opening", ar: "فتح" },
  "common.closing": { fr: "Fermeture", en: "Closing", ar: "إغلاق" },
  "common.hours": { fr: "Horaires", en: "Hours", ar: "ساعات" },
  "common.date": { fr: "Date", en: "Date", ar: "التاريخ" },
  "common.cancel": { fr: "Annuler", en: "Cancel", ar: "إلغاء" },
  "common.add": { fr: "Ajouter", en: "Add", ar: "إضافة" },
  "common.example": { fr: "Exemple", en: "Example", ar: "مثال" },
  "common.days.monday": { fr: "Lundi", en: "Monday", ar: "الاثنين" },
  "common.days.tuesday": { fr: "Mardi", en: "Tuesday", ar: "الثلاثاء" },
  "common.days.wednesday": { fr: "Mercredi", en: "Wednesday", ar: "الأربعاء" },
  "common.days.thursday": { fr: "Jeudi", en: "Thursday", ar: "الخميس" },
  "common.days.friday": { fr: "Vendredi", en: "Friday", ar: "الجمعة" },
  "common.days.saturday": { fr: "Samedi", en: "Saturday", ar: "السبت" },
  "common.days.sunday": { fr: "Dimanche", en: "Sunday", ar: "الأحد" },
  "accessDenied.title": { fr: "Accès Refusé", en: "Access Denied", ar: "تم رفض الوصول" },
  "accessDenied.message": { fr: "Seuls les propriétaires peuvent gérer les paramètres.", en: "Only owners can manage store settings.", ar: "فقط المالكون يمكنهم إدارة إعدادات المتجر." },
  "pricing.title": { fr: "Gestion des Tarifs", en: "Pricing Management", ar: "إدارة التسعير" },
  "pricing.subtitle": { fr: "Configurez les prix des sessions et services", en: "Configure pricing for sessions and services", ar: "تكوين أسعار الجلسات والخدمات" },
  "pricing.ps5": { fr: "Sessions PS5", en: "PS5 Sessions", ar: "جلسات PS5" },
  "pricing.ps4": { fr: "Sessions PS4", en: "PS4 Sessions", ar: "جلسات PS4" },
  "pricing.other": { fr: "Autres Services", en: "Other Services", ar: "خدمات أخرى" },
  "pricing.price": { fr: "Prix", en: "Price", ar: "السعر" },
  "pricing.duration": { fr: "Durée (min)", en: "Duration (min)", ar: "المدة (دقيقة)" },
  "pricing.extra": { fr: "Prix Extra", en: "Extra Price", ar: "سعر إضافي" },
  "pricing.points": { fr: "Points Gagnés", en: "Points Earned", ar: "النقاط المكتسبة" },

  // Products
  "products.title": { fr: "Gestion des Produits", en: "Product Management", ar: "إدارة المنتجات" },
  "products.subtitle": { fr: "Gérez votre inventaire et stock", en: "Manage your inventory and stock", ar: "إدارة المخزون والمستودع" },
  "products.add": { fr: "Ajouter Produit", en: "Add Product", ar: "إضافة منتج" },
  "products.name": { fr: "Nom du Produit", en: "Product Name", ar: "اسم المنتج" },
  "products.description": { fr: "Description", en: "Description", ar: "الوصف" },
  "products.stock": { fr: "Stock", en: "Stock", ar: "المخزون" },
  "products.category": { fr: "Catégorie", en: "Category", ar: "الفئة" },
  "products.price": { fr: "Prix", en: "Price", ar: "السعر" },
  "products.edit": { fr: "Modifier", en: "Edit", ar: "تعديل" },
  "products.delete": { fr: "Supprimer", en: "Delete", ar: "حذف" },
  "products.in_stock": { fr: "En Stock", en: "In Stock", ar: "متوفر" },
  "products.out_stock": { fr: "Rupture", en: "Out of Stock", ar: "نفذت الكمية" },

  // Sales
  "sales.title": { fr: "Ventes", en: "Sales", ar: "المبيعات" },
  "sales.subtitle": { fr: "Vendre des produits de l'inventaire", en: "Sell products from inventory", ar: "بيع المنتجات من المخزون" },
  "sales.search": { fr: "Rechercher produits...", en: "Search products...", ar: "البحث عن المنتجات..." },
  "sales.today": { fr: "Ventes du Jour", en: "Today's Sales", ar: "مبيعات اليوم" },
  "sales.select": { fr: "Sélectionner", en: "Select", ar: "تحديد" },
  "sales.quantity": { fr: "Quantité", en: "Quantity", ar: "الكمية" },
  "sales.payment": { fr: "Moyen de Paiement", en: "Payment Method", ar: "طريقة الدفع" },
  "sales.cash": { fr: "Espèces", en: "Cash", ar: "نقدا" },
  "sales.points": { fr: "Points", en: "Points", ar: "نقاط" },
  "sales.mixed": { fr: "Mixte (Espèces + Points)", en: "Mixed (Cash + Points)", ar: "مختلط (نقد + نقاط)" },
  "sales.client_phone": { fr: "Tél Client (Optionnel)", en: "Client Phone (Optional)", ar: "هاتف العميل (اختياري)" },
  "sales.complete": { fr: "Terminer Vente", en: "Complete Sale", ar: "إتمام البيع" },
  "sales.confirm": { fr: "Confirmer", en: "Confirm", ar: "تأكيد" },
  "sales.summary": { fr: "Résumé", en: "Summary", ar: "ملخص" },
  "sales.total": { fr: "Total à payer", en: "Total to pay", ar: "المجموع للدفع" },
  "sales.discount": { fr: "Réduction points", en: "Points discount", ar: "خصم النقاط" },

  // Gaming Zone
  "gaming.badge": { fr: "Paradis Gaming", en: "Gaming Paradise", ar: "جنة الألعاب" },
  "gaming.title1": { fr: "La Zone", en: "The Ultimate", ar: "منطقة الألعاب" },
  "gaming.title2": { fr: " Gaming Ultime", en: " Gaming Zone", ar: " المثالية" },
  "gaming.subtitle": { fr: "Entrez dans notre havre gaming néon. Prenez une manette, défiez vos amis sur nos écrans 4K, savourez des boissons fraîches et vibrez sur nos playlists gaming.", en: "Step into our neon-lit gaming haven. Grab a controller, challenge your friends on our massive 4K screens, sip on refreshing drinks, and vibe to curated gaming playlists.", ar: "ادخل إلى ملاذنا للألعاب المضيء بالنيون. امسك ذراع التحكم، تحدى أصدقاءك على شاشاتنا 4K الضخمة، واستمتع بالمشروبات المنعشة." },
  "gaming.feature1": { fr: "TVs 4K Gaming", en: "4K Gaming TVs", ar: "شاشات 4K" },
  "gaming.feature2": { fr: "PS5 & PS4", en: "PS5 & PS4", ar: "PS5 و PS4" },
  "gaming.feature3": { fr: "Audio Premium", en: "Premium Audio", ar: "صوت ممتاز" },
  "gaming.feature4": { fr: "Boissons Fraîches", en: "Soft Drinks", ar: "مشروبات" },
  "gaming.feature5": { fr: "Musique Ambiance", en: "Vibing Music", ar: "موسيقى" },
  "gaming.feature6": { fr: "Simulateur", en: "Simulator", ar: "محاكي" },
  "gaming.pricing.title": { fr: "Tarifs Zone Gaming", en: "Gaming Zone Pricing", ar: "أسعار منطقة الألعاب" },
  "gaming.pricing.ps4.hour": { fr: "PS4 (1h)", en: "PS4 (1h)", ar: "PS4 (ساعة)" },
  "gaming.pricing.ps4.game": { fr: "PS4 (1 partie)", en: "PS4 (1 game)", ar: "PS4 (لعبة)" },
  "gaming.pricing.ps5.hour": { fr: "PS5 (1h)", en: "PS5 (1h)", ar: "PS5 (ساعة)" },
  "gaming.pricing.ps5.game": { fr: "PS5 (1 partie)", en: "PS5 (1 game)", ar: "PS5 (لعبة)" },
  "gaming.pricing.online": { fr: "Jeu Online (1h)", en: "Online Game (1h)", ar: "لعبة أونلاين (ساعة)" },
  "gaming.pricing.simulator": { fr: "Simulateur (1h)", en: "Simulator (1h)", ar: "محاكي (ساعة)" },
  "gaming.offer": { fr: "🎮 Achetez {count} parties, la {next}ème est offerte!", en: "🎮 Buy {count} games, get the {next}th FREE!", ar: "🎮 اشتري {count} ألعاب واحصل على الـ {next} مجاناً!" },
  "gaming.reserve": { fr: "Réserver Maintenant", en: "Reserve Your Spot", ar: "احجز مكانك" },
  "gaming.stations": { fr: "10 Postes", en: "10 Stations", ar: "١٠ محطات" },
  "gaming.open": { fr: "OUVERT", en: "OPEN NOW", ar: "مفتوح الآن" },
  "gaming.closed": { fr: "FERMÉ", en: "CLOSED", ar: "مغلق" },
  "gaming.opens.after": { fr: "Ouvre dans", en: "Opens in", ar: "يفتح بعد" },
  "gaming.opens.hour": { fr: "heure", en: "hour", ar: "ساعة" },
  "gaming.opens.hours": { fr: "heures", en: "hours", ar: "ساعات" },
  "gaming.opens.minutes": { fr: "minutes", en: "minutes", ar: "دقائق" },

  // Sidebar navigation labels
  "sidebar.financial_overview": { fr: "Aperçu Financier", en: "Financial Overview", ar: "نظرة مالية" },
  "sidebar.session_management": { fr: "Gestion Sessions", en: "Session Management", ar: "إدارة الجلسات" },
  "sidebar.service_management": { fr: "Gestion Services", en: "Service Management", ar: "إدارة الخدمات" },
  "sidebar.sales_management": { fr: "Gestion Ventes", en: "Sales Management", ar: "إدارة المبيعات" },
  "sidebar.client_management": { fr: "Gestion Clients", en: "Client Management", ar: "إدارة العملاء" },
  "sidebar.product_inventory": { fr: "Inventaire Produits", en: "Product Inventory", ar: "مخزون المنتجات" },
  "sidebar.pricing_config": { fr: "Config. Tarifs", en: "Pricing Config", ar: "تكوين الأسعار" },
  "sidebar.console_settings": { fr: "Config. Consoles", en: "Console Settings", ar: "إعدادات الأجهزة" },
  "sidebar.staff_management": { fr: "Gestion Personnel", en: "Staff Management", ar: "إدارة الموظفين" },
  "sidebar.blog_marketing": { fr: "Blog \u0026 Marketing", en: "Blog \u0026 Marketing", ar: "المدونة والتسويق" },
  "sidebar.charges_management": { fr: "Gestion Charges", en: "Charges Management", ar: "إدارة المصاريف" },
  "sidebar.store_settings": { fr: "Paramètres Magasin", en: "Store Settings", ar: "إعدادات المتجر" },
  "sidebar.sign_out": { fr: "Déconnexion", en: "Sign Out", ar: "تسجيل الخروج" },
  "client.add": { fr: "Ajouter Client", en: "Add Client", ar: "إضافة عميل" },
  "client.total": { fr: "Total Clients", en: "Total Clients", ar: "إجمالي العملاء" },
  "client.total_points": { fr: "Total Points", en: "Total Points", ar: "إجمالي النقاط" },
  "client.total_games": { fr: "Total Jeux", en: "Total Games", ar: "إجمالي الألعاب" },
  "client.member_since": { fr: "Membre depuis", en: "Member since", ar: "عضو منذ" },
  "client.search_placeholder": { fr: "Rechercher par nom ou téléphone...", en: "Search by name or phone...", ar: "البحث بالاسم أو الهاتف..." },
  "client.manage_desc": { fr: "Gérer les comptes clients et les points de fidélité", en: "Manage customer accounts and loyalty points", ar: "إدارة حسابات العملاء ونقاط الولاء" },
  "client.redeem": { fr: "Utiliser", en: "Redeem", ar: "استبدال" },
  "client.history": { fr: "Historique", en: "History", ar: "السجل" },
  "client.games": { fr: "jeux", en: "games", ar: "ألعاب" },
  "attendance.clock_in": { fr: "Pointer Arrivée", en: "Clock In", ar: "تسجيل الدخول" },
  "attendance.clock_out": { fr: "Pointer Départ", en: "Clock Out", ar: "تسجيل الخروج" },
  "attendance.staff_status": { fr: "Statut Personnel", en: "Staff Status", ar: "حالة الموظف" },
  "attendance.in_service": { fr: "En Service", en: "In Service", ar: "في الخدمة" },
  "attendance.offline": { fr: "Hors Ligne", en: "Offline", ar: "غير متصل" },
  "attendance.success_in": { fr: "Pointage arrivée réussi", en: "Clocked in successfully", ar: "تم تسجيل الدخول بنجاح" },
  "attendance.success_out": { fr: "Pointage départ réussi", en: "Clocked out successfully", ar: "تم تسجيل الخروج بنجاح" },

  // About section stats
  "about.stat1.value": { fr: "2000+", en: "2000+", ar: "٢٠٠٠+" },
  "about.stat1.label": { fr: "Réparations", en: "Repairs", ar: "إصلاحات" },
  "about.stat2.value": { fr: "500+", en: "500+", ar: "٥٠٠+" },
  "about.stat2.label": { fr: "Clients Satisfaits", en: "Happy Clients", ar: "عملاء سعداء" },
  "about.stat3.value": { fr: "5★", en: "5★", ar: "٥★" },
  "about.stat3.label": { fr: "Note", en: "Rating", ar: "التقييم" },

  // About
  "about.badge": { fr: "À Propos", en: "About Us", ar: "من نحن" },
  "about.title1": { fr: "Pourquoi Choisir", en: "Why Choose", ar: "لماذا تختار" },
  "about.title2": { fr: " Game Store?", en: " Game Store?", ar: " متجرنا؟" },
  "about.subtitle": { fr: "Nous ne sommes pas qu'un simple magasin. Nous sommes des gamers, des passionnés de tech et des bâtisseurs de communauté.", en: "We're not just another repair shop. We're gamers, tech enthusiasts, and community builders who understand what your devices mean to you.", ar: "لسنا مجرد متجر إصلاح آخر. نحن لاعبون وعشاق تقنية وبناة مجتمع نفهم ما تعنيه أجهزتك لك." },
  "about.value1.title": { fr: "Garantie 30 Jours", en: "30-Day Warranty", ar: "ضمان 30 يوم" },
  "about.value1.desc": { fr: "Toutes les réparations sont garanties 30 jours. Pièces premium uniquement.", en: "All repairs come with a 30-day warranty. We use only premium parts.", ar: "جميع الإصلاحات مضمونة لمدة 30 يومًا. نستخدم قطع غيار ممتازة فقط." },
  "about.value2.title": { fr: "Service Rapide", en: "Quick Turnaround", ar: "خدمة سريعة" },
  "about.value2.desc": { fr: "La plupart des réparations terminées le jour même.", en: "Most repairs completed same-day. Get back to gaming faster.", ar: "معظم الإصلاحات تكتمل في نفس اليوم. عد للألعاب أسرع." },
  "about.value3.title": { fr: "Techniciens Experts", en: "Expert Technicians", ar: "فنيون خبراء" },
  "about.value3.desc": { fr: "Professionnels certifiés avec des années d'expérience.", en: "Certified professionals with years of experience in tech repair.", ar: "محترفون معتمدون مع سنوات من الخبرة في إصلاح التقنية." },
  "about.value4.title": { fr: "Communauté D'abord", en: "Community First", ar: "المجتمع أولاً" },
  "about.value4.desc": { fr: "Plus qu'un magasin - une famille de gamers. Bienvenue à tous!", en: "More than a store - we're a gaming family. Everyone's welcome.", ar: "أكثر من متجر - نحن عائلة ألعاب. الجميع مرحب به." },
  "about.story": { fr: "\"Notre mission? Réparer vos appareils, alimenter votre passion gaming, et construire une communauté où chacun a sa place.\"", en: "\"Our mission? Fix your devices, fuel your gaming passion, and build a community where everyone belongs.\"", ar: "\"مهمتنا؟ إصلاح أجهزتك، تغذية شغفك بالألعاب، وبناء مجتمع يشعر فيه الجميع بالانتماء.\"" },
  "about.est": { fr: "Zarzis", en: "Zarzis", ar: "جرجيس" },
  "about.customers": { fr: "Rejoignez nos clients satisfaits", en: "Join our happy customers", ar: "انضم لعملائنا السعداء" },

  // Contact
  "contact.badge": { fr: "Contactez-Nous", en: "Get In Touch", ar: "تواصل معنا" },
  "contact.title1": { fr: "Visitez", en: "Visit", ar: "زوروا" },
  "contact.title2": { fr: " Game Store Zarzis", en: " Game Store Zarzis", ar: " متجرنا في جرجيس" },
  "contact.subtitle": { fr: "Passez pour des réparations, des sessions gaming, ou simplement pour discuter avec d'autres gamers.", en: "Drop by for repairs, gaming sessions, or just to hang out with fellow gamers.", ar: "مروا للإصلاحات أو جلسات الألعاب أو فقط للاستمتاع مع زملائكم اللاعبين." },
  "contact.location": { fr: "Adresse", en: "Location", ar: "العنوان" },
  "contact.location.value": { fr: "Zarzis, Tunisie", en: "Zarzis, Tunisia", ar: "جرجيس، تونس" },
  "contact.hours": { fr: "Horaires", en: "Hours", ar: "ساعات العمل" },
  "contact.hours.value": { fr: "08:00h – 02:00h", en: "08:00h – 02:00h", ar: "٠٨:٠٠ - ٠٢:٠٠" },
  "contact.phone": { fr: "Téléphone", en: "Phone", ar: "الهاتف" },
  "contact.phone.value": { fr: "23 290 065", en: "23 290 065", ar: "23 290 065" },
  "contact.email": { fr: "Email", en: "Email", ar: "البريد الإلكتروني" },
  "contact.email.value": { fr: "game.store.zarzis@gmail.com", en: "game.store.zarzis@gmail.com", ar: "game.store.zarzis@gmail.com" },
  "contact.follow": { fr: "Suivez-nous:", en: "Follow us:", ar: "تابعونا:" },
  "contact.form.title": { fr: "Envoyez-nous un Message", en: "Send us a Message", ar: "أرسل لنا رسالة" },
  "contact.form.name": { fr: "Nom", en: "Name", ar: "الاسم" },
  "contact.form.name.placeholder": { fr: "Votre nom", en: "Your name", ar: "اسمك" },
  "contact.form.email": { fr: "Email", en: "Email", ar: "البريد الإلكتروني" },
  "contact.form.email.placeholder": { fr: "vous@email.com", en: "you@email.com", ar: "بريدك@email.com" },
  "contact.form.subject": { fr: "Sujet", en: "Subject", ar: "الموضوع" },
  "contact.form.subject.repair": { fr: "Demande de Réparation", en: "Repair Inquiry", ar: "استفسار إصلاح" },
  "contact.form.subject.gaming": { fr: "Réservation Zone Gaming", en: "Gaming Zone Booking", ar: "حجز منطقة الألعاب" },
  "contact.form.subject.general": { fr: "Question Générale", en: "General Question", ar: "سؤال عام" },
  "contact.form.message": { fr: "Message", en: "Message", ar: "الرسالة" },
  "contact.form.message.placeholder": { fr: "Dites-nous ce dont vous avez besoin...", en: "Tell us what you need...", ar: "أخبرنا بما تحتاجه..." },
  "contact.form.send": { fr: "Envoyer le Message", en: "Send Message", ar: "إرسال الرسالة" },

  // Footer
  "footer.copyright": { fr: "© 2024 Game Store Zarzis. Tous droits réservés.", en: "© 2024 Game Store Zarzis. All rights reserved.", ar: "© 2024 متجر الألعاب جرجيس. جميع الحقوق محفوظة." },

  // Products Showcase
  "products.special": { fr: "OFFRES SPÉCIALES", en: "SPECIAL OFFERS", ar: "عروض خاصة" },
  "products.featured": { fr: "Produits", en: "Featured", ar: "منتجات" },
  "products.title_suffix": { fr: "Vedettes", en: "Products", ar: "مميزة" },
  "products.showcase_subtitle": { fr: "Découvrez nos derniers produits et offres spéciales", en: "Check out our latest products and special offers", ar: "اكتشف أحدث منتجاتنا وعروضنا الخاصة" },
  "products.no_image": { fr: "Pas d'image", en: "No image", ar: "لا توجد صورة" },
  "products.sale": { fr: "PROMO", en: "SALE", ar: "تخفيض" },
  "products.add_cart": { fr: "Ajouter au Panier", en: "Add to Cart", ar: "أضف إلى السلة" },

  // Client Status & Labels
  "client.status.completed": { fr: "Terminé", en: "Completed", ar: "مكتمل" },
  "client.status.in_progress": { fr: "En Cours", en: "In Progress", ar: "قيد التنفيذ" },
  "client.status.pending": { fr: "En Attente", en: "Pending", ar: "قيد الانتظار" },
  "client.status.delivered": { fr: "Livré", en: "Delivered", ar: "تم التوصيل" },
  "client.status.ready": { fr: "Prêt", en: "Ready", ar: "جاهز" },
  "client.label.device": { fr: "Appareil", en: "Device", ar: "الجهاز" },
  "client.label.items": { fr: "articles", en: "items", ar: "عناصر" },

  // Gaming Table
  "gaming.table.session_type": { fr: "Type de Session", en: "Session Type", ar: "نوع الجلسة" },
  "gaming.table.price": { fr: "Prix", en: "Price", ar: "السعر" },

  // News Showcase
  "news.latest": { fr: "DERNIÈRES MAJ", en: "LATEST UPDATES", ar: "آخر التحديثات" },
  "news.title": { fr: "Actualités", en: "Store", ar: "أخبار" },
  "news.title_suffix": { fr: "Magasin", en: "News", ar: "المتجر" },
  "news.subtitle": { fr: "Restez informé de nos offres, événements et actualités gaming", en: "Stay updated with our latest offers, events, and gaming news", ar: "ابق على اطلاع بآخر عروضنا وأحداثنا وأخبار الألعاب" },
  "news.read_more": { fr: "Lire Plus", en: "Read More", ar: "اقرأ المزيد" },
  "news.show_less": { fr: "Voir Moins", en: "Show Less", ar: "عرض أقل" },

  // Services Extra
  "services.expert_care": { fr: "SOIN EXPERT", en: "EXPERT CARE", ar: "عناية خبيرة" },
  "services.price_start": { fr: "À partir de", en: "Price starts at", ar: "السعر يبدأ من" },
  "services.currency": { fr: "DT", en: "DT", ar: "د.ت" },

  // Pricing Fallback
  "pricing.ps4_30min": { fr: "PS4 - 30 min", en: "PS4 - 30 min", ar: "PS4 - 30 دقيقة" },
  "pricing.ps4_1h": { fr: "PS4 - 1 heure", en: "PS4 - 1 hour", ar: "PS4 - ساعة" },
  "pricing.ps4_2h": { fr: "PS4 - 2 heures", en: "PS4 - 2 hours", ar: "PS4 - ساعتان" },
  "pricing.ps5_30min": { fr: "PS5 - 30 min", en: "PS5 - 30 min", ar: "PS5 - 30 دقيقة" },
  "pricing.ps5_1h": { fr: "PS5 - 1 heure", en: "PS5 - 1 hour", ar: "PS5 - ساعة" },
  "pricing.ps5_2h": { fr: "PS5 - 2 heures", en: "PS5 - 2 hours", ar: "PS5 - ساعتان" },

  "checkout.cart": { fr: "Panier", en: "Cart", ar: "السلة" },
  "checkout.delivery": { fr: "Livraison", en: "Delivery", ar: "التوصيل" },
  "checkout.review": { fr: "Révision", en: "Review", ar: "المراجعة" },
  "checkout.success.title": { fr: "COMMANDE PASSÉE !", en: "ORDER PLACED!", ar: "تم الطلب!" },
  "checkout.success.subtitle": { fr: "Votre aventure gaming commence bientôt.", en: "Your gaming adventure begins soon.", ar: "مغامرتك في الألعاب تبدأ قريباً." },
  "checkout.success.status": { fr: "Statut : Traitement en cours", en: "Status: Processing", ar: "الحالة: جارِ المعالجة" },
  "checkout.success.home": { fr: "Retour à l'Accueil", en: "Back to Home", ar: "الرجوع للرئيسية" },
  "checkout.summary.title": { fr: "Résumé de la Commande", en: "Order Summary", ar: "ملخص الطلب" },
  "checkout.summary.total_payable": { fr: "Total à Payer", en: "Total Payable", ar: "المجموع للدفع" },
  "checkout.summary.confirmed": { fr: "Confirmé", en: "Confirmed", ar: "مؤكد" },
  "checkout.btn.continue": { fr: "Continuer", en: "Continue", ar: "استمرار" },
  "checkout.btn.review": { fr: "Vérifier la Commande", en: "Review Order", ar: "مراجعة الطلب" },
  "checkout.btn.confirm": { fr: "Confirmer l'Achat", en: "Confirm Purchase", ar: "تأكيد الشراء" },
  "checkout.btn.back": { fr: "Retour", en: "Go Back", ar: "رجوع" },
  "checkout.details.contact": { fr: "Informations de Contact", en: "Contact Information", ar: "معلومات الاتصال" },
  "checkout.details.delivery": { fr: "Méthode de Livraison", en: "Delivery Method", ar: "طريقة التوصيل" },
  "checkout.details.address": { fr: "Adresse de Livraison", en: "Delivery Address", ar: "عنوان التوصيل" },
  "checkout.review.payment": { fr: "Mode de Paiement", en: "Payment Method", ar: "طريقة الدفع" },
  "checkout.review.instructions": { fr: "Instructions", en: "Instructions", ar: "التعليمات" },
  "checkout.review.ref": { fr: "ID Transaction / Référence (Optionnel)", en: "Transaction ID / Reference (Optional)", ar: "رقم العملية / المرجع (اختياري)" },
  "checkout.review.notes": { fr: "Notes Additionnelles", en: "Additional Notes", ar: "ملاحظات إضافية" },
  "checkout.review.placeholder_notes": { fr: "Instructions spéciales ?", en: "Special instructions?", ar: "تعليمات خاصة؟" },
  "checkout.review.as": { fr: "Révision par :", en: "Reviewing as:", ar: "المراجعة باسم:" },
  "checkout.cart.empty": { fr: "Votre panier est vide", en: "Your cart is empty", ar: "سلة التسوق فارغة" },
  "checkout.cart.empty_desc": { fr: "On dirait que vous n'avez rien ajouté encore.", en: "Looks like you haven't added anything yet.", ar: "يبدو أنك لم تضف أي شيء بعد." },
  "checkout.cart.browse": { fr: "Parcourir la Boutique", en: "Browse Shop", ar: "تصفح المتجر" },
  "checkout.delivery.post": { fr: "Poste Rapide", en: "Rapid Post", ar: "البريد السريع" },
  "checkout.delivery.post_desc": { fr: "Expédition partout en Tunisie.", en: "Shipping anywhere in Tunisia.", ar: "الشحن إلى أي مكان في تونس." },
  "checkout.details.address_placeholder": { fr: "Adresse, Appartement, Ville, Code Postal...", en: "Street address, Apartment, City, Postal Code...", ar: "العنوان، الشقة، المدينة، الرمز البريدي..." },
  "checkout.terms": { fr: "En passant votre commande, vous acceptez nos conditions de service et de livraison.", en: "By placing your order, you agree to our terms of service and delivery conditions.", ar: "بتقديم طلبك، فإنك توافق على شروط الخدمة وظروف التوصيل الخاصة بنا." },
  "checkout.redirecting": { fr: "Redirection dans quelques secondes...", en: "Redirecting in a few seconds...", ar: "إعادة التوجيه خلال ثوانٍ..." },
  "checkout.error.missing": { fr: "Informations manquantes", en: "Missing information", ar: "معلومات ناقصة" },
  "checkout.error.missing_desc": { fr: "Veuillez fournir votre nom et votre numéro de téléphone.", en: "Please provide your name and phone number.", ar: "يرجى تقديم اسمك ورقم هاتفك." },
  "checkout.error.name": { fr: "Nom Invalide", en: "Invalid Name", ar: "اسم غير صالح" },
  "checkout.error.name_desc": { fr: "Veuillez entrer un nom complet valide (min 2 caractères).", en: "Please enter a valid full name (min 2 characters).", ar: "يرجى إدخال اسم كامل صالح (حرفين على الأقل)." },
  "checkout.error.phone": { fr: "Téléphone Invalide", en: "Invalid Phone", ar: "رقم هاتف غير صالح" },
  "checkout.error.phone_desc": { fr: "Veuillez entrer un numéro de téléphone tunisien valide (8 chiffres).", en: "Please enter a valid Tunisian phone number (8 digits).", ar: "يرجى إدخال رقم هاتف تونسي صالح (8 أرقام)." },
  "checkout.error.email": { fr: "Email requis", en: "Email required", ar: "البريد الإلكتروني مطلوب" },
  "checkout.error.email_desc": { fr: "Veuillez entrer un email valide pour recevoir vos produits numériques.", en: "Please enter a valid email to receive your digital products.", ar: "يرجى إدخال بريد إلكتروني صالح لاستلام منتجاتك الرقمية." },
  "checkout.error.address": { fr: "Adresse manquante", en: "Missing address", ar: "العنوان ناقص" },
  "checkout.error.address_desc": { fr: "Veuillez fournir une adresse de livraison.", en: "Please provide a delivery address.", ar: "يرجى تقديم عنوان للتوصيل." },
  "checkout.error.failed": { fr: "Échec de la commande", en: "Order Failed", ar: "فشل في الطلب" },
  "checkout.cart.each": { fr: "chacun", en: "each", ar: "لكل واحد" },
  "checkout.placeholder.name": { fr: "Ahmed Zarzis", en: "Ahmed Zarzis", ar: "أحمد جرجيس" },
  "checkout.placeholder.phone": { fr: "22 345 678", en: "22 345 678", ar: "22 345 678" },
  "checkout.placeholder.email": { fr: "gamer@exemple.com", en: "gamer@example.com", ar: "gamer@example.com" },
  "checkout.placeholder.ref": { fr: "Ex: #55432 ou AhmedZ", en: "Ex: #55432 or AhmedZ", ar: "مثال: #55432 أو AhmedZ" },
  "checkout.placeholder.notes": { fr: "Des instructions spéciales pour nous?", en: "Any special instructions for us?", ar: "أي تعليمات خاصة لنا؟" },
  "checkout.delivery.pickup": { fr: "Retrait en Magasin", en: "Store Pickup", ar: "استلام من المتجر" },
  "checkout.delivery.pickup_desc": { fr: "Récupérez votre commande dans notre magasin à Zarzis.", en: "Pick up from our Zarzis store.", ar: "استلم طلبك من متجرنا في جرجيس." },
  "checkout.delivery.local": { fr: "Livraison Locale", en: "Local Delivery", ar: "توصيل محلي" },
  "checkout.delivery.local_desc": { fr: "Livraison rapide à Zarzis.", en: "Fast delivery within Zarzis.", ar: "توصيل سريع داخل جرجيس." },
  "checkout.delivery.free": { fr: "Gratuit", en: "Free", ar: "مجاني" },
  "checkout.payment.store": { fr: "Paiement en Magasin", en: "Store Payment", ar: "الدفع في المتجر" },
  "checkout.payment.cash": { fr: "Paiement à la Livraison", en: "Cash on Delivery", ar: "الدفع عند الاستلام" },
  "checkout.payment.cash_desc": { fr: "Payez lors de la livraison", en: "Pay at delivery", ar: "ادفع عند التوصيل" },
  "checkout.payment.d17": { fr: "Transfert D17", en: "D17 Transfer", ar: "تحويل D17" },
  "checkout.payment.d17_desc": { fr: "Application mobile de la Poste", en: "Mobile Post App", ar: "تطبيق البريد" },
  "checkout.payment.bank": { fr: "Virement Bancaire", en: "Bank Transfer", ar: "تحويل بنكي" },
  "checkout.payment.bank_desc": { fr: "Virement direct", en: "Direct Virement", ar: "تحويل مباشر" },
  "checkout.payment.card": { fr: "Carte en Ligne", en: "Online Card", ar: "بطاقة عبر الإنترنت" },
  "checkout.payment.card_desc": { fr: "Débit/Crédit", en: "Debit/Credit", ar: "بطاقة سحب/ائتمان" },
  "checkout.payment.soon": { fr: "Bientôt", en: "Soon", ar: "قريباً" },
  "checkout.payment.no_info": { fr: "Info non configurée.", en: "Info not set.", ar: "المعلومات غير متوفرة." },
  "checkout.payment.ref_info": { fr: "Veuillez utiliser votre nom comme référence.", en: "Please use your name as reference.", ar: "يرجى استخدام اسمك كمرجع." },
  "checkout.info.digital": { fr: "Les codes numériques seront envoyés instantanément ici.", en: "Digital codes will be sent instantly here.", ar: "سيتم إرسال الأكواد الرقمية فوراً هنا." },

  ...helpTranslations
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, any>) => string;
  dir: "ltr" | "rtl";
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('app_language');
      return (saved === 'fr' || saved === 'en' || saved === 'ar') ? saved : 'fr';
    }
    return 'fr';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('app_language', lang);
    }
  };

  const t = (key: string, params?: Record<string, any>): string => {
    let text = translations[key]?.[language] || key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, String(v));
      });
    }
    return text;
  };

  const dir = language === "ar" ? "rtl" : "ltr";

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>
      <div dir={dir} className={language === "ar" ? "font-arabic" : ""}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
