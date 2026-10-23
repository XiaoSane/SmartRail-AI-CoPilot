import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import { Progress } from "./ui/progress";
import { 
  Clock, 
  Train, 
  Zap, 
  Target, 
  ArrowRight, 
  CheckCircle, 
  AlertTriangle,
  Brain,
  TrendingUp,
  MapPin,
  RefreshCw
} from "lucide-react";

interface TrainConflict {
  id: string;
  train1: {
    number: string;
    name: string;
    type: "express" | "local" | "freight";
    priority: number;
  };
  train2: {
    number: string;
    name: string;
    type: "express" | "local" | "freight";
    priority: number;
  };
  location: string;
  traditionalGap: number;
  aiOptimizedGap: number;
  timeSaved: number;
  safetyScore: number;
}

interface PlatformScenario {
  id: string;
  trainNumber: string;
  trainName: string;
  originalPlatform: number;
  suggestedPlatform: number;
  reason: string;
  delaySaved: number;
  passengerImpact: string;
}

interface CascadeEvent {
  id: string;
  initialTrain: string;
  affectedTrains: string[];
  withoutAI: {
    totalDelay: number;
    trainsImpacted: number;
  };
  withAI: {
    totalDelay: number;
    trainsImpacted: number;
  };
  containmentStrategy: string;
}

const SCHEDULING_SCENARIOS: TrainConflict[] = [
  {
    id: "rajdhani_local",
    train1: { number: "12951", name: "Mumbai Rajdhani", type: "express", priority: 95 },
    train2: { number: "93015", name: "CSMT-Kalyan Local", type: "local", priority: 70 },
    location: "Thane Junction",
    traditionalGap: 10,
    aiOptimizedGap: 7,
    timeSaved: 3,
    safetyScore: 98.5
  },
  {
    id: "freight_shatabdi",
    train1: { number: "12027", name: "Chennai Shatabdi", type: "express", priority: 90 },
    train2: { number: "BOXN-7842", name: "Perishable Freight", type: "freight", priority: 85 },
    location: "Dadar Junction",
    traditionalGap: 15,
    aiOptimizedGap: 11,
    timeSaved: 4,
    safetyScore: 97.2
  },
  {
    id: "double_local",
    train1: { number: "93021", name: "Harbour Line Local", type: "local", priority: 75 },
    train2: { number: "93023", name: "Central Line Local", type: "local", priority: 72 },
    location: "CSMT Approach",
    traditionalGap: 8,
    aiOptimizedGap: 5.5,
    timeSaved: 2.5,
    safetyScore: 99.1
  }
];

const PLATFORM_SCENARIOS: PlatformScenario[] = [
  {
    id: "csmt_maintenance",
    trainNumber: "12809",
    trainName: "Howrah Mail",
    originalPlatform: 2,
    suggestedPlatform: 5,
    reason: "Platform 2 under maintenance, Platform 5 available with optimal passenger flow",
    delaySaved: 12,
    passengerImpact: "Reduced crowding, faster boarding"
  },
  {
    id: "peak_optimization",
    trainNumber: "93011",
    trainName: "Virar Fast Local",
    originalPlatform: 3,
    suggestedPlatform: 7,
    reason: "Platform 3 congested with 1400+ passengers, Platform 7 clear for immediate departure",
    delaySaved: 8,
    passengerImpact: "Improved safety, reduced platform crowding"
  },
  {
    id: "express_priority",
    trainNumber: "12951",
    trainName: "Mumbai Rajdhani",
    originalPlatform: 1,
    suggestedPlatform: 4,
    reason: "Priority express service, Platform 4 offers direct track access",
    delaySaved: 5,
    passengerImpact: "Premium service maintained, faster departure"
  }
];

const CASCADE_EVENTS: CascadeEvent[] = [
  {
    id: "freight_breakdown",
    initialTrain: "BOXN-7841 (Freight)",
    affectedTrains: ["12951 Rajdhani", "93015 Local", "93017 Local", "12027 Shatabdi", "93019 Local"],
    withoutAI: { totalDelay: 325, trainsImpacted: 8 },
    withAI: { totalDelay: 45, trainsImpacted: 2 },
    containmentStrategy: "Immediate freight bypass via loop line, passenger trains rerouted through fast tracks"
  },
  {
    id: "signal_failure",
    initialTrain: "Signal Failure at Dadar",
    affectedTrains: ["93021 Harbour", "93023 Central", "12809 Howrah", "93025 Local"],
    withoutAI: { totalDelay: 180, trainsImpacted: 6 },
    withAI: { totalDelay: 25, trainsImpacted: 1 },
    containmentStrategy: "Dynamic track switching, alternative route calculation in 1.2 seconds"
  }
];

export function SmartSchedulingDemo() {
  const [activeDemo, setActiveDemo] = useState<"scheduling" | "platform" | "cascade" | "overview">("overview");
  const [isSimulating, setIsSimulating] = useState(false);
  const [liveMetrics, setLiveMetrics] = useState({
    trainsPerHour: 28,
    averageGap: 8.2,
    conflictsResolved: 47,
    timeSavedToday: 156
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveMetrics(prev => ({
        trainsPerHour: Math.floor(Math.random() * 4 + 28),
        averageGap: Math.round((Math.random() * 2 + 7) * 10) / 10,
        conflictsResolved: prev.conflictsResolved + Math.floor(Math.random() * 3),
        timeSavedToday: prev.timeSavedToday + Math.floor(Math.random() * 5)
      }));
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const runSmartOptimization = async () => {
    setIsSimulating(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSimulating(false);
  };

  return (
    <div className="space-y-6">
      {/* Header with Live Metrics */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Zap className="size-6 text-blue-600" />
            SmartRail Core Capabilities: More Trains on Same Track
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Real-time demonstration of AI + OR optimization techniques achieving 5-10% throughput increase
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-white rounded-lg border">
              <div className="font-semibold text-blue-900">{liveMetrics.trainsPerHour}</div>
              <div className="text-sm text-blue-700">Trains/Hour</div>
              <div className="text-xs text-green-600">+3 from baseline</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg border">
              <div className="font-semibold text-green-900">{liveMetrics.averageGap}min</div>
              <div className="text-sm text-green-700">Avg Safe Gap</div>
              <div className="text-xs text-green-600">-2.8min optimized</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg border">
              <div className="font-semibold text-purple-900">{liveMetrics.conflictsResolved}</div>
              <div className="text-sm text-purple-700">Conflicts Resolved</div>
              <div className="text-xs text-purple-600">Today</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg border">
              <div className="font-semibold text-orange-900">{liveMetrics.timeSavedToday}min</div>
              <div className="text-sm text-orange-700">Time Saved</div>
              <div className="text-xs text-orange-600">System-wide</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Capability Selection */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Button
          variant={activeDemo === "overview" ? "default" : "outline"}
          onClick={() => setActiveDemo("overview")}
          className="h-20 flex flex-col items-center gap-2"
        >
          <Target className="size-5" />
          <span className="text-sm">Overview</span>
        </Button>
        <Button
          variant={activeDemo === "scheduling" ? "default" : "outline"}
          onClick={() => setActiveDemo("scheduling")}
          className="h-20 flex flex-col items-center gap-2"
        >
          <Clock className="size-5" />
          <span className="text-sm">Smart Scheduling</span>
        </Button>
        <Button
          variant={activeDemo === "platform" ? "default" : "outline"}
          onClick={() => setActiveDemo("platform")}
          className="h-20 flex flex-col items-center gap-2"
        >
          <MapPin className="size-5" />
          <span className="text-sm">Platform Optimization</span>
        </Button>
        <Button
          variant={activeDemo === "cascade" ? "default" : "outline"}
          onClick={() => setActiveDemo("cascade")}
          className="h-20 flex flex-col items-center gap-2"
        >
          <TrendingUp className="size-5" />
          <span className="text-sm">Cascade Prevention</span>
        </Button>
      </div>

      {/* Overview */}
      {activeDemo === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">SmartRail Impact Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded">
                <div>
                  <div className="font-medium text-green-900">Buffer Time Optimization</div>
                  <div className="text-sm text-green-700">10min to 7min safe gaps</div>
                </div>
                <Badge className="bg-green-100 text-green-800">+30% capacity</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded">
                <div>
                  <div className="font-medium text-blue-900">Dynamic Prioritization</div>
                  <div className="text-sm text-blue-700">Rajdhani, Shatabdi priority</div>
                </div>
                <Badge className="bg-blue-100 text-blue-800">-15min delays</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded">
                <div>
                  <div className="font-medium text-purple-900">Platform Intelligence</div>
                  <div className="text-sm text-purple-700">Dynamic allocation</div>
                </div>
                <Badge className="bg-purple-100 text-purple-800">-12min wait</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded">
                <div>
                  <div className="font-medium text-orange-900">Cascade Prevention</div>
                  <div className="text-sm text-orange-700">1 delay → 8 train impact</div>
                </div>
                <Badge className="bg-orange-100 text-orange-800">85% contained</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Brain className="size-5" />
                AI Decision Engine
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button 
                  onClick={runSmartOptimization}
                  disabled={isSimulating}
                  className="w-full"
                >
                  {isSimulating ? (
                    <>
                      <RefreshCw className="size-4 mr-2 animate-spin" />
                      AI Optimizing Section...
                    </>
                  ) : (
                    <>
                      <Zap className="size-4 mr-2" />
                      Run SmartRail Optimization
                    </>
                  )}
                </Button>
                
                <Alert className="bg-blue-50 border-blue-200">
                  <Brain className="size-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <strong>AI Processing:</strong>
                      <ul className="text-sm space-y-1">
                        <li>• Analyzing 23 active trains across 4 tracks</li>
                        <li>• Calculating optimal safe headways using OR-Tools</li>
                        <li>• Processing priority matrix: Express &gt; Local &gt; Freight</li>
                        <li>• Predicting cascade impact for next 2 hours</li>
                      </ul>
                    </div>
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Smart Scheduling Demo */}
      {activeDemo === "scheduling" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="size-5" />
              Smarter Scheduling = More Trains on Same Track
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              AI reduces unnecessary buffer time by calculating exact safe headways
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {SCHEDULING_SCENARIOS.map((scenario) => (
              <div key={scenario.id} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{scenario.location} Conflict Resolution</h4>
                    <div className="text-sm text-muted-foreground">
                      Priority-based optimization in progress
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">
                    {scenario.timeSaved}min saved
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded">
                      <Train className="size-5 text-blue-600" />
                      <div>
                        <div className="font-medium">{scenario.train1.number}</div>
                        <div className="text-sm text-blue-700">{scenario.train1.name}</div>
                        <Badge className="text-xs mt-1" variant="outline">
                          Priority: {scenario.train1.priority}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-purple-50 rounded">
                      <Train className="size-5 text-purple-600" />
                      <div>
                        <div className="font-medium">{scenario.train2.number}</div>
                        <div className="text-sm text-purple-700">{scenario.train2.name}</div>
                        <Badge className="text-xs mt-1" variant="outline">
                          Priority: {scenario.train2.priority}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Alert>
                      <AlertTriangle className="size-4" />
                      <AlertDescription>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Traditional Gap:</span>
                            <span className="font-medium text-red-600">{scenario.traditionalGap} minutes</span>
                          </div>
                          <ArrowRight className="size-4 mx-auto text-muted-foreground" />
                          <div className="flex items-center justify-between">
                            <span className="text-sm">AI Optimized Gap:</span>
                            <span className="font-medium text-green-600">{scenario.aiOptimizedGap} minutes</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Safety Score: {scenario.safetyScore}% ✓
                          </div>
                        </div>
                      </AlertDescription>
                    </Alert>
                  </div>
                </div>

                <div className="bg-green-50 p-3 rounded">
                  <div className="flex items-center gap-2 text-green-800">
                    <CheckCircle className="size-4" />
                    <span className="font-medium">
                      Result: {scenario.timeSaved} minutes saved, maintaining 98%+ safety standards
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Platform Optimization Demo */}
      {activeDemo === "platform" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="size-5" />
              Platform Optimization Intelligence
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              AI dynamically reroutes trains to whichever platform becomes free first
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {PLATFORM_SCENARIOS.map((scenario) => (
              <div key={scenario.id} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{scenario.trainNumber} - {scenario.trainName}</h4>
                    <div className="text-sm text-muted-foreground">
                      Platform reallocation scenario
                    </div>
                  </div>
                  <Badge className="bg-orange-100 text-orange-800">
                    -{scenario.delaySaved}min delay
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-red-50 rounded border border-red-200">
                    <MapPin className="size-6 mx-auto mb-2 text-red-600" />
                    <div className="font-medium text-red-900">Platform {scenario.originalPlatform}</div>
                    <div className="text-sm text-red-700">Original Assignment</div>
                    <div className="text-xs text-red-600 mt-1">⚠ Issues detected</div>
                  </div>

                  <div className="flex items-center justify-center">
                    <ArrowRight className="size-8 text-muted-foreground" />
                  </div>

                  <div className="text-center p-4 bg-green-50 rounded border border-green-200">
                    <MapPin className="size-6 mx-auto mb-2 text-green-600" />
                    <div className="font-medium text-green-900">Platform {scenario.suggestedPlatform}</div>
                    <div className="text-sm text-green-700">AI Suggestion</div>
                    <div className="text-xs text-green-600 mt-1">✓ Optimal choice</div>
                  </div>
                </div>

                <Alert className="bg-blue-50 border-blue-200">
                  <Brain className="size-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <strong>AI Reasoning:</strong> {scenario.reason}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                        <div className="text-sm">
                          <strong>Time Impact:</strong> {scenario.delaySaved} minutes saved
                        </div>
                        <div className="text-sm">
                          <strong>Passenger Impact:</strong> {scenario.passengerImpact}
                        </div>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Cascade Prevention Demo */}
      {activeDemo === "cascade" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="size-5" />
              Reducing Ripple Effect of Delays
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              AI contains disruption by re-optimizing the whole section quickly
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {CASCADE_EVENTS.map((event) => (
              <div key={event.id} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Disruption: {event.initialTrain}</h4>
                    <div className="text-sm text-muted-foreground">
                      Impact analysis and AI containment
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">
                    {Math.round(((event.withoutAI.totalDelay - event.withAI.totalDelay) / event.withoutAI.totalDelay) * 100)}% improvement
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h5 className="font-medium text-red-800">Without SmartRail AI</h5>
                    <div className="p-4 bg-red-50 rounded border border-red-200">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Total Delay:</span>
                          <span className="font-medium text-red-900">{event.withoutAI.totalDelay} minutes</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Trains Impacted:</span>
                          <span className="font-medium text-red-900">{event.withoutAI.trainsImpacted}</span>
                        </div>
                        <div className="text-sm text-red-700 mt-3">
                          <strong>Affected Trains:</strong>
                          <ul className="list-disc list-inside mt-1 space-y-1">
                            {event.affectedTrains.map((train, index) => (
                              <li key={index}>{train}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h5 className="font-medium text-green-800">With SmartRail AI</h5>
                    <div className="p-4 bg-green-50 rounded border border-green-200">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Total Delay:</span>
                          <span className="font-medium text-green-900">{event.withAI.totalDelay} minutes</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Trains Impacted:</span>
                          <span className="font-medium text-green-900">{event.withAI.trainsImpacted}</span>
                        </div>
                        <div className="text-sm text-green-700 mt-3">
                          <strong>AI Response Time:</strong> 1.2 seconds
                          <br />
                          <strong>Containment Success:</strong> 85% of delays prevented
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <Alert className="bg-blue-50 border-blue-200">
                  <Brain className="size-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <strong>SmartRail Containment Strategy:</strong>
                      <p className="text-sm">{event.containmentStrategy}</p>
                      <div className="text-xs text-blue-600 mt-2">
                        Real-time re-optimization prevented {event.withoutAI.totalDelay - event.withAI.totalDelay} minutes of system-wide delays
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}