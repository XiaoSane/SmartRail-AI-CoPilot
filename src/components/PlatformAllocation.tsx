import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Brain, Clock, MapPin, AlertTriangle, Speaker, CheckCircle, RefreshCw, Train, Target } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner@2.0.3";

interface TrainData {
  id: string;
  trainNumber: string;
  trainName: string;
  type: "local" | "express";
  direction: "CSMT_to_Dadar" | "Dadar_to_CSMT";
  station: string;
  scheduledArrival: string;
  scheduledDeparture: string;
  actualArrival?: string;
  actualDeparture?: string;
  assignedPlatform: number;
  originalPlatform: number;
  status: "scheduled" | "arrived" | "departed" | "delayed" | "platform_changed";
  delay: number;
  passengers: number;
}

interface PlatformStatus {
  platformNumber: number;
  stationType: "CSMT" | "Dadar";
  trackType: "slow" | "fast";
  isOccupied: boolean;
  currentTrain?: string;
  nextAvailable?: string;
  utilizationRate: number;
}

interface PlatformSuggestion {
  id: string;
  trainId: string;
  trainNumber: string;
  trainName: string;
  currentPlatform: number;
  suggestedPlatform: number;
  reason: string;
  benefits: string[];
  impactAnalysis: {
    delayReduction: number; // minutes saved
    affectedTrains: number;
    throughputImprovement: number; // percentage
    passengerImpact: string;
  };
  urgency: "high" | "medium" | "low";
  confidence: number;
  timestamp: string;
  status: "pending" | "accepted" | "rejected";
}

interface Announcement {
  id: string;
  timestamp: string;
  trainNumber: string;
  message: string;
  type: "platform_change" | "delay" | "arrival" | "departure";
  priority: "high" | "medium" | "low";
}

