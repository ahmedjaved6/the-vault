import { useMemo } from "react";
import { format } from "date-fns";

interface Collectible {
  id: string;
  name: string;
  category: string;
  purchase_date: string;
  cost_price: number | null;
  current_value: number | null;
  properties?: Record<string, unknown>;
}

interface ChartData {
  date: string;
  value: number;
}

interface BreakdownData {
  name: string;
  value: number;
}

export function useCollectionStats(items: Collectible[]) {
  return useMemo(() => {
    const totalValue = items.reduce((acc, item) => acc + (item.current_value || item.cost_price || 0), 0);
    const totalInvestment = items.reduce((acc, item) => acc + (item.cost_price || 0), 0);
    const profitLoss = totalValue - totalInvestment;
    const roi = totalInvestment > 0 ? (profitLoss / totalInvestment) * 100 : 0;

    // Chart Data: Value over time
    const sortedByDate = [...items]
      .filter(i => i.purchase_date)
      .sort((a, b) => new Date(a.purchase_date).getTime() - new Date(b.purchase_date).getTime());

    const valueOverTime: ChartData[] = [];
    let runningTotal = 0;
    
    sortedByDate.forEach(item => {
      runningTotal += (item.current_value || item.cost_price || 0);
      const dateKey = format(new Date(item.purchase_date), "MMM yyyy");
      
      const existing = valueOverTime.find(v => v.date === dateKey);
      if (existing) {
        existing.value = runningTotal;
      } else {
        valueOverTime.push({ date: dateKey, value: runningTotal });
      }
    });

    // Category breakdown
    const categories = items.reduce((acc: Record<string, number>, item) => {
      acc[item.category] = (acc[item.category] || 0) + (item.current_value || item.cost_price || 0);
      return acc;
    }, {} as Record<string, number>);

    const categoryData: BreakdownData[] = Object.entries(categories).map(([name, value]) => ({ name, value }));

    // Manufacturer breakdown
    const manufacturers = items.reduce((acc: Record<string, number>, item) => {
      const m = (item.properties?.manufacturer as string) || "Other";
      acc[m] = (acc[m] || 0) + (item.current_value || item.cost_price || 0);
      return acc;
    }, {} as Record<string, number>);

    const manufacturerData: BreakdownData[] = Object.entries(manufacturers)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    return {
      totalValue,
      totalInvestment,
      profitLoss,
      roi,
      valueOverTime,
      categoryData,
      manufacturerData,
      topItems: [...items].sort((a, b) => (b.current_value || 0) - (a.current_value || 0)).slice(0, 5)
    };
  }, [items]);
}
