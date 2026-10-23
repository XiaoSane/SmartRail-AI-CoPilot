import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Progress } from "./ui/progress";
import { motion, AnimatePresence } from "motion/react";
import { 
  Train, 
  MapPin, 
  Play, 
  RotateCcw, 
  CheckCircle,
  Clock,
  AlertTriangle,
  Zap,
  ArrowRight,
  Radio,
  Eye,
  Settings,
  BarChart3,
  Timer,
  Shield,
  Activity,
  Gauge,
  MonitorSpeaker,
  Pause,
  FastForward
} from "lucide-react";

interface Platform {
  id: number;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  status: "available" | "occupied" | "maintenance";
  trainNumber?: string;
}

interface Signal {
  id: string;
  x: number;
  y: number;
  state: "red" | "green" | "yellow";
  platforms: number[];
  name: string;
  type: "home" | "starter" | "distant" | "shunt";
  aspectRatio?: string;
}

interface TrainMovement {
  trainId: string;
  currentBlock: string;
  nextBlock: string;
  speed: number;
  eta: string;
  status: "approaching" | "occupying" | "departed";
}

interface ControllerAction {
  id: string;
  timestamp: string;
  action: string;
  trainId: string;
  signalId?: string;
  controller: string;
}

interface TrainPath {
  id: string;
  points: Array<{ x: number; y: number; rotation?: number }>;
  duration: number;
}

interface SimulationScenario {
  id: string;
  trainNumber: string;
  trainName: string;
  fromPlatform: number;
  toPlatform: number;
  reason: string;
  priority: "high" | "medium" | "low";
}

const STATION_WIDTH = 800;
const STATION_HEIGHT = 500;
const PLATFORM_WIDTH = 120;
const PLATFORM_HEIGHT = 40;
const TRACK_WIDTH = 100;

const PLATFORMS: Platform[] = [
  { id: 1, name: "Platform 1", x: 50, y: 80, width: PLATFORM_WIDTH, height: PLATFORM_HEIGHT, status: "available" },
  { id: 2, name: "Platform 2", x: 50, y: 160, width: PLATFORM_WIDTH, height: PLATFORM_HEIGHT, status: "occupied", trainNumber: "12951" },
  { id: 3, name: "Platform 3", x: 50, y: 240, width: PLATFORM_WIDTH, height: PLATFORM_HEIGHT, status: "available" },
  { id: 4, name: "Platform 4", x: 50, y: 320, width: PLATFORM_WIDTH, height: PLATFORM_HEIGHT, status: "available" },
  { id: 5, name: "Platform 5", x: 50, y: 400, width: PLATFORM_WIDTH, height: PLATFORM_HEIGHT, status: "maintenance" },
];

const SIGNALS: Signal[] = [
  { id: "CS/001", x: 250, y: 100, state: "green", platforms: [1, 2], name: "Platform 1-2 Home", type: "home", aspectRatio: "G" },
  { id: "CS/002", x: 350, y: 180, state: "green", platforms: [2, 3], name: "Junction Control", type: "starter", aspectRatio: "G" },
  { id: "CS/003", x: 450, y: 260, state: "green", platforms: [3, 4], name: "Platform 3-4 Home", type: "home", aspectRatio: "G" },
  { id: "CS/004", x: 550, y: 340, state: "green", platforms: [4, 5], name: "Platform 4-5 Starter", type: "starter", aspectRatio: "G" },
  { id: "CS/005", x: 200, y: 50, state: "red", platforms: [1], name: "Approach Signal", type: "distant", aspectRatio: "R" },
];

const SCENARIOS: SimulationScenario[] = [
  {
    id: "scenario_1",
    trainNumber: "12951",
    trainName: "Mumbai Rajdhani",
    fromPlatform: 2,
    toPlatform: 4,
    reason: "Platform 2 overcrowded, moving to Platform 4 for better passenger flow",
    priority: "high"
  },
  {
    id: "scenario_2",
    trainNumber: "16209",
    trainName: "Pune Express",
    fromPlatform: 1,
    toPlatform: 3,
    reason: "Platform 1 maintenance required, switching to Platform 3",
    priority: "medium"
  },
];

