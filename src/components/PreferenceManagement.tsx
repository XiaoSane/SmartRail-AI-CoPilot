import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import { Progress } from "./ui/progress";
import { Separator } from "./ui/separator";
import { motion, AnimatePresence } from "motion/react";
import { 
  Train, 
  Clock, 
  ArrowRight, 
  AlertTriangle, 
  CheckCircle, 
  Route,
  Zap,
  TrendingUp,
  TrendingDown,
  Timer,
  MapPin,
  Brain,
  BarChart3
} from "lucide-react";

interface TrainScenario {
  id: string;
  name: string;
  type: "freight" | "express" | "local";
  currentPosition: number; // km from start
  destination: string;
  priority: number;
  scheduledTime: string;
  estimatedArrival: string;
  speed: number;
  length: number;
  passengerCount?: number;
  delayTolerance: number; // minutes
  economicImpact: number; // rupees per minute delay
}

interface LoopLineStation {
  name: string;
  position: number; // km from start
  hasLoopLine: boolean;
  capacity: number; // minutes a train can wait
}

interface Scenario {
  id: string;
  title: string;
  description: string;
  corridor: string;
  distance: number;
  trains: TrainScenario[];
  loopStations: LoopLineStation[];
  conflictPoint: number; // km where conflict occurs
}

const SAMPLE_SCENARIOS: Scenario[] = [
  {
    id: "scenario_1",
    title: "CSMT-Kalyan Corridor Conflict",
    description: "Express train behind freight train with single loop line opportunity",
    corridor: "CSMT ↔ Kalyan",
    distance: 30,
    conflictPoint: 15,
    trains: [
      {
        id: "freight_2401",
        name: "Goods Train 2401",
        type: "freight",
        currentPosition: 12,
        destination: "Kalyan Yard",
        priority: 40,
        scheduledTime: "14:30",
        estimatedArrival: "15:45",
        speed: 45,
        length: 850,
        delayTolerance: 30,
        economicImpact: 2500
      },
      {
        id: "express_12345",
        name: "Konkan Kanya Express",
        type: "express",
        currentPosition: 8,
        destination: "Madgaon",
        priority: 95,
        scheduledTime: "14:40",
        estimatedArrival: "15:25",
        speed: 85,
        length: 450,
        passengerCount: 1200,
        delayTolerance: 10,
        economicImpact: 8500
      }
    ],
    loopStations: [
      {
        name: "Vikhroli",
        position: 18,
        hasLoopLine: true,
        capacity: 25 // max 25 minutes wait time
      }
    ]
  }
];

interface OptimizationResult {
  scenario: "give_precedence" | "use_loop_line" | "maintain_current";
  freightDelay: number;
  expressDelay: number;
  totalSystemDelay: number;
  economicImpact: number;
  confidence: number;
  reasoning: string[];
  riskFactors: string[];
  benefits: string[];
}

