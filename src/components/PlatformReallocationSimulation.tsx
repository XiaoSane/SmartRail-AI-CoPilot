import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import { motion, AnimatePresence } from "motion/react";
import { 
  Train, 
  MapPin, 
  ArrowRight, 
  Play, 
  RotateCcw, 
  CheckCircle,
  Clock,
  Users,
  AlertTriangle,
  Zap
} from "lucide-react";

interface Platform {
  id: number;
  name: string;
  status: "available" | "occupied" | "maintenance" | "assigned";
  capacity: number;
  currentOccupancy: number;
  trainNumber?: string;
}

interface SimulationScenario {
  id: string;
  trainNumber: string;
  trainName: string;
  fromPlatform: number;
  toPlatform: number;
  reason: string;
  priority: "high" | "medium" | "low";
  estimatedTime: string;
  passengerCount: number;
  delay: number;
}

const INITIAL_PLATFORMS: Platform[] = [
  { id: 1, name: "Platform 1", status: "available", capacity: 1200, currentOccupancy: 0 },
  { id: 2, name: "Platform 2", status: "maintenance", capacity: 1000, currentOccupancy: 0 },
  { id: 3, name: "Platform 3", status: "occupied", capacity: 1400, currentOccupancy: 850, trainNumber: "12345" },
  { id: 4, name: "Platform 4", status: "available", capacity: 1200, currentOccupancy: 0 },
  { id: 5, name: "Platform 5", status: "available", capacity: 1600, currentOccupancy: 0 },
  { id: 6, name: "Platform 6", status: "occupied", capacity: 1000, currentOccupancy: 420, trainNumber: "98765" }
];

const SIMULATION_SCENARIOS: SimulationScenario[] = [
  {
    id: "scenario_1",
    trainNumber: "12345",
    trainName: "Mumbai Express",
    fromPlatform: 3,
    toPlatform: 5,
    reason: "Platform 3 overcrowded (850 passengers), Platform 5 optimal with 1600 capacity",
    priority: "high",
    estimatedTime: "14:25",
    passengerCount: 850,
    delay: 8
  },
  {
    id: "scenario_2", 
    trainNumber: "98765",
    trainName: "Dadar Local",
    fromPlatform: 6,
    toPlatform: 1,
    reason: "Platform 6 track maintenance required, Platform 1 available with better passenger flow",
    priority: "medium",
    estimatedTime: "14:28",
    passengerCount: 420,
    delay: 3
  },
  {
    id: "scenario_3",
    trainNumber: "54321",
    trainName: "Rajdhani Express",
    fromPlatform: 2,
    toPlatform: 4,
    reason: "Platform 2 under maintenance, high-priority express service needs immediate platform",
    priority: "high",
    estimatedTime: "14:32",
    passengerCount: 1200,
    delay: 12
  }
];