// Generate curved path between platforms following railway tracks
const generateTrainPath = (fromPlatform: number, toPlatform: number): TrainPath => {
  const from = PLATFORMS.find(p => p.id === fromPlatform)!;
  const to = PLATFORMS.find(p => p.id === toPlatform)!;
  
  const startX = from.x + from.width + 20;
  const startY = from.y + from.height / 2;
  const endX = to.x + to.width + 20;
  const endY = to.y + to.height / 2;
  
  // Create a path that goes through the junction area
  const junctionX = 400;
  const midY = (startY + endY) / 2;
  
  const points = [
    { x: startX, y: startY, rotation: 0 },
    { x: startX + 100, y: startY, rotation: 0 },
    { x: junctionX - 50, y: startY, rotation: 0 },
    { x: junctionX, y: midY, rotation: fromPlatform < toPlatform ? 15 : -15 },
    { x: junctionX + 50, y: endY, rotation: fromPlatform < toPlatform ? 0 : 0 },
    { x: endX - 100, y: endY, rotation: 0 },
    { x: endX, y: endY, rotation: 0 },
  ];
  
  return {
    id: `path_${fromPlatform}_${toPlatform}`,
    points,
    duration: 4000
  };
};

const TrackSleeper = ({ x, y }: { x: number; y: number }) => (
  <rect
    x={x}
    y={y}
    width="8"
    height="2"
    fill="#8B4513"
    rx="1"
  />
);

const RailwaySignal = ({ signal, isActive }: { signal: Signal; isActive: boolean }) => (
  <g transform={`translate(${signal.x}, ${signal.y})`}>
    {/* Signal Post */}
    <rect x="-3" y="0" width="6" height="35" fill="#4a5568" rx="1" />
    <rect x="-10" y="0" width="20" height="25" fill="#2d3748" rx="3" />
    
    {/* Signal Type Indicator */}
    <rect x="-8" y="22" width="16" height="8" fill="#1a202c" rx="1" />
    <text x="0" y="28" fontSize="4" fill="white" textAnchor="middle" fontWeight="bold">
      {signal.id}
    </text>
    
    {/* Multi-aspect signals */}
    {signal.type === "home" || signal.type === "starter" ? (
      <>
        {/* Red Light */}
        <circle 
          cx="-4" 
          cy="6" 
          r="3.5" 
          fill={signal.state === "red" ? "#ff2626" : "#2d3748"} 
          stroke="#000"
          strokeWidth="0.5"
          className={signal.state === "red" ? "drop-shadow-lg" : ""}
        />
        {/* Yellow Light */}
        <circle 
          cx="4" 
          cy="6" 
          r="3.5" 
          fill={signal.state === "yellow" ? "#ffaa00" : "#2d3748"} 
          stroke="#000"
          strokeWidth="0.5"
          className={signal.state === "yellow" ? "drop-shadow-lg" : ""}
        />
        {/* Green Light */}
        <circle 
          cx="0" 
          cy="16" 
          r="3.5" 
          fill={signal.state === "green" ? "#00ff00" : "#2d3748"} 
          stroke="#000"
          strokeWidth="0.5"
          className={signal.state === "green" ? "drop-shadow-lg" : ""}
        />
      </>
    ) : (
      /* Distant Signal - Single aspect */
      <circle 
        cx="0" 
        cy="10" 
        r="4" 
        fill={signal.state === "red" ? "#ff2626" : signal.state === "yellow" ? "#ffaa00" : "#00ff00"} 
        stroke="#000"
        strokeWidth="0.5"
        className="drop-shadow-lg"
      />
    )}
    
    {/* Active Signal Glow Effect */}
    {isActive && (
      <motion.circle
        cx={signal.type === "distant" ? "0" : 
            signal.state === "red" ? "-4" :
            signal.state === "yellow" ? "4" : "0"}
        cy={signal.type === "distant" ? "10" :
            signal.state === "green" ? "16" : "6"}
        r="6"
        fill="none"
        stroke={signal.state === "red" ? "#ff2626" : 
               signal.state === "yellow" ? "#ffaa00" : "#00ff00"}
        strokeWidth="1"
        opacity="0.7"
        initial={{ scale: 0.8 }}
        animate={{ scale: [0.8, 1.3, 0.8], opacity: [0.7, 0.3, 0.7] }}
        transition={{ duration: 1.2, repeat: Infinity }}
      />
    )}
    
    {/* Signal Name Label */}
    <text x="0" y="45" fontSize="5" fill="#4a5568" textAnchor="middle" fontWeight="500">
      {signal.name}
    </text>
    
    {/* Aspect Display */}
    <rect x="-6" y="37" width="12" height="6" fill="#e2e8f0" rx="1" />
    <text x="0" y="41.5" fontSize="4" fill="#2d3748" textAnchor="middle" fontWeight="bold">
      {signal.aspectRatio}
    </text>
  </g>
);

