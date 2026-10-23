import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { AlertTriangle, Clock, CheckCircle, X, Bell } from "lucide-react";

interface Alert {
  id: string;
  type: "conflict" | "delay" | "maintenance" | "weather" | "system";
  severity: "Critical" | "High" | "Medium" | "Low";
  title: string;
  description: string;
  timestamp: string;
  affectedTrains?: string[];
  location: string;
  status: "Active" | "Acknowledged" | "Resolved";
  estimatedResolution?: string;
}

const mockAlerts: Alert[] = [
  {
    id: "1",
    type: "conflict",
    severity: "Critical",
    title: "Train Conflict at Junction X",
    description: "Two trains approaching same track section. Immediate attention required.",
    timestamp: "14:35",
    affectedTrains: ["12345", "67890"],
    location: "Junction X",
    status: "Active",
    estimatedResolution: "2 minutes"
  },
  {
    id: "2",
    type: "delay",
    severity: "High",
    title: "Express Train Running Late",
    description: "Rajdhani Express delayed by 8 minutes due to signal failure upstream.",
    timestamp: "14:30",
    affectedTrains: ["12345"],
    location: "Signal Post 42",
    status: "Acknowledged",
    estimatedResolution: "15 minutes"
  },
  {
    id: "3",
    type: "maintenance",
    severity: "Medium",
    title: "Scheduled Track Maintenance",
    description: "Track maintenance window starting in 30 minutes on Loop Line B-C.",
    timestamp: "14:25",
    location: "Loop Line B-C",
    status: "Active",
    estimatedResolution: "2 hours"
  },
  {
    id: "4",
    type: "weather",
    severity: "Medium",
    title: "Heavy Rain Warning",
    description: "Weather alert: Heavy rain expected. Consider speed restrictions.",
    timestamp: "14:20",
    location: "Section A-B",
    status: "Active",
    estimatedResolution: "3 hours"
  },
  {
    id: "5",
    type: "system",
    severity: "Low",
    title: "Signal System Update",
    description: "Automatic signal system updated successfully. All systems operational.",
    timestamp: "14:15",
    location: "Control Center",
    status: "Resolved"
  }
];

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case "Critical": return "bg-red-500 text-white";
    case "High": return "bg-orange-500 text-white";
    case "Medium": return "bg-yellow-500 text-white";
    case "Low": return "bg-blue-500 text-white";
    default: return "bg-gray-500 text-white";
  }
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case "conflict": return <AlertTriangle className="size-4" />;
    case "delay": return <Clock className="size-4" />;
    case "maintenance": return <CheckCircle className="size-4" />;
    case "weather": return <AlertTriangle className="size-4" />;
    case "system": return <Bell className="size-4" />;
    default: return <AlertTriangle className="size-4" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "Active": return "bg-red-100 text-red-800";
    case "Acknowledged": return "bg-yellow-100 text-yellow-800";
    case "Resolved": return "bg-green-100 text-green-800";
    default: return "bg-gray-100 text-gray-800";
  }
};

export function AlertsPanel() {
  const activeAlerts = mockAlerts.filter(alert => alert.status !== "Resolved");
  const criticalCount = activeAlerts.filter(alert => alert.severity === "Critical").length;
  const highCount = activeAlerts.filter(alert => alert.severity === "High").length;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="size-5" />
            Active Alerts
          </div>
          <div className="flex gap-2">
            {criticalCount > 0 && (
              <Badge className="bg-red-500 text-white">
                {criticalCount} Critical
              </Badge>
            )}
            {highCount > 0 && (
              <Badge className="bg-orange-500 text-white">
                {highCount} High
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-80">
          <div className="space-y-3">
            {mockAlerts.map((alert) => (
              <div 
                key={alert.id} 
                className={`border rounded-lg p-4 space-y-3 ${
                  alert.status === "Resolved" ? "opacity-60" : ""
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(alert.type)}
                    <h4 className="font-medium">{alert.title}</h4>
                    <Badge className={getSeverityColor(alert.severity)}>
                      {alert.severity}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {alert.timestamp}
                    </span>
                    {alert.status !== "Resolved" && (
                      <Button variant="ghost" size="sm">
                        <X className="size-4" />
                      </Button>
                    )}
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground">
                  {alert.description}
                </p>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <span>📍 {alert.location}</span>
                    {alert.affectedTrains && (
                      <span>🚂 {alert.affectedTrains.join(", ")}</span>
                    )}
                  </div>
                  <Badge className={getStatusColor(alert.status)}>
                    {alert.status}
                  </Badge>
                </div>
                
                {alert.estimatedResolution && alert.status !== "Resolved" && (
                  <div className="text-sm text-muted-foreground">
                    Est. resolution: {alert.estimatedResolution}
                  </div>
                )}
                
                {alert.status === "Active" && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Acknowledge
                    </Button>
                    <Button size="sm">
                      Take Action
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}