import { useMemo } from 'react';
import type { NavigationGraph, NavigationPoint, Route, SegmentStatus } from '../types';

interface GraphViewProps {
  graph: NavigationGraph;
  activeRoute: Route | null;
  originId: string;
  selectedDestinationIds: string[];
  selectedSegmentId: string | null;
  onSelectSegment: (segmentId: string) => void;
}

interface Point2D {
  x: number;
  y: number;
}

// Posiciones fijas del escenario demo "Finca El Horizonte" (grafo simulado, no coordenadas reales).
const FIXED_POSITIONS: Record<string, Point2D> = {
  entrada: { x: 200, y: 350 },
  'lote-a': { x: 80, y: 200 },
  'lote-b': { x: 200, y: 80 },
  'lote-c': { x: 320, y: 80 },
  'lote-d': { x: 80, y: 320 },
  'lote-e': { x: 320, y: 200 },
  bodega: { x: 200, y: 450 },
};

const STATUS_COLORS: Record<SegmentStatus, string> = {
  NORMAL: '#9a958a',
  CONGESTIONADO: '#c9762c',
  BLOQUEADO: '#b3261e',
};

const ACTIVE_ROUTE_COLOR = '#1d6fa5';

function fallbackPosition(index: number, total: number): Point2D {
  const cx = 200;
  const cy = 260;
  const r = 170;
  const angle = (index / Math.max(total, 1)) * Math.PI * 2;
  return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
}

function nodeFill(point: NavigationPoint): string {
  if (point.type === 'ENTRADA') return '#8b5a2b';
  if (point.type === 'BODEGA') return '#2d5016';
  return '#f5efe0';
}

function shortLabel(point: NavigationPoint): string {
  if (point.type === 'LOTE') return point.name.replace('Lote ', '');
  return point.type.slice(0, 3);
}

export function GraphView({
  graph,
  activeRoute,
  originId,
  selectedDestinationIds,
  selectedSegmentId,
  onSelectSegment,
}: GraphViewProps) {
  const positions = useMemo(() => {
    const map: Record<string, Point2D> = {};
    graph.points.forEach((point, index) => {
      map[point.id] = FIXED_POSITIONS[point.id] ?? fallbackPosition(index, graph.points.length);
    });
    return map;
  }, [graph.points]);

  const routeSegmentSet = useMemo(() => new Set(activeRoute?.segmentIds ?? []), [activeRoute]);

  return (
    <section className="panel graph-panel" aria-label="Grafo de la finca">
      <div className="graph-header">
        <h2>Mapa de la finca (grafo simulado)</h2>
        <Legend />
      </div>

      <svg viewBox="0 0 400 500" className="graph-svg" role="img" aria-label="Grafo de navegacion de la finca">
        {graph.segments.map((segment) => {
          const from = positions[segment.fromId];
          const to = positions[segment.toId];
          if (!from || !to) return null;

          const isActive = routeSegmentSet.has(segment.id);
          const isSelected = selectedSegmentId === segment.id;
          const midX = (from.x + to.x) / 2;
          const midY = (from.y + to.y) / 2;

          return (
            <g
              key={segment.id}
              className="segment-group"
              onClick={() => onSelectSegment(segment.id)}
            >
              <line
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke={isActive ? ACTIVE_ROUTE_COLOR : STATUS_COLORS[segment.status]}
                strokeWidth={isActive ? 5 : isSelected ? 4 : 3}
                strokeLinecap="round"
                className="segment-line"
              />
              <rect x={midX - 22} y={midY - 10} width={44} height={20} rx={4} className="segment-label-bg" />
              <text x={midX} y={midY + 4} textAnchor="middle" className="segment-label">
                {segment.distanceKm}km
              </text>
            </g>
          );
        })}

        {graph.points.map((point) => {
          const pos = positions[point.id];
          if (!pos) return null;

          const isOrigin = point.id === originId;
          const isDestination = selectedDestinationIds.includes(point.id);

          return (
            <g key={point.id} className="node-group">
              {(isOrigin || isDestination) && (
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={22}
                  className={isOrigin ? 'node-ring node-ring-origin' : 'node-ring node-ring-destination'}
                />
              )}
              <circle cx={pos.x} cy={pos.y} r={16} fill={nodeFill(point)} className="node-circle" />
              <text x={pos.x} y={pos.y + 4} textAnchor="middle" className="node-label-inner">
                {shortLabel(point)}
              </text>
              <text x={pos.x} y={pos.y + 32} textAnchor="middle" className="node-label-name">
                {point.name}
              </text>
              {point.priority && (
                <text
                  x={pos.x}
                  y={pos.y + 45}
                  textAnchor="middle"
                  className={`node-priority priority-${point.priority.toLowerCase()}`}
                >
                  {point.priority}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </section>
  );
}

function Legend() {
  return (
    <div className="legend">
      <span className="legend-item">
        <i className="legend-dot" style={{ background: STATUS_COLORS.NORMAL }} /> Normal
      </span>
      <span className="legend-item">
        <i className="legend-dot" style={{ background: STATUS_COLORS.CONGESTIONADO }} /> Congestionado
      </span>
      <span className="legend-item">
        <i className="legend-dot" style={{ background: STATUS_COLORS.BLOQUEADO }} /> Bloqueado
      </span>
      <span className="legend-item">
        <i className="legend-dot" style={{ background: ACTIVE_ROUTE_COLOR }} /> Ruta activa
      </span>
    </div>
  );
}
