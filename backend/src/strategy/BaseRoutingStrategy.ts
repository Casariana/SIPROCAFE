import type { NavigationGraph } from '../domain/NavigationGraph.js';
import type { RouteSegment } from '../domain/RouteSegment.js';
import { Route } from '../domain/Route.js';
import type { RoutePlan } from '../domain/RoutePlan.js';
import type { RoutingStrategy } from './RoutingStrategy.js';

export interface PathResult {
  reachable: boolean;
  pointIds: string[];
  segmentIds: string[];
  cost: number;
  distanceKm: number;
  timeMin: number;
}

/**
 * Esqueleto compartido: Dijkstra entre pares + Nearest Neighbor (DT-02).
 * Cada estrategia redefine edgeCost y selectNext — sin ifs en NavigationService.
 */
export abstract class BaseRoutingStrategy implements RoutingStrategy {
  abstract readonly id: string;
  abstract readonly name: string;

  protected abstract edgeCost(segment: RouteSegment): number;

  protected abstract selectNext(
    candidates: Array<{ pointId: string; path: PathResult }>,
    graph: NavigationGraph,
  ): { pointId: string; path: PathResult };

  calculate(graph: NavigationGraph, plan: RoutePlan): Route {
    const pending = new Set(plan.destinationIds);
    let current = plan.originId;
    const pointIds: string[] = [current];
    const segmentIds: string[] = [];
    let totalDistance = 0;
    let totalTime = 0;

    while (pending.size > 0) {
      const candidates: Array<{ pointId: string; path: PathResult }> = [];
      for (const dest of pending) {
        const path = this.dijkstra(graph, current, dest);
        if (path.reachable) candidates.push({ pointId: dest, path });
      }
      if (candidates.length === 0) {
        throw new Error(`Puntos inalcanzables desde ${current}: ${[...pending].join(', ')}`);
      }

      const chosen = this.selectNext(candidates, graph);
      for (let i = 1; i < chosen.path.pointIds.length; i++) {
        pointIds.push(chosen.path.pointIds[i]);
      }
      segmentIds.push(...chosen.path.segmentIds);
      totalDistance += chosen.path.distanceKm;
      totalTime += chosen.path.timeMin;

      for (const id of chosen.path.pointIds) {
        pending.delete(id);
      }
      current = chosen.pointId;
    }

    return new Route(pointIds, segmentIds, round2(totalDistance), round2(totalTime), this.id);
  }

  protected dijkstra(graph: NavigationGraph, fromId: string, toId: string): PathResult {
    if (fromId === toId) {
      return { reachable: true, pointIds: [fromId], segmentIds: [], cost: 0, distanceKm: 0, timeMin: 0 };
    }

    const dist = new Map<string, number>();
    const prev = new Map<string, { pointId: string; segment: RouteSegment } | null>();
    const visited = new Set<string>();

    for (const p of graph.allPoints()) {
      dist.set(p.id, Number.POSITIVE_INFINITY);
      prev.set(p.id, null);
    }
    dist.set(fromId, 0);

    while (true) {
      let u: string | null = null;
      let best = Number.POSITIVE_INFINITY;
      for (const [id, d] of dist) {
        if (!visited.has(id) && d < best) {
          best = d;
          u = id;
        }
      }
      if (u === null || best === Number.POSITIVE_INFINITY) break;
      if (u === toId) break;
      visited.add(u);

      for (const { segment, toId: v } of graph.traversableNeighbors(u)) {
        if (visited.has(v)) continue;
        const cost = this.edgeCost(segment);
        if (!Number.isFinite(cost)) continue;
        const alt = best + cost;
        if (alt < (dist.get(v) ?? Number.POSITIVE_INFINITY)) {
          dist.set(v, alt);
          prev.set(v, { pointId: u, segment });
        }
      }
    }

    const endCost = dist.get(toId) ?? Number.POSITIVE_INFINITY;
    if (!Number.isFinite(endCost)) {
      return { reachable: false, pointIds: [], segmentIds: [], cost: Infinity, distanceKm: 0, timeMin: 0 };
    }

    const pointIdsRev: string[] = [];
    const segmentIdsRev: string[] = [];
    let cur: string | null = toId;
    let distanceKm = 0;
    let timeMin = 0;
    while (cur && cur !== fromId) {
      pointIdsRev.push(cur);
      const step = prev.get(cur);
      if (!step) {
        return { reachable: false, pointIds: [], segmentIds: [], cost: Infinity, distanceKm: 0, timeMin: 0 };
      }
      segmentIdsRev.push(step.segment.id);
      distanceKm += step.segment.distanceKm;
      timeMin += step.segment.effectiveTimeMin();
      cur = step.pointId;
    }
    pointIdsRev.push(fromId);
    pointIdsRev.reverse();
    segmentIdsRev.reverse();

    return {
      reachable: true,
      pointIds: pointIdsRev,
      segmentIds: segmentIdsRev,
      cost: endCost,
      distanceKm,
      timeMin,
    };
  }
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
