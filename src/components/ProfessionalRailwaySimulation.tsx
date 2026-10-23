import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import { motion, AnimatePresence } from "motion/react";
import { 
  Train, 
  MapPin, 
  Play, 
  RotateCcw, 
  CheckCircle,
  Zap,
  ArrowRight,
  Clock,
  Users
} from "lucide-react";

interface Platform {
  id: number;
  name: string;
  x: number;
  y: number;
  status: "available" | "occupied" | "maintenance";
  trainNumber?: string;
  passengerCount?: number;
}

interface Signal {
  id: string;
  x: number;
  y: number;
  state: "red" | "green";
  isActive: boolean;
}

interface TrainMovement {
  trainNumber: string;
  trainName: string;
  fromPlatform: number;
  toPlatform: number;
  reason: string;
  priority: "high" | "medium" | "low";
  passengerCount: number;
  delay: number;
}

const STATION_CONFIG = {
  width: 1000,
  height: 600,
  platformWidth: 160,
  platformHeight: 50,
  trackOffset: 200,
  junctionX: 500
};

const PLATFORMS: Platform[] = [
  { id: 1, name: "Platform 1", x: 50, y: 80, status: "available" },
  { id: 2, name: "Platform 2", x: 50, y: 150, status: "occupied", trainNumber: "12345", passengerCount: 890 },
  { id: 3, name: "Platform 3", x: 50, y: 220, status: "available" },
  { id: 4, name: "Platform 4", x: 50, y: 290, status: "maintenance" },
  { id: 5, name: "Platform 5", x: 50, y: 360, status: "available" },
  { id: 6, name: "Platform 6", x: 50, y: 430, status: "occupied", trainNumber: "67890", passengerCount: 650 }
];

const INITIAL_SIGNALS: Signal[] = [
  { id: "main_junction", x: 500, y: 250, state: "green", isActive: false },
  { id: "north_switch", x: 400, y: 180, state: "green", isActive: false },
  { id: "south_switch", x: 400, y: 320, state: "green", isActive: false },
  { id: "entry_signal", x: 280, y: 250, state: "green", isActive: false },
  { id: "exit_signal", x: 720, y: 250, state: "green", isActive: false }
];

const TRAIN_MOVEMENTS: TrainMovement[] = [
  {
    trainNumber: "12345",
    trainName: "Mumbai Rajdhani Express",
    fromPlatform: 2,
    toPlatform: 5,
    reason: "Platform 2 overcrowded (890 passengers), relocating to Platform 5 for optimal passenger flow",
    priority: "high",
    passengerCount: 890,
    delay: 8
  },
  {
    trainNumber: "67890",
    trainName: "Pune Intercity",
    fromPlatform: 6,
    toPlatform: 3,
    reason: "Platform 6 maintenance scheduled, moving to Platform 3 for on-time departure",
    priority: "medium",
    passengerCount: 650,
    delay: 5
  },
  {
    trainNumber: "11111",
    trainName: "Chennai Express",
    fromPlatform: 1,
    toPlatform: 4,
    reason: "High-priority express service allocation to Platform 4 for faster boarding",
    priority: "high",
    passengerCount: 1200,
    delay: 12
  }
];

// Generate smooth curved path for train movement
const generateTrainPath = (fromPlatform: number, toPlatform: number) => {
  const from = PLATFORMS.find(p => p.id === fromPlatform)!;
  const to = PLATFORMS.find(p => p.id === toPlatform)!;
  
  const startX = from.x + STATION_CONFIG.platformWidth + 30;
  const startY = from.y + STATION_CONFIG.platformHeight / 2;
  const endX = to.x + STATION_CONFIG.platformWidth + 30;
  const endY = to.y + STATION_CONFIG.platformHeight / 2;
  
  const junctionX = STATION_CONFIG.junctionX;
  const controlY = (startY + endY) / 2;
  
  // Create smooth curved path through junction
  const pathPoints = [
    { x: startX, y: startY },
    { x: startX + 80, y: startY },
    { x: junctionX - 100, y: startY },
    { x: junctionX - 50, y: controlY },
    { x: junctionX, y: controlY },
    { x: junctionX + 50, y: controlY },
    { x: junctionX + 100, y: endY },
    { x: endX - 80, y: endY },
    { x: endX, y: endY }
  ];
  
  return pathPoints;
};