const calculateOptimization = (scenario: Scenario): OptimizationResult[] => {
  const freight = scenario.trains.find(t => t.type === "freight")!;
  const express = scenario.trains.find(t => t.type === "express")!;
  const loopStation = scenario.loopStations[0];
  
  // Option 1: Give precedence to express (freight waits)
  // Calculate how long freight needs to wait for express to pass
  const distanceToConflict = scenario.conflictPoint - freight.currentPosition;
  const timeForFreightToReachConflict = (distanceToConflict / freight.speed) * 60; // minutes
  
  const expressDistanceToConflict = scenario.conflictPoint - express.currentPosition;
  const timeForExpressToReachConflict = (expressDistanceToConflict / express.speed) * 60; // minutes
  const timeForExpressToPassConflict = timeForExpressToReachConflict + 10; // 10 min buffer for express to clear
  
  const freightWaitTime = Math.max(0, timeForExpressToPassConflict - timeForFreightToReachConflict);
  
  // Option 2: Use loop line (freight moves to loop)
  const loopMoveTime = Math.abs(loopStation.position - freight.currentPosition) / freight.speed * 60;
  const loopWaitTime = Math.max(8, loopMoveTime + 5); // minimum 8 minutes for loop operations
  
  // Option 3: Maintain current order
  // Express follows freight at freight's speed after catching up
  const timeToCatchUp = Math.max(0, (freight.currentPosition - express.currentPosition) / (express.speed - freight.speed) * 60);
  const remainingDistance = scenario.distance - Math.max(freight.currentPosition, express.currentPosition + (express.speed * timeToCatchUp / 60));
  const timeAtFreightSpeed = (remainingDistance / freight.speed) * 60;
  const timeAtExpressSpeed = (remainingDistance / express.speed) * 60;
  const expressDelayBehindFreight = Math.max(0, timeToCatchUp + timeAtFreightSpeed - timeAtExpressSpeed);

  return [
    {
      scenario: "give_precedence",
      freightDelay: freightWaitTime,
      expressDelay: 0,
      totalSystemDelay: freightWaitTime,
      economicImpact: freightWaitTime * freight.economicImpact,
      confidence: 0.85,
      reasoning: [
        "Express train has higher priority (95 vs 40)",
        "1200 passengers affected vs freight cargo",
        "Express has lower delay tolerance (10 vs 30 minutes)",
        "Higher economic impact per minute (₹8,500 vs ₹2,500)"
      ],
      riskFactors: [
        "Freight train may exceed 30-minute delay tolerance",
        "Yard scheduling at Kalyan may be affected"
      ],
      benefits: [
        "Passenger satisfaction maintained",
        "Express maintains schedule",
        "Higher revenue protection"
      ]
    },
    {
      scenario: "use_loop_line",
      freightDelay: loopWaitTime,
      expressDelay: 2, // minimal delay for loop coordination
      totalSystemDelay: loopWaitTime + 2,
      economicImpact: (loopWaitTime * freight.economicImpact) + (2 * express.economicImpact),
      confidence: 0.92,
      reasoning: [
        "Optimal use of infrastructure (loop line at Vikhroli)",
        "Balanced approach - minimal impact on both trains",
        "Freight delay within acceptable limits",
        "Express gets clear path with minor coordination delay"
      ],
      riskFactors: [
        "Loop line capacity must be available",
        "Coordination time may vary"
      ],
      benefits: [
        "Both trains maintain reasonable schedules",
        "Efficient infrastructure utilization",
        "Balanced economic impact",
        "Sets precedent for similar scenarios"
      ]
    },
    {
      scenario: "maintain_current",
      freightDelay: 0,
      expressDelay: expressDelayBehindFreight,
      totalSystemDelay: expressDelayBehindFreight,
      economicImpact: expressDelayBehindFreight * express.economicImpact,
      confidence: 0.45,
      reasoning: [
        "First-come-first-served principle",
        "No disruption to freight schedule",
        "Simplest operational approach"
      ],
      riskFactors: [
        "High passenger impact (1200 passengers delayed)",
        "Express may miss connecting services",
        "Significant economic loss",
        "Poor customer satisfaction"
      ],
      benefits: [
        "No freight disruption",
        "Simple to execute",
        "No infrastructure changes needed"
      ]
    }
  ];
};

