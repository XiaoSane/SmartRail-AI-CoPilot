/**
 * AI-Powered Train Traffic Control Engine
 * Core Python-like algorithms implemented in TypeScript for Deno runtime
 */

export interface Train {
  id: string;
  name: string;
  type: 'express' | 'local' | 'freight' | 'maintenance';
  priority: number;
  currentLocation: string;
  destination: string;
  scheduledTime: string;
  actualTime?: string;
  delay: number;
  speed: number;
  length: number;
  direction: 'up' | 'down';
  nextSignal?: string;
  status: 'running' | 'stopped' | 'delayed' | 'cancelled';
}

export interface Track {
  id: string;
  name: string;
  length: number;
  maxSpeed: number;
  signals: Signal[];
  occupied: boolean;
  occupiedBy?: string;
  maintenanceWindow?: string;
}

export interface Signal {
  id: string;
  trackId: string;
  position: number;
  aspect: 'green' | 'yellow' | 'red';
  type: 'home' | 'starter' | 'distant' | 'intermediate';
}

export interface Recommendation {
  id: string;
  type: 'precedence' | 'crossing' | 'maintenance' | 'emergency';
  priority: 'high' | 'medium' | 'low';
  trainId: string;
  action: string;
  reasoning: string;
  confidence: number;
  estimatedDelay: number;
  throughputImpact: number;
}

/**
 * Python-style train priority calculation algorithm
 */
export class TrainPriorityCalculator {
  
  static calculatePriority(train: Train, currentTime: Date): number {
    let priority = 0;
    
    // Base priority by train type (Python dict-like mapping)
    const typePriorities = {
      'express': 100,
      'local': 60,
      'freight': 30,
      'maintenance': 20
    };
    
    priority += typePriorities[train.type] || 0;
    
    // Delay penalty (exponential increase)
    if (train.delay > 0) {
      priority += Math.pow(train.delay, 1.5) * 10;
    }
    
    // Schedule adherence bonus
    const scheduledTime = new Date(train.scheduledTime);
    const timeDiff = Math.abs(currentTime.getTime() - scheduledTime.getTime()) / (1000 * 60);
    if (timeDiff < 5) { // Within 5 minutes of schedule
      priority += 20;
    }
    
    return Math.round(priority);
  }
  
  /**
   * Python-style list comprehension equivalent for sorting trains
   */
  static sortTrainsByPriority(trains: Train[], currentTime: Date): Train[] {
    return trains
      .map(train => ({
        ...train,
        calculatedPriority: this.calculatePriority(train, currentTime)
      }))
      .sort((a, b) => b.calculatedPriority - a.calculatedPriority);
  }
}

/**
 * AI Decision Engine - Python ML-style logic
 */
export class AIDecisionEngine {
  
  /**
   * Generate crossing recommendations using conflict resolution algorithm
   */
  static generateCrossingRecommendations(
    trains: Train[], 
    tracks: Track[], 
    historicalData: any[]
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];
    const conflicts = this.detectConflicts(trains, tracks);
    
    for (const conflict of conflicts) {
      const recommendation = this.resolveCrossing(conflict, historicalData);
      if (recommendation) {
        recommendations.push(recommendation);
      }
    }
    
    return recommendations.sort((a, b) => b.confidence - a.confidence);
  }
  
  /**
   * Detect potential train conflicts (Python algorithm style)
   */
  private static detectConflicts(trains: Train[], tracks: Track[]): any[] {
    const conflicts = [];
    
    // Check for same-track conflicts
    for (const track of tracks) {
      const trainsOnTrack = trains.filter(t => t.currentLocation === track.id);
      
      if (trainsOnTrack.length > 1) {
        // Sort by position and check for conflicts
        for (let i = 0; i < trainsOnTrack.length - 1; i++) {
          const train1 = trainsOnTrack[i];
          const train2 = trainsOnTrack[i + 1];
          
          const timeGap = Math.abs(
            new Date(train1.scheduledTime).getTime() - 
            new Date(train2.scheduledTime).getTime()
          ) / (1000 * 60);
          
          if (timeGap < 10) { // Less than 10 minutes apart
            conflicts.push({
              type: 'same_track',
              trains: [train1, train2],
              track: track,
              severity: this.calculateConflictSeverity(train1, train2, timeGap)
            });
          }
        }
      }
    }
    
    return conflicts;
  }
  
  /**
   * Resolve crossing conflicts using optimization algorithm
   */
  private static resolveCrossing(conflict: any, historicalData: any[]): Recommendation | null {
    const { trains, track, severity } = conflict;
    const [train1, train2] = trains;
    
    // Calculate delay impact for different scenarios
    const scenarios = [
      { action: `Give precedence to ${train1.name}`, train: train1, delayOther: train2 },
      { action: `Give precedence to ${train2.name}`, train: train2, delayOther: train1 }
    ];
    
    let bestScenario = scenarios[0];
    let bestScore = -Infinity;
    
    for (const scenario of scenarios) {
      const score = this.calculateScenarioScore(scenario, historicalData);
      if (score > bestScore) {
        bestScore = score;
        bestScenario = scenario;
      }
    }
    
    return {
      id: `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'crossing',
      priority: severity > 0.7 ? 'high' : 'medium',
      trainId: bestScenario.train.id,
      action: bestScenario.action,
      reasoning: `Based on train priorities and historical delay patterns. ${bestScenario.train.name} (${bestScenario.train.type}) should proceed first to minimize overall system delay.`,
      confidence: this.calculateConfidence(bestScenario, historicalData),
      estimatedDelay: this.estimateDelay(bestScenario.delayOther),
      throughputImpact: this.calculateThroughputImpact(conflict)
    };
  }
  
  private static calculateConflictSeverity(train1: Train, train2: Train, timeGap: number): number {
    const priorityDiff = Math.abs(train1.priority - train2.priority);
    const speedDiff = Math.abs(train1.speed - train2.speed);
    return (priorityDiff / 100 + speedDiff / 120 + (10 - timeGap) / 10) / 3;
  }
  
  private static calculateScenarioScore(scenario: any, historicalData: any[]): number {
    const { train, delayOther } = scenario;
    
    // Base score from train priority
    let score = train.priority;
    
    // Penalty for delaying the other train
    score -= delayOther.priority * 0.8;
    
    // Historical performance bonus
    const avgDelay = this.getAverageDelay(train.name, historicalData);
    if (avgDelay < 5) {
      score += 10; // Reward punctual trains
    }
    
    return score;
  }
  
  private static calculateConfidence(scenario: any, historicalData: any[]): number {
    const dataPoints = historicalData.filter(d => 
      d.trainName === scenario.train.name || d.trainName === scenario.delayOther.name
    ).length;
    
    return Math.min(0.95, 0.5 + (dataPoints / 100) * 0.4);
  }
  
  private static estimateDelay(train: Train): number {
    // Simple delay estimation based on train type and current delay
    const baseDelay = { express: 3, local: 5, freight: 8, maintenance: 10 };
    return baseDelay[train.type] + (train.delay * 0.3);
  }
  
  private static calculateThroughputImpact(conflict: any): number {
    const { trains, track } = conflict;
    const totalDelay = trains.reduce((sum: number, t: Train) => sum + t.delay, 0);
    return (totalDelay / (track.length * 0.1)) * -1; // Negative impact
  }
  
  private static getAverageDelay(trainName: string, historicalData: any[]): number {
    const trainData = historicalData.filter(d => d.trainName === trainName);
    if (trainData.length === 0) return 0;
    return trainData.reduce((sum, d) => sum + (d.delay || 0), 0) / trainData.length;
  }
}

/**
 * Performance Analytics Engine - Python data science style
 */
export class PerformanceAnalytics {
  
  /**
   * Calculate system performance metrics
   */
  static calculateMetrics(trains: Train[], historicalData: any[]): any {
    const now = new Date();
    const last24h = historicalData.filter(d => 
      new Date(d.timestamp).getTime() > now.getTime() - (24 * 60 * 60 * 1000)
    );
    
    return {
      punctualityRate: this.calculatePunctualityRate(trains),
      averageDelay: this.calculateAverageDelay(trains),
      throughputEfficiency: this.calculateThroughputEfficiency(last24h),
      capacityUtilization: this.calculateCapacityUtilization(trains),
      performanceTrend: this.calculatePerformanceTrend(historicalData),
      criticalDelays: this.identifyCriticalDelays(trains)
    };
  }
  
  private static calculatePunctualityRate(trains: Train[]): number {
    const onTimeTrains = trains.filter(t => t.delay <= 5).length;
    return trains.length > 0 ? (onTimeTrains / trains.length) * 100 : 100;
  }
  
  private static calculateAverageDelay(trains: Train[]): number {
    const totalDelay = trains.reduce((sum, t) => sum + t.delay, 0);
    return trains.length > 0 ? totalDelay / trains.length : 0;
  }
  
  private static calculateThroughputEfficiency(data: any[]): number {
    // Simplified throughput calculation
    const plannedTrains = data.filter(d => d.status !== 'cancelled').length;
    const completedTrains = data.filter(d => d.status === 'completed').length;
    return plannedTrains > 0 ? (completedTrains / plannedTrains) * 100 : 100;
  }
  
  private static calculateCapacityUtilization(trains: Train[]): number {
    // Estimate based on active trains vs theoretical maximum
    const activeTrains = trains.filter(t => t.status === 'running').length;
    const maxCapacity = 50; // Theoretical maximum trains in section
    return (activeTrains / maxCapacity) * 100;
  }
  
  private static calculatePerformanceTrend(historicalData: any[]): string {
    if (historicalData.length < 2) return 'stable';
    
    const recent = historicalData.slice(-10);
    const older = historicalData.slice(-20, -10);
    
    const recentAvgDelay = recent.reduce((sum, d) => sum + (d.delay || 0), 0) / recent.length;
    const olderAvgDelay = older.reduce((sum, d) => sum + (d.delay || 0), 0) / older.length;
    
    if (recentAvgDelay > olderAvgDelay * 1.1) return 'declining';
    if (recentAvgDelay < olderAvgDelay * 0.9) return 'improving';
    return 'stable';
  }
  
  private static identifyCriticalDelays(trains: Train[]): Train[] {
    return trains
      .filter(t => t.delay > 15 && (t.type === 'express' || t.type === 'local'))
      .sort((a, b) => b.delay - a.delay)
      .slice(0, 5);
  }
}

/**
 * Simulation Engine for What-If Analysis
 */
export class SimulationEngine {
  
  /**
   * Run traffic simulation with given parameters
   */
  static runSimulation(
    trains: Train[], 
    tracks: Track[], 
    modifications: any[]
  ): any {
    const simulatedTrains = JSON.parse(JSON.stringify(trains)); // Deep clone
    const simulatedTracks = JSON.parse(JSON.stringify(tracks));
    
    // Apply modifications
    for (const mod of modifications) {
      this.applyModification(simulatedTrains, simulatedTracks, mod);
    }
    
    // Run simulation steps
    const results = [];
    for (let minute = 0; minute < 60; minute++) {
      const stepResult = this.simulateStep(simulatedTrains, simulatedTracks, minute);
      results.push(stepResult);
    }
    
    return {
      totalDelay: results.reduce((sum, r) => sum + r.totalDelay, 0),
      throughput: results[results.length - 1].completedTrains,
      conflictsResolved: results.reduce((sum, r) => sum + r.conflicts, 0),
      efficiency: this.calculateSimulationEfficiency(results),
      timeline: results
    };
  }
  
  private static applyModification(trains: Train[], tracks: Track[], mod: any): void {
    switch (mod.type) {
      case 'delay_train':
        const train = trains.find(t => t.id === mod.trainId);
        if (train) train.delay += mod.minutes;
        break;
      case 'block_track':
        const track = tracks.find(t => t.id === mod.trackId);
        if (track) {
          track.occupied = true;
          track.occupiedBy = 'maintenance';
        }
        break;
      case 'speed_restriction':
        const restrictTrack = tracks.find(t => t.id === mod.trackId);
        if (restrictTrack) restrictTrack.maxSpeed = mod.speed;
        break;
    }
  }
  
  private static simulateStep(trains: Train[], tracks: Track[], minute: number): any {
    let totalDelay = 0;
    let conflicts = 0;
    let completedTrains = 0;
    
    for (const train of trains) {
      // Simulate train movement
      if (train.status === 'running') {
        // Simple movement simulation
        totalDelay += train.delay;
        
        // Check for conflicts
        const conflictingTrains = trains.filter(t => 
          t.id !== train.id && 
          t.currentLocation === train.currentLocation &&
          t.status === 'running'
        );
        
        if (conflictingTrains.length > 0) {
          conflicts++;
        }
        
        // Check if train completed journey (simplified)
        if (minute > 30 && Math.random() > 0.7) {
          train.status = 'stopped';
          completedTrains++;
        }
      }
    }
    
    return {
      minute,
      totalDelay,
      conflicts,
      completedTrains,
      activeTrains: trains.filter(t => t.status === 'running').length
    };
  }
  
  private static calculateSimulationEfficiency(results: any[]): number {
    const finalResult = results[results.length - 1];
    const totalConflicts = results.reduce((sum, r) => sum + r.conflicts, 0);
    const efficiency = Math.max(0, 100 - (totalConflicts * 5) - (finalResult.totalDelay * 0.1));
    return Math.round(efficiency * 100) / 100;
  }
}