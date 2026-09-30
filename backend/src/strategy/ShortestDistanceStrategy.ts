import type { RouteSegment } from '../domain/RouteSegment.js';
import { BaseRoutingStrategy, type PathResult } from './BaseRoutingStrategy.js';

export class ShortestDistanceStrategy extends BaseRoutingStrategy {
  readonly id = 'shortest-distance';
  readonly name = 'Menor distancia';

  protected edgeCost(segment: RouteSegment): number {
    return segment.distanceKm;
  }

  protected selectNext(
    candidates: Array<{ pointId: string; path: PathResult }>,
  ): { pointId: string; path: PathResult } {
    return candidates.reduce((best, c) => (c.path.cost < best.path.cost ? c : best));
  }
}
