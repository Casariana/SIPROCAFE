import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it, expect, beforeEach } from 'vitest';
import { createApp } from '../backend/src/app.js';
import type { RouteMetrics } from '../backend/src/domain/RouteMetrics.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const metricsPath = join(__dirname, '../docs/metrics/results.json');

const collected: Array<Record<string, unknown>> = [];

function record(caseId: string, metrics: RouteMetrics, extra?: Record<string, unknown>) {
  collected.push({
    caseId,
    recordedAt: new Date().toISOString(),
    ...metrics,
    ...extra,
  });
}

describe('SIPROCAFE Navigation — escenarios reproducibles', () => {
  let service: ReturnType<typeof createApp>['service'];
  let graph: ReturnType<typeof createApp>['graph'];
  let monitor: ReturnType<typeof createApp>['monitor'];

  beforeEach(() => {
    ({ service, graph, monitor } = createApp());
  });

  it('Caso 1 — mapa pequeño, menor distancia', () => {
    const result = service.calculateRoute('entrada', ['lote-a', 'lote-b', 'lote-d'], 'shortest-distance');
    expect(result.route.pointIds[0]).toBe('entrada');
    expect(result.route.pointIds).toEqual(expect.arrayContaining(['lote-a', 'lote-b', 'lote-d']));
    expect(result.metrics.totalDistanceKm).toBeGreaterThan(0);
    expect(result.metrics.estimatedTimeMin).toBeGreaterThan(0);
    expect(result.metrics.segmentCount).toBeGreaterThan(0);
    record('caso1-mapa-pequeno-shortest', result.metrics, { path: result.route.pointIds });
  });

  it('Caso 2 — misma plan, otra estrategia (Strategy)', () => {
    const d = service.calculateRoute('entrada', ['lote-a', 'lote-b', 'lote-d'], 'shortest-distance');
    const t = service.calculateRoute('entrada', ['lote-a', 'lote-b', 'lote-d'], 'fastest-route');
    const p = service.calculateRoute('entrada', ['lote-a', 'lote-b', 'lote-d'], 'priority-route');

    expect(d.metrics.strategyId).toBe('shortest-distance');
    expect(t.metrics.strategyId).toBe('fastest-route');
    expect(p.metrics.strategyId).toBe('priority-route');

    // Las tres producen rutas válidas; pueden diferir en orden o métricas
    expect(d.route.pointIds.length).toBeGreaterThan(1);
    expect(t.route.pointIds.length).toBeGreaterThan(1);
    expect(p.route.pointIds.length).toBeGreaterThan(1);

    record('caso2-shortest', d.metrics, { path: d.route.pointIds });
    record('caso2-fastest', t.metrics, { path: t.route.pointIds });
    record('caso2-priority', p.metrics, { path: p.route.pointIds });
  });

  it('Caso 3 — cambio de estado Observer + recalculación', () => {
    const initial = service.calculateRoute('entrada', ['lote-a', 'lote-b', 'lote-d'], 'shortest-distance');
    const blockedSegment = initial.route.segmentIds[0];
    expect(blockedSegment).toBeTruthy();

    const previousPath = [...initial.route.pointIds];
    monitor.setSegmentStatus(blockedSegment, 'BLOQUEADO');

    const state = service.getActiveState();
    expect(state.conditionChanged).toBe(true);
    expect(state.recalculated).toBe(true);
    expect(state.metrics?.recalculationCount).toBeGreaterThanOrEqual(1);
    expect(state.route).toBeTruthy();
    // La nueva ruta no debe usar el segmento bloqueado
    expect(state.route!.segmentIds).not.toContain(blockedSegment);

    record('caso3-observer-recalc', state.metrics!, {
      blockedSegment,
      previousPath,
      newPath: state.route!.pointIds,
      message: state.message,
    });
  });

  it('Caso 4 — mapa más grande (todos los lotes) y tiempo de cálculo', () => {
    const result = service.calculateRoute(
      'entrada',
      ['lote-a', 'lote-b', 'lote-c', 'lote-d', 'lote-e'],
      'shortest-distance',
    );
    expect(result.route.pointIds).toEqual(
      expect.arrayContaining(['lote-a', 'lote-b', 'lote-c', 'lote-d', 'lote-e']),
    );
    expect(result.metrics.calculationTimeMs).toBeGreaterThanOrEqual(0);
    expect(Number.isFinite(result.metrics.calculationTimeMs)).toBe(true);
    record('caso4-mapa-grande', result.metrics, { path: result.route.pointIds });
  });

  it('Comparación de las tres estrategias (métricas reales)', () => {
    const comparison = service.compareStrategies('entrada', ['lote-a', 'lote-b', 'lote-d']);
    expect(comparison).toHaveLength(3);
    for (const item of comparison) {
      record(`compare-${item.strategyId}`, item.metrics, { path: item.route.pointIds });
    }
  });

  it('Persiste métricas reales en docs/metrics/results.json', () => {
    mkdirSync(dirname(metricsPath), { recursive: true });
    writeFileSync(
      metricsPath,
      JSON.stringify(
        {
          note: 'Resultados obtenidos por ejecución real de pruebas. No inventados.',
          generatedAt: new Date().toISOString(),
          graph: graph.name,
          results: collected,
        },
        null,
        2,
      ),
      'utf-8',
    );
    expect(collected.length).toBeGreaterThan(0);
  });
});