const TrainIcon = ({ trainNumber }: { trainNumber: string }) => (
  <g>
    {/* Engine */}
    <rect x="-30" y="-8" width="25" height="16" fill="#1e40af" rx="2" />
    <rect x="-28" y="-6" width="4" height="12" fill="#3b82f6" />
    <circle cx="-22" cy="-4" r="1.5" fill="#fbbf24" />
    <circle cx="-22" cy="4" r="1.5" fill="#fbbf24" />
    
    {/* Coach 1 */}
    <rect x="-5" y="-8" width="20" height="16" fill="#dc2626" rx="2" />
    <rect x="-3" y="-6" width="16" height="12" fill="#f87171" />
    <circle cx="1" cy="-4" r="1.5" fill="#374151" />
    <circle cx="1" cy="4" r="1.5" fill="#374151" />
    <circle cx="9" cy="-4" r="1.5" fill="#374151" />
    <circle cx="9" cy="4" r="1.5" fill="#374151" />
    
    {/* Coach 2 */}
    <rect x="15" y="-8" width="20" height="16" fill="#dc2626" rx="2" />
    <rect x="17" y="-6" width="16" height="12" fill="#f87171" />
    <circle cx="21" cy="-4" r="1.5" fill="#374151" />
    <circle cx="21" cy="4" r="1.5" fill="#374151" />
    <circle cx="29" cy="-4" r="1.5" fill="#374151" />
    <circle cx="29" cy="4" r="1.5" fill="#374151" />
    
    {/* Train Number */}
    <text x="5" y="2" fontSize="6" fill="white" textAnchor="middle" fontWeight="bold">
      {trainNumber}
    </text>
  </g>
);

