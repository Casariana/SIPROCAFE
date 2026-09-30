import type { RouteSegment } from '../domain/RouteSegment.js';
import { BaseRoutingStrategy, type PathResult } from './BaseRoutingStrategy.js';

export class FastestRouteStrategy extends BaseRoutingStrategy {
  readonly id = 'fastest-route';
  readonly name = 'Menor tiempo';

  protected edgeCost(segment: RouteSegment): number {
    return segment.effectiveTimeMin();
  }

  protected selectNext(
    candidates: Array<{ pointId: string; path: PathResult }>,
  ): { pointId: string; path: PathResult } {
    return candidates.reduce((best, c) => (c.path.cost < best.path.cost ? c : best));
  }
}
