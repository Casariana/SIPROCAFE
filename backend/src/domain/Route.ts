export class Route {
  constructor(
    readonly pointIds: string[],
    readonly segmentIds: string[],
    readonly totalDistanceKm: number,
    readonly estimatedTimeMin: number,
    readonly strategyId: string,
  ) {}

  usesSegment(segmentId: string): boolean {
    return this.segmentIds.includes(segmentId);
  }
}
