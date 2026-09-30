import type { NavigationPoint, StrategyInfo } from '../types';

interface PlanFormProps {
  points: NavigationPoint[];
  strategies: StrategyInfo[];
  originId: string;
  strategyId: string;
  selectedDestinationIds: string[];
  loading: boolean;
  onOriginChange: (id: string) => void;
  onStrategyChange: (id: string) => void;
  onToggleDestination: (id: string) => void;
  onCalculate: () => void;
  onCompare: () => void;
}

export function PlanForm({
  points,
  strategies,
  originId,
  strategyId,
  selectedDestinationIds,
  loading,
  onOriginChange,
  onStrategyChange,
  onToggleDestination,
  onCalculate,
  onCompare,
}: PlanFormProps) {
  const lotes = points.filter((point) => point.type === 'LOTE');
  const canSubmit = originId !== '' && selectedDestinationIds.length > 0 && !loading;

  return (
    <section className="panel plan-form" aria-label="Planificacion de recorrido">
      <h2>Planificacion</h2>

      <label className="field">
        <span>Origen</span>
        <select value={originId} onChange={(event) => onOriginChange(event.target.value)}>
          <option value="" disabled>
            Seleccionar origen...
          </option>
          {points.map((point) => (
            <option key={point.id} value={point.id}>
              {point.name} ({point.type})
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span>Estrategia</span>
        <select value={strategyId} onChange={(event) => onStrategyChange(event.target.value)}>
          <option value="" disabled>
            Seleccionar estrategia...
          </option>
          {strategies.map((strategy) => (
            <option key={strategy.id} value={strategy.id}>
              {strategy.name}
            </option>
          ))}
        </select>
      </label>

      <fieldset className="field lotes-field">
        <legend>Lotes a visitar</legend>
        {lotes.length === 0 && <p className="hint">Sin lotes disponibles en el grafo.</p>}
        <div className="checkbox-list">
          {lotes.map((lote) => (
            <label key={lote.id} className="checkbox-item">
              <input
                type="checkbox"
                checked={selectedDestinationIds.includes(lote.id)}
                disabled={lote.id === originId}
                onChange={() => onToggleDestination(lote.id)}
              />
              <span className="checkbox-text">{lote.name}</span>
              {lote.priority && (
                <span className={`badge badge-priority-${lote.priority.toLowerCase()}`}>
                  {lote.priority}
                </span>
              )}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="actions">
        <button className="btn btn-primary" onClick={onCalculate} disabled={!canSubmit}>
          CALCULAR RECORRIDO
        </button>
        <button className="btn btn-secondary" onClick={onCompare} disabled={!canSubmit}>
          Comparar estrategias
        </button>
      </div>
    </section>
  );
}
