import type { CompareResponse, NavigationPoint, RouteCalculationResult } from '../types';

interface ResultPanelProps {
  result: RouteCalculationResult | null;
  compareResult: CompareResponse | null;
  pointsById: Record<string, NavigationPoint>;
  strategyNameById: Record<string, string>;
  currentStrategyName: string;
  onRecalculate: () => void;
  loading: boolean;
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric">
      <span className="metric-label">{label}</span>
      <span className="metric-value">{value}</span>
    </div>
  );
}

export function ResultPanel({
  result,
  compareResult,
  pointsById,
  strategyNameById,
  currentStrategyName,
  onRecalculate,
  loading,
}: ResultPanelProps) {
  const strategyLabel = result?.strategyId
    ? strategyNameById[result.strategyId] ?? result.strategyId
    : currentStrategyName;

  return (
    <section className="panel result-panel" aria-label="Resultado del recorrido">
      <div className="result-header">
        <h2>Resultado</h2>
        <button className="btn btn-ghost" onClick={onRecalculate} disabled={loading || !result}>
          Recalcular
        </button>
      </div>

      {!result && <p className="hint">Aun no se ha calculado un recorrido. Complete el formulario y presione CALCULAR RECORRIDO.</p>}

      {result && (
        <>
          <div className="metrics-grid">
            <Metric label="Distancia total" value={`${result.route.totalDistanceKm.toFixed(2)} km`} />
            <Metric label="Tiempo estimado" value={`${result.route.estimatedTimeMin.toFixed(1)} min`} />
            <Metric label="Estrategia" value={strategyLabel} />
            <Metric label="Tiempo de calculo" value={`${result.metrics.calculationTimeMs.toFixed(2)} ms`} />
            <Metric label="Segmentos" value={String(result.metrics.segmentCount)} />
            <Metric label="Nodos visitados" value={String(result.metrics.visitedNodeCount)} />
            <Metric label="Recalculos" value={String(result.metrics.recalculationCount)} />
          </div>

          <div className="route-sequence">
            <span className="metric-label">Secuencia de recorrido</span>
            <ol>
              {result.route.pointIds.map((id, index) => (
                <li key={`${id}-${index}`}>{pointsById[id]?.name ?? id}</li>
              ))}
            </ol>
          </div>
        </>
      )}

      {compareResult && (
        <div className="compare-table-wrapper">
          <h3>Comparacion de estrategias</h3>
          <table className="compare-table">
            <thead>
              <tr>
                <th>Estrategia</th>
                <th>Distancia (km)</th>
                <th>Tiempo (min)</th>
                <th>Segmentos</th>
                <th>Nodos</th>
                <th>Calculo (ms)</th>
              </tr>
            </thead>
            <tbody>
              {compareResult.comparison.map((row) => (
                <tr key={row.strategyId}>
                  <td>{row.strategyName}</td>
                  <td>{row.route.totalDistanceKm.toFixed(2)}</td>
                  <td>{row.route.estimatedTimeMin.toFixed(1)}</td>
                  <td>{row.metrics.segmentCount}</td>
                  <td>{row.metrics.visitedNodeCount}</td>
                  <td>{row.metrics.calculationTimeMs.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