export function RailwayStationSimulation() {
  const [currentScenario, setCurrentScenario] = useState<SimulationScenario>(SCENARIOS[0]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [showNotification, setShowNotification] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [signals, setSignals] = useState<Signal[]>(SIGNALS);
  const [platforms, setPlatforms] = useState<Platform[]>(PLATFORMS);
  const [trainPath, setTrainPath] = useState<TrainPath | null>(null);
  const [activeView, setActiveView] = useState<"overview" | "signals" | "control">("overview");
  const [trainMovements, setTrainMovements] = useState<TrainMovement[]>([]);
  const [controllerActions, setControllerActions] = useState<ControllerAction[]>([]);
  const [systemAlerts, setSystemAlerts] = useState<string[]>([]);
  const [trainPosition, setTrainPosition] = useState({ x: 0, y: 0, block: "" });

  const logControllerAction = (action: string, trainId: string, signalId?: string) => {
    const newAction: ControllerAction = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString(),
      action,
      trainId,
      signalId,
      controller: "TTC-001"
    };
    setControllerActions(prev => [newAction, ...prev].slice(0, 10));
  };

  const addSystemAlert = (message: string) => {
    setSystemAlerts(prev => [message, ...prev].slice(0, 5));
    setTimeout(() => {
      setSystemAlerts(prev => prev.slice(0, -1));
    }, 8000);
  };

  const startSimulation = async () => {
    setIsAnimating(true);
    setShowNotification(true);
    setAnimationComplete(false);
    setIsPaused(false);

    // Log controller action
    logControllerAction(`Initiated movement from Platform ${currentScenario.fromPlatform} to ${currentScenario.toPlatform}`, currentScenario.trainNumber);
    addSystemAlert(`Movement authority granted for Train ${currentScenario.trainNumber}`);

    // Generate train path
    const path = generateTrainPath(currentScenario.fromPlatform, currentScenario.toPlatform);
    setTrainPath(path);

    // Progressive signal changes - more realistic
    setTimeout(() => {
      setSignals(prev => prev.map(signal => ({
        ...signal,
        state: signal.id === "CS/005" ? "yellow" : signal.state,
        aspectRatio: signal.id === "CS/005" ? "Y" : signal.aspectRatio
      })));
      logControllerAction("Set distant signal to CAUTION", currentScenario.trainNumber, "CS/005");
    }, 500);

    setTimeout(() => {
      setSignals(prev => prev.map(signal => ({
        ...signal,
        state: signal.platforms.includes(currentScenario.fromPlatform) ? "red" : signal.state,
        aspectRatio: signal.platforms.includes(currentScenario.fromPlatform) ? "R" : signal.aspectRatio
      })));
      logControllerAction("Set departure signal to DANGER", currentScenario.trainNumber);
    }, 1000);

    setTimeout(() => {
      setSignals(prev => prev.map(signal => ({
        ...signal,
        state: signal.platforms.includes(currentScenario.toPlatform) ? "yellow" : signal.state,
        aspectRatio: signal.platforms.includes(currentScenario.toPlatform) ? "Y" : signal.aspectRatio
      })));
      logControllerAction("Set arrival signal to CAUTION", currentScenario.trainNumber);
    }, 2000);

    // Update train movements
    setTrainMovements([{
      trainId: currentScenario.trainNumber,
      currentBlock: `Platform ${currentScenario.fromPlatform}`,
      nextBlock: `Platform ${currentScenario.toPlatform}`,
      speed: 25,
      eta: new Date(Date.now() + 4000).toLocaleTimeString(),
      status: "approaching"
    }]);

    // Highlight platforms
    setPlatforms(prev => prev.map(platform => ({
      ...platform,
      status: platform.id === currentScenario.fromPlatform ? "maintenance" :
              platform.id === currentScenario.toPlatform ? "available" : platform.status,
      trainNumber: platform.id === currentScenario.fromPlatform ? undefined :
                  platform.id === currentScenario.toPlatform ? currentScenario.trainNumber : platform.trainNumber
    })));

    // Complete animation after duration
    setTimeout(() => {
      if (!isPaused) {
        setIsAnimating(false);
        setAnimationComplete(true);
        
        // Final signal changes
        setSignals(prev => prev.map(signal => ({ 
          ...signal, 
          state: "green",
          aspectRatio: "G"
        })));
        
        logControllerAction("All signals cleared to PROCEED", currentScenario.trainNumber);
        addSystemAlert(`Train ${currentScenario.trainNumber} successfully arrived at Platform ${currentScenario.toPlatform}`);
        
        // Update final platform status
        setPlatforms(prev => prev.map(platform => ({
          ...platform,
          status: platform.id === currentScenario.fromPlatform ? "available" :
                  platform.id === currentScenario.toPlatform ? "occupied" : platform.status
        })));

        setTrainMovements([]);
      }
    }, (path.duration / animationSpeed) + 500);
  };

  const pauseSimulation = () => {
    setIsPaused(!isPaused);
    logControllerAction(isPaused ? "Resumed movement" : "Paused movement", currentScenario.trainNumber);
  };

  const changeAnimationSpeed = (speed: number) => {
    setAnimationSpeed(speed);
    logControllerAction(`Changed animation speed to ${speed}x`, currentScenario.trainNumber);
  };

  const resetSimulation = () => {
    setPlatforms(PLATFORMS);
    setSignals(SIGNALS);
    setIsAnimating(false);
    setShowNotification(false);
    setAnimationComplete(false);
    setTrainPath(null);
    setScenarioIndex(0);
    setCurrentScenario(SCENARIOS[0]);
  };

  const nextScenario = () => {
    const nextIndex = (scenarioIndex + 1) % SCENARIOS.length;
    setScenarioIndex(nextIndex);
    setCurrentScenario(SCENARIOS[nextIndex]);
    setAnimationComplete(false);
    setShowNotification(false);
    setTrainPath(null);
  };

  const getPlatformColor = (platform: Platform) => {
    if (isAnimating) {
      if (platform.id === currentScenario.fromPlatform) return "#fecaca"; // red
      if (platform.id === currentScenario.toPlatform) return "#bbf7d0"; // green
    }
    
    switch (platform.status) {
      case "available": return "#f0f9ff";
      case "occupied": return "#dbeafe";
      case "maintenance": return "#fed7aa";
      default: return "#f9fafb";
    }
  };

  const getPlatformStroke = (platform: Platform) => {
    if (isAnimating) {
      if (platform.id === currentScenario.fromPlatform) return "#dc2626"; // red
      if (platform.id === currentScenario.toPlatform) return "#16a34a"; // green
    }
    
    switch (platform.status) {
      case "available": return "#3b82f6";
      case "occupied": return "#1d4ed8";
      case "maintenance": return "#ea580c";
      default: return "#6b7280";
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
      {/* Professional TTC Header */}
      <Card className="bg-gradient-to-r from-slate-50 to-blue-50 border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MonitorSpeaker className="size-6 text-blue-600" />
              Train Traffic Control - CSMT Section
              <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                Professional Controller Interface
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>System Online</span>
              </div>
              <div className="text-muted-foreground">
                Controller: TTC-001 | Sector: A1-A5
              </div>
            </div>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Advanced railway traffic control system with real-time train movement, signal management, and safety protocols
          </p>
        </CardHeader>
      </Card>

      {/* System Alerts & Notifications */}
      <AnimatePresence>
        {systemAlerts.map((alert, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <Alert className="bg-yellow-50 border-yellow-300">
              <AlertTriangle className="size-4 text-yellow-600" />
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <div>
                    <strong>System Alert:</strong> {alert}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date().toLocaleTimeString()}
                  </span>
                </div>
              </AlertDescription>
            </Alert>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Movement Authorization */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Alert className="bg-green-50 border-green-200">
              <Shield className="size-4 text-green-600" />
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <div>
                    <strong>Movement Authority Granted:</strong> Train {currentScenario.trainNumber} • Route: Platform {currentScenario.fromPlatform} → Platform {currentScenario.toPlatform}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getPriorityColor(currentScenario.priority)}>
                      {currentScenario.priority} priority
                    </Badge>
                    <Badge variant="outline">
                      Speed: 25 km/h
                    </Badge>
                  </div>
                </div>
                <div className="text-sm mt-2 text-green-700 flex items-center gap-4">
                  <span>Reason: {currentScenario.reason}</span>
                  <span>ETA: {new Date(Date.now() + 4000).toLocaleTimeString()}</span>
                </div>
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Professional Controller Interface */}
      <Tabs value={activeView} onValueChange={(value) => setActiveView(value as any)} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Eye className="size-4" />
            Track Overview
          </TabsTrigger>
          <TabsTrigger value="signals" className="flex items-center gap-2">
            <Radio className="size-4" />
            Signal Control
          </TabsTrigger>
          <TabsTrigger value="control" className="flex items-center gap-2">
            <Settings className="size-4" />
            Movement Control
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="size-5" />
                  CSMT Railway Station - Track Layout & Live Status
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Activity className="size-4 text-green-600" />
                    <span>Real-time Tracking</span>
                  </div>
                  <Badge variant="outline">Scale: 1:500</Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-100 p-4 rounded-lg border border-slate-300 overflow-x-auto">
                {/* Control Panel Above Track */}
                <div className="flex items-center justify-between mb-4 p-3 bg-white rounded border">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${isAnimating ? 'bg-orange-500 animate-pulse' : 'bg-green-500'}`}></div>
                      <span className="text-sm font-medium">
                        {isAnimating ? 'Movement In Progress' : 'Track Clear'}
                      </span>
                    </div>
                    {trainMovements.length > 0 && (
                      <div className="flex items-center gap-2 text-sm">
                        <Gauge className="size-4 text-blue-600" />
                        <span>Speed: {trainMovements[0].speed} km/h</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="size-4" />
                    <span>Last Update: {new Date().toLocaleTimeString()}</span>
                  </div>
                </div>

                <svg 
                  width={STATION_WIDTH} 
                  height={STATION_HEIGHT} 
                  viewBox={`0 0 ${STATION_WIDTH} ${STATION_HEIGHT}`}
                  className="w-full bg-white border border-slate-200 rounded"
                  style={{ minWidth: '800px' }}
                >
                  {/* Professional Railway Drawing Style */}
                  <defs>
                    <pattern id="blueprintGrid" width="25" height="25" patternUnits="userSpaceOnUse">
                      <path d="M 25 0 L 0 0 0 25" fill="none" stroke="#e2e8f0" strokeWidth="0.5" opacity="0.8"/>
                      <path d="M 0 5 L 25 5 M 0 10 L 25 10 M 0 15 L 25 15 M 0 20 L 25 20" 
                            fill="none" stroke="#f1f5f9" strokeWidth="0.3" opacity="0.6"/>
                    </pattern>
                    <linearGradient id="trackGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#4a5568" />
                      <stop offset="50%" stopColor="#2d3748" />
                      <stop offset="100%" stopColor="#4a5568" />
                    </linearGradient>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                      <feMerge> 
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#blueprintGrid)" />
                  
                  {/* Station Title & Coordinates */}
                  <text x="20" y="25" fontSize="12" fontWeight="600" fill="#1e293b">
                    Chhatrapati Shivaji Maharaj Terminus (CSMT) - Section Control
                  </text>
                  <text x="20" y="40" fontSize="9" fill="#64748b">
                    Coordinates: 18.9401°N, 72.8351°E | Track Gauge: 1676mm (5'6") | Block Section: CS-01 to CS-05
                  </text>

              {/* Railway Tracks */}
              {platforms.map((platform, index) => {
                const trackY = platform.y + platform.height / 2;
                return (
                  <g key={`track-${platform.id}`}>
                    {/* Main Track Lines */}
                    <line 
                      x1={platform.x + platform.width} 
                      y1={trackY - 3} 
                      x2={STATION_WIDTH - 50} 
                      y2={trackY - 3} 
                      stroke="#4a5568" 
                      strokeWidth="2"
                    />
                    <line 
                      x1={platform.x + platform.width} 
                      y1={trackY + 3} 
                      x2={STATION_WIDTH - 50} 
                      y2={trackY + 3} 
                      stroke="#4a5568" 
                      strokeWidth="2"
                    />
                    
                    {/* Track Sleepers */}
                    {Array.from({ length: 25 }).map((_, i) => (
                      <TrackSleeper 
                        key={`sleeper-${platform.id}-${i}`}
                        x={platform.x + platform.width + (i * 25)}
                        y={trackY - 5}
                      />
                    ))}
                  </g>
                );
              })}

              {/* Junction Tracks */}
              {platforms.slice(0, -1).map((platform, index) => {
                const nextPlatform = platforms[index + 1];
                const startY = platform.y + platform.height / 2;
                const endY = nextPlatform.y + nextPlatform.height / 2;
                const junctionX = 400;
                
                return (
                  <g key={`junction-${platform.id}`}>
                    <path
                      d={`M ${junctionX} ${startY} Q ${junctionX + 30} ${(startY + endY) / 2} ${junctionX} ${endY}`}
                      stroke="#4a5568"
                      strokeWidth="2"
                      fill="none"
                    />
                  </g>
                );
              })}

              {/* Platforms */}
              {platforms.map((platform) => (
                <g key={platform.id}>
                  <rect
                    x={platform.x}
                    y={platform.y}
                    width={platform.width}
                    height={platform.height}
                    fill={getPlatformColor(platform)}
                    stroke={getPlatformStroke(platform)}
                    strokeWidth="2"
                    rx="4"
                    className={isAnimating && (platform.id === currentScenario.fromPlatform || platform.id === currentScenario.toPlatform) ? 
                      "drop-shadow-lg" : ""}
                  />
                  
                  {/* Platform Label */}
                  <text
                    x={platform.x + platform.width / 2}
                    y={platform.y + platform.height / 2 - 5}
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight="bold"
                    fill="#374151"
                  >
                    {platform.name}
                  </text>
                  
                  {/* Train Number */}
                  {platform.trainNumber && (
                    <text
                      x={platform.x + platform.width / 2}
                      y={platform.y + platform.height / 2 + 8}
                      textAnchor="middle"
                      fontSize="8"
                      fill="#1f2937"
                    >
                      Train {platform.trainNumber}
                    </text>
                  )}
                  
                  {/* Status Indicator */}
                  <circle
                    cx={platform.x + platform.width - 8}
                    cy={platform.y + 8}
                    r="3"
                    fill={platform.status === "available" ? "#16a34a" : 
                          platform.status === "occupied" ? "#dc2626" : "#ea580c"}
                  />
                </g>
              ))}

              {/* Railway Signals */}
              {signals.map((signal) => (
                <RailwaySignal 
                  key={signal.id} 
                  signal={signal} 
                  isActive={isAnimating}
                />
              ))}

                  {/* Animated Train with Professional Effects */}
                  {isAnimating && trainPath && !isPaused && (
                    <motion.g
                      initial={{ 
                        x: trainPath.points[0].x, 
                        y: trainPath.points[0].y,
                        rotate: trainPath.points[0].rotation || 0
                      }}
                      animate={{
                        x: trainPath.points.map(p => p.x),
                        y: trainPath.points.map(p => p.y),
                        rotate: trainPath.points.map(p => p.rotation || 0)
                      }}
                      transition={{
                        duration: (trainPath.duration / 1000) / animationSpeed,
                        ease: "linear",
                        times: trainPath.points.map((_, i) => i / (trainPath.points.length - 1))
                      }}
                      onUpdate={(latest) => {
                        setTrainPosition({ 
                          x: latest.x as number, 
                          y: latest.y as number, 
                          block: `Moving via Junction` 
                        });
                      }}
                    >
                      <TrainIcon trainNumber={currentScenario.trainNumber} />
                      
                      {/* Train Movement Trail */}
                      <motion.circle
                        cx={-35}
                        cy={0}
                        r="15"
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="1"
                        opacity="0.3"
                        strokeDasharray="2,2"
                        animate={{ strokeDashoffset: [0, -4, -8] }}
                        transition={{ duration: 0.5, repeat: Infinity }}
                      />
                      
                      {/* Speed Indicator */}
                      <text x="-15" y="-20" fontSize="6" fill="#1e40af" textAnchor="middle" fontWeight="bold">
                        {Math.round(25 * animationSpeed)} km/h
                      </text>
                    </motion.g>
                  )}
                  
                  {/* Paused Train Indicator */}
                  {isAnimating && isPaused && (
                    <g transform={`translate(${trainPosition.x}, ${trainPosition.y})`}>
                      <TrainIcon trainNumber={currentScenario.trainNumber} />
                      <motion.circle
                        cx={0}
                        cy={0}
                        r="20"
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth="2"
                        opacity="0.7"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      />
                      <text x="0" y="-25" fontSize="7" fill="#f59e0b" textAnchor="middle" fontWeight="bold">
                        PAUSED
                      </text>
                    </g>
                  )}

              {/* Static Train on Platform */}
              {!isAnimating && platforms.map((platform) => 
                platform.trainNumber ? (
                  <g key={`static-train-${platform.id}`} transform={`translate(${platform.x + platform.width + 20}, ${platform.y + platform.height / 2})`}>
                    <TrainIcon trainNumber={platform.trainNumber} />
                  </g>
                ) : null
              )}
                </svg>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="signals">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Radio className="size-5 text-green-600" />
                Signal Control Panel
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {signals.map((signal) => (
                  <div key={signal.id} className="border rounded-lg p-4 bg-slate-50">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{signal.name}</h4>
                        <p className="text-sm text-muted-foreground">{signal.id} • {signal.type}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${
                          signal.state === 'red' ? 'bg-red-500' :
                          signal.state === 'yellow' ? 'bg-yellow-500' : 'bg-green-500'
                        }`}></div>
                        <Badge variant="outline">{signal.aspectRatio}</Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        variant={signal.state === 'red' ? 'default' : 'outline'}
                        size="sm"
                        className={signal.state === 'red' ? 'bg-red-600 hover:bg-red-700' : ''}
                        disabled={isAnimating}
                      >
                        Red
                      </Button>
                      <Button
                        variant={signal.state === 'yellow' ? 'default' : 'outline'}
                        size="sm"
                        className={signal.state === 'yellow' ? 'bg-yellow-600 hover:bg-yellow-700' : ''}
                        disabled={isAnimating}
                      >
                        Yellow
                      </Button>
                      <Button
                        variant={signal.state === 'green' ? 'default' : 'outline'}
                        size="sm"
                        className={signal.state === 'green' ? 'bg-green-600 hover:bg-green-700' : ''}
                        disabled={isAnimating}
                      >
                        Green
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="control">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Movement Control */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings className="size-5" />
                  Movement Control
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Animation Speed</span>
                    <Badge variant="outline">{animationSpeed}x</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant={animationSpeed === 0.5 ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => changeAnimationSpeed(0.5)}
                      disabled={isAnimating}
                    >
                      0.5x
                    </Button>
                    <Button
                      variant={animationSpeed === 1 ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => changeAnimationSpeed(1)}
                      disabled={isAnimating}
                    >
                      1x
                    </Button>
                    <Button
                      variant={animationSpeed === 2 ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => changeAnimationSpeed(2)}
                      disabled={isAnimating}
                    >
                      2x
                    </Button>
                  </div>
                </div>

                <div className="pt-4 border-t space-y-3">
                  <Button
                    onClick={startSimulation}
                    disabled={isAnimating}
                    className="w-full"
                    size="lg"
                  >
                    {isAnimating ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Train className="size-4 mr-2" />
                      </motion.div>
                    ) : (
                      <Play className="size-4 mr-2" />
                    )}
                    {isAnimating ? 'Movement Active...' : 'Authorize Movement'}
                  </Button>

                  {isAnimating && (
                    <Button
                      onClick={pauseSimulation}
                      variant="outline"
                      className="w-full"
                    >
                      {isPaused ? (
                        <>
                          <Play className="size-4 mr-2" />
                          Resume
                        </>
                      ) : (
                        <>
                          <Pause className="size-4 mr-2" />
                          Pause
                        </>
                      )}
                    </Button>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      onClick={nextScenario}
                      disabled={isAnimating}
                      size="sm"
                    >
                      Next Scenario
                    </Button>
                    <Button
                      variant="outline"
                      onClick={resetSimulation}
                      disabled={isAnimating}
                      size="sm"
                    >
                      <RotateCcw className="size-3 mr-1" />
                      Reset
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Live Train Movements */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="size-5" />
                  Live Movements
                </CardTitle>
              </CardHeader>
              <CardContent>
                {trainMovements.length > 0 ? (
                  <div className="space-y-3">
                    {trainMovements.map((movement) => (
                      <div key={movement.trainId} className="border rounded p-3 bg-blue-50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Train {movement.trainId}</span>
                          <Badge className="bg-orange-100 text-orange-800">
                            {movement.status}
                          </Badge>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Current:</span>
                            <span className="font-medium">{movement.currentBlock}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Next:</span>
                            <span className="font-medium">{movement.nextBlock}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Speed:</span>
                            <span className="font-medium">{movement.speed} km/h</span>
                          </div>
                          <div className="flex justify-between">
                            <span>ETA:</span>
                            <span className="font-medium">{movement.eta}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <Train className="size-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No active movements</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Controller Log */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="size-5" />
                  Controller Log
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {controllerActions.map((action) => (
                    <div key={action.id} className="text-xs border-l-2 border-blue-200 pl-3 py-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{action.action}</span>
                        <span className="text-muted-foreground">{action.timestamp}</span>
                      </div>
                      <div className="text-muted-foreground">
                        Train: {action.trainId} | TTC: {action.controller}
                        {action.signalId && ` | Signal: ${action.signalId}`}
                      </div>
                    </div>
                  ))}
                  {controllerActions.length === 0 && (
                    <div className="text-center py-6 text-muted-foreground">
                      <Clock className="size-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No controller actions logged</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Status Footer */}
      {animationComplete && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border border-green-200 p-4 rounded-lg"
        >
          <div className="flex items-center gap-3">
            <CheckCircle className="size-5 text-green-600" />
            <div>
              <div className="font-medium text-green-900">Movement Successfully Completed</div>
              <div className="text-sm text-green-700">
                Train {currentScenario.trainNumber} ({currentScenario.trainName}) has been safely positioned at Platform {currentScenario.toPlatform}. 
                All signals have been cleared and the section is now available for next movement.
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Current Scenario Information */}
      <Card className="bg-slate-50 border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Timer className="size-5 text-blue-600" />
            Current Movement Scenario
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Train Details</div>
            <div className="font-medium">{currentScenario.trainNumber}</div>
            <div className="text-sm">{currentScenario.trainName}</div>
          </div>
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Movement Route</div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Platform {currentScenario.fromPlatform}</span>
              <ArrowRight className="size-4 text-blue-600" />
              <span className="font-medium">Platform {currentScenario.toPlatform}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Priority Level</div>
            <Badge className={getPriorityColor(currentScenario.priority)}>
              {currentScenario.priority.toUpperCase()}
            </Badge>
          </div>
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">AI Reasoning</div>
            <p className="text-sm">{currentScenario.reason}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}