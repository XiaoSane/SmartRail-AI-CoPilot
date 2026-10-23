import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { 
  TrainPriorityCalculator, 
  AIDecisionEngine, 
  PerformanceAnalytics,
  SimulationEngine,
  Train,
  Track,
  Recommendation
} from "./train_ai_engine.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-0a078106/health", (c) => {
  return c.json({ status: "ok" });
});

// Initialize sample data if not exists
app.post("/make-server-0a078106/init-data", async (c) => {
  try {
    // Check if data already exists
    const existingTrains = await kv.get("trains");
    if (existingTrains) {
      return c.json({ message: "Data already initialized" });
    }

    // Sample train data
    const sampleTrains: Train[] = [
      {
        id: "T001",
        name: "Rajdhani Express",
        type: "express",
        priority: 100,
        currentLocation: "JN-A",
        destination: "JN-D",
        scheduledTime: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        delay: 2,
        speed: 110,
        length: 400,
        direction: "up",
        nextSignal: "SIG-01",
        status: "running"
      },
      {
        id: "T002",
        name: "Mumbai Local",
        type: "local",
        priority: 60,
        currentLocation: "JN-B",
        destination: "JN-C",
        scheduledTime: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        delay: 0,
        speed: 80,
        length: 200,
        direction: "down",
        nextSignal: "SIG-02",
        status: "running"
      },
      {
        id: "T003",
        name: "Freight 2401",
        type: "freight",
        priority: 30,
        currentLocation: "JN-C",
        destination: "JN-A",
        scheduledTime: new Date(Date.now() + 45 * 60 * 1000).toISOString(),
        delay: 8,
        speed: 50,
        length: 800,
        direction: "up",
        nextSignal: "SIG-03",
        status: "running"
      },
      {
        id: "T004",
        name: "Shatabdi Express",
        type: "express",
        priority: 95,
        currentLocation: "JN-D",
        destination: "JN-A",
        scheduledTime: new Date(Date.now() + 20 * 60 * 1000).toISOString(),
        delay: 5,
        speed: 120,
        length: 350,
        direction: "down",
        nextSignal: "SIG-04",
        status: "running"
      }
    ];

    // Sample track data
    const sampleTracks: Track[] = [
      {
        id: "JN-A",
        name: "Junction A Main Line",
        length: 2000,
        maxSpeed: 120,
        signals: [
          { id: "SIG-01", trackId: "JN-A", position: 500, aspect: "green", type: "home" },
          { id: "SIG-02", trackId: "JN-A", position: 1500, aspect: "yellow", type: "starter" }
        ],
        occupied: true,
        occupiedBy: "T001"
      },
      {
        id: "JN-B",
        name: "Junction B Branch Line",
        length: 1500,
        maxSpeed: 80,
        signals: [
          { id: "SIG-03", trackId: "JN-B", position: 750, aspect: "green", type: "intermediate" }
        ],
        occupied: true,
        occupiedBy: "T002"
      },
      {
        id: "JN-C",
        name: "Junction C Freight Yard",
        length: 3000,
        maxSpeed: 60,
        signals: [
          { id: "SIG-04", trackId: "JN-C", position: 1000, aspect: "red", type: "home" },
          { id: "SIG-05", trackId: "JN-C", position: 2000, aspect: "yellow", type: "distant" }
        ],
        occupied: true,
        occupiedBy: "T003"
      },
      {
        id: "JN-D",
        name: "Junction D Terminal",
        length: 1800,
        maxSpeed: 100,
        signals: [
          { id: "SIG-06", trackId: "JN-D", position: 900, aspect: "green", type: "starter" }
        ],
        occupied: true,
        occupiedBy: "T004"
      }
    ];

    // Historical performance data
    const historicalData = [];
    const now = new Date();
    
    for (let i = 0; i < 100; i++) {
      const timestamp = new Date(now.getTime() - (i * 60 * 60 * 1000)); // Hours ago
      historicalData.push({
        timestamp: timestamp.toISOString(),
        trainName: sampleTrains[i % sampleTrains.length].name,
        delay: Math.floor(Math.random() * 15),
        status: Math.random() > 0.1 ? 'completed' : 'cancelled',
        throughput: Math.floor(Math.random() * 10) + 5
      });
    }

    // Store data
    await kv.set("trains", sampleTrains);
    await kv.set("tracks", sampleTracks);
    await kv.set("historical_data", historicalData);
    await kv.set("last_updated", new Date().toISOString());

    return c.json({ 
      message: "Sample data initialized successfully",
      trains: sampleTrains.length,
      tracks: sampleTracks.length,
      historicalRecords: historicalData.length
    });
  } catch (error) {
    console.log("Error initializing data:", error);
    return c.json({ error: "Failed to initialize data" }, 500);
  }
});

