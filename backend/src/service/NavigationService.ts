import type { NavigationGraph } from '../domain/NavigationGraph.js';
import type { Route } from '../domain/Route.js';
import { RoutePlan } from '../domain/RoutePlan.js';
import type { RouteCondition } from '../domain/RouteCondition.js';
import type { RouteMetrics } from '../domain/RouteMetrics.js';
import type { StrategyEngine } from '../strategy/StrategyEngine.js';
import type { RouteConditionObserver } from '../observer/RouteConditionMonitor.js';

export interface CalculateResult {
  route: Route;
  metrics: RouteMetrics;
  plan: RoutePlan;
  message?: string;
  conditionChanged?: boolean;
  recalculated?: boolean;
}

export interface CompareItem {
  strategyId: string;
  strategyName: string;
  route: Route;
  metrics: RouteMetrics;
}

/**
 * Orquesta planificación. Depende de RoutingStrategy vía StrategyEngine.
 * Observa RouteConditionMonitor para recalcular.
 */
export class NavigationService implements RouteConditionObserver {
  private activePlan: RoutePlan | null = null;
  private lastMetrics: RouteMetrics | null = null;
  private recalculationCount = 0;
  private lastMessage: string | undefined;
  private lastConditionChanged = false;
  private lastRecalculated = false;
  private recalculating = false;

  constructor(
    private readonly graph: NavigationGraph,
    private readonly strategyEngine: StrategyEngine,
  ) {}

  calculateRoute(originId: string, destinationIds: string[], strategyId: string): CalculateResult {
    this.recalculationCount = 0;
    this.lastConditionChanged = false;
    this.lastRecalculated = false;
    this.lastMessage = undefined;

    const plan = new RoutePlan(originId, destinationIds, strategyId);
    const { route, metrics } = this.runStrategy(plan);
    plan.route = route;
    this.activePlan = plan;
    this.lastMetrics = metrics;

    return { route, metrics, plan };
  }

  changeStrategy(strategyId: string): CalculateResult {
    if (!this.activePlan) {
      throw new Error('No hay un plan activo. Calcule un recorrido primero.');
    }
    this.activePlan.strategyId = strategyId;
    const { route, metrics } = this.runStrategy(this.activePlan);
    this.activePlan.route = route;
    this.lastMetrics = metrics;
    this.lastMessage = `Estrategia cambiada a: ${metrics.strategyName}`;
    return {
      route,
      metrics,
      plan: this.activePlan,
      message: this.lastMessage,
    };
  }

  recalculateRoute(): CalculateResult {
    if (!this.activePlan) {
      throw new Error('No hay un plan activo para recalcular.');
    }
    this.recalculationCount += 1;
    const { route, metrics } = this.runStrategy(this.activePlan);
    this.activePlan.route = route;
    this.lastMetrics = metrics;
    this.lastRecalculated = true;
    this.lastMessage = 'Ruta recalculada.';
    return {
      route,
      metrics,
      plan: this.activePlan,
      message: this.lastMessage,
      recalculated: true,
    };
  }

  onConditionChanged(condition: RouteCondition): void {
    this.lastConditionChanged = true;
    this.lastMessage = `Cambio detectado en el recorrido (segmento ${condition.segmentId}: ${condition.previousStatus} → ${condition.status}).`;

    if (!this.activePlan?.route) return;
    if (this.recalculating) return;

    const affects =
      this.activePlan.route.usesSegment(condition.segmentId) ||
      condition.status === 'BLOQUEADO' ||
      condition.status === 'NORMAL';

    if (!affects) return;

    this.recalculating = true;
    try {
      this.recalculationCount += 1;
      const { route, metrics } = this.runStrategy(this.activePlan);
      this.activePlan.route = route;
      this.lastMetrics = metrics;
      this.lastRecalculated = true;
      this.lastMessage = `${this.lastMessage} Ruta recalculada.`;
    } catch (err) {
      this.lastMessage = `${this.lastMessage} No fue posible recalcular: ${(err as Error).message}`;
    } finally {
      this.recalculating = false;
    }
  }

  compareStrategies(originId: string, destinationIds: string[]): CompareItem[] {
    const results: CompareItem[] = [];
    for (const { id, name } of this.strategyEngine.list()) {
      const plan = new RoutePlan(originId, destinationIds, id);
      const { route, metrics } = this.runStrategy(plan);
      results.push({ strategyId: id, strategyName: name, route, metrics });
    }
    return results;
  }

  getLastMetrics(): RouteMetrics | null {
    return this.lastMetrics;
  }

  getActiveState() {
    return {
      plan: this.activePlan
        ? {
            originId: this.activePlan.originId,
            destinationIds: this.activePlan.destinationIds,
            strategyId: this.activePlan.strategyId,
          }
        : null,
      route: this.activePlan?.route ?? null,
      metrics: this.lastMetrics,
      message: this.lastMessage,
      conditionChanged: this.lastConditionChanged,
      recalculated: this.lastRecalculated,
    };
  }

  private runStrategy(plan: RoutePlan): { route: Route; metrics: RouteMetrics } {
    const strategy = this.strategyEngine.resolve(plan.strategyId);
    const start = performance.now();
    const route = strategy.calculate(this.graph, plan);
    const calculationTimeMs = Math.round((performance.now() - start) * 1000) / 1000;

    const metrics: RouteMetrics = {
      totalDistanceKm: route.totalDistanceKm,
      estimatedTimeMin: route.estimatedTimeMin,
      calculationTimeMs,
      segmentCount: route.segmentIds.length,
      visitedNodeCount: route.pointIds.length,
      recalculationCount: this.recalculationCount,
      strategyId: strategy.id,
      strategyName: strategy.name,
    };
    return { route, metrics };
  }
}