const PlatformComponent = ({ platform, isSource, isDestination, isAnimating }: {
  platform: Platform;
  isSource: boolean;
  isDestination: boolean;
  isAnimating: boolean;
}) => {
  const getPlatformColor = () => {
    if (isAnimating) {
      if (isSource) return "#fecaca"; // red-200
      if (isDestination) return "#bbf7d0"; // green-200
    }
    
    switch (platform.status) {
      case "available": return "#f0f9ff"; // blue-50
      case "occupied": return "#dbeafe"; // blue-100
      case "maintenance": return "#fed7aa"; // orange-200
      default: return "#f9fafb"; // gray-50
    }
  };

  const getPlatformStroke = () => {
    if (isAnimating) {
      if (isSource) return "#dc2626"; // red-600
      if (isDestination) return "#16a34a"; // green-600
    }
    
    switch (platform.status) {
      case "available": return "#3b82f6"; // blue-500
      case "occupied": return "#1d4ed8"; // blue-700
      case "maintenance": return "#ea580c"; // orange-600
      default: return "#6b7280"; // gray-500
    }
  };

  return (
    <g>
      <motion.rect
        x={platform.x}
        y={platform.y}
        width={STATION_CONFIG.platformWidth}
        height={STATION_CONFIG.platformHeight}
        fill={getPlatformColor()}
        stroke={getPlatformStroke()}
        strokeWidth="2"
        rx="8"
        animate={isAnimating && (isSource || isDestination) ? {
          strokeWidth: [2, 4, 2],
          filter: ["brightness(1)", "brightness(1.1)", "brightness(1)"]
        } : {}}
        transition={{ duration: 1, repeat: isAnimating ? Infinity : 0 }}
      />
      
      {/* Platform Label */}
      <text
        x={platform.x + STATION_CONFIG.platformWidth / 2}
        y={platform.y + 20}
        textAnchor="middle"
        fontSize="14"
        fontWeight="600"
        fill="#374151"
      >
        {platform.name}
      </text>
      
      {/* Train and Passenger Info */}
      {platform.trainNumber && (
        <g>
          <text
            x={platform.x + STATION_CONFIG.platformWidth / 2}
            y={platform.y + 35}
            textAnchor="middle"
            fontSize="10"
            fill="#1f2937"
            fontWeight="500"
          >
            Train {platform.trainNumber}
          </text>
          {platform.passengerCount && (
            <text
              x={platform.x + STATION_CONFIG.platformWidth / 2}
              y={platform.y + 47}
              textAnchor="middle"
              fontSize="9"
              fill="#6b7280"
            >
              {platform.passengerCount} passengers
            </text>
          )}
        </g>
      )}
      
      {/* Status Indicator */}
      <circle
        cx={platform.x + STATION_CONFIG.platformWidth - 15}
        cy={platform.y + 15}
        r="5"
        fill={platform.status === "available" ? "#10b981" : 
              platform.status === "occupied" ? "#ef4444" : "#f59e0b"}
      />
    </g>
  );
};

