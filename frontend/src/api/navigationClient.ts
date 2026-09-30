// SIPROCAFE Navigation - Cliente HTTP hacia la Navigation API
// Base: /api/navigation (proxeada por Vite hacia http://localhost:3001)

import type {
  CompareResponse,
  NavigationGraph,
  RouteCalculationResult,
  RouteMetrics,
  RoutePlanRequest,
  SegmentStatus,
  StrategyInfo,
} from '../types';

const BASE_URL = '/api/navigation';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
  } catch {
    throw new Error(
      'No se pudo contactar la API de navegacion. Verifique que el backend este activo en http://localhost:3001.'
    );
  }

  if (!response.ok) {
    let detail = response.statusText;
    try {
      const body = await response.json();
      if (body && typeof body.error === 'string') {
        detail = body.error;
      } else if (body && typeof body.message === 'string') {
        detail = body.message;
      }
    } catch {
      // Cuerpo no era JSON, se mantiene el detalle por defecto.
    }
    throw new Error(`Error ${response.status}: ${detail}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export function getGraph(): Promise<NavigationGraph> {
  return request<NavigationGraph>('/graph');
}

export function getStrategies(): Promise<StrategyInfo[]> {
  return request<StrategyInfo[]>('/strategies');
}

export function calculateRoute(payload: RoutePlanRequest): Promise<RouteCalculationResult> {
  return request<RouteCalculationResult>('/route/calculate', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function setStrategy(strategyId: string): Promise<RouteCalculationResult> {
  return request<RouteCalculationResult>('/route/strategy', {
    method: 'POST',
    body: JSON.stringify({ strategyId }),
  });
}

export function setSegmentStatus(
  segmentId: string,
  status: SegmentStatus
): Promise<RouteCalculationResult> {
  return request<RouteCalculationResult>(`/segments/${segmentId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export function recalculateRoute(): Promise<RouteCalculationResult> {
  return request<RouteCalculationResult>('/route/recalculate', {
    method: 'POST',
  });
}

export function compareStrategies(
  originId: string,
  destinationIds: string[]
): Promise<CompareResponse> {
  return request<CompareResponse>('/route/compare', {
    method: 'POST',
    body: JSON.stringify({ originId, destinationIds }),
  });
}

export function getLastMetrics(): Promise<RouteMetrics> {
  return request<RouteMetrics>('/metrics/last');
}