// Get current train status and recommendations
app.get("/make-server-0a078106/dashboard", async (c) => {
  try {
    const trains = await kv.get("trains") as Train[] || [];
    const tracks = await kv.get("tracks") as Track[] || [];
    const historicalData = await kv.get("historical_data") || [];
    
    // Calculate AI recommendations
    const recommendations = AIDecisionEngine.generateCrossingRecommendations(
      trains, 
      tracks, 
      historicalData
    );
    
    // Calculate performance metrics
    const metrics = PerformanceAnalytics.calculateMetrics(trains, historicalData);
    
    // Sort trains by priority
    const prioritizedTrains = TrainPriorityCalculator.sortTrainsByPriority(trains, new Date());
    
    return c.json({
      trains: prioritizedTrains,
      tracks,
      recommendations: recommendations.slice(0, 5), // Top 5 recommendations
      metrics,
      lastUpdated: await kv.get("last_updated")
    });
  } catch (error) {
    console.log("Error fetching dashboard data:", error);
    return c.json({ error: "Failed to fetch dashboard data" }, 500);
  }
});

// Update train status
app.put("/make-server-0a078106/trains/:id", async (c) => {
  try {
    const trainId = c.req.param("id");
    const updates = await c.req.json();
    
    const trains = await kv.get("trains") as Train[] || [];
    const trainIndex = trains.findIndex(t => t.id === trainId);
    
    if (trainIndex === -1) {
      return c.json({ error: "Train not found" }, 404);
    }
    
    // Update train data
    trains[trainIndex] = { ...trains[trainIndex], ...updates };
    
    // Store updated trains
    await kv.set("trains", trains);
    await kv.set("last_updated", new Date().toISOString());
    
    // Log the update to historical data
    const historicalData = await kv.get("historical_data") || [];
    historicalData.push({
      timestamp: new Date().toISOString(),
      trainName: trains[trainIndex].name,
      action: "status_update",
      delay: trains[trainIndex].delay,
      status: trains[trainIndex].status
    });
    await kv.set("historical_data", historicalData.slice(-1000)); // Keep last 1000 records
    
    return c.json({ 
      message: "Train updated successfully",
      train: trains[trainIndex]
    });
  } catch (error) {
    console.log("Error updating train:", error);
    return c.json({ error: "Failed to update train" }, 500);
  }
});

