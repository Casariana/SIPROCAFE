import type { RouteSegment } from '../domain/RouteSegment.js';
import type { NavigationGraph } from '../domain/NavigationGraph.js';
import { PRIORITY_RANK } from '../domain/types.js';
import { BaseRoutingStrategy, type PathResult } from './BaseRoutingStrategy.js';

/**
 * Visita primero URGENTE → ALTA → NORMAL; a igual prioridad, menor tiempo (DT-02).
 */
export class PriorityRouteStrategy extends BaseRoutingStrategy {
  readonly id = 'priority-route';
  readonly name = 'Prioridad de lotes';

  protected edgeCost(segment: RouteSegment): number {
    return segment.effectiveTimeMin();
  }

  protected selectNext(
    candidates: Array<{ pointId: string; path: PathResult }>,
    graph: NavigationGraph,
  ): { pointId: string; path: PathResult } {
    return candidates.reduce((best, c) => {
      const pC = PRIORITY_RANK[graph.getPoint(c.pointId).priority] ?? 1;
      const pB = PRIORITY_RANK[graph.getPoint(best.pointId).priority] ?? 1;
      if (pC !== pB) return pC > pB ? c : best;
      return c.path.cost < best.path.cost ? c : best;
    });
  }
}
