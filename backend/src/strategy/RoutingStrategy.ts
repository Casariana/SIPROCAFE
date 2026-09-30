import type { NavigationGraph } from '../domain/NavigationGraph.js';
import type { Route } from '../domain/Route.js';
import type { RoutePlan } from '../domain/RoutePlan.js';

export interface RoutingStrategy {
  readonly id: string;
  readonly name: string;
  calculate(graph: NavigationGraph, plan: RoutePlan): Route;
}
