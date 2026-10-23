import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Toaster } from "./components/ui/sonner";
import { PerformanceMetrics } from "./components/PerformanceMetrics";
import { TrainSchedulePanel } from "./components/TrainSchedulePanel";
import { TrackVisualization } from "./components/TrackVisualization";
import { DecisionSupportPanel } from "./components/DecisionSupportPanel";
import { SimulationPanel } from "./components/SimulationPanel";
import { AlertsPanel } from "./components/AlertsPanel";
import { Train, BarChart3, Brain, Settings, Bell, MapPin } from "lucide-react";
import { useEffect } from "react";

export default function App() {
  // Handle unhandled promise rejections to prevent app crashes
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.log('Unhandled promise rejection (handled):', event.reason);
      event.preventDefault(); // Prevent the default unhandled rejection behavior
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Train className="size-8 text-blue-600" />
              SmartRail
              <span className="text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AI Co-Pilot
              </span>
            </h1>
            <p className="text-muted-foreground mt-1">
              AI-Powered Precise Train Traffic Control • Maximizing Section Throughput
            </p>
            <div className="flex items-center gap-4 mt-2 text-sm">
              <span className="bg-green-100 text-green-700 px-2 py-1 rounded-md">
                ✓ 15-30% Delay Reduction
              </span>
              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-md">
                ✓ 5-10% Throughput Increase
              </span>
              <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-md">
                ✓ Real-time AI Optimization
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Train Traffic Controller (TTC)</div>
            <div className="font-medium">CSMT ↔ Dadar Control Zone</div>
            <div className="text-sm text-blue-600 font-medium">
              Indian Railways • 2.3 Cr Daily Passengers
            </div>
            <div className="text-xs text-muted-foreground">
              {new Date().toLocaleString()}
            </div>
          </div>
        </div>

        {/* Performance Overview */}
        <div className="space-y-4">
          <PerformanceMetrics />
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="size-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="ai-support" className="flex items-center gap-2">
              <Brain className="size-4" />
              AI Support
            </TabsTrigger>
            <TabsTrigger value="simulation" className="flex items-center gap-2">
              <Settings className="size-4" />
              Simulation
            </TabsTrigger>
            <TabsTrigger value="track-view" className="flex items-center gap-2">
              <MapPin className="size-4" />
              Track View
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-2">
              <Bell className="size-4" />
              Alerts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <TrainSchedulePanel />
            </div>
            <div className="space-y-4">
              <TrackVisualization />
            </div>
          </TabsContent>

          <TabsContent value="ai-support">
            <DecisionSupportPanel />
          </TabsContent>

          <TabsContent value="simulation">
            <SimulationPanel />
          </TabsContent>

          <TabsContent value="track-view">
            <TrackVisualization />
          </TabsContent>

          <TabsContent value="alerts">
            <AlertsPanel />
          </TabsContent>
        </Tabs>
      </div>
      <Toaster />
    </div>
  );
}