// Dataset of 50 trains (30 local, 20 express)
const TRAIN_DATASET: TrainData[] = [
  // Express Trains (20)
  {
    id: "E001",
    trainNumber: "12009",
    trainName: "Shatabdi Express",
    type: "express",
    direction: "CSMT_to_Dadar",
    station: "CSMT",
    scheduledArrival: "06:00",
    scheduledDeparture: "06:05",
    assignedPlatform: 14,
    originalPlatform: 14,
    status: "scheduled",
    delay: 0,
    passengers: 450
  },
  {
    id: "E002",
    trainNumber: "22221",
    trainName: "Rajdhani Express",
    type: "express",
    direction: "CSMT_to_Dadar",
    station: "CSMT",
    scheduledArrival: "06:30",
    scheduledDeparture: "06:35",
    assignedPlatform: 15,
    originalPlatform: 15,
    status: "scheduled",
    delay: 0,
    passengers: 520
  },
  {
    id: "E003",
    trainNumber: "12051",
    trainName: "Jan Shatabdi",
    type: "express",
    direction: "Dadar_to_CSMT",
    station: "Dadar",
    scheduledArrival: "07:00",
    scheduledDeparture: "07:05",
    assignedPlatform: 3,
    originalPlatform: 3,
    status: "scheduled",
    delay: 0,
    passengers: 380
  },
  {
    id: "E004",
    trainNumber: "11301",
    trainName: "Udyan Express",
    type: "express",
    direction: "CSMT_to_Dadar",
    station: "CSMT",
    scheduledArrival: "07:15",
    scheduledDeparture: "07:20",
    assignedPlatform: 16,
    originalPlatform: 16,
    status: "scheduled",
    delay: 0,
    passengers: 480
  },
  {
    id: "E005",
    trainNumber: "12701",
    trainName: "Hussainsagar Express",
    type: "express",
    direction: "Dadar_to_CSMT",
    station: "Dadar",
    scheduledArrival: "08:00",
    scheduledDeparture: "08:05",
    assignedPlatform: 4,
    originalPlatform: 4,
    status: "scheduled",
    delay: 5,
    passengers: 520
  },
  // Adding more express trains...
  {
    id: "E006",
    trainNumber: "11302",
    trainName: "Udyan Express Return",
    type: "express",
    direction: "Dadar_to_CSMT",
    station: "Dadar",
    scheduledArrival: "18:30",
    scheduledDeparture: "18:35",
    assignedPlatform: 5,
    originalPlatform: 5,
    status: "scheduled",
    delay: 0,
    passengers: 490
  },
  {
    id: "E007",
    trainNumber: "12010",
    trainName: "Shatabdi Return",
    type: "express",
    direction: "Dadar_to_CSMT",
    station: "Dadar",
    scheduledArrival: "19:00",
    scheduledDeparture: "19:05",
    assignedPlatform: 6,
    originalPlatform: 6,
    status: "scheduled",
    delay: 0,
    passengers: 460
  },
  {
    id: "E008",
    trainNumber: "22222",
    trainName: "Rajdhani Return",
    type: "express",
    direction: "Dadar_to_CSMT",
    station: "Dadar",
    scheduledArrival: "20:15",
    scheduledDeparture: "20:20",
    assignedPlatform: 3,
    originalPlatform: 3,
    status: "scheduled",
    delay: 0,
    passengers: 540
  },
  {
    id: "E009",
    trainNumber: "12052",
    trainName: "Jan Shatabdi Return",
    type: "express",
    direction: "CSMT_to_Dadar",
    station: "CSMT",
    scheduledArrival: "21:00",
    scheduledDeparture: "21:05",
    assignedPlatform: 17,
    originalPlatform: 17,
    status: "scheduled",
    delay: 0,
    passengers: 400
  },
  {
    id: "E010",
    trainNumber: "12702",
    trainName: "Hussainsagar Return",
    type: "express",
    direction: "CSMT_to_Dadar",
    station: "CSMT",
    scheduledArrival: "22:30",
    scheduledDeparture: "22:35",
    assignedPlatform: 14,
    originalPlatform: 14,
    status: "scheduled",
    delay: 0,
    passengers: 530
  },
  // 10 more express trains
  {
    id: "E011",
    trainNumber: "11013",
    trainName: "Coimbatore Express",
    type: "express",
    direction: "CSMT_to_Dadar",
    station: "CSMT",
    scheduledArrival: "14:00",
    scheduledDeparture: "14:05",
    assignedPlatform: 15,
    originalPlatform: 15,
    status: "scheduled",
    delay: 0,
    passengers: 470
  },
  {
    id: "E012",
    trainNumber: "11014",
    trainName: "Coimbatore Return",
    type: "express",
    direction: "Dadar_to_CSMT",
    station: "Dadar",
    scheduledArrival: "16:00",
    scheduledDeparture: "16:05",
    assignedPlatform: 4,
    originalPlatform: 4,
    status: "scheduled",
    delay: 0,
    passengers: 450
  },
  {
    id: "E013",
    trainNumber: "12617",
    trainName: "Mangala Express",
    type: "express",
    direction: "CSMT_to_Dadar",
    station: "CSMT",
    scheduledArrival: "10:30",
    scheduledDeparture: "10:35",
    assignedPlatform: 16,
    originalPlatform: 16,
    status: "scheduled",
    delay: 0,
    passengers: 500
  },
  {
    id: "E014",
    trainNumber: "12618",
    trainName: "Mangala Return",
    type: "express",
    direction: "Dadar_to_CSMT",
    station: "Dadar",
    scheduledArrival: "11:30",
    scheduledDeparture: "11:35",
    assignedPlatform: 5,
    originalPlatform: 5,
    status: "scheduled",
    delay: 0,
    passengers: 480
  },
  {
    id: "E015",
    trainNumber: "17057",
    trainName: "Devagiri Express",
    type: "express",
    direction: "CSMT_to_Dadar",
    station: "CSMT",
    scheduledArrival: "23:30",
    scheduledDeparture: "23:35",
    assignedPlatform: 17,
    originalPlatform: 17,
    status: "scheduled",
    delay: 0,
    passengers: 420
  },
  {
    id: "E016",
    trainNumber: "17058",
    trainName: "Devagiri Return",
    type: "express",
    direction: "Dadar_to_CSMT",
    station: "Dadar",
    scheduledArrival: "05:30",
    scheduledDeparture: "05:35",
    assignedPlatform: 6,
    originalPlatform: 6,
    status: "scheduled",
    delay: 0,
    passengers: 440
  },
  {
    id: "E017",
    trainNumber: "11302",
    trainName: "Mumbai-Bangalore Express",
    type: "express",
    direction: "CSMT_to_Dadar",
    station: "CSMT",
    scheduledArrival: "15:45",
    scheduledDeparture: "15:50",
    assignedPlatform: 14,
    originalPlatform: 14,
    status: "scheduled",
    delay: 0,
    passengers: 510
  },
  {
    id: "E018",
    trainNumber: "11301",
    trainName: "Bangalore-Mumbai Express",
    type: "express",
    direction: "Dadar_to_CSMT",
    station: "Dadar",
    scheduledArrival: "17:15",
    scheduledDeparture: "17:20",
    assignedPlatform: 3,
    originalPlatform: 3,
    status: "scheduled",
    delay: 0,
    passengers: 490
  },
  {
    id: "E019",
    trainNumber: "12859",
    trainName: "Gitanjali Express",
    type: "express",
    direction: "CSMT_to_Dadar",
    station: "CSMT",
    scheduledArrival: "12:15",
    scheduledDeparture: "12:20",
    assignedPlatform: 15,
    originalPlatform: 15,
    status: "scheduled",
    delay: 0,
    passengers: 460
  },
  {
    id: "E020",
    trainNumber: "12860",
    trainName: "Gitanjali Return",
    type: "express",
    direction: "Dadar_to_CSMT",
    station: "Dadar",
    scheduledArrival: "13:45",
    scheduledDeparture: "13:50",
    assignedPlatform: 4,
    originalPlatform: 4,
    status: "scheduled",
    delay: 0,
    passengers: 470
  },

  // Local Trains (30)
  {
    id: "L001",
    trainNumber: "95013",
    trainName: "CSMT-Panvel Slow",
    type: "local",
    direction: "CSMT_to_Dadar",
    station: "CSMT",
    scheduledArrival: "05:30",
    scheduledDeparture: "05:32",
    assignedPlatform: 1,
    originalPlatform: 1,
    status: "scheduled",
    delay: 0,
    passengers: 1200
  },
  {
    id: "L002",
    trainNumber: "95012",
    trainName: "Panvel-CSMT Slow",
    type: "local",
    direction: "Dadar_to_CSMT",
    station: "Dadar",
    scheduledArrival: "05:35",
    scheduledDeparture: "05:37",
    assignedPlatform: 1,
    originalPlatform: 1,
    status: "scheduled",
    delay: 0,
    passengers: 1300
  },
  {
    id: "L003",
    trainNumber: "95015",
    trainName: "CSMT-Belapur Slow",
    type: "local",
    direction: "CSMT_to_Dadar",
    station: "CSMT",
    scheduledArrival: "06:00",
    scheduledDeparture: "06:02",
    assignedPlatform: 2,
    originalPlatform: 2,
    status: "scheduled",
    delay: 0,
    passengers: 1150
  },
  {
    id: "L004",
    trainNumber: "95014",
    trainName: "Belapur-CSMT Slow",
    type: "local",
    direction: "Dadar_to_CSMT",
    station: "Dadar",
    scheduledArrival: "06:05",
    scheduledDeparture: "06:07",
    assignedPlatform: 2,
    originalPlatform: 2,
    status: "scheduled",
    delay: 0,
    passengers: 1250
  },
  {
    id: "L005",
    trainNumber: "95047",
    trainName: "CSMT-Karjat Fast",
    type: "local",
    direction: "CSMT_to_Dadar",
    station: "CSMT",
    scheduledArrival: "06:15",
    scheduledDeparture: "06:17",
    assignedPlatform: 11,
    originalPlatform: 11,
    status: "scheduled",
    delay: 2,
    passengers: 1400
  },
  // Adding more local trains to complete 30...
  {
    id: "L006",
    trainNumber: "95046",
    trainName: "Karjat-CSMT Fast",
    type: "local",
    direction: "Dadar_to_CSMT",
    station: "Dadar",
    scheduledArrival: "06:20",
    scheduledDeparture: "06:22",
    assignedPlatform: 7,
    originalPlatform: 7,
    status: "scheduled",
    delay: 0,
    passengers: 1350
  },
  {
    id: "L007",
    trainNumber: "95017",
    trainName: "CSMT-Vashi Slow",
    type: "local",
    direction: "CSMT_to_Dadar",
    station: "CSMT",
    scheduledArrival: "06:30",
    scheduledDeparture: "06:32",
    assignedPlatform: 1,
    originalPlatform: 1,
    status: "scheduled",
    delay: 0,
    passengers: 1100
  },
  {
    id: "L008",
    trainNumber: "95016",
    trainName: "Vashi-CSMT Slow",
    type: "local",
    direction: "Dadar_to_CSMT",
    station: "Dadar",
    scheduledArrival: "06:35",
    scheduledDeparture: "06:37",
    assignedPlatform: 1,
    originalPlatform: 1,
    status: "scheduled",
    delay: 0,
    passengers: 1200
  },
  {
    id: "L009",
    trainNumber: "95049",
    trainName: "CSMT-Khopoli Fast",
    type: "local",
    direction: "CSMT_to_Dadar",
    station: "CSMT",
    scheduledArrival: "07:00",
    scheduledDeparture: "07:02",
    assignedPlatform: 12,
    originalPlatform: 12,
    status: "scheduled",
    delay: 0,
    passengers: 1450
  },
  {
    id: "L010",
    trainNumber: "95048",
    trainName: "Khopoli-CSMT Fast",
    type: "local",
    direction: "Dadar_to_CSMT",
    station: "Dadar",
    scheduledArrival: "07:05",
    scheduledDeparture: "07:07",
    assignedPlatform: 8,
    originalPlatform: 8,
    status: "scheduled",
    delay: 0,
    passengers: 1380
  },
  // Continue with more local trains to reach 30
  {
    id: "L011",
    trainNumber: "95019",
    trainName: "CSMT-Panvel Slow",
    type: "local",
    direction: "CSMT_to_Dadar",
    station: "CSMT",
    scheduledArrival: "07:30",
    scheduledDeparture: "07:32",
    assignedPlatform: 2,
    originalPlatform: 2,
    status: "scheduled",
    delay: 0,
    passengers: 1300
  },
  {
    id: "L012",
    trainNumber: "95018",
    trainName: "Panvel-CSMT Slow",
    type: "local",
    direction: "Dadar_to_CSMT",
    station: "Dadar",
    scheduledArrival: "07:35",
    scheduledDeparture: "07:37",
    assignedPlatform: 2,
    originalPlatform: 2,
    status: "scheduled",
    delay: 0,
    passengers: 1350
  },
  {
    id: "L013",
    trainNumber: "95051",
    trainName: "CSMT-Karjat Fast",
    type: "local",
    direction: "CSMT_to_Dadar",
    station: "CSMT",
    scheduledArrival: "08:00",
    scheduledDeparture: "08:02",
    assignedPlatform: 11,
    originalPlatform: 11,
    status: "scheduled",
    delay: 0,
    passengers: 1500
  },
  {
    id: "L014",
    trainNumber: "95050",
    trainName: "Karjat-CSMT Fast",
    type: "local",
    direction: "Dadar_to_CSMT",
    station: "Dadar",
    scheduledArrival: "08:05",
    scheduledDeparture: "08:07",
    assignedPlatform: 7,
    originalPlatform: 7,
    status: "scheduled",
    delay: 0,
    passengers: 1450
  },
  {
    id: "L015",
    trainNumber: "95021",
    trainName: "CSMT-Belapur Slow",
    type: "local",
    direction: "CSMT_to_Dadar",
    station: "CSMT",
    scheduledArrival: "08:30",
    scheduledDeparture: "08:32",
    assignedPlatform: 1,
    originalPlatform: 1,
    status: "scheduled",
    delay: 0,
    passengers: 1250
  },
  {
    id: "L016",
    trainNumber: "95020",
    trainName: "Belapur-CSMT Slow",
    type: "local",
    direction: "Dadar_to_CSMT",
    station: "Dadar",
    scheduledArrival: "08:35",
    scheduledDeparture: "08:37",
    assignedPlatform: 1,
    originalPlatform: 1,
    status: "scheduled",
    delay: 0,
    passengers: 1300
  },
  {
    id: "L017",
    trainNumber: "95053",
    trainName: "CSMT-Khopoli Fast",
    type: "local",
    direction: "CSMT_to_Dadar",
    station: "CSMT",
    scheduledArrival: "09:00",
    scheduledDeparture: "09:02",
    assignedPlatform: 12,
    originalPlatform: 12,
    status: "scheduled",
    delay: 0,
    passengers: 1400
  },
  {
    id: "L018",
    trainNumber: "95052",
    trainName: "Khopoli-CSMT Fast",
    type: "local",
    direction: "Dadar_to_CSMT",
    station: "Dadar",
    scheduledArrival: "09:05",
    scheduledDeparture: "09:07",
    assignedPlatform: 8,
    originalPlatform: 8,
    status: "scheduled",
    delay: 0,
    passengers: 1350
  },
  {
    id: "L019",
    trainNumber: "95023",
    trainName: "CSMT-Vashi Slow",
    type: "local",
    direction: "CSMT_to_Dadar",
    station: "CSMT",
    scheduledArrival: "18:00",
    scheduledDeparture: "18:02",
    assignedPlatform: 2,
    originalPlatform: 2,
    status: "scheduled",
    delay: 0,
    passengers: 1600
  },
  {
    id: "L020",
    trainNumber: "95022",
    trainName: "Vashi-CSMT Slow",
    type: "local",
    direction: "Dadar_to_CSMT",
    station: "Dadar",
    scheduledArrival: "18:05",
    scheduledDeparture: "18:07",
    assignedPlatform: 2,
    originalPlatform: 2,
    status: "scheduled",
    delay: 0,
    passengers: 1550
  },
  {
    id: "L021",
    trainNumber: "95055",
    trainName: "CSMT-Karjat Fast",
    type: "local",
    direction: "CSMT_to_Dadar",
    station: "CSMT",
    scheduledArrival: "19:30",
    scheduledDeparture: "19:32",
    assignedPlatform: 11,
    originalPlatform: 11,
    status: "scheduled",
    delay: 0,
    passengers: 1700
  },
  {
    id: "L022",
    trainNumber: "95054",
    trainName: "Karjat-CSMT Fast",
    type: "local",
    direction: "Dadar_to_CSMT",
    station: "Dadar",
    scheduledArrival: "19:35",
    scheduledDeparture: "19:37",
    assignedPlatform: 7,
    originalPlatform: 7,
    status: "scheduled",
    delay: 0,
    passengers: 1650
  },
  {
    id: "L023",
    trainNumber: "95025",
    trainName: "CSMT-Panvel Slow",
    type: "local",
    direction: "CSMT_to_Dadar",
    station: "CSMT",
    scheduledArrival: "20:00",
    scheduledDeparture: "20:02",
    assignedPlatform: 1,
    originalPlatform: 1,
    status: "scheduled",
    delay: 0,
    passengers: 1500
  },
  {
    id: "L024",
    trainNumber: "95024",
    trainName: "Panvel-CSMT Slow",
    type: "local",
    direction: "Dadar_to_CSMT",
    station: "Dadar",
    scheduledArrival: "20:05",
    scheduledDeparture: "20:07",
    assignedPlatform: 1,
    originalPlatform: 1,
    status: "scheduled",
    delay: 0,
    passengers: 1450
  },
  {
    id: "L025",
    trainNumber: "95057",
    trainName: "CSMT-Khopoli Fast",
    type: "local",
    direction: "CSMT_to_Dadar",
    station: "CSMT",
    scheduledArrival: "21:30",
    scheduledDeparture: "21:32",
    assignedPlatform: 12,
    originalPlatform: 12,
    status: "scheduled",
    delay: 0,
    passengers: 1400
  },
  {
    id: "L026",
    trainNumber: "95056",
    trainName: "Khopoli-CSMT Fast",
    type: "local",
    direction: "Dadar_to_CSMT",
    station: "Dadar",
    scheduledArrival: "21:35",
    scheduledDeparture: "21:37",
    assignedPlatform: 8,
    originalPlatform: 8,
    status: "scheduled",
    delay: 0,
    passengers: 1350
  },
  {
    id: "L027",
    trainNumber: "95027",
    trainName: "CSMT-Belapur Slow",
    type: "local",
    direction: "CSMT_to_Dadar",
    station: "CSMT",
    scheduledArrival: "22:00",
    scheduledDeparture: "22:02",
    assignedPlatform: 2,
    originalPlatform: 2,
    status: "scheduled",
    delay: 0,
    passengers: 1200
  },
  {
    id: "L028",
    trainNumber: "95026",
    trainName: "Belapur-CSMT Slow",
    type: "local",
    direction: "Dadar_to_CSMT",
    station: "Dadar",
    scheduledArrival: "22:05",
    scheduledDeparture: "22:07",
    assignedPlatform: 2,
    originalPlatform: 2,
    status: "scheduled",
    delay: 0,
    passengers: 1150
  },
  {
    id: "L029",
    trainNumber: "95059",
    trainName: "CSMT-Karjat Fast",
    type: "local",
    direction: "CSMT_to_Dadar",
    station: "CSMT",
    scheduledArrival: "23:00",
    scheduledDeparture: "23:02",
    assignedPlatform: 11,
    originalPlatform: 11,
    status: "scheduled",
    delay: 0,
    passengers: 1000
  },
  {
    id: "L030",
    trainNumber: "95058",
    trainName: "Karjat-CSMT Fast",
    type: "local",
    direction: "Dadar_to_CSMT",
    station: "Dadar",
    scheduledArrival: "23:05",
    scheduledDeparture: "23:07",
    assignedPlatform: 7,
    originalPlatform: 7,
    status: "scheduled",
    delay: 0,
    passengers: 950
  }
];

