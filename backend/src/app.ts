import express from 'express';
import cors from 'cors';
import { GraphRepository } from './repository/GraphRepository.js';
import { StrategyEngine } from './strategy/StrategyEngine.js';
import { NavigationService } from './service/NavigationService.js';
import { RouteConditionMonitor } from './observer/RouteConditionMonitor.js';
import { createNavigationRouter } from './api/routes.js';

export function createApp(dataPath?: string) {
  const repo = new GraphRepository(dataPath);
  const graph = repo.getGraph();
  const strategyEngine = new StrategyEngine();
  const service = new NavigationService(graph, strategyEngine);
  const monitor = new RouteConditionMonitor((segmentId, status) =>
    graph.setSegmentStatus(segmentId, status),
  );
  monitor.attach(service);

  const app = express();
  app.use(cors());
  app.use(express.json());
  app.get('/health', (_req, res) => res.json({ ok: true, module: 'SIPROCAFE-NAVIGATION' }));
  app.use('/api/navigation', createNavigationRouter({ graph, service, strategyEngine, monitor }));

  return { app, graph, service, strategyEngine, monitor, repo };
}
