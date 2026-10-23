import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Alert, AlertDescription } from "./ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { PlayCircle, RotateCcw, Settings, BarChart3, Clock, MapPin, Train, Route, Zap } from "lucide-react";
import { PlatformReallocationSimulation } from "./PlatformReallocationSimulation";
import { RailwayStationSimulation } from "./RailwayStationSimulation";
import { ProfessionalRailwaySimulation } from "./ProfessionalRailwaySimulation";

interface SimulationScenario {
  id: string;
  name: string;
  description: string;
  parameters: {
    timeHorizon: number;
    trainCount: number;
    conflictProbability: number;
  };
}

interface SimulationResult {
  throughput: number;
  averageDelay: number;
  onTimePerformance: number;
  conflicts: number;
  recommendations: string[];
}

const scenarios: SimulationScenario[] = [
  {
    id: "peak_hour",
    name: "Mumbai Peak Hour Rush",
    description: "Simulate 18:00-20:00 peak traffic with 1400+ passengers per local train",
    parameters: {
      timeHorizon: 2,
      trainCount: 35,
      conflictProbability: 0.4
    }
  },
  {
    id: "express_conflict",
    name: "Express vs Freight Priority",
    description: "Test SmartRail's decision when Rajdhani meets freight at junction",
    parameters: {
      timeHorizon: 1,
      trainCount: 8,
      conflictProbability: 0.6
    }
  },
  {
    id: "monsoon_impact",
    name: "Mumbai Monsoon Delays",
    description: "Simulate 25-30 min delays during heavy rainfall disruption",
    parameters: {
      timeHorizon: 4,
      trainCount: 25,
      conflictProbability: 0.7
    }
  },
  {
    id: "throughput_test",
    name: "5-10% Throughput Increase",
    description: "Validate SmartRail's promise: 200 trains/day → 210 trains/day",
    parameters: {
      timeHorizon: 6,
      trainCount: 45,
      conflictProbability: 0.3
    }
  },
  {
    id: "cascade_prevention",
    name: "Delay Cascade Prevention",
    description: "Test AI's ability to prevent 15-20min delays from cascading network-wide",
    parameters: {
      timeHorizon: 3,
      trainCount: 28,
      conflictProbability: 0.5
    }
  }
];