export function PreferenceManagement() {
  const [currentScenario, setCurrentScenario] = useState<Scenario>(SAMPLE_SCENARIOS[0]);
  const [optimizations, setOptimizations] = useState<OptimizationResult[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const results = calculateOptimization(currentScenario);
    setOptimizations(results);
  }, [currentScenario]);

  const runAnalysis = () => {
    setIsAnalyzing(true);
    setShowResults(false);
    setSelectedOption(null);

    setTimeout(() => {
      setIsAnalyzing(false);
      setShowResults(true);
      // Auto-select the best option (loop line)
      setSelectedOption("use_loop_line");
    }, 2000);
  };

  const freight = currentScenario.trains.find(t => t.type === "freight");
  const express = currentScenario.trains.find(t => t.type === "express");
  const loopStation = currentScenario.loopStations[0];

  const getScenarioColor = (scenario: string) => {
    switch (scenario) {
      case "give_precedence": return "border-yellow-200 bg-yellow-50";
      case "use_loop_line": return "border-green-200 bg-green-50";
      case "maintain_current": return "border-red-200 bg-red-50";
      default: return "border-gray-200 bg-gray-50";
    }
  };

  const getScenarioTitle = (scenario: string) => {
    switch (scenario) {
      case "give_precedence": return "Give Express Precedence";
      case "use_loop_line": return "Use Loop Line (Recommended)";
      case "maintain_current": return "Maintain Current Order";
      default: return "Unknown Scenario";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Brain className="size-6 text-purple-600" />
            AI Preference Management
            <Badge className="bg-purple-100 text-purple-800 border-purple-200">
              Advanced Decision Engine
            </Badge>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Intelligent freight vs express train conflict resolution with system-wide optimization analysis
          </p>
        </CardHeader>
      </Card>

      {/* Current Scenario */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Route className="size-5 text-blue-600" />
            Current Scenario: {currentScenario.title}
          </CardTitle>
          <p className="text-sm text-muted-foreground">{currentScenario.description}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Corridor Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
              <MapPin className="size-5 mx-auto mb-1 text-blue-600" />
              <div className="font-medium text-blue-900">{currentScenario.corridor}</div>
              <div className="text-sm text-blue-700">{currentScenario.distance} km corridor</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-200">
              <AlertTriangle className="size-5 mx-auto mb-1 text-orange-600" />
              <div className="font-medium text-orange-900">Conflict at {currentScenario.conflictPoint} km</div>
              <div className="text-sm text-orange-700">Single track section</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
              <Route className="size-5 mx-auto mb-1 text-green-600" />
              <div className="font-medium text-green-900">{loopStation.name}</div>
              <div className="text-sm text-green-700">Loop line available</div>
            </div>
          </div>

          {/* Train Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Freight Train */}
            <div className="border rounded-lg p-4 bg-orange-50 border-orange-200">
              <div className="flex items-center gap-2 mb-3">
                <Train className="size-5 text-orange-600" />
                <h4 className="font-medium text-orange-900">{freight?.name}</h4>
                <Badge className="bg-orange-100 text-orange-800">Freight</Badge>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Position:</span>
                  <span className="font-medium">{freight?.currentPosition} km</span>
                </div>
                <div className="flex justify-between">
                  <span>Speed:</span>
                  <span className="font-medium">{freight?.speed} km/h</span>
                </div>
                <div className="flex justify-between">
                  <span>Length:</span>
                  <span className="font-medium">{freight?.length} m</span>
                </div>
                <div className="flex justify-between">
                  <span>Priority:</span>
                  <span className="font-medium">{freight?.priority}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delay Tolerance:</span>
                  <span className="font-medium">{freight?.delayTolerance} min</span>
                </div>
                <div className="flex justify-between">
                  <span>Economic Impact:</span>
                  <span className="font-medium">₹{freight?.economicImpact}/min</span>
                </div>
              </div>
            </div>

            {/* Express Train */}
            <div className="border rounded-lg p-4 bg-blue-50 border-blue-200">
              <div className="flex items-center gap-2 mb-3">
                <Train className="size-5 text-blue-600" />
                <h4 className="font-medium text-blue-900">{express?.name}</h4>
                <Badge className="bg-blue-100 text-blue-800">Express</Badge>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Position:</span>
                  <span className="font-medium">{express?.currentPosition} km</span>
                </div>
                <div className="flex justify-between">
                  <span>Speed:</span>
                  <span className="font-medium">{express?.speed} km/h</span>
                </div>
                <div className="flex justify-between">
                  <span>Passengers:</span>
                  <span className="font-medium">{express?.passengerCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Priority:</span>
                  <span className="font-medium">{express?.priority}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delay Tolerance:</span>
                  <span className="font-medium">{express?.delayTolerance} min</span>
                </div>
                <div className="flex justify-between">
                  <span>Economic Impact:</span>
                  <span className="font-medium">₹{express?.economicImpact}/min</span>
                </div>
              </div>
            </div>
          </div>

          {/* Analysis Button */}
          <div className="text-center">
            <Button
              onClick={runAnalysis}
              disabled={isAnalyzing}
              size="lg"
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isAnalyzing ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <Brain className="size-4 mr-2" />
                  </motion.div>
                  AI Analyzing Scenario...
                </>
              ) : (
                <>
                  <Zap className="size-4 mr-2" />
                  Run AI Optimization Analysis
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      <AnimatePresence>
        {showResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            {/* AI Recommendation Alert */}
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="size-4 text-green-600" />
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-green-900">AI Recommendation:</span>
                    <span className="text-green-800 ml-2">
                      Use Loop Line at {loopStation.name} for optimal system performance
                    </span>
                  </div>
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    92% Confidence
                  </Badge>
                </div>
              </AlertDescription>
            </Alert>

            {/* Optimization Options */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {optimizations.map((option, index) => (
                <motion.div
                  key={option.scenario}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card 
                    className={`cursor-pointer transition-all duration-200 ${
                      selectedOption === option.scenario ? 'ring-2 ring-purple-500' : ''
                    } ${getScenarioColor(option.scenario)}`}
                    onClick={() => setSelectedOption(option.scenario)}
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center justify-between">
                        <span>{getScenarioTitle(option.scenario)}</span>
                        {option.scenario === "use_loop_line" && (
                          <Badge className="bg-green-100 text-green-800">Recommended</Badge>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Key Metrics */}
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="text-center p-2 bg-white rounded border">
                          <div className="font-medium text-orange-600">
                            {option.freightDelay.toFixed(1)} min
                          </div>
                          <div className="text-orange-700">Freight Delay</div>
                        </div>
                        <div className="text-center p-2 bg-white rounded border">
                          <div className="font-medium text-blue-600">
                            {option.expressDelay.toFixed(1)} min
                          </div>
                          <div className="text-blue-700">Express Delay</div>
                        </div>
                        <div className="text-center p-2 bg-white rounded border">
                          <div className="font-medium text-purple-600">
                            {option.totalSystemDelay.toFixed(1)} min
                          </div>
                          <div className="text-purple-700">Total Delay</div>
                        </div>
                        <div className="text-center p-2 bg-white rounded border">
                          <div className="font-medium text-red-600">
                            ₹{option.economicImpact.toFixed(0)}
                          </div>
                          <div className="text-red-700">Economic Impact</div>
                        </div>
                      </div>

                      {/* Confidence */}
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>AI Confidence</span>
                          <span>{(option.confidence * 100).toFixed(0)}%</span>
                        </div>
                        <Progress value={option.confidence * 100} className="h-2" />
                      </div>

                      {/* Key Points */}
                      <div className="space-y-2 text-xs">
                        <div>
                          <span className="font-medium text-green-600">Benefits:</span>
                          <ul className="list-disc list-inside mt-1 space-y-1">
                            {option.benefits.slice(0, 2).map((benefit, i) => (
                              <li key={i} className="text-green-700">{benefit}</li>
                            ))}
                          </ul>
                        </div>
                        {option.riskFactors.length > 0 && (
                          <div>
                            <span className="font-medium text-orange-600">Risks:</span>
                            <ul className="list-disc list-inside mt-1 space-y-1">
                              {option.riskFactors.slice(0, 1).map((risk, i) => (
                                <li key={i} className="text-orange-700">{risk}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Detailed Analysis */}
            {selectedOption && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.3 }}
              >
                <Card className="bg-slate-50 border-slate-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="size-5 text-slate-600" />
                      Detailed Analysis: {getScenarioTitle(selectedOption)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      const selectedOpt = optimizations.find(opt => opt.scenario === selectedOption);
                      if (!selectedOpt) return null;

                      return (
                        <div className="space-y-4">
                          {/* AI Reasoning */}
                          <div>
                            <h4 className="font-medium mb-2 flex items-center gap-2">
                              <Brain className="size-4 text-purple-600" />
                              AI Reasoning
                            </h4>
                            <ul className="space-y-1 text-sm">
                              {selectedOpt.reasoning.map((reason, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <CheckCircle className="size-3 text-green-600 mt-1 flex-shrink-0" />
                                  <span>{reason}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <Separator />

                          {/* Complete Benefits & Risks */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-medium mb-2 flex items-center gap-2">
                                <TrendingUp className="size-4 text-green-600" />
                                All Benefits
                              </h4>
                              <ul className="space-y-1 text-sm">
                                {selectedOpt.benefits.map((benefit, i) => (
                                  <li key={i} className="flex items-start gap-2">
                                    <CheckCircle className="size-3 text-green-600 mt-1 flex-shrink-0" />
                                    <span>{benefit}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div>
                              <h4 className="font-medium mb-2 flex items-center gap-2">
                                <TrendingDown className="size-4 text-orange-600" />
                                Risk Factors
                              </h4>
                              <ul className="space-y-1 text-sm">
                                {selectedOpt.riskFactors.map((risk, i) => (
                                  <li key={i} className="flex items-start gap-2">
                                    <AlertTriangle className="size-3 text-orange-600 mt-1 flex-shrink-0" />
                                    <span>{risk}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          {/* Implementation Button */}
                          <div className="text-center pt-4 border-t">
                            <Button
                              size="lg"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => {
                                // Implementation logic would go here
                                alert(`Implementing: ${getScenarioTitle(selectedOption)}`);
                              }}
                            >
                              <CheckCircle className="size-4 mr-2" />
                              Implement This Solution
                            </Button>
                            <p className="text-xs text-muted-foreground mt-2">
                              This will send commands to the signal control system
                            </p>
                          </div>
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}