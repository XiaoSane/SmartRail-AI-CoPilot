import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Clock, MapPin, AlertTriangle, CheckCircle, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { projectId, publicAnonKey } from "../utils/supabase/info";

interface Train {
  id: string;
  name: string;
  type: "express" | "local" | "freight" | "maintenance";
  priority: number;
  currentLocation: string;
  destination: string;
  scheduledTime: string;
  actualTime?: string;
  delay: number;
  speed: number;
  length: number;
  direction: "up" | "down";
  nextSignal?: string;
  status: "running" | "stopped" | "delayed" | "cancelled";
  calculatedPriority?: number;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "running": return "bg-green-500";
    case "delayed": return "bg-red-500";
    case "stopped": return "bg-yellow-500";
    case "cancelled": return "bg-gray-500";
    default: return "bg-blue-500";
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case "express": return "bg-red-100 text-red-800";
    case "local": return "bg-blue-100 text-blue-800";
    case "freight": return "bg-green-100 text-green-800";
    case "maintenance": return "bg-yellow-100 text-yellow-800";
    default: return "bg-gray-100 text-gray-800";
  }
};

const formatTime = (isoString: string) => {
  return new Date(isoString).toLocaleTimeString('en-IN', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

// Fallback sample data for CSMT-Dadar section
const SAMPLE_TRAINS: Train[] = [
  {
    id: "T001",
    name: "12009 Shatabdi Express",
    type: "express",
    priority: 100,
    currentLocation: "CSMT Platform 14",
    destination: "Pune Junction",
    scheduledTime: new Date(Date.now() + 20 * 60 * 1000).toISOString(),
    delay: 2,
    speed: 85,
    length: 400,
    direction: "down",
    nextSignal: "CSMT-005",
    status: "running",
    calculatedPriority: 120
  },
  {
    id: "T002",
    name: "95013 CSMT-Panvel Slow",
    type: "local",
    priority: 70,
    currentLocation: "Cotton Green",
    destination: "Panvel",
    scheduledTime: new Date(Date.now() + 8 * 60 * 1000).toISOString(),
    delay: 0,
    speed: 45,
    length: 270,
    direction: "down",
    nextSignal: "CG-02",
    status: "running",
    calculatedPriority: 85
  },
  {
    id: "T003",
    name: "95012 Panvel-CSMT Slow",
    type: "local",
    priority: 65,
    currentLocation: "Wadala Road",
    destination: "CSMT",
    scheduledTime: new Date(Date.now() + 12 * 60 * 1000).toISOString(),
    delay: 1,
    speed: 42,
    length: 270,
    direction: "up",
    nextSignal: "WR-01",
    status: "running",
    calculatedPriority: 80
  },
  {
    id: "T004",
    name: "22221 Rajdhani Express",
    type: "express",
    priority: 100,
    currentLocation: "Masjid Station",
    destination: "New Delhi",
    scheduledTime: new Date(Date.now() + 25 * 60 * 1000).toISOString(),
    delay: 0,
    speed: 110,
    length: 450,
    direction: "down",
    nextSignal: "MAS-03",
    status: "running",
    calculatedPriority: 130
  },
  {
    id: "T005",
    name: "95047 CSMT-Karjat Fast",
    type: "local",
    priority: 75,
    currentLocation: "Dadar Platform 5",
    destination: "Karjat",
    scheduledTime: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    delay: 3,
    speed: 70,
    length: 270,
    direction: "down",
    nextSignal: "DDR-F2",
    status: "delayed",
    calculatedPriority: 95
  },
  {
    id: "T006",
    name: "Goods 52345",
    type: "freight",
    priority: 40,
    currentLocation: "Sewri Yard",
    destination: "Kalamboli Yard",
    scheduledTime: new Date(Date.now() + 45 * 60 * 1000).toISOString(),
    delay: 12,
    speed: 35,
    length: 850,
    direction: "down",
    nextSignal: "SEW-YRD-02",
    status: "delayed",
    calculatedPriority: 55
  }
];

export function TrainSchedulePanel() {
  const [trains, setTrains] = useState<Train[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [serverAvailable, setServerAvailable] = useState(true);

  const fetchTrains = async () => {
    try {
      setLoading(true);
      
      // Add timeout and better error handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
      
      try {
        // First try to test server health
        console.log('Testing server connection...');
        const healthResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-0a078106/health`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
              'Content-Type': 'application/json',
            },
            signal: controller.signal
          }
        );
        
        console.log('Health check response:', healthResponse.status);
        
        if (!healthResponse.ok) {
          throw new Error(`Server health check failed: ${healthResponse.status}`);
        }
        
        // Now fetch dashboard data
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-0a078106/dashboard`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
              'Content-Type': 'application/json',
            },
            signal: controller.signal
          }
        );
        
        console.log('Dashboard response:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to fetch trains: ${response.status} - ${errorText}`);
        }
        
        const data = await response.json();
        setTrains(data.trains || SAMPLE_TRAINS);
        setLastUpdated(data.lastUpdated || new Date().toISOString());
        setServerAvailable(true);
        clearTimeout(timeoutId);
      } catch (fetchError) {
        clearTimeout(timeoutId);
        throw fetchError;
      }
    } catch (error) {
      // Always provide fallback data
      console.log('Server connection failed, using demo data:', error);
      setTrains(SAMPLE_TRAINS);
      setLastUpdated(new Date().toISOString());
      setServerAvailable(false);
      
      // Don't log full error details to reduce noise
      if (error instanceof Error && error.name !== 'AbortError') {
        console.log('Connection error type:', error.name);
      }
    } finally {
      setLoading(false);
    }
  };

  const initializeData = async () => {
    try {
      // Always start by trying to fetch trains first
      await fetchTrains();
      
      // Only try initialization if server is available after fetchTrains check
      if (serverAvailable) {
        try {
          const response = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-0a078106/init-data`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${publicAnonKey}`,
                'Content-Type': 'application/json',
              },
              signal: AbortSignal.timeout(5000) // 5 second timeout
            }
          );
          
          if (response.ok) {
            await fetchTrains();
          }
        } catch (initError) {
          console.log('Initialization failed, continuing with current data:', initError);
        }
      }
    } catch (error) {
      console.log('Error during initialization, falling back to sample data:', error);
      // Ensure we have fallback data
      setTrains(SAMPLE_TRAINS);
      setLastUpdated(new Date().toISOString());
      setServerAvailable(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    initializeData();
    
    // Auto-refresh every 60 seconds to reduce server load
    const interval = setInterval(fetchTrains, 60000);
    return () => clearInterval(interval);
  }, []);

  const updateTrainStatus = async (trainId: string, updates: Partial<Train>) => {
    if (!serverAvailable) {
      // Local update for demo mode
      setTrains(prev => prev.map(train => 
        train.id === trainId ? { ...train, ...updates } : train
      ));
      console.log('Demo mode: Updated train locally');
      return;
    }
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0a078106/trains/${trainId}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updates),
        }
      );
      
      if (response.ok) {
        await fetchTrains(); // Refresh data
      }
    } catch (error) {
      console.error('Error updating train:', error);
    }
  };

  if (loading && trains.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="size-5" />
            Active Trains in Section
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2 text-muted-foreground">
            <RefreshCw className="size-4 animate-spin" />
            Loading train data...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="size-5" />
            Active Trains in CSMT-Dadar Section ({trains.length})
            {!serverAvailable && (
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                Demo Mode
              </span>
            )}
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchTrains}
            disabled={loading}
          >
            <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
        {lastUpdated && (
          <p className="text-xs text-muted-foreground">
            Last updated: {new Date(lastUpdated).toLocaleString()}
            {!serverAvailable && " (Using sample data - server unavailable)"}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4 max-h-96 overflow-y-auto">
        {trains.map((train) => (
          <div key={train.id} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-medium">{train.name}</h4>
                  <Badge variant="secondary" className={getTypeColor(train.type)}>
                    {train.type.charAt(0).toUpperCase() + train.type.slice(1)}
                  </Badge>
                  <Badge variant="outline">
                    Priority: {train.calculatedPriority || train.priority}
                  </Badge>
                  <Badge variant="outline">
                    {train.speed} km/h
                  </Badge>
                </div>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="size-3" />
                    {train.currentLocation} → {train.destination}
                  </span>
                  <span>Length: {train.length}m</span>
                  <span className="capitalize">{train.direction} direction</span>
                </div>
              </div>
              <div className={`size-3 rounded-full ${getStatusColor(train.status)}`} />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm flex-wrap">
                <span>Scheduled: {formatTime(train.scheduledTime)}</span>
                {train.actualTime && (
                  <span>Actual: {formatTime(train.actualTime)}</span>
                )}
                {train.delay > 0 && (
                  <span className="flex items-center gap-1 text-red-600">
                    <AlertTriangle className="size-3" />
                    +{train.delay}min delay
                  </span>
                )}
                {train.delay === 0 && train.status === 'running' && (
                  <span className="flex items-center gap-1 text-green-600">
                    <CheckCircle className="size-3" />
                    On time
                  </span>
                )}
                {train.nextSignal && (
                  <span className="text-muted-foreground">
                    Next: {train.nextSignal}
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => updateTrainStatus(train.id, { 
                    priority: train.priority + 10 
                  })}
                >
                  Boost Priority
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => updateTrainStatus(train.id, { 
                    status: train.status === 'running' ? 'stopped' : 'running' 
                  })}
                >
                  {train.status === 'running' ? 'Stop' : 'Resume'}
                </Button>
              </div>
            </div>
          </div>
        ))}
        
        {trains.length === 0 && !loading && (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="size-8 mx-auto mb-2 opacity-50" />
            <p>No active trains in this section</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={initializeData}
              className="mt-2"
            >
              Initialize Sample Data
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}