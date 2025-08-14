import { useState, useCallback } from 'react';

export function usePerformanceMetrics() {
  const [metrics, setMetrics] = useState({
    latency: null,
    confidence: null,
    startTime: null
  });

  const startMeasurement = useCallback(() => {
    setMetrics(prev => ({
      ...prev,
      startTime: performance.now()
    }));
  }, []);

  const endMeasurement = useCallback((confidence = null) => {
    setMetrics(prev => {
      if (!prev.startTime) return prev;
      
      const endTime = performance.now();
      const latency = Math.round(endTime - prev.startTime);
      
      return {
        ...prev,
        latency,
        confidence: confidence || prev.confidence,
        startTime: null
      };
    });
  }, []);

  const resetMetrics = useCallback(() => {
    setMetrics({
      latency: null,
      confidence: null,
      startTime: null
    });
  }, []);

  return {
    metrics,
    startMeasurement,
    endMeasurement,
    resetMetrics
  };
} 