// Run simulation
app.post("/make-server-0a078106/simulate", async (c) => {
  try {
    const { modifications } = await c.req.json();
    
    const trains = await kv.get("trains") as Train[] || [];
    const tracks = await kv.get("tracks") as Track[] || [];
    
    const simulationResult = SimulationEngine.runSimulation(
      trains,
      tracks,
      modifications || []
    );
    
    return c.json({
      simulation: simulationResult,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.log("Error running simulation:", error);
    return c.json({ error: "Failed to run simulation" }, 500);
  }
});

// Get performance analytics
app.get("/make-server-0a078106/analytics", async (c) => {
  try {
    const trains = await kv.get("trains") as Train[] || [];
    const historicalData = await kv.get("historical_data") || [];
    
    const analytics = PerformanceAnalytics.calculateMetrics(trains, historicalData);
    
    // Additional analytics
    const trainTypeDistribution = trains.reduce((acc, train) => {
      acc[train.type] = (acc[train.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const delayDistribution = trains.reduce((acc, train) => {
      const delayRange = train.delay <= 5 ? 'on-time' : 
                        train.delay <= 15 ? 'minor-delay' : 'major-delay';
      acc[delayRange] = (acc[delayRange] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return c.json({
      ...analytics,
      trainTypeDistribution,
      delayDistribution,
      totalTrains: trains.length,
      historicalDataPoints: historicalData.length
    });
  } catch (error) {
    console.log("Error fetching analytics:", error);
    return c.json({ error: "Failed to fetch analytics" }, 500);
  }
});

// Accept/reject AI recommendations
app.post("/make-server-0a078106/recommendations/:id/action", async (c) => {
  try {
    const recommendationId = c.req.param("id");
    const { action, feedback } = await c.req.json(); // action: 'accept' | 'reject'
    
    // Log the decision for ML learning
    const decisions = await kv.get("recommendation_decisions") || [];
    decisions.push({
      recommendationId,
      action,
      feedback,
      timestamp: new Date().toISOString(),
      controller: "system" // In real system, would be authenticated user
    });
    
    await kv.set("recommendation_decisions", decisions.slice(-500)); // Keep last 500 decisions
    
    return c.json({
      message: `Recommendation ${action}ed successfully`,
      logged: true
    });
  } catch (error) {
    console.log("Error processing recommendation action:", error);
    return c.json({ error: "Failed to process recommendation action" }, 500);
  }
});

// Get real-time alerts
app.get("/make-server-0a078106/alerts", async (c) => {
  try {
    const trains = await kv.get("trains") as Train[] || [];
    const tracks = await kv.get("tracks") as Track[] || [];
    
    const alerts = [];
    
    // Generate alerts based on current conditions
    for (const train of trains) {
      if (train.delay > 15) {
        alerts.push({
          id: `alert_${train.id}_delay`,
          type: 'delay',
          severity: train.delay > 30 ? 'critical' : 'warning',
          title: `${train.name} Severely Delayed`,
          message: `${train.name} is running ${train.delay} minutes behind schedule`,
          trainId: train.id,
          timestamp: new Date().toISOString()
        });
      }
      
      if (train.status === 'stopped' && train.type === 'express') {
        alerts.push({
          id: `alert_${train.id}_stopped`,
          type: 'operational',
          severity: 'warning',
          title: `Express Train Stopped`,
          message: `${train.name} has stopped unexpectedly`,
          trainId: train.id,
          timestamp: new Date().toISOString()
        });
      }
    }
    
    // Track occupancy alerts
    const overOccupiedTracks = tracks.filter(track => {
      const trainsOnTrack = trains.filter(t => t.currentLocation === track.id);
      return trainsOnTrack.length > 1;
    });
    
    for (const track of overOccupiedTracks) {
      alerts.push({
        id: `alert_${track.id}_conflict`,
        type: 'safety',
        severity: 'critical',
        title: `Track Conflict Detected`,
        message: `Multiple trains detected on ${track.name}`,
        trackId: track.id,
        timestamp: new Date().toISOString()
      });
    }
    
    return c.json({
      alerts: alerts.sort((a, b) => {
        const severityOrder = { critical: 3, warning: 2, info: 1 };
        return severityOrder[b.severity as keyof typeof severityOrder] - 
               severityOrder[a.severity as keyof typeof severityOrder];
      }),
      totalAlerts: alerts.length,
      criticalAlerts: alerts.filter(a => a.severity === 'critical').length
    });
  } catch (error) {
    console.log("Error fetching alerts:", error);
    return c.json({ error: "Failed to fetch alerts" }, 500);
  }
});

Deno.serve(app.fetch);