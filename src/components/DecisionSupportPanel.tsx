import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Brain, CheckCircle, Clock, AlertTriangle, TrendingUp, RefreshCw, Zap, MapPin, Target, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { projectId, publicAnonKey } from "../utils/supabase/info";
import { toast } from "sonner@2.0.3";
import { PlatformAllocation } from "./PlatformAllocation";
import { SmartSchedulingDemo } from "./SmartSchedulingDemo";
import { PreferenceManagement } from "./PreferenceManagement";

interface Recommendation {
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

// Sample recommendations for demo mode
const SAMPLE_RECOMMENDATIONS: Recommendation[] = [
  {
    id: "rec_001",
    type: "precedence",
    priority: "high",
    trainId: "T001",
    action: "Give precedence to Rajdhani Express",
    reasoning: "Based on train priorities and optimization algorithms. Rajdhani Express (express) should proceed first to minimize overall system delay. Priority scores: 120 vs 65.",
    confidence: 0.92,
    estimatedDelay: 3,
    throughputImpact: 8.5
  },
  {
    id: "rec_002", 
    type: "crossing",
    priority: "medium",
    trainId: "T003",
    action: "Route Freight 2401 via alternate path",
    reasoning: "Freight train conflict detected at Junction C. Routing via loop line will optimize passenger flow while minimizing freight delay.",
    confidence: 0.87,
    estimatedDelay: 5,
    throughputImpact: 6.2
  }
];

const SAMPLE_METRICS = {
  punctualityRate: 87.5,
  averageDelay: 4.2,
  throughputEfficiency: 91.3,
  capacityUtilization: 68.7,
  performanceTrend: 'improving'
};

const getUrgencyColor = (priority: string) => {
  switch (priority) {
    case "high": return "bg-red-100 text-red-800 border-red-200";
    case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "low": return "bg-green-100 text-green-800 border-green-200";
    default: return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case "precedence": return <TrendingUp className="size-4" />;
    case "crossing": return <CheckCircle className="size-4" />;
    case "maintenance": return <Clock className="size-4" />;
    case "emergency": return <AlertTriangle className="size-4" />;
    default: return <Brain className="size-4" />;
  }
};

export function DecisionSupportPanel() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [processingRecommendation, setProcessingRecommendation] = useState<string | null>(null);
  const [serverAvailable, setServerAvailable] = useState(true);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      
      console.log('Fetching AI recommendations...');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0a078106/dashboard`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      console.log('Recommendations response:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch recommendations: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      setRecommendations(data.recommendations || []);
      setDashboardData(data);
      setServerAvailable(true);
      console.log('Successfully fetched recommendations:', data.recommendations?.length || 0);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      // Fallback to sample data
      console.log('Server not available, using sample recommendations');
      setRecommendations(SAMPLE_RECOMMENDATIONS);
      setDashboardData({ metrics: SAMPLE_METRICS });
      setServerAvailable(false);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      // Don't show error toast in demo mode, just log it
      console.log('Full error details:', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRecommendationAction = async (recommendationId: string, action: 'accept' | 'reject') => {
    if (!serverAvailable) {
      // Demo mode - just remove the recommendation locally
      setRecommendations(prev => prev.filter(rec => rec.id !== recommendationId));
      toast.success(`Recommendation ${action}ed successfully (Demo Mode)`);
      return;
    }
    
    try {
      setProcessingRecommendation(recommendationId);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0a078106/recommendations/${recommendationId}/action`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            action,
            feedback: action === 'accept' ? 'Recommendation implemented' : 'Not suitable for current conditions'
          }),
        }
      );
      
      if (response.ok) {
        toast.success(`Recommendation ${action}ed successfully`);
        await fetchRecommendations(); // Refresh recommendations
      } else {
        throw new Error(`Failed to ${action} recommendation`);
      }
    } catch (error) {
      console.error(`Error ${action}ing recommendation:`, error);
      toast.error(`Failed to ${action} recommendation`);
    } finally {
      setProcessingRecommendation(null);
    }
  };

  useEffect(() => {
    fetchRecommendations();
    
    // Auto-refresh every 45 seconds to reduce server load
    const interval = setInterval(fetchRecommendations, 45000);
    return () => clearInterval(interval);
  }, []);

  const totalThroughputImprovement = recommendations.reduce((sum, rec) => 
    sum + Math.abs(rec.throughputImpact || 0), 0
  );

  if (loading && recommendations.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="size-5" />
            AI Decision Support
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2 text-muted-foreground">
            <RefreshCw className="size-4 animate-spin" />
            Analyzing traffic patterns...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="preference-management" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="preference-management" className="flex items-center gap-2">
            <Settings className="size-4" />
            Preference Management
          </TabsTrigger>
          <TabsTrigger value="smart-scheduling" className="flex items-center gap-2">
            <Zap className="size-4" />
            SmartRail Core
          </TabsTrigger>
          <TabsTrigger value="platform-allocation" className="flex items-center gap-2">
            <MapPin className="size-4" />
            Platform AI
          </TabsTrigger>
          <TabsTrigger value="decision-support" className="flex items-center gap-2">
            <Brain className="size-4" />
            Decision Support
          </TabsTrigger>
          <TabsTrigger value="optimization" className="flex items-center gap-2">
            <Target className="size-4" />
            Route Optimization
          </TabsTrigger>
        </TabsList>

        <TabsContent value="preference-management">
          <PreferenceManagement />
        </TabsContent>

        <TabsContent value="smart-scheduling">
          <SmartSchedulingDemo />
        </TabsContent>

        <TabsContent value="platform-allocation">
          <PlatformAllocation />
        </TabsContent>

        <TabsContent value="decision-support">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Brain className="size-5" />
                  AI Decision Support
                  {!serverAvailable && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                      Demo Mode
                    </span>
                  )}
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={fetchRecommendations}
                  disabled={loading}
                >
                  <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 max-h-96 overflow-y-auto">
              {recommendations.length > 0 && (
                <Alert>
                  <Zap className="size-4" />
                  <AlertDescription>
                    {recommendations.length} optimization opportunities detected. 
                    Estimated total throughput improvement: {totalThroughputImprovement.toFixed(1)}%
                  </AlertDescription>
                </Alert>
              )}
              
              {recommendations.map((rec) => (
                <div key={rec.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2 flex-wrap">
                      {getTypeIcon(rec.type)}
                      <h4 className="font-medium text-sm">{rec.action}</h4>
                      <Badge className={getUrgencyColor(rec.priority)}>
                        {rec.priority} priority
                      </Badge>
                      <Badge variant="outline">
                        {rec.type}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      Train: {rec.trainId}
                    </span>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">{rec.reasoning}</p>
                  
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div className="text-center p-2 bg-green-50 rounded">
                      <div className="font-medium text-green-600">
                        {rec.throughputImpact > 0 ? '+' : ''}{rec.throughputImpact.toFixed(1)}%
                      </div>
                      <div className="text-green-700">Throughput</div>
                    </div>
                    <div className="text-center p-2 bg-blue-50 rounded">
                      <div className="font-medium text-blue-600">
                        {rec.estimatedDelay ? `+${rec.estimatedDelay}min` : 'No delay'}
                      </div>
                      <div className="text-blue-700">Est. Delay</div>
                    </div>
                    <div className="text-center p-2 bg-purple-50 rounded">
                      <div className="font-medium text-purple-600">
                        {Math.round(rec.confidence * 100)}%
                      </div>
                      <div className="text-purple-700">Confidence</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">
                      AI Analysis: Python-based conflict resolution algorithm
                      {!serverAvailable && " (Demo Mode)"}
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleRecommendationAction(rec.id, 'reject')}
                        disabled={processingRecommendation === rec.id}
                      >
                        {processingRecommendation === rec.id ? (
                          <RefreshCw className="size-3 animate-spin" />
                        ) : (
                          'Reject'
                        )}
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => handleRecommendationAction(rec.id, 'accept')}
                        disabled={processingRecommendation === rec.id}
                      >
                        {processingRecommendation === rec.id ? (
                          <RefreshCw className="size-3 animate-spin" />
                        ) : (
                          'Apply'
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {recommendations.length === 0 && !loading && (
                <div className="text-center py-8 text-muted-foreground">
                  <Brain className="size-8 mx-auto mb-2 opacity-50" />
                  <p>No optimization recommendations at this time</p>
                  <p className="text-sm mt-1">
                    AI is monitoring traffic patterns for opportunities
                  </p>
                </div>
              )}

              {dashboardData?.metrics && (
                <div className="border-t pt-4 mt-4">
                  <h4 className="font-medium mb-2 text-sm">Current System Performance</h4>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-2 bg-muted rounded">
                      <div className="font-medium">Punctuality Rate</div>
                      <div className="text-lg">{dashboardData.metrics.punctualityRate.toFixed(1)}%</div>
                    </div>
                    <div className="p-2 bg-muted rounded">
                      <div className="font-medium">Avg Delay</div>
                      <div className="text-lg">{dashboardData.metrics.averageDelay.toFixed(1)}min</div>
                    </div>
                    <div className="p-2 bg-muted rounded">
                      <div className="font-medium">Throughput Efficiency</div>
                      <div className="text-lg">{dashboardData.metrics.throughputEfficiency.toFixed(1)}%</div>
                    </div>
                    <div className="p-2 bg-muted rounded">
                      <div className="font-medium">Capacity Usage</div>
                      <div className="text-lg">{dashboardData.metrics.capacityUtilization.toFixed(1)}%</div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimization">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="size-5" />
                Route Optimization Engine
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Target className="size-8 mx-auto mb-2 opacity-50" />
                <p>Route optimization algorithms coming soon</p>
                <p className="text-sm mt-1">
                  Advanced pathfinding and scheduling optimization
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}