export interface RouteMetrics {
  totalDistanceKm: number;
  estimatedTimeMin: number;
  calculationTimeMs: number;
  segmentCount: number;
  visitedNodeCount: number;
  recalculationCount: number;
  strategyId: string;
  strategyName: string;
}