export function SimulationPanel() {
  const [selectedScenario, setSelectedScenario] = useState<string>("");
  const [customParams, setCustomParams] = useState({
    timeHorizon: 2,
    trainCount: 15,
    conflictProb: 0.2
  });
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<SimulationResult | null>(null);

  const runSimulation = async () => {
    setIsRunning(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate realistic simulation results based on SmartRail capabilities
    const selectedScenarioData = scenarios.find(s => s.id === selectedScenario);
    const baselineDelay = 18; // Current Indian Railways average
    const smartRailImprovement = 0.22; // 22% improvement as shown in metrics
    
    const mockResults: SimulationResult = {
      throughput: Math.floor((selectedScenarioData?.parameters.trainCount || 20) * 1.08), // 8% increase
      averageDelay: Math.round((baselineDelay * (1 - smartRailImprovement)) * 10) / 10,
      onTimePerformance: Math.floor(87.6 + Math.random() * 8), // SmartRail target range
      conflicts: Math.max(0, Math.floor((selectedScenarioData?.parameters.conflictProbability || 0.3) * 10) - 3),
      recommendations: [
        `AI suggests prioritizing ${Math.random() > 0.5 ? 'Rajdhani Express' : 'Jan Shatabdi'} due to passenger load analysis`,
        "Implement dynamic platform allocation to reduce ${Math.floor(Math.random() * 5 + 3)} minute delays",
        "Route freight via loop line to optimize passenger flow during peak hours",
        `Predicted delay reduction: ${Math.floor(Math.random() * 8 + 12)} minutes using OR-Tools optimization`,
        "Weather impact mitigation: Activate backup signaling protocols"
      ].slice(0, 3 + Math.floor(Math.random() * 2))
    };
    
    setResults(mockResults);
    setIsRunning(false);
  };

  const resetSimulation = () => {
    setResults(null);
    setSelectedScenario("");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="size-5" />
            SmartRail Simulation Suite
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Interactive simulations and what-if scenarios • Real-time visualization of AI decision-making
          </p>
        </CardHeader>
      </Card>

      <Tabs defaultValue="railway-station" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="railway-station" className="flex items-center gap-2">
            <Route className="size-4" />
            Railway Tracks
          </TabsTrigger>
          <TabsTrigger value="professional-railway" className="flex items-center gap-2">
            <Zap className="size-4" />
            Professional View
          </TabsTrigger>
          <TabsTrigger value="platform-reallocation" className="flex items-center gap-2">
            <MapPin className="size-4" />
            Platform View
          </TabsTrigger>
          <TabsTrigger value="what-if-engine" className="flex items-center gap-2">
            <BarChart3 className="size-4" />
            What-If Engine
          </TabsTrigger>
        </TabsList>

        <TabsContent value="railway-station">
          <RailwayStationSimulation />
        </TabsContent>

        <TabsContent value="professional-railway">
          <ProfessionalRailwaySimulation />
        </TabsContent>

        <TabsContent value="platform-reallocation">
          <PlatformReallocationSimulation />
        </TabsContent>

        <TabsContent value="what-if-engine">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="size-5" />
                SmartRail What-If Simulation Engine
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Test AI + Operations Research scenarios before implementing decisions • Real-time re-optimization capabilities
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
        {/* Scenario Selection */}
        <div className="space-y-3">
          <Label>Predefined Scenarios</Label>
          <Select value={selectedScenario} onValueChange={setSelectedScenario}>
            <SelectTrigger>
              <SelectValue placeholder="Select a scenario" />
            </SelectTrigger>
            <SelectContent>
              {scenarios.map((scenario) => (
                <SelectItem key={scenario.id} value={scenario.id}>
                  {scenario.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedScenario && (
            <p className="text-sm text-muted-foreground">
              {scenarios.find(s => s.id === selectedScenario)?.description}
            </p>
          )}
        </div>

        {/* Custom Parameters */}
        <div className="space-y-4">
          <Label>Custom Parameters</Label>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label htmlFor="timeHorizon" className="text-xs">Time (hours)</Label>
              <Input
                id="timeHorizon"
                type="number"
                value={customParams.timeHorizon}
                onChange={(e) => setCustomParams(prev => ({
                  ...prev,
                  timeHorizon: parseInt(e.target.value) || 0
                }))}
                min="1"
                max="12"
              />
            </div>
            <div>
              <Label htmlFor="trainCount" className="text-xs">Train Count</Label>
              <Input
                id="trainCount"
                type="number"
                value={customParams.trainCount}
                onChange={(e) => setCustomParams(prev => ({
                  ...prev,
                  trainCount: parseInt(e.target.value) || 0
                }))}
                min="5"
                max="50"
              />
            </div>
            <div>
              <Label htmlFor="conflictProb" className="text-xs">Conflict Risk</Label>
              <Input
                id="conflictProb"
                type="number"
                step="0.1"
                value={customParams.conflictProb}
                onChange={(e) => setCustomParams(prev => ({
                  ...prev,
                  conflictProb: parseFloat(e.target.value) || 0
                }))}
                min="0"
                max="1"
              />
            </div>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex gap-3">
          <Button 
            onClick={runSimulation} 
            disabled={isRunning}
            className="flex-1"
          >
            <PlayCircle className="size-4 mr-2" />
            {isRunning ? "Running..." : "Run Simulation"}
          </Button>
          <Button variant="outline" onClick={resetSimulation}>
            <RotateCcw className="size-4 mr-2" />
            Reset
          </Button>
        </div>

        {/* Results */}
        {results && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="size-5" />
              <h4 className="font-medium">Simulation Results</h4>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="font-semibold text-blue-900">{results.throughput}</div>
                <div className="text-sm text-blue-700">Throughput (trains/hr)</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="font-semibold text-green-900">{results.onTimePerformance}%</div>
                <div className="text-sm text-green-700">On-Time Performance</div>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <div className="font-semibold text-yellow-900">{results.averageDelay}min</div>
                <div className="text-sm text-yellow-700">Average Delay</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="font-semibold text-red-900">{results.conflicts}</div>
                <div className="text-sm text-red-700">Conflicts</div>
              </div>
            </div>

            <Alert className="bg-blue-50 border-blue-200">
              <Clock className="size-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <strong className="text-blue-900">SmartRail AI Recommendations (Explainable AI):</strong>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {results.recommendations.map((rec, index) => (
                      <li key={index} className="text-blue-800">{rec}</li>
                    ))}
                  </ul>
                  <div className="mt-3 p-2 bg-white rounded border border-blue-200">
                    <div className="text-xs text-blue-700">
                      <strong>Technology Stack:</strong> Python + TensorFlow (AI/ML) • OR-Tools (Optimization) • React.js (Dashboard) • Google Cloud (Deployment)
                    </div>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}