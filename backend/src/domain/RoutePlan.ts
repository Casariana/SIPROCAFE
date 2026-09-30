import type { Route } from './Route.js';

export class RoutePlan {
  route?: Route;

  constructor(
    readonly originId: string,
    readonly destinationIds: string[],
    public strategyId: string,
  ) {}
}
