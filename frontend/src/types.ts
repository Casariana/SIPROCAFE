// SIPROCAFE Navigation - Tipos del dominio (espejo minimo del backend)
// Fuente: docs/blueprint/BLUEPRINT-TECNICO.md (seccion 2 y 9)

export type PointType = 'ENTRADA' | 'LOTE' | 'BODEGA' | 'POI';

export type Priority = 'NORMAL' | 'ALTA' | 'URGENTE';

export type SegmentStatus = 'NORMAL' | 'CONGESTIONADO' | 'BLOQUEADO';

export interface NavigationPoint {
  id: string;
  name: string;
  type: PointType;
  priority?: Priority;
  loteId?: string;
}

export interface RouteSegment {
  id: string;
  fromId: string;
  toId: string;
  distanceKm: number;
  timeMin: number;
  status: SegmentStatus;
}

export interface NavigationGraph {
  id: string;
  name: string;
  points: NavigationPoint[];
  segments: RouteSegment[];
}

export interface Route {
  pointIds: string[];
  segmentIds: string[];
  totalDistanceKm: number;
  estimatedTimeMin: number;
}

export interface RouteMetrics {
  totalDistanceKm: number;
  estimatedTimeMin: number;
  calculationTimeMs: number;
  segmentCount: number;
  visitedNodeCount: number;
  recalculationCount: number;
  strategyId?: string;
  strategyName?: string;
}

export interface StrategyInfo {
  id: string;
  name: string;
}

export interface RoutePlanRequest {
  originId: string;
  destinationIds: string[];
  strategyId: string;
}

// Forma comun de respuesta de los endpoints de ruta (calculate/strategy/recalculate/segments-status).
export interface RouteCalculationResult {
  route: Route;
  metrics: RouteMetrics;
  message?: string;
  conditionChanged?: boolean;
  recalculated?: boolean;
  strategyId?: string;
  graph?: NavigationGraph;
}

export interface CompareStrategyResult {
  strategyId: string;
  strategyName: string;
  route: Route;
  metrics: RouteMetrics;
}

export interface CompareResponse {
  comparison: CompareStrategyResult[];
  message?: string;
}
