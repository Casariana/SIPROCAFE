import { useCallback, useEffect, useMemo, useState } from 'react';
import { PlanForm } from './components/PlanForm';
import { GraphView } from './components/GraphView';
import { ResultPanel } from './components/ResultPanel';
import { ConditionControls } from './components/ConditionControls';
import * as api from './api/navigationClient';
import type {
  CompareResponse,
  NavigationGraph,
  NavigationPoint,
  RouteCalculationResult,
  SegmentStatus,
  StrategyInfo,
} from './types';

export default function App() {
  const [graph, setGraph] = useState<NavigationGraph | null>(null);
  const [strategies, setStrategies] = useState<StrategyInfo[]>([]);
  const [originId, setOriginId] = useState('entrada');
  const [strategyId, setStrategyId] = useState('shortest-distance');
  const [destinationIds, setDestinationIds] = useState<string[]>(['lote-a', 'lote-b', 'lote-d']);
  const [result, setResult] = useState<RouteCalculationResult | null>(null);
  const [compareResult, setCompareResult] = useState<CompareResponse | null>(null);
  const [selectedSegmentId, setSelectedSegmentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [banner, setBanner] = useState<string | null>(null);

  const pointsById = useMemo(() => {
    const map: Record<string, NavigationPoint> = {};
    graph?.points.forEach((p) => {
      map[p.id] = p;
    });
    return map;
  }, [graph]);

  const strategyNameById = useMemo(() => {
    const map: Record<string, string> = {};
    strategies.forEach((s) => {
      map[s.id] = s.name;
    });
    return map;
  }, [strategies]);

  const applyResult = useCallback((data: RouteCalculationResult) => {
    setResult({
      ...data,
      strategyId: data.metrics?.strategyId ?? data.strategyId,
    });
    if (data.graph) setGraph(data.graph);
    if (data.message) setBanner(data.message);
    else if (data.conditionChanged || data.recalculated) {
      setBanner(
        data.recalculated
          ? 'Cambio detectado en el recorrido. Ruta recalculada.'
          : 'Cambio detectado en el recorrido.',
      );
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [g, s] = await Promise.all([api.getGraph(), api.getStrategies()]);
        if (cancelled) return;
        setGraph(g);
        setStrategies(s);
        if (s[0] && !strategyId) setStrategyId(s[0].id);
      } catch (err) {
        if (!cancelled) setError((err as Error).message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const toggleDestination = (id: string) => {
    setDestinationIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const onCalculate = async () => {
    setLoading(true);
    setError(null);
    setBanner(null);
    setCompareResult(null);
    try {
      const data = await api.calculateRoute({ originId, destinationIds, strategyId });
      applyResult(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const onStrategySelect = async (id: string) => {
    setStrategyId(id);
    if (!result) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.setStrategy(id);
      applyResult(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const onCompare = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.compareStrategies(originId, destinationIds);
      setCompareResult(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const onChangeStatus = async (segmentId: string, status: SegmentStatus) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.setSegmentStatus(segmentId, status);
      applyResult(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const onRecalculate = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.recalculateRoute();
      applyResult(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (!graph) {
    return (
      <div className="app-shell">
        <header className="app-header">
          <h1>SIPROCAFE</h1>
          <p>Planificación de recorridos</p>
        </header>
        <main className="app-main">
          <p className="hint">{error ?? 'Cargando grafo de Finca El Horizonte…'}</p>
        </main>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>SIPROCAFE</h1>
        <p>Planificación de recorridos</p>
        <span className="farm-label">{graph.name} (escenario simulado)</span>
      </header>

      {banner && (
        <div className={`banner ${result?.recalculated || result?.conditionChanged ? 'banner-alert' : ''}`} role="status">
          {banner}
        </div>
      )}
      {error && (
        <div className="banner banner-error" role="alert">
          {error}
        </div>
      )}

      <main className="app-main">
        <PlanForm
          points={graph.points}
          strategies={strategies}
          originId={originId}
          strategyId={strategyId}
          selectedDestinationIds={destinationIds}
          loading={loading}
          onOriginChange={setOriginId}
          onStrategyChange={onStrategySelect}
          onToggleDestination={toggleDestination}
          onCalculate={onCalculate}
          onCompare={onCompare}
        />

        <GraphView
          graph={graph}
          activeRoute={result?.route ?? null}
          originId={originId}
          selectedDestinationIds={destinationIds}
          selectedSegmentId={selectedSegmentId}
          onSelectSegment={setSelectedSegmentId}
        />

        <ResultPanel
          result={result}
          compareResult={compareResult}
          pointsById={pointsById}
          strategyNameById={strategyNameById}
          currentStrategyName={strategyNameById[strategyId] ?? strategyId}
          onRecalculate={onRecalculate}
          loading={loading}
        />

        <ConditionControls
          segments={graph.segments}
          pointsById={pointsById}
          selectedSegmentId={selectedSegmentId}
          onSelectSegment={setSelectedSegmentId}
          onChangeStatus={onChangeStatus}
          loading={loading}
        />
      </main>
    </div>
  );
}
