"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export function OverviewCharts({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#FF6B6B" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#FF6B6B" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
        <XAxis 
          dataKey="date" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fontSize: 12, fill: "#888" }}
          dy={10}
        />
        <YAxis 
          axisLine={false} 
          tickLine={false} 
          tick={{ fontSize: 12, fill: "#888" }}
        />
        <Tooltip 
          contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
        />
        <Area 
          type="monotone" 
          dataKey="count" 
          stroke="#FF6B6B" 
          strokeWidth={3}
          fillOpacity={1} 
          fill="url(#colorCount)" 
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
