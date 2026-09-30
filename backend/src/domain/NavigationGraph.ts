import { NavigationPoint } from './NavigationPoint.js';
import { RouteSegment } from './RouteSegment.js';
import type { SegmentStatus } from './types.js';

export class NavigationGraph {
  private readonly points = new Map<string, NavigationPoint>();
  private readonly segments = new Map<string, RouteSegment>();

  constructor(
    readonly id: string,
    readonly name: string,
  ) {}

  addPoint(point: NavigationPoint): void {
    this.points.set(point.id, point);
  }

  addSegment(segment: RouteSegment): void {
    if (!this.points.has(segment.fromId) || !this.points.has(segment.toId)) {
      throw new Error(`Segmento ${segment.id}: extremos inexistentes`);
    }
    this.segments.set(segment.id, segment);
  }

  getPoint(id: string): NavigationPoint {
    const p = this.points.get(id);
    if (!p) throw new Error(`Punto no encontrado: ${id}`);
    return p;
  }

  getSegment(id: string): RouteSegment {
    const s = this.segments.get(id);
    if (!s) throw new Error(`Segmento no encontrado: ${id}`);
    return s;
  }

  allPoints(): NavigationPoint[] {
    return [...this.points.values()];
  }

  allSegments(): RouteSegment[] {
    return [...this.segments.values()];
  }

  lotePoints(): NavigationPoint[] {
    return this.allPoints().filter((p) => p.isLote());
  }

  setSegmentStatus(segmentId: string, status: SegmentStatus): SegmentStatus {
    const segment = this.getSegment(segmentId);
    const previous = segment.status;
    segment.status = status;
    return previous;
  }

  /**
   * Vecinos transitables (excluye BLOQUEADO). Grafo bidireccional.
   */
  traversableNeighbors(pointId: string): Array<{ segment: RouteSegment; toId: string }> {
    const result: Array<{ segment: RouteSegment; toId: string }> = [];
    for (const segment of this.segments.values()) {
      if (!segment.isTraversable()) continue;
      if (segment.fromId === pointId) {
        result.push({ segment, toId: segment.toId });
      } else if (segment.toId === pointId) {
        result.push({ segment, toId: segment.fromId });
      }
    }
    return result;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      points: this.allPoints().map((p) => ({
        id: p.id,
        name: p.name,
        type: p.type,
        priority: p.priority,
        loteId: p.loteId,
      })),
      segments: this.allSegments().map((s) => ({
        id: s.id,
        fromId: s.fromId,
        toId: s.toId,
        distanceKm: s.distanceKm,
        timeMin: s.timeMin,
        status: s.status,
      })),
    };
  }
}
