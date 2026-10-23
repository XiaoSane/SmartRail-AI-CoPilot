import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { TrendingUp, TrendingDown, Clock, Train, Target, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";

interface Metric {
  label: string;
  value: string | number;
  target?: string | number;
  trend?: "up" | "down" | "stable";
  percentage?: number;
  unit?: string;
}

const performanceMetrics: Metric[] = [
  {
    label: "SmartRail Throughput Gain",
    value: "+8.2",
    target: "+10",
    trend: "up",
    percentage: 82,
    unit: "%"
  },
  {
    label: "AI Delay Reduction",
    value: "-22.4",
    target: "-30",
    trend: "up",
    percentage: 75,
    unit: "%"
  },
  {
    label: "Section Efficiency",
    value: 193,
    target: 210,
    trend: "up",
    percentage: 92,
    unit: "trains/day"
  },
  {
    label: "Passenger Punctuality",
    value: 87.6,
    target: 95.0,
    trend: "up",
    percentage: 88,
    unit: "%"
  },
  {
    label: "AI Decision Accuracy",
    value: 94.2,
    target: 98.0,
    trend: "up",
    percentage: 94,
    unit: "%"
  },
  {
    label: "Economic Impact",
    value: "₹2.4",
    target: "₹5.0",
    trend: "up",
    percentage: 48,
    unit: "Cr/month"
  }
];

const getTrendIcon = (trend: string) => {
  switch (trend) {
    case "up": return <TrendingUp className="size-4 text-green-500" />;
    case "down": return <TrendingDown className="size-4 text-red-500" />;
    default: return <div className="size-4 rounded-full bg-gray-400" />;
  }
};

const getProgressColor = (percentage: number, isReversed?: boolean) => {
  if (isReversed) {
    if (percentage >= 80) return "bg-red-500";
    if (percentage >= 60) return "bg-yellow-500";
    return "bg-green-500";
  } else {
    if (percentage >= 80) return "bg-green-500";
    if (percentage >= 60) return "bg-yellow-500";
    return "bg-red-500";
  }
};

export function PerformanceMetrics() {
  const [liveMetrics, setLiveMetrics] = useState(performanceMetrics);
  const [liveStats, setLiveStats] = useState({
    activeTrains: 12,
    onSchedule: 8,
    delayed: 3,
    conflicts: 1
  });

  // Simulate live updates every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveMetrics(prev => prev.map(metric => {
        const variation = (Math.random() - 0.5) * 0.1; // ±5% variation
        const newValue = typeof metric.value === 'number' 
          ? Math.max(0, metric.value + (metric.value * variation))
          : metric.value;
        
        return {
          ...metric,
          value: typeof newValue === 'number' ? Number(newValue.toFixed(1)) : newValue,
          percentage: metric.percentage ? Math.max(0, Math.min(100, metric.percentage + (variation * 100))) : undefined
        };
      }));

      setLiveStats(prev => ({
        activeTrains: Math.max(8, Math.min(16, prev.activeTrains + Math.floor((Math.random() - 0.5) * 2))),
        onSchedule: Math.max(5, Math.min(15, prev.onSchedule + Math.floor((Math.random() - 0.5) * 2))),
        delayed: Math.max(0, Math.min(8, prev.delayed + Math.floor((Math.random() - 0.5) * 2))),
        conflicts: Math.max(0, Math.min(5, prev.conflicts + Math.floor((Math.random() - 0.5) * 2)))
      }));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {liveMetrics.map((metric, index) => (
        <Card key={index}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span>{metric.label}</span>
              {getTrendIcon(metric.trend || "stable")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-semibold">
                {metric.value}
                <span className="text-sm text-muted-foreground ml-1">
                  {metric.unit}
                </span>
              </span>
              {metric.target && (
                <span className="text-sm text-muted-foreground">
                  Target: {metric.target}{metric.unit}
                </span>
              )}
            </div>
            
            {metric.percentage && (
              <div className="space-y-2">
                <Progress 
                  value={metric.percentage} 
                  className="h-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0{metric.unit}</span>
                  <span>{metric.target}{metric.unit}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
      
      {/* SmartRail Impact Dashboard */}
      <Card className="md:col-span-2 lg:col-span-3 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="size-5 text-blue-600" />
            SmartRail Impact Dashboard - Indian Railways Scale
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Real-time performance metrics for 23,000+ daily trains serving 2.3 crore passengers
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-white rounded-lg border border-blue-200">
              <Train className="size-6 mx-auto mb-2 text-blue-600" />
              <div className="font-semibold text-blue-900">{liveStats.activeTrains}</div>
              <div className="text-sm text-blue-700">Active in Section</div>
              <div className="text-xs text-muted-foreground">23,000+ System-wide</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border border-green-200">
              <Clock className="size-6 mx-auto mb-2 text-green-600" />
              <div className="font-semibold text-green-900">{liveStats.onSchedule}</div>
              <div className="text-sm text-green-700">On Schedule</div>
              <div className="text-xs text-green-600">↑15min improvement</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border border-yellow-200">
              <AlertCircle className="size-6 mx-auto mb-2 text-yellow-600" />
              <div className="font-semibold text-yellow-900">{liveStats.delayed}</div>
              <div className="text-sm text-yellow-700">Minor Delays</div>
              <div className="text-xs text-yellow-600">vs 45min Delhi-Howrah</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border border-purple-200">
              <TrendingUp className="size-6 mx-auto mb-2 text-purple-600" />
              <div className="font-semibold text-purple-900">₹{(2.4 * 12).toFixed(1)}Cr</div>
              <div className="text-sm text-purple-700">Annual Savings</div>
              <div className="text-xs text-purple-600">AI Optimization</div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-white rounded-lg border border-blue-200">
            <div className="text-sm font-medium text-blue-900 mb-2">SmartRail Mission Impact</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Making 2.3Cr daily passengers more punctual</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Optimizing existing infrastructure usage</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Reducing need for expensive new tracks</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}