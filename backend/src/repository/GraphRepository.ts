import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { NavigationGraph } from '../domain/NavigationGraph.js';
import { NavigationPoint } from '../domain/NavigationPoint.js';
import { RouteSegment } from '../domain/RouteSegment.js';
import type { LotePriority, PointType, SegmentStatus } from '../domain/types.js';

interface GraphJson {
  id: string;
  name: string;
  points: Array<{
    id: string;
    name: string;
    type: PointType;
    priority?: LotePriority;
    loteId?: string;
  }>;
  segments: Array<{
    id: string;
    fromId: string;
    toId: string;
    distanceKm: number;
    timeMin: number;
    status: SegmentStatus;
  }>;
}

const __dirname = dirname(fileURLToPath(import.meta.url));

export class GraphRepository {
  private graph: NavigationGraph;

  constructor(dataPath = join(__dirname, '../data/finca-el-horizonte.json')) {
    this.graph = this.loadFromFile(dataPath);
  }

  getGraph(): NavigationGraph {
    return this.graph;
  }

  /** Recarga el JSON semilla (útil en pruebas). */
  reload(dataPath = join(__dirname, '../data/finca-el-horizonte.json')): NavigationGraph {
    this.graph = this.loadFromFile(dataPath);
    return this.graph;
  }

  loadFromObject(data: GraphJson): NavigationGraph {
    const graph = new NavigationGraph(data.id, data.name);
    for (const p of data.points) {
      graph.addPoint(
        new NavigationPoint(p.id, p.name, p.type, p.priority ?? 'NORMAL', p.loteId),
      );
    }
    for (const s of data.segments) {
      graph.addSegment(
        new RouteSegment(s.id, s.fromId, s.toId, s.distanceKm, s.timeMin, s.status),
      );
    }
    this.graph = graph;
    return graph;
  }

  private loadFromFile(dataPath: string): NavigationGraph {
    const raw = JSON.parse(readFileSync(dataPath, 'utf-8')) as GraphJson;
    return this.loadFromObject(raw);
  }
}