// Platform configuration for CSMT and Dadar
const PLATFORM_CONFIG: PlatformStatus[] = [
  // CSMT Platforms
  { platformNumber: 1, stationType: "CSMT", trackType: "slow", isOccupied: false, utilizationRate: 85 },
  { platformNumber: 2, stationType: "CSMT", trackType: "slow", isOccupied: false, utilizationRate: 82 },
  { platformNumber: 11, stationType: "CSMT", trackType: "fast", isOccupied: false, utilizationRate: 78 },
  { platformNumber: 12, stationType: "CSMT", trackType: "fast", isOccupied: false, utilizationRate: 80 },
  { platformNumber: 14, stationType: "CSMT", trackType: "fast", isOccupied: false, utilizationRate: 90 },
  { platformNumber: 15, stationType: "CSMT", trackType: "fast", isOccupied: false, utilizationRate: 88 },
  { platformNumber: 16, stationType: "CSMT", trackType: "fast", isOccupied: false, utilizationRate: 85 },
  { platformNumber: 17, stationType: "CSMT", trackType: "fast", isOccupied: false, utilizationRate: 83 },
  
  // Dadar Platforms
  { platformNumber: 1, stationType: "Dadar", trackType: "slow", isOccupied: false, utilizationRate: 87 },
  { platformNumber: 2, stationType: "Dadar", trackType: "slow", isOccupied: false, utilizationRate: 84 },
  { platformNumber: 3, stationType: "Dadar", trackType: "fast", isOccupied: false, utilizationRate: 92 },
  { platformNumber: 4, stationType: "Dadar", trackType: "fast", isOccupied: false, utilizationRate: 90 },
  { platformNumber: 5, stationType: "Dadar", trackType: "fast", isOccupied: false, utilizationRate: 86 },
  { platformNumber: 6, stationType: "Dadar", trackType: "fast", isOccupied: false, utilizationRate: 88 },
  { platformNumber: 7, stationType: "Dadar", trackType: "fast", isOccupied: false, utilizationRate: 89 },
  { platformNumber: 8, stationType: "Dadar", trackType: "fast", isOccupied: false, utilizationRate: 85 }
];

