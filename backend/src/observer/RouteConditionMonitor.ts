import { RouteCondition } from '../domain/RouteCondition.js';
import type { SegmentStatus } from '../domain/types.js';

export interface RouteConditionObserver {
  onConditionChanged(condition: RouteCondition): void;
}

/**
 * Subject del patrón Observer.
 * Único punto de mutación de estado de segmentos con notificación.
 */
export class RouteConditionMonitor {
  private readonly observers: RouteConditionObserver[] = [];

  constructor(
    private readonly applyStatus: (
      segmentId: string,
      status: SegmentStatus,
    ) => SegmentStatus,
  ) {}

  attach(observer: RouteConditionObserver): void {
    if (!this.observers.includes(observer)) {
      this.observers.push(observer);
    }
  }

  detach(observer: RouteConditionObserver): void {
    const i = this.observers.indexOf(observer);
    if (i >= 0) this.observers.splice(i, 1);
  }

  setSegmentStatus(segmentId: string, status: SegmentStatus): RouteCondition {
    const previousStatus = this.applyStatus(segmentId, status);
    const condition = new RouteCondition(segmentId, status, new Date(), previousStatus);
    if (previousStatus !== status) {
      this.notify(condition);
    }
    return condition;
  }

  notify(condition: RouteCondition): void {
    for (const observer of [...this.observers]) {
      observer.onConditionChanged(condition);
    }
  }
}
