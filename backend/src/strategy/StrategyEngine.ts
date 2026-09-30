import type { RoutingStrategy } from './RoutingStrategy.js';
import { ShortestDistanceStrategy } from './ShortestDistanceStrategy.js';
import { FastestRouteStrategy } from './FastestRouteStrategy.js';
import { PriorityRouteStrategy } from './PriorityRouteStrategy.js';

/** Resuelve strategyId → instancia. Sin lógica de algoritmo. */
export class StrategyEngine {
  private readonly strategies = new Map<string, RoutingStrategy>();

  constructor() {
    this.register(new ShortestDistanceStrategy());
    this.register(new FastestRouteStrategy());
    this.register(new PriorityRouteStrategy());
  }

  register(strategy: RoutingStrategy): void {
    this.strategies.set(strategy.id, strategy);
  }

  resolve(strategyId: string): RoutingStrategy {
    const s = this.strategies.get(strategyId);
    if (!s) throw new Error(`Estrategia desconocida: ${strategyId}`);
    return s;
  }

  list(): Array<{ id: string; name: string }> {
    return [...this.strategies.values()].map((s) => ({ id: s.id, name: s.name }));
  }
}