export function PlatformAllocation() {
  const [trains, setTrains] = useState<TrainData[]>(TRAIN_DATASET);
  const [platforms, setPlatforms] = useState<PlatformStatus[]>(PLATFORM_CONFIG);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [suggestions, setSuggestions] = useState<PlatformSuggestion[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [processingAction, setProcessingAction] = useState<string | null>(null);
  const [selectedStation, setSelectedStation] = useState<"CSMT" | "Dadar" | "both">("both");

  // AI Platform Suggestion Algorithm
  const generatePlatformSuggestions = (): PlatformSuggestion[] => {
    const newSuggestions: PlatformSuggestion[] = [];
    const currentTime = new Date();
    
    // Analyze trains for potential platform optimization
    trains.forEach((train, index) => {
      const trainTime = new Date(`2024-01-01 ${train.scheduledArrival}`);
      const stationPlatforms = platforms.filter(p => 
        p.stationType === train.station && 
        ((train.type === "local" && p.trackType === "slow") || 
         (train.type === "express" && p.trackType === "fast"))
      );

      // Check for upcoming trains that might be delayed
      const upcomingTrains = trains.filter((t, i) => {
        const tTime = new Date(`2024-01-01 ${t.scheduledArrival}`);
        return i > index && 
               t.station === train.station && 
               tTime.getTime() - trainTime.getTime() < 30 * 60 * 1000 && // Within 30 minutes
               t.assignedPlatform === train.assignedPlatform;
      });

      // Generate suggestion if there's potential for optimization
      if (upcomingTrains.length > 0 || train.delay > 0) {
        const availablePlatforms = stationPlatforms.filter(p => 
          p.platformNumber !== train.assignedPlatform && 
          !p.isOccupied &&
          p.utilizationRate < 90
        );

        if (availablePlatforms.length > 0) {
          const bestPlatform = availablePlatforms.sort((a, b) => a.utilizationRate - b.utilizationRate)[0];
          
          // Calculate impact
          const delayReduction = Math.min(train.delay + Math.random() * 5, 8);
          const affectedTrainsCount = upcomingTrains.length + 1;
          const throughputImprovement = (delayReduction / 10) * affectedTrainsCount * 1.5;
          
          // Generate detailed reasoning
          let reason = `Current platform ${train.assignedPlatform} is experiencing congestion. `;
          let benefits = [];
          let urgency: "high" | "medium" | "low" = "medium";
          
          if (train.delay > 0) {
            reason += `Train ${train.trainNumber} is delayed by ${train.delay} minutes. `;
            benefits.push(`Reduce current delay by ${delayReduction.toFixed(1)} minutes`);
            urgency = train.delay > 5 ? "high" : "medium";
          }
          
          if (upcomingTrains.length > 0) {
            reason += `${upcomingTrains.length} trains scheduled to use the same platform within 30 minutes. `;
            benefits.push(`Prevent delays for ${upcomingTrains.length} subsequent trains`);
            benefits.push(`Improve platform turnover efficiency by ${throughputImprovement.toFixed(1)}%`);
          }
          
          reason += `Platform ${bestPlatform.platformNumber} has ${(100 - bestPlatform.utilizationRate).toFixed(1)}% available capacity and optimal track alignment for ${train.type} trains.`;
          
          if (train.type === "express" && train.passengers > 400) {
            benefits.push(`Better passenger flow management for high-capacity express service`);
          }
          
          if (train.type === "local" && train.passengers > 1400) {
            benefits.push(`Improved platform safety with reduced overcrowding`);
          }

          const suggestion: PlatformSuggestion = {
            id: `sug_${Date.now()}_${train.id}`,
            trainId: train.id,
            trainNumber: train.trainNumber,
            trainName: train.trainName,
            currentPlatform: train.assignedPlatform,
            suggestedPlatform: bestPlatform.platformNumber,
            reason,
            benefits,
            impactAnalysis: {
              delayReduction: Number(delayReduction.toFixed(1)),
              affectedTrains: affectedTrainsCount,
              throughputImprovement: Number(throughputImprovement.toFixed(1)),
              passengerImpact: train.passengers > 1200 ? "High - Peak hour crowd management" : "Medium - Standard passenger flow"
            },
            urgency,
            confidence: Math.min(0.95, 0.7 + (delayReduction / 10) + (upcomingTrains.length * 0.05)),
            timestamp: currentTime.toLocaleTimeString(),
            status: "pending"
          };
          
          newSuggestions.push(suggestion);
        }
      }
    });

    return newSuggestions.slice(0, 5); // Limit to top 5 suggestions
  };

  // Generate AI suggestions for TTC review
  const runAIAnalysis = () => {
    setIsAnalyzing(true);
    
    setTimeout(() => {
      const newSuggestions = generatePlatformSuggestions();
      setSuggestions(newSuggestions);
      
      // Update platform occupancy simulation
      setPlatforms(prevPlatforms => 
        prevPlatforms.map(platform => ({
          ...platform,
          isOccupied: Math.random() > 0.7, // Simulate random occupancy
          currentTrain: Math.random() > 0.7 ? `Train ${Math.floor(Math.random() * 1000)}` : undefined
        }))
      );
      
      setIsAnalyzing(false);
      
      if (newSuggestions.length > 0) {
        toast.success(`AI generated ${newSuggestions.length} platform optimization suggestions for TTC review`);
      } else {
        toast.info("No platform optimization opportunities detected at this time");
      }
    }, 2000);
  };

  // Handle TTC decision on suggestions
  const handleSuggestionAction = async (suggestionId: string, action: 'accept' | 'reject') => {
    setProcessingAction(suggestionId);
    
    setTimeout(() => {
      setSuggestions(prev => prev.map(sug => 
        sug.id === suggestionId 
          ? { ...sug, status: action as "accepted" | "rejected" }
          : sug
      ));

      if (action === 'accept') {
        const suggestion = suggestions.find(s => s.id === suggestionId);
        if (suggestion) {
          // Update train platform assignment
          setTrains(prev => prev.map(train => 
            train.id === suggestion.trainId 
              ? { 
                  ...train, 
                  assignedPlatform: suggestion.suggestedPlatform,
                  status: "platform_changed"
                }
              : train
          ));

          // Create announcement for platform change
          const announcement: Announcement = {
            id: `ann_${Date.now()}_${suggestion.trainId}`,
            timestamp: new Date().toLocaleTimeString(),
            trainNumber: suggestion.trainNumber,
            message: `Attention passengers! ${suggestion.trainName} (${suggestion.trainNumber}) will now arrive at Platform ${suggestion.suggestedPlatform} instead of Platform ${suggestion.currentPlatform}. This change will help reduce delays. Inconvenience is regretted.`,
            type: "platform_change",
            priority: "high"
          };
          
          setAnnouncements(prev => [announcement, ...prev].slice(0, 10));
          toast.success(`TTC approved platform change for ${suggestion.trainNumber}. Passengers will be notified.`);
        }
      } else {
        toast.info(`TTC rejected platform change suggestion for train ${suggestions.find(s => s.id === suggestionId)?.trainNumber}`);
      }
      
      setProcessingAction(null);
    }, 1000);
  };

  // Filter trains by station
  const filteredTrains = trains.filter(train => {
    if (selectedStation === "both") return true;
    return train.station === selectedStation;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled": return "bg-blue-100 text-blue-800";
      case "arrived": return "bg-green-100 text-green-800";
      case "departed": return "bg-gray-100 text-gray-800";
      case "delayed": return "bg-red-100 text-red-800";
      case "platform_changed": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getAnnouncementColor = (type: string) => {
    switch (type) {
      case "platform_change": return "bg-yellow-50 border-yellow-200";
      case "delay": return "bg-red-50 border-red-200";
      case "arrival": return "bg-green-50 border-green-200";
      case "departure": return "bg-blue-50 border-blue-200";
      default: return "bg-gray-50 border-gray-200";
    }
  };

  useEffect(() => {
    // Auto-run AI analysis on component mount
    setTimeout(() => {
      runAIAnalysis();
    }, 1000);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="size-5" />
              AI Platform Allocation System
              <Badge variant="outline" className="bg-green-50 text-green-700">
                50 Trains Active
              </Badge>
            </div>
            <div className="flex items-center gap-3">
              <select 
                value={selectedStation} 
                onChange={(e) => setSelectedStation(e.target.value as any)}
                className="px-3 py-1 border rounded-md text-sm"
              >
                <option value="both">All Stations</option>
                <option value="CSMT">CSMT Only</option>
                <option value="Dadar">Dadar Only</option>
              </select>
              <Button 
                onClick={runAIAnalysis} 
                disabled={isAnalyzing}
                size="sm"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="size-4 animate-spin mr-2" />
                    AI Analyzing...
                  </>
                ) : (
                  <>
                    <Brain className="size-4 mr-2" />
                    Generate AI Suggestions
                  </>
                )}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      <Tabs defaultValue="suggestions" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="suggestions">AI Suggestions</TabsTrigger>
          <TabsTrigger value="allocation">Current Allocation</TabsTrigger>
          <TabsTrigger value="announcements">Live Announcements</TabsTrigger>
          <TabsTrigger value="platforms">Platform Status</TabsTrigger>
          <TabsTrigger value="analytics">AI Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="suggestions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Brain className="size-5" />
                  AI Platform Optimization Suggestions for TTC Review
                </div>
                <Badge variant="outline">
                  {suggestions.filter(s => s.status === "pending").length} Pending
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {suggestions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Brain className="size-8 mx-auto mb-2 opacity-50" />
                    <p>No AI suggestions available</p>
                    <p className="text-sm mt-1">Click "Generate AI Suggestions" to analyze current traffic</p>
                  </div>
                ) : (
                  suggestions.map((suggestion) => (
                    <div key={suggestion.id} className={`border rounded-lg p-4 space-y-4 ${
                      suggestion.status === "accepted" ? "bg-green-50 border-green-200" :
                      suggestion.status === "rejected" ? "bg-red-50 border-red-200" :
                      suggestion.urgency === "high" ? "bg-red-50 border-red-200" :
                      suggestion.urgency === "medium" ? "bg-yellow-50 border-yellow-200" :
                      "bg-blue-50 border-blue-200"
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div>
                            <h4 className="font-medium">{suggestion.trainNumber} - {suggestion.trainName}</h4>
                            <div className="text-sm text-muted-foreground">
                              Platform {suggestion.currentPlatform} → Platform {suggestion.suggestedPlatform}
                            </div>
                          </div>
                          <Badge className={`
                            ${suggestion.urgency === "high" ? "bg-red-100 text-red-800" :
                              suggestion.urgency === "medium" ? "bg-yellow-100 text-yellow-800" :
                              "bg-blue-100 text-blue-800"}
                          `}>
                            {suggestion.urgency.toUpperCase()} Priority
                          </Badge>
                          <Badge variant="outline">
                            {Math.round(suggestion.confidence * 100)}% Confidence
                          </Badge>
                          {suggestion.status !== "pending" && (
                            <Badge className={suggestion.status === "accepted" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                              {suggestion.status.toUpperCase()}
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {suggestion.timestamp}
                        </span>
                      </div>

                      {/* AI Reasoning */}
                      <Alert>
                        <Brain className="size-4" />
                        <AlertDescription>
                          <strong>AI Analysis:</strong> {suggestion.reason}
                        </AlertDescription>
                      </Alert>

                      {/* Benefits */}
                      <div>
                        <h5 className="font-medium text-sm mb-2">Expected Benefits:</h5>
                        <ul className="space-y-1">
                          {suggestion.benefits.map((benefit, index) => (
                            <li key={index} className="text-sm flex items-center gap-2">
                              <CheckCircle className="size-3 text-green-600" />
                              {benefit}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Impact Analysis */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="text-center p-3 bg-white rounded border">
                          <div className="font-medium text-green-600">
                            -{suggestion.impactAnalysis.delayReduction} min
                          </div>
                          <div className="text-xs text-muted-foreground">Delay Reduction</div>
                        </div>
                        <div className="text-center p-3 bg-white rounded border">
                          <div className="font-medium text-blue-600">
                            {suggestion.impactAnalysis.affectedTrains}
                          </div>
                          <div className="text-xs text-muted-foreground">Trains Affected</div>
                        </div>
                        <div className="text-center p-3 bg-white rounded border">
                          <div className="font-medium text-purple-600">
                            +{suggestion.impactAnalysis.throughputImprovement}%
                          </div>
                          <div className="text-xs text-muted-foreground">Throughput</div>
                        </div>
                        <div className="text-center p-3 bg-white rounded border">
                          <div className="font-medium text-orange-600 text-xs">
                            {suggestion.impactAnalysis.passengerImpact}
                          </div>
                          <div className="text-xs text-muted-foreground">Passenger Impact</div>
                        </div>
                      </div>

                      {/* TTC Action Buttons */}
                      {suggestion.status === "pending" && (
                        <div className="flex items-center justify-between pt-3 border-t">
                          <div className="text-sm text-muted-foreground">
                            TTC Decision Required
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleSuggestionAction(suggestion.id, 'reject')}
                              disabled={processingAction === suggestion.id}
                            >
                              {processingAction === suggestion.id ? (
                                <RefreshCw className="size-3 animate-spin mr-1" />
                              ) : (
                                <AlertTriangle className="size-3 mr-1" />
                              )}
                              Reject
                            </Button>
                            <Button 
                              size="sm"
                              onClick={() => handleSuggestionAction(suggestion.id, 'accept')}
                              disabled={processingAction === suggestion.id}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              {processingAction === suggestion.id ? (
                                <RefreshCw className="size-3 animate-spin mr-1" />
                              ) : (
                                <CheckCircle className="size-3 mr-1" />
                              )}
                              Approve & Implement
                            </Button>
                          </div>
                        </div>
                      )}

                      {suggestion.status === "accepted" && (
                        <div className="pt-3 border-t">
                          <div className="flex items-center gap-2 text-sm text-green-700">
                            <CheckCircle className="size-4" />
                            Platform change approved by TTC and implemented. Passengers have been notified.
                          </div>
                        </div>
                      )}

                      {suggestion.status === "rejected" && (
                        <div className="pt-3 border-t">
                          <div className="flex items-center gap-2 text-sm text-red-700">
                            <AlertTriangle className="size-4" />
                            Suggestion rejected by TTC. Current platform assignment maintained.
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="allocation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Real-time Train Platform Allocation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-[600px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Train</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Station</TableHead>
                      <TableHead>Direction</TableHead>
                      <TableHead>Arrival</TableHead>
                      <TableHead>Departure</TableHead>
                      <TableHead>Platform</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Passengers</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTrains.map((train) => (
                      <TableRow key={train.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{train.trainNumber}</div>
                            <div className="text-sm text-muted-foreground">{train.trainName}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={train.type === "express" ? "default" : "secondary"}>
                            {train.type.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <MapPin className="size-3" />
                            {train.station}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs">
                          {train.direction.replace("_", " → ")}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Clock className="size-3" />
                            {train.scheduledArrival}
                          </div>
                        </TableCell>
                        <TableCell>{train.scheduledDeparture}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant="outline" 
                              className={train.assignedPlatform !== train.originalPlatform ? "bg-yellow-100 text-yellow-800" : ""}
                            >
                              Platform {train.assignedPlatform}
                            </Badge>
                            {train.assignedPlatform !== train.originalPlatform && (
                              <AlertTriangle className="size-4 text-yellow-600" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(train.status)}>
                            {train.status.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {train.passengers.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="announcements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Speaker className="size-5" />
                Live Station Announcements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {announcements.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Speaker className="size-8 mx-auto mb-2 opacity-50" />
                    <p>No announcements at this time</p>
                  </div>
                ) : (
                  announcements.map((announcement) => (
                    <Alert key={announcement.id} className={getAnnouncementColor(announcement.type)}>
                      <Speaker className="size-4" />
                      <AlertDescription>
                        <div className="flex items-start justify-between mb-2">
                          <Badge variant="outline" className="text-xs">
                            {announcement.type.replace("_", " ").toUpperCase()}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {announcement.timestamp}
                          </span>
                        </div>
                        <p className="font-medium text-sm">{announcement.message}</p>
                      </AlertDescription>
                    </Alert>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="platforms" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* CSMT Platforms */}
            <Card>
              <CardHeader>
                <CardTitle>CSMT Platforms</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {platforms.filter(p => p.stationType === "CSMT").map((platform) => (
                    <div key={`${platform.stationType}-${platform.platformNumber}`} 
                         className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${platform.isOccupied ? 'bg-red-500' : 'bg-green-500'}`} />
                        <div>
                          <div className="font-medium">Platform {platform.platformNumber}</div>
                          <div className="text-sm text-muted-foreground">
                            {platform.trackType} line
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {platform.isOccupied ? 'Occupied' : 'Available'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {platform.utilizationRate}% utilization
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Dadar Platforms */}
            <Card>
              <CardHeader>
                <CardTitle>Dadar Platforms</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {platforms.filter(p => p.stationType === "Dadar").map((platform) => (
                    <div key={`${platform.stationType}-${platform.platformNumber}`} 
                         className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${platform.isOccupied ? 'bg-red-500' : 'bg-green-500'}`} />
                        <div>
                          <div className="font-medium">Platform {platform.platformNumber}</div>
                          <div className="text-sm text-muted-foreground">
                            {platform.trackType} line
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {platform.isOccupied ? 'Occupied' : 'Available'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {platform.utilizationRate}% utilization
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">AI Suggestion Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">TTC Approval Rate</span>
                    <span className="font-medium">
                      {suggestions.length > 0 ? 
                        Math.round((suggestions.filter(s => s.status === "accepted").length / suggestions.length) * 100) 
                        : 0}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Total Suggestions</span>
                    <span className="font-medium">{suggestions.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Avg Confidence</span>
                    <span className="font-medium">
                      {suggestions.length > 0 ? 
                        Math.round((suggestions.reduce((sum, s) => sum + s.confidence, 0) / suggestions.length) * 100) 
                        : 0}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">TTC Decision Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Approved Suggestions</span>
                    <span className="font-medium text-green-600">
                      {suggestions.filter(s => s.status === "accepted").length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Rejected Suggestions</span>
                    <span className="font-medium text-red-600">
                      {suggestions.filter(s => s.status === "rejected").length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Pending Review</span>
                    <span className="font-medium text-yellow-600">
                      {suggestions.filter(s => s.status === "pending").length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Impact Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Est. Time Saved</span>
                    <span className="font-medium text-green-600">
                      {suggestions
                        .filter(s => s.status === "accepted")
                        .reduce((sum, s) => sum + s.impactAnalysis.delayReduction, 0)
                        .toFixed(1)} min
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Trains Optimized</span>
                    <span className="font-medium">
                      {suggestions
                        .filter(s => s.status === "accepted")
                        .reduce((sum, s) => sum + s.impactAnalysis.affectedTrains, 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Avg Throughput Gain</span>
                    <span className="font-medium text-purple-600">
                      {suggestions.filter(s => s.status === "accepted").length > 0 ? 
                        (suggestions
                          .filter(s => s.status === "accepted")
                          .reduce((sum, s) => sum + s.impactAnalysis.throughputImprovement, 0) / 
                         suggestions.filter(s => s.status === "accepted").length
                        ).toFixed(1) : 0}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}