import type { SegmentStatus } from './types.js';
import { CONGESTION_TIME_FACTOR } from './types.js';

export class RouteSegment {
  constructor(
    readonly id: string,
    readonly fromId: string,
    readonly toId: string,
    readonly distanceKm: number,
    readonly timeMin: number,
    public status: SegmentStatus = 'NORMAL',
  ) {}

  /** Tiempo efectivo según DT-01. */
  effectiveTimeMin(): number {
    if (this.status === 'BLOQUEADO') return Number.POSITIVE_INFINITY;
    if (this.status === 'CONGESTIONADO') return this.timeMin * CONGESTION_TIME_FACTOR;
    return this.timeMin;
  }

  isTraversable(): boolean {
    return this.status !== 'BLOQUEADO';
  }
}
