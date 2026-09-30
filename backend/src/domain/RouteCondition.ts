import type { SegmentStatus } from './types.js';

export class RouteCondition {
  constructor(
    readonly segmentId: string,
    readonly status: SegmentStatus,
    readonly changedAt: Date = new Date(),
    readonly previousStatus?: SegmentStatus,
  ) {}
}