const SignalComponent = ({ signal }: { signal: Signal }) => (
  <g transform={`translate(${signal.x}, ${signal.y})`}>
    {/* Signal Post */}
    <rect x="-3" y="0" width="6" height="40" fill="#4b5563" rx="3" />
    <rect x="-12" y="0" width="24" height="25" fill="#1f2937" rx="4" />
    
    {/* Signal Housing */}
    <rect x="-10" y="2" width="20" height="21" fill="#374151" rx="2" />
    
    {/* Red Light */}
    <circle 
      cx="0" 
      cy="8" 
      r="4" 
      fill={signal.state === "red" ? "#ef4444" : "#374151"} 
    />
    {signal.state === "red" && signal.isActive && (
      <motion.circle
        cx="0"
        cy="8"
        r="6"
        fill="none"
        stroke="#ef4444"
        strokeWidth="1"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: [0, 0.8, 0], scale: [0.5, 1.3, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
    )}
    
    {/* Green Light */}
    <circle 
      cx="0" 
      cy="17" 
      r="4" 
      fill={signal.state === "green" ? "#10b981" : "#374151"} 
    />
    {signal.state === "green" && signal.isActive && (
      <motion.circle
        cx="0"
        cy="17"
        r="6"
        fill="none"
        stroke="#10b981"
        strokeWidth="1"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: [0, 0.8, 0], scale: [0.5, 1.3, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
    )}
  </g>
);

const TrainIcon = ({ trainNumber }: { trainNumber: string }) => (
  <g>
    {/* Engine */}
    <motion.rect 
      x="-40" 
      y="-12" 
      width="35" 
      height="24" 
      fill="#1e40af" 
      rx="4"
      animate={{ 
        filter: ["brightness(1)", "brightness(1.1)", "brightness(1)"] 
      }}
      transition={{ duration: 2, repeat: Infinity }}
    />
    <rect x="-38" y="-8" width="6" height="16" fill="#3b82f6" rx="1" />
    <circle cx="-30" cy="-6" r="2" fill="#fbbf24" />
    <circle cx="-30" cy="6" r="2" fill="#fbbf24" />
    
    {/* Coach 1 */}
    <rect x="-5" y="-12" width="28" height="24" fill="#dc2626" rx="4" />
    <rect x="-3" y="-8" width="24" height="16" fill="#f87171" rx="2" />
    <circle cx="3" cy="-6" r="2" fill="#374151" />
    <circle cx="3" cy="6" r="2" fill="#374151" />
    <circle cx="15" cy="-6" r="2" fill="#374151" />
    <circle cx="15" cy="6" r="2" fill="#374151" />
    
    {/* Coach 2 */}
    <rect x="23" y="-12" width="28" height="24" fill="#dc2626" rx="4" />
    <rect x="25" y="-8" width="24" height="16" fill="#f87171" rx="2" />
    <circle cx="31" cy="-6" r="2" fill="#374151" />
    <circle cx="31" cy="6" r="2" fill="#374151" />
    <circle cx="43" cy="-6" r="2" fill="#374151" />
    <circle cx="43" cy="6" r="2" fill="#374151" />
    
    {/* Train Number */}
    <text x="9" y="3" fontSize="8" fill="white" textAnchor="middle" fontWeight="600">
      {trainNumber}
    </text>
    
    {/* Motion Blur Effect */}
    <motion.rect
      x="-45"
      y="-15"
      width="100"
      height="30"
      fill="url(#motionBlur)"
      opacity="0.3"
      animate={{
        opacity: [0, 0.2, 0],
        scaleX: [1, 1.1, 1]
      }}
      transition={{ duration: 0.8, repeat: Infinity }}
    />
  </g>
);

export function ProfessionalRailwaySimulation() {
  const [currentMovement, setCurrentMovement] = useState<TrainMovement>(TRAIN_MOVEMENTS[0]);
  const [platforms, setPlatforms] = useState<Platform[]>(PLATFORMS);
  const [signals, setSignals] = useState<Signal[]>(INITIAL_SIGNALS);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [trainPath, setTrainPath] = useState<Array<{x: number, y: number}>>([]);

  const startSimulation = async () => {
    setIsAnimating(true);
    setShowNotification(true);
    setAnimationComplete(false);

    // Generate train path
    const pathPoints = generateTrainPath(currentMovement.fromPlatform, currentMovement.toPlatform);
    setTrainPath(pathPoints);

    // Activate signals and set to red for safety
    setSignals(prev => prev.map(signal => ({
      ...signal,
      state: "red" as const,
      isActive: true
    })));

    // Update platform statuses
    setPlatforms(prev => prev.map(platform => ({
      ...platform,
      status: platform.id === currentMovement.fromPlatform ? "available" :
              platform.id === currentMovement.toPlatform ? "occupied" : platform.status,
      trainNumber: platform.id === currentMovement.fromPlatform ? undefined :
                  platform.id === currentMovement.toPlatform ? currentMovement.trainNumber : platform.trainNumber,
      passengerCount: platform.id === currentMovement.fromPlatform ? undefined :
                     platform.id === currentMovement.toPlatform ? currentMovement.passengerCount : platform.passengerCount
    })));

    // Complete animation after 5 seconds
    setTimeout(() => {
      setIsAnimating(false);
      setAnimationComplete(true);
      
      // Reset signals to green
      setSignals(prev => prev.map(signal => ({
        ...signal,
        state: "green" as const,
        isActive: false
      })));
    }, 5000);
  };

  const resetSimulation = () => {
    setPlatforms(PLATFORMS);
    setSignals(INITIAL_SIGNALS);
    setIsAnimating(false);
    setShowNotification(false);
    setAnimationComplete(false);
    setTrainPath([]);
    setScenarioIndex(0);
    setCurrentMovement(TRAIN_MOVEMENTS[0]);
  };

  const nextScenario = () => {
    if (!isAnimating) {
      const nextIndex = (scenarioIndex + 1) % TRAIN_MOVEMENTS.length;
      setScenarioIndex(nextIndex);
      setCurrentMovement(TRAIN_MOVEMENTS[nextIndex]);
      setAnimationComplete(false);
      setShowNotification(false);
      setTrainPath([]);
    }
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
      <Card className="bg-gradient-to-r from-slate-50 to-blue-50 border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Train className="size-6 text-blue-600" />
            Professional Railway Station Control System
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Advanced AI-powered platform management with realistic track switching and signal control
          </p>
        </CardHeader>
      </Card>

      {/* AI Notification Panel */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ opacity: 0, y: -30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.95 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <Alert className="bg-blue-50 border-blue-200 shadow-lg">
              <Zap className="size-4 text-blue-600" />
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <strong className="text-blue-900">AI Suggestion:</strong>
                    <span className="text-blue-800">
                      Train {currentMovement.trainNumber} moved from Platform {currentMovement.fromPlatform} → Platform {currentMovement.toPlatform}
                    </span>
                  </div>
                  <Badge className={getPriorityColor(currentMovement.priority)}>
                    {currentMovement.priority.toUpperCase()}
                  </Badge>
                </div>
                <div className="text-sm mt-2 text-blue-700 flex items-center gap-4">
                  <span>{currentMovement.reason}</span>
                  <div className="flex items-center gap-2 text-blue-600">
                    <Users className="size-3" />
                    {currentMovement.passengerCount} passengers
                  </div>
                  <div className="flex items-center gap-2 text-blue-600">
                    <Clock className="size-3" />
                    {currentMovement.delay}min delay
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Railway Station Visualization */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="size-5" />
              CSMT Railway Station - Professional Track Layout
            </div>
            <div className="text-sm text-muted-foreground">
              Real-time Signal Control & Platform Management
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="bg-slate-50 p-6 overflow-x-auto">
            <svg 
              width={STATION_CONFIG.width} 
              height={STATION_CONFIG.height} 
              viewBox={`0 0 ${STATION_CONFIG.width} ${STATION_CONFIG.height}`}
              className="w-full border rounded-lg bg-white shadow-inner"
              style={{ minWidth: '1000px' }}
            >
              {/* Gradient Definitions */}
              <defs>
                <linearGradient id="trackGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#64748b" />
                  <stop offset="50%" stopColor="#475569" />
                  <stop offset="100%" stopColor="#64748b" />
                </linearGradient>
                
                <linearGradient id="motionBlur" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0" />
                  <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                </linearGradient>
                
                <pattern id="trackPattern" x="0" y="0" width="20" height="4" patternUnits="userSpaceOnUse">
                  <rect x="0" y="1" width="12" height="2" fill="#8b5cf6" opacity="0.6" rx="1" />
                </pattern>
              </defs>

              {/* Background Grid */}
              <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#e2e8f0" strokeWidth="1" opacity="0.4"/>
              </pattern>
              <rect width="100%" height="100%" fill="url(#grid)" />

              {/* Main Railway Tracks */}
              {platforms.map((platform, index) => {
                const trackY = platform.y + STATION_CONFIG.platformHeight / 2;
                return (
                  <g key={`track-${platform.id}`}>
                    {/* Track Rails */}
                    <line 
                      x1={platform.x + STATION_CONFIG.platformWidth} 
                      y1={trackY - 4} 
                      x2={STATION_CONFIG.width - 80} 
                      y2={trackY - 4} 
                      stroke="url(#trackGradient)" 
                      strokeWidth="3"
                    />
                    <line 
                      x1={platform.x + STATION_CONFIG.platformWidth} 
                      y1={trackY + 4} 
                      x2={STATION_CONFIG.width - 80} 
                      y2={trackY + 4} 
                      stroke="url(#trackGradient)" 
                      strokeWidth="3"
                    />
                    
                    {/* Track Sleepers */}
                    <line
                      x1={platform.x + STATION_CONFIG.platformWidth}
                      y1={trackY - 8}
                      x2={STATION_CONFIG.width - 80}
                      y2={trackY - 8}
                      stroke="url(#trackPattern)"
                      strokeWidth="16"
                    />
                  </g>
                );
              })}

              {/* Junction Switching Tracks */}
              {platforms.slice(0, -1).map((platform, index) => {
                const nextPlatform = platforms[index + 1];
                const startY = platform.y + STATION_CONFIG.platformHeight / 2;
                const endY = nextPlatform.y + STATION_CONFIG.platformHeight / 2;
                const junctionX = STATION_CONFIG.junctionX;
                
                return (
                  <g key={`junction-${platform.id}`}>
                    <motion.path
                      d={`M ${junctionX - 50} ${startY} Q ${junctionX} ${(startY + endY) / 2} ${junctionX - 50} ${endY}`}
                      stroke="url(#trackGradient)"
                      strokeWidth="3"
                      fill="none"
                      animate={isAnimating ? {
                        strokeWidth: [3, 4, 3],
                        filter: ["brightness(1)", "brightness(1.2)", "brightness(1)"]
                      } : {}}
                      transition={{ duration: 1.5, repeat: isAnimating ? Infinity : 0 }}
                    />
                  </g>
                );
              })}

              {/* Platform Components */}
              {platforms.map((platform) => (
                <PlatformComponent
                  key={platform.id}
                  platform={platform}
                  isSource={platform.id === currentMovement.fromPlatform}
                  isDestination={platform.id === currentMovement.toPlatform}
                  isAnimating={isAnimating}
                />
              ))}

              {/* Railway Signals */}
              {signals.map((signal) => (
                <SignalComponent key={signal.id} signal={signal} />
              ))}

              {/* Animated Train Movement */}
              {isAnimating && trainPath.length > 0 && (
                <motion.g
                  initial={{ 
                    x: trainPath[0].x, 
                    y: trainPath[0].y 
                  }}
                  animate={{
                    x: trainPath.map(p => p.x),
                    y: trainPath.map(p => p.y)
                  }}
                  transition={{
                    duration: 5,
                    ease: "easeInOut",
                    times: trainPath.map((_, i) => i / (trainPath.length - 1))
                  }}
                >
                  <TrainIcon trainNumber={currentMovement.trainNumber} />
                </motion.g>
              )}

              {/* Static Trains on Platforms */}
              {!isAnimating && platforms.map((platform) => 
                platform.trainNumber ? (
                  <g key={`static-train-${platform.id}`} transform={`translate(${platform.x + STATION_CONFIG.platformWidth + 40}, ${platform.y + STATION_CONFIG.platformHeight / 2})`}>
                    <TrainIcon trainNumber={platform.trainNumber} />
                  </g>
                ) : null
              )}

              {/* Station Labels */}
              <text x="50" y="30" fontSize="18" fontWeight="700" fill="#1e293b">
                Chhatrapati Shivaji Maharaj Terminus (CSMT)
              </text>
              <text x="50" y="50" fontSize="12" fill="#64748b">
                Platform Management System • AI-Powered Optimization
              </text>
            </svg>
          </div>
        </CardContent>
      </Card>

      {/* Control Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scenario Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Current Movement Scenario</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Train Number</div>
                <div className="font-semibold">{currentMovement.trainNumber}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Service Name</div>
                <div className="font-semibold">{currentMovement.trainName}</div>
              </div>
            </div>
            
            <div>
              <div className="text-sm text-muted-foreground mb-2">Platform Movement</div>
              <div className="flex items-center gap-3 bg-slate-50 p-3 rounded border">
                <span className="font-semibold text-red-600">Platform {currentMovement.fromPlatform}</span>
                <ArrowRight className="size-4 text-slate-600" />
                <span className="font-semibold text-green-600">Platform {currentMovement.toPlatform}</span>
              </div>
            </div>

            <div>
              <div className="text-sm text-muted-foreground mb-2">AI Decision Rationale</div>
              <p className="text-sm bg-blue-50 p-3 rounded border border-blue-200">
                {currentMovement.reason}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <Badge className={getPriorityColor(currentMovement.priority)}>
                {currentMovement.priority.toUpperCase()} PRIORITY
              </Badge>
              <div className="text-sm text-muted-foreground">
                Expected delay: {currentMovement.delay} minutes
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
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <Train className="size-4 mr-2" />
                  </motion.div>
                  Processing Track Movement...
                </>
              ) : (
                <>
                  <Play className="size-4 mr-2" />
                  Start Railway Simulation
                </>
              )}
            </Button>

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={nextScenario}
                disabled={isAnimating}
              >
                Next Scenario ({scenarioIndex + 1}/{TRAIN_MOVEMENTS.length})
              </Button>
              <Button
                variant="outline"
                onClick={resetSimulation}
                disabled={isAnimating}
              >
                <RotateCcw className="size-4 mr-2" />
                Reset Station
              </Button>
            </div>

            {animationComplete && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-50 border border-green-200 p-3 rounded-lg"
              >
                <div className="flex items-center gap-2 text-green-800">
                  <CheckCircle className="size-4" />
                  <span className="font-semibold">Movement Completed Successfully!</span>
                </div>
                <div className="text-sm text-green-700 mt-1">
                  Train {currentMovement.trainNumber} has been safely relocated to Platform {currentMovement.toPlatform}
                </div>
              </motion.div>
            )}

            <div className="text-xs text-muted-foreground bg-slate-50 p-3 rounded border">
              <strong>System Features:</strong>
              <ul className="mt-1 space-y-1">
                <li>• Realistic track switching and junction control</li>
                <li>• Automated signal management (red/green states)</li>
                <li>• Smooth train movement with professional easing</li>
                <li>• Real-time platform status monitoring</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}