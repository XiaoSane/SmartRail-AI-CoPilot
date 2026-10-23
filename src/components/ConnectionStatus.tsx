import { useState, useEffect } from "react";
import { AlertCircle, Wifi, WifiOff } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";
import { projectId, publicAnonKey } from "../utils/supabase/info";

export function ConnectionStatus() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const checkConnection = async () => {
    if (isChecking) return;
    
    setIsChecking(true);
    try {
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0a078106/health`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
        }
      );
      
      clearTimeout(timeoutId);
      setIsConnected(response.ok);
    } catch (error) {
      setIsConnected(false);
      // Only log non-abort errors to reduce noise
      if (error instanceof Error && error.name !== 'AbortError') {
        console.log('Connection check failed (expected in demo mode):', error.name);
      }
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkConnection();
    
    // Check connection every 2 minutes
    const interval = setInterval(checkConnection, 120000);
    return () => clearInterval(interval);
  }, []);

  if (isConnected === null) {
    return null; // Don't show anything while initial check is running
  }

  return null;
}