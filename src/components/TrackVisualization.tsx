import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Train, AlertTriangle, ArrowRight, Activity } from "lucide-react";
import { useEffect, useState } from "react";

interface TrackSection {
  id: string;
  name: string;
  trackType: "Slow" | "Fast";
  platforms: string[];
  capacity: number;
  currentOccupancy: number;
  trains: TrainPosition[];
  status: "Clear" | "Occupied" | "Conflict" | "Maintenance";
  isLive: boolean;
}

interface TrainPosition {
  trainNumber: string;
  trainName: string;
  position: number; // 0-100 percentage along the track
  direction: "up" | "down"; // UP: towards CSMT, DOWN: towards suburbs
  priority: "High" | "Medium" | "Low";
  speed: number; // km/h
}

const csmtToDadarTracks: TrackSection[] = [
  {
    id: "1",
    name: "Slow Line 1 (UP)",
    trackType: "Slow",
    platforms: ["Platform 1 (CSMT)", "Platform 1 (Masjid)", "Platform 1 (Sandhurst Road)", "Platform 1 (Dockyard Road)", "Platform 1 (Reay Road)", "Platform 1 (Cotton Green)", "Platform 1 (Sewri)", "Platform 1 (Wadala Road)", "Platform 1 (GTB Nagar)", "Platform 1 (Chunabhatti)", "Platform 1 (Kurla)", "Platform 1 (Tilak Nagar)", "Platform 1 (Chembur)", "Platform 1 (Govandi)", "Platform 1 (Mankhurd)", "Platform 1 (Vashi)", "Platform 1 (Sanpada)", "Platform 1 & 2 (Dadar)"],
    capacity: 3,
    currentOccupancy: 2,
    status: "Occupied",
    isLive: true,
    trains: [
      {
        trainNumber: "95013",
        trainName: "CSMT-Panvel Slow",
        position: 25,
        direction: "down",
        priority: "Medium",
        speed: 45
      },
      {
        trainNumber: "95012",
        trainName: "Panvel-CSMT Slow",
        position: 75,
        direction: "up",
        priority: "Medium",
        speed: 42
      }
    ]
  },
  {
    id: "2",
    name: "Slow Line 2 (DOWN)",
    trackType: "Slow",
    platforms: ["Platform 2 (CSMT)", "Platform 2 (Masjid)", "Platform 2 (Sandhurst Road)", "Platform 2 (Dockyard Road)", "Platform 2 (Reay Road)", "Platform 2 (Cotton Green)", "Platform 2 (Sewri)", "Platform 2 (Wadala Road)", "Platform 2 (GTB Nagar)", "Platform 2 (Chunabhatti)", "Platform 2 (Kurla)", "Platform 2 (Tilak Nagar)", "Platform 2 (Chembur)", "Platform 2 (Govandi)", "Platform 2 (Mankhurd)", "Platform 2 (Vashi)", "Platform 2 (Sanpada)", "Platform 1 & 2 (Dadar)"],
    capacity: 3,
    currentOccupancy: 1,
    status: "Occupied",
    isLive: true,
    trains: [
      {
        trainNumber: "95021",
        trainName: "CSMT-Belapur Slow",
        position: 60,
        direction: "down",
        priority: "Medium",
        speed: 48
      }
    ]
  },
  {
    id: "3",
    name: "Fast Line 1 (UP)",
    trackType: "Fast",
    platforms: ["Platform 14-15 (CSMT)", "Platform 3-4 (Dadar)"],
    capacity: 2,
    currentOccupancy: 1,
    status: "Occupied",
    isLive: true,
    trains: [
      {
        trainNumber: "12009",
        trainName: "Shatabdi Express",
        position: 80,
        direction: "up",
        priority: "High",
        speed: 85
      }
    ]
  },
  {
    id: "4",
    name: "Fast Line 2 (DOWN)",
    trackType: "Fast",
    platforms: ["Platform 16-17 (CSMT)", "Platform 5-6 (Dadar)"],
    capacity: 2,
    currentOccupancy: 2,
    status: "Conflict",
    isLive: true,
    trains: [
      {
        trainNumber: "22221",
        trainName: "Rajdhani Express",
        position: 40,
        direction: "down",
        priority: "High",
        speed: 110
      },
      {
        trainNumber: "95047",
        trainName: "CSMT-Karjat Fast",
        position: 65,
        direction: "down",
        priority: "Medium",
        speed: 70
      }
    ]
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "Clear": return "bg-green-500";
    case "Occupied": return "bg-blue-500";
    case "Conflict": return "bg-red-500";
    case "Maintenance": return "bg-yellow-500";
    default: return "bg-gray-500";
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "High": return "text-red-600";
    case "Medium": return "text-yellow-600";
    case "Low": return "text-green-600";
    default: return "text-gray-600";
  }
};

export function TrackVisualization() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Train className="size-5" />
          CSMT-Dadar Track Section Status
          <Activity className="size-4 text-green-500 animate-pulse" />
          <span className="text-sm font-normal text-muted-foreground">LIVE</span>
        </CardTitle>
        <div className="text-sm text-muted-foreground">
          Real-time monitoring • Last updated: {currentTime.toLocaleTimeString()}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
          <h3 className="font-medium text-blue-900 mb-2">CSMT to Dadar Section Layout</h3>
          <div className="text-sm text-blue-700">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <strong>Slow Lines (Local Trains):</strong>
                <ul className="mt-1 space-y-1">
                  <li>• Line 1 (UP): Platforms 1-2 at major stations</li>
                  <li>• Line 2 (DOWN): Platforms 1-2 at major stations</li>
                </ul>
              </div>
              <div>
                <strong>Fast Lines (Express/Long Distance):</strong>
                <ul className="mt-1 space-y-1">
                  <li>• Line 1 (UP): Platforms 14-15 (CSMT), 3-4 (Dadar)</li>
                  <li>• Line 2 (DOWN): Platforms 16-17 (CSMT), 5-6 (Dadar)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {csmtToDadarTracks.map((section) => (
          <div key={section.id} className="space-y-3 border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h4 className="font-medium">{section.name}</h4>
                <Badge 
                  variant={section.trackType === "Fast" ? "default" : "secondary"}
                  className="text-xs"
                >
                  {section.trackType}
                </Badge>
                <Badge 
                  className={`${getStatusColor(section.status)} text-white`}
                >
                  {section.status}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {section.currentOccupancy}/{section.capacity} trains
                </span>
                {section.isLive && (
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-green-600 font-medium">LIVE</span>
                  </div>
                )}
              </div>
              {section.status === "Conflict" && (
                <AlertTriangle className="size-5 text-red-500 animate-pulse" />
              )}
            </div>
            
            {/* Track visualization */}
            <div className="relative">
              <div className="h-12 bg-gray-100 rounded-lg relative overflow-hidden border">
                {/* Track base - double line for railway tracks */}
                <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-600 transform -translate-y-1/2" />
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-800 transform -translate-y-1/2 mt-1" />
                
                {/* Station markers */}
                <div className="absolute top-0 left-0 w-1 h-full bg-blue-600"></div>
                <div className="absolute top-0 right-0 w-1 h-full bg-orange-600"></div>
                <div className="absolute top-0 left-0 text-xs text-blue-600 font-medium -mt-5">CSMT</div>
                <div className="absolute top-0 right-0 text-xs text-orange-600 font-medium -mt-5">DADAR</div>
                
                {/* Train positions */}
                {section.trains.map((train, index) => (
                  <div
                    key={`${train.trainNumber}-${index}`}
                    className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 animate-pulse"
                    style={{ left: `${train.position}%` }}
                  >
                    <div className="flex items-center gap-1">
                      <div className={`p-1.5 rounded-full shadow-lg ${
                        train.priority === 'High' ? 'bg-red-100 border-2 border-red-500' :
                        train.priority === 'Medium' ? 'bg-yellow-100 border-2 border-yellow-500' :
                        'bg-green-100 border-2 border-green-500'
                      }`}>
                        <Train 
                          className={`size-5 ${
                            train.direction === 'up' ? 'transform rotate-180 text-blue-600' : 'text-orange-600'
                          }`} 
                        />
                      </div>
                    </div>
                    <div className="absolute top-10 left-1/2 transform -translate-x-1/2 text-xs bg-gray-900 text-white px-2 py-1 rounded shadow-lg whitespace-nowrap z-10">
                      <div className="font-medium">{train.trainNumber}</div>
                      <div className="text-gray-300">{train.speed} km/h</div>
                    </div>
                  </div>
                ))}
                
                {/* Direction indicators */}
                <div className="absolute top-1 left-2 flex items-center">
                  <ArrowRight className="size-3 text-orange-500" />
                  <span className="text-xs text-orange-600 ml-1">DOWN</span>
                </div>
                <div className="absolute top-1 right-2 flex items-center">
                  <ArrowRight className="size-3 text-blue-500 transform rotate-180" />
                  <span className="text-xs text-blue-600 mr-1">UP</span>
                </div>
              </div>
            </div>
            
            {/* Platform information */}
            <div className="bg-gray-50 p-3 rounded text-sm">
              <div className="font-medium text-gray-700 mb-1">Platform Allocation:</div>
              <div className="text-gray-600">
                {section.platforms.slice(0, 3).join(" → ")}
                {section.platforms.length > 3 && ` → ... (${section.platforms.length - 3} more)`}
              </div>
            </div>
            
            {/* Train details */}
            {section.trains.length > 0 && (
              <div className="space-y-2">
                <div className="font-medium text-sm">Active Trains:</div>
                {section.trains.map((train, index) => (
                  <div key={index} className="flex items-center justify-between text-sm bg-white p-2 rounded border">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className={getPriorityColor(train.priority)}>
                        {train.priority}
                      </Badge>
                      <span className="font-medium">{train.trainNumber}</span>
                      <span className="text-muted-foreground">{train.trainName}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{train.speed} km/h</span>
                      <span className={train.direction === 'up' ? 'text-blue-600' : 'text-orange-600'}>
                        {train.direction.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}