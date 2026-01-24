import { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3 } from "lucide-react";
import { Sale } from "@/types";
import { useLanguage } from "@/contexts/LanguageContext";

// Helper to process sales for today (hourly)
function getTodayRevenue(sales: Sale[]) {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const todayStr = new Date().toISOString().split('T')[0];

    return hours.map(hour => {
        const hourStr = hour.toString().padStart(2, '0');
        const hourRevenue = sales
            .filter(s => {
                const saleDate = new Date(s.created_at);
                const saleDateStr = saleDate.toISOString().split('T')[0];
                const saleHour = saleDate.getHours();
                return saleDateStr === todayStr && saleHour === hour;
            })
            .reduce((sum, s) => sum + Number(s.total_amount), 0);

        return {
            label: `${hourStr}:00`,
            revenue: Number(hourRevenue.toFixed(2))
        };
    });
}

// Helper to process sales for a daily range (Weekly or Monthly)
function getDailyRevenueRange(sales: Sale[], daysBack: number) {
    const data = [];
    const today = new Date();

    for (let i = daysBack - 1; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];

        const dayRevenue = sales
            .filter(s => s.created_at.startsWith(dateStr))
            .reduce((sum, s) => sum + Number(s.total_amount), 0);

        // Format label based on range
        const displayLabel = d.toLocaleDateString('fr-FR', {
            weekday: daysBack <= 7 ? 'short' : undefined,
            day: 'numeric',
            month: daysBack > 7 ? 'short' : undefined
        });

        data.push({
            label: displayLabel,
            revenue: Number(dayRevenue.toFixed(2))
        });
    }
    return data;
}

interface OverviewRevenueChartProps {
    sales: Sale[];
    timeRange: 'today' | 'weekly' | 'monthly' | 'yearly';
    setTimeRange: (range: 'today' | 'weekly' | 'monthly' | 'yearly') => void;
    isOwner: boolean;
}

const OverviewRevenueChart = ({ sales, timeRange, setTimeRange, isOwner }: OverviewRevenueChartProps) => {
    const { t } = useLanguage();

    const revenueData = useMemo(() => {
        if (timeRange === 'today') return getTodayRevenue(sales || []);
        if (timeRange === 'weekly') return getDailyRevenueRange(sales || [], 7);
        return getDailyRevenueRange(sales || [], 30);
    }, [sales, timeRange]);

    return (
        <Card className="glass-card lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    {timeRange === 'today' ? t("dashboard.chart.daily_breakdown") :
                        timeRange === 'weekly' ? t("dashboard.chart.weekly_trend") :
                            t("dashboard.chart.monthly_trend")}
                </CardTitle>
                {isOwner && (
                    <Tabs value={timeRange} onValueChange={(v: string) => setTimeRange(v as 'today' | 'weekly' | 'monthly' | 'yearly')}>
                        <TabsList className="bg-black/20 h-8">
                            <TabsTrigger value="today" className="text-xs h-7">{t("sales.today")}</TabsTrigger>
                            <TabsTrigger value="weekly" className="text-xs h-7">{t("common.weekday")}</TabsTrigger>
                            <TabsTrigger value="monthly" className="text-xs h-7">{t("common.month") || 'Month'}</TabsTrigger>
                            <TabsTrigger value="yearly" className="text-xs h-7">{t("common.year") || 'Year'}</TabsTrigger>
                        </TabsList>
                    </Tabs>
                )}
            </CardHeader>
            <CardContent>
                <div className="h-[250px] sm:h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={revenueData}>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.2} stroke="hsl(var(--border))" />
                            <XAxis
                                dataKey="label"
                                stroke="hsl(var(--muted-foreground))"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="hsl(var(--muted-foreground))"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `${value} DT`}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'hsl(var(--card))',
                                    borderColor: 'hsl(var(--border))',
                                    borderRadius: 'var(--radius)',
                                    color: 'hsl(var(--card-foreground))'
                                }}
                                itemStyle={{ color: 'hsl(var(--card-foreground))' }}
                                labelStyle={{ color: 'hsl(var(--muted-foreground))', marginBottom: '0.25rem' }}
                                formatter={(value: number) => [`${value.toFixed(2)} DT`, 'Revenue']}
                            />
                            <Line
                                type="monotone"
                                dataKey="revenue"
                                stroke="hsl(var(--primary))"
                                strokeWidth={3}
                                dot={{ fill: "hsl(var(--primary))", r: 4, strokeWidth: 2, stroke: "hsl(var(--background))" }}
                                activeDot={{ r: 6, strokeWidth: 0, fill: "hsl(var(--primary))" }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
};

export default OverviewRevenueChart;
