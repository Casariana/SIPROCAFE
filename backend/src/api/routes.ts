import { Router, type Request, type Response } from 'express';
import type { NavigationService } from '../service/NavigationService.js';
import type { StrategyEngine } from '../strategy/StrategyEngine.js';
import type { RouteConditionMonitor } from '../observer/RouteConditionMonitor.js';
import type { NavigationGraph } from '../domain/NavigationGraph.js';
import type { SegmentStatus } from '../domain/types.js';

export function createNavigationRouter(deps: {
  graph: NavigationGraph;
  service: NavigationService;
  strategyEngine: StrategyEngine;
  monitor: RouteConditionMonitor;
}): Router {
  const router = Router();
  const { graph, service, strategyEngine, monitor } = deps;

  router.get('/graph', (_req, res) => {
    res.json(graph.toJSON());
  });

  router.get('/strategies', (_req, res) => {
    res.json(strategyEngine.list());
  });

  router.post('/route/calculate', (req: Request, res: Response) => {
    try {
      const { originId, destinationIds, strategyId } = req.body as {
        originId: string;
        destinationIds: string[];
        strategyId: string;
      };
      if (!originId || !Array.isArray(destinationIds) || destinationIds.length === 0 || !strategyId) {
        res.status(400).json({ error: 'originId, destinationIds[] y strategyId son requeridos' });
        return;
      }
      const result = service.calculateRoute(originId, destinationIds, strategyId);
      res.json({
        route: result.route,
        metrics: result.metrics,
        graph: graph.toJSON(),
      });
    } catch (err) {
      res.status(400).json({ error: (err as Error).message });
    }
  });

  router.post('/route/strategy', (req: Request, res: Response) => {
    try {
      const { strategyId } = req.body as { strategyId: string };
      if (!strategyId) {
        res.status(400).json({ error: 'strategyId es requerido' });
        return;
      }
      const result = service.changeStrategy(strategyId);
      res.json({
        route: result.route,
        metrics: result.metrics,
        message: result.message,
        graph: graph.toJSON(),
      });
    } catch (err) {
      res.status(400).json({ error: (err as Error).message });
    }
  });

  router.patch('/segments/:id/status', (req: Request, res: Response) => {
    try {
      const segmentId = req.params.id;
      const { status } = req.body as { status: SegmentStatus };
      if (!status || !['NORMAL', 'CONGESTIONADO', 'BLOQUEADO'].includes(status)) {
        res.status(400).json({ error: 'status debe ser NORMAL | CONGESTIONADO | BLOQUEADO' });
        return;
      }
      const condition = monitor.setSegmentStatus(segmentId, status);
      const state = service.getActiveState();
      res.json({
        condition: {
          segmentId: condition.segmentId,
          status: condition.status,
          previousStatus: condition.previousStatus,
          changedAt: condition.changedAt,
        },
        route: state.route,
        metrics: state.metrics,
        message: state.message,
        conditionChanged: state.conditionChanged,
        recalculated: state.recalculated,
        graph: graph.toJSON(),
      });
    } catch (err) {
      res.status(400).json({ error: (err as Error).message });
    }
  });

  router.post('/route/recalculate', (_req, res) => {
    try {
      const result = service.recalculateRoute();
      res.json({
        route: result.route,
        metrics: result.metrics,
        message: result.message,
        recalculated: true,
        graph: graph.toJSON(),
      });
    } catch (err) {
      res.status(400).json({ error: (err as Error).message });
    }
  });

  router.post('/route/compare', (req: Request, res: Response) => {
    try {
      const { originId, destinationIds } = req.body as {
        originId: string;
        destinationIds: string[];
      };
      if (!originId || !Array.isArray(destinationIds) || destinationIds.length === 0) {
        res.status(400).json({ error: 'originId y destinationIds[] son requeridos' });
        return;
      }
      const comparison = service.compareStrategies(originId, destinationIds);
      res.json({ comparison });
    } catch (err) {
      res.status(400).json({ error: (err as Error).message });
    }
  });

  router.get('/metrics/last', (_req, res) => {
    res.json({ metrics: service.getLastMetrics(), state: service.getActiveState() });
  });

  return router;
}