export function PlatformReallocationSimulation() {
  const [platforms, setPlatforms] = useState<Platform[]>(INITIAL_PLATFORMS);
  const [currentScenario, setCurrentScenario] = useState<SimulationScenario>(SIMULATION_SCENARIOS[0]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);
  const [scenarioIndex, setScenarioIndex] = useState(0);

  const getPlatformColor = (status: Platform["status"], isSource = false, isTarget = false) => {
    if (isSource && isAnimating) return "bg-red-100 border-red-300 shadow-red-200";
    if (isTarget && isAnimating) return "bg-green-100 border-green-300 shadow-green-200";
    
    switch (status) {
      case "available": return "bg-green-50 border-green-200 shadow-green-100";
      case "occupied": return "bg-blue-50 border-blue-200 shadow-blue-100";
      case "maintenance": return "bg-orange-50 border-orange-200 shadow-orange-100";
      case "assigned": return "bg-purple-50 border-purple-200 shadow-purple-100";
      default: return "bg-gray-50 border-gray-200";
    }
  };

  const getPlatformIcon = (status: Platform["status"]) => {
    switch (status) {
      case "available": return <CheckCircle className="size-4 text-green-600" />;
      case "occupied": return <Train className="size-4 text-blue-600" />;
      case "maintenance": return <AlertTriangle className="size-4 text-orange-600" />;
      case "assigned": return <Clock className="size-4 text-purple-600" />;
      default: return <MapPin className="size-4 text-gray-600" />;
    }
  };

  const startSimulation = async () => {
    setIsAnimating(true);
    setShowNotification(true);
    setAnimationComplete(false);

    // Update platform statuses
    setPlatforms(prev => prev.map(platform => ({
      ...platform,
      status: platform.id === currentScenario.fromPlatform ? "available" : 
              platform.id === currentScenario.toPlatform ? "assigned" : platform.status,
      trainNumber: platform.id === currentScenario.fromPlatform ? undefined : 
                  platform.id === currentScenario.toPlatform ? currentScenario.trainNumber : platform.trainNumber,
      currentOccupancy: platform.id === currentScenario.fromPlatform ? 0 : 
                       platform.id === currentScenario.toPlatform ? currentScenario.passengerCount : platform.currentOccupancy
    })));

    // Wait for animation to complete
    setTimeout(() => {
      setIsAnimating(false);
      setAnimationComplete(true);
      
      // Update final platform status
      setPlatforms(prev => prev.map(platform => ({
        ...platform,
        status: platform.id === currentScenario.toPlatform ? "occupied" : platform.status
      })));
    }, 2500);
  };

  const resetSimulation = () => {
    setPlatforms(INITIAL_PLATFORMS);
    setIsAnimating(false);
    setShowNotification(false);
    setAnimationComplete(false);
    setScenarioIndex(0);
    setCurrentScenario(SIMULATION_SCENARIOS[0]);
  };

  const nextScenario = () => {
    const nextIndex = (scenarioIndex + 1) % SIMULATION_SCENARIOS.length;
    setScenarioIndex(nextIndex);
    setCurrentScenario(SIMULATION_SCENARIOS[nextIndex]);
    setAnimationComplete(false);
    setShowNotification(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800 border-red-200";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <MapPin className="size-6 text-blue-600" />
            Platform Reallocation Simulation
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Real-time AI-powered platform optimization with smooth train movement visualization
          </p>
        </CardHeader>
      </Card>

      {/* AI Notification */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Alert className="bg-blue-50 border-blue-200">
              <Zap className="size-4" />
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <div>
                    <strong>AI Suggestion:</strong> Train {currentScenario.trainNumber} reassigned from Platform {currentScenario.fromPlatform} → Platform {currentScenario.toPlatform}
                  </div>
                  <Badge className={getPriorityColor(currentScenario.priority)}>
                    {currentScenario.priority} priority
                  </Badge>
                </div>
                <div className="text-sm mt-2 text-blue-700">
                  Reason: {currentScenario.reason}
                </div>
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Station Layout */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Train className="size-5" />
              CSMT Station Layout - Top View
            </div>
            <div className="text-sm text-muted-foreground">
              Live Platform Status
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Platform Grid */}
          <div className="relative bg-gray-50 p-8 rounded-lg border-2 border-dashed border-gray-200 min-h-96">
            {/* Grid Pattern Background */}
            <div className="absolute inset-0 opacity-20">
              <div className="grid grid-cols-12 grid-rows-8 h-full">
                {Array.from({ length: 96 }).map((_, i) => (
                  <div key={i} className="border border-gray-300"></div>
                ))}
              </div>
            </div>

            {/* Platform Boxes */}
            <div className="relative grid grid-cols-6 gap-4 h-full items-center">
              {platforms.map((platform) => {
                const isSource = platform.id === currentScenario.fromPlatform;
                const isTarget = platform.id === currentScenario.toPlatform;
                
                return (
                  <motion.div
                    key={platform.id}
                    className={`
                      relative p-4 rounded-lg border-2 shadow-sm transition-all duration-300
                      ${getPlatformColor(platform.status, isSource, isTarget)}
                      ${isAnimating && (isSource || isTarget) ? 'shadow-lg scale-105' : ''}
                    `}
                    animate={isAnimating && (isSource || isTarget) ? {
                      scale: [1, 1.05, 1],
                      boxShadow: [
                        "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                        "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                        "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                      ]
                    } : {}}
                    transition={{ duration: 0.5, repeat: isAnimating ? Infinity : 0 }}
                  >
                    {/* Platform Label */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getPlatformIcon(platform.status)}
                        <span className="font-medium text-sm">{platform.name}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {platform.capacity}
                      </Badge>
                    </div>

                    {/* Platform Status */}
                    <div className="text-xs text-muted-foreground mb-2">
                      {platform.status === "occupied" && (
                        <div>Train: {platform.trainNumber}</div>
                      )}
                      {platform.currentOccupancy > 0 && (
                        <div className="flex items-center gap-1">
                          <Users className="size-3" />
                          {platform.currentOccupancy} passengers
                        </div>
                      )}
                      {platform.status === "maintenance" && (
                        <div className="text-orange-600">Under maintenance</div>
                      )}
                      {platform.status === "available" && (
                        <div className="text-green-600">Available</div>
                      )}
                    </div>

                    {/* Train Icon on Platform */}
                    {platform.trainNumber && (
                      <div className="absolute bottom-2 right-2">
                        <motion.div
                          className="bg-blue-600 text-white p-1 rounded text-xs font-medium"
                          animate={platform.trainNumber === currentScenario.trainNumber && isAnimating ? {
                            rotate: [0, 5, -5, 0],
                          } : {}}
                          transition={{ duration: 0.5, repeat: isAnimating ? Infinity : 0 }}
                        >
                          {platform.trainNumber}
                        </motion.div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Animated Train Movement */}
            {isAnimating && (
              <motion.div
                className="absolute top-1/2 transform -translate-y-1/2 z-10"
                initial={{
                  left: `${((currentScenario.fromPlatform - 1) / 5) * 83.33 + 8.33}%`,
                }}
                animate={{
                  left: `${((currentScenario.toPlatform - 1) / 5) * 83.33 + 8.33}%`,
                }}
                transition={{
                  duration: 2.5,
                  ease: "easeInOut"
                }}
              >
                <div className="bg-blue-600 text-white px-3 py-2 rounded-lg shadow-lg flex items-center gap-2">
                  <Train className="size-4" />
                  <span className="font-medium">{currentScenario.trainNumber}</span>
                </div>
                <motion.div
                  className="absolute -bottom-1 left-1/2 transform -translate-x-1/2"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.7, 0.3]
                  }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                </motion.div>
              </motion.div>
            )}

            {/* Movement Arrow */}
            {showNotification && !isAnimating && (
              <motion.div
                className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.3 }}
              >
                <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-md border">
                  <span className="text-sm font-medium">Platform {currentScenario.fromPlatform}</span>
                  <ArrowRight className="size-4 text-blue-600" />
                  <span className="text-sm font-medium">Platform {currentScenario.toPlatform}</span>
                </div>
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Scenario Details & Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Scenario Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Current Scenario Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Train Number</div>
                <div className="font-medium">{currentScenario.trainNumber}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Train Name</div>
                <div className="font-medium">{currentScenario.trainName}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Estimated Arrival</div>
                <div className="font-medium">{currentScenario.estimatedTime}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Passenger Count</div>
                <div className="font-medium flex items-center gap-1">
                  <Users className="size-4" />
                  {currentScenario.passengerCount}
                </div>
              </div>
            </div>
            
            <div>
              <div className="text-sm text-muted-foreground mb-2">AI Reasoning</div>
              <p className="text-sm bg-blue-50 p-3 rounded border">{currentScenario.reason}</p>
            </div>

            <div className="flex items-center justify-between">
              <Badge className={getPriorityColor(currentScenario.priority)}>
                {currentScenario.priority.toUpperCase()} Priority
              </Badge>
              <div className="text-sm text-muted-foreground">
                Expected Delay: {currentScenario.delay} minutes
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Simulation Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Simulation Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Button
                onClick={startSimulation}
                disabled={isAnimating}
                className="w-full"
                size="lg"
              >
                {isAnimating ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Train className="size-4 mr-2" />
                    </motion.div>
                    Simulating Movement...
                  </>
                ) : (
                  <>
                    <Play className="size-4 mr-2" />
                    Start Platform Reallocation
                  </>
                )}
              </Button>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={nextScenario}
                  disabled={isAnimating}
                >
                  <ArrowRight className="size-4 mr-2" />
                  Next Scenario
                </Button>
                <Button
                  variant="outline"
                  onClick={resetSimulation}
                  disabled={isAnimating}
                >
                  <RotateCcw className="size-4 mr-2" />
                  Reset
                </Button>
              </div>
            </div>

            {animationComplete && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-50 border border-green-200 p-3 rounded-lg"
              >
                <div className="flex items-center gap-2 text-green-800">
                  <CheckCircle className="size-4" />
                  <span className="font-medium">Reallocation Complete!</span>
                </div>
                <div className="text-sm text-green-700 mt-1">
                  Train {currentScenario.trainNumber} successfully moved to Platform {currentScenario.toPlatform}
                </div>
              </motion.div>
            )}

            <div className="text-xs text-muted-foreground bg-muted p-3 rounded">
              <strong>Scenario {scenarioIndex + 1} of {SIMULATION_SCENARIOS.length}</strong><br />
              Click "Next Scenario" to try different reallocation situations or "Start" to see the current simulation.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}