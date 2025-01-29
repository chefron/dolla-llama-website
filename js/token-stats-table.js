import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const StatsTable = () => {
  // Sample data - replace with actual data
  const stats = [
    {
      label: "Spotify Earnings",
      value: "$12,458.32",
      change: "+22.4%",
      isPositive: true
    },
    {
      label: "YouTube Earnings",
      value: "$8,234.15",
      change: "+15.8%",
      isPositive: true
    },
    {
      label: "Total Earnings",
      value: "$20,692.47",
      change: "+19.6%",
      isPositive: true
    },
    {
      label: "Tokens Burned",
      value: "142,857",
      change: "+5.3%",
      isPositive: true
    }
  ];

  return (
    <Card className="w-full max-w-4xl mx-auto bg-[rgba(30,30,30,0.8)] border border-[#363636] shadow-lg">
      <CardHeader>
        <CardTitle className="text-center font-mono text-xl text-[#f2f2f2]">
          PERFORMANCE METRICS
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div 
              key={index}
              className="p-4 rounded-lg border border-[#363636] bg-[rgba(30,30,30,0.8)]"
            >
              <div className="font-mono text-sm text-[#808080]">{stat.label}</div>
              <div className="mt-2 flex items-baseline">
                <div className="font-mono text-2xl font-semibold text-[#f2f2f2]">
                  {stat.value}
                </div>
                <div className={`ml-2 text-sm font-mono ${
                  stat.isPositive ? 'text-[#edda1c]' : 'text-red-500'
                }`}>
                  {stat.change}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsTable;