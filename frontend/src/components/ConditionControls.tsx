import type { NavigationPoint, RouteSegment, SegmentStatus } from '../types';

interface ConditionControlsProps {
  segments: RouteSegment[];
  pointsById: Record<string, NavigationPoint>;
  selectedSegmentId: string | null;
  onSelectSegment: (id: string) => void;
  onChangeStatus: (segmentId: string, status: SegmentStatus) => void;
  loading: boolean;
}

const STATUS_OPTIONS: { status: SegmentStatus; label: string }[] = [
  { status: 'NORMAL', label: 'Normal' },
  { status: 'CONGESTIONADO', label: 'Congestionar' },
  { status: 'BLOQUEADO', label: 'Bloquear' },
];

export function ConditionControls({
  segments,
  pointsById,
  selectedSegmentId,
  onSelectSegment,
  onChangeStatus,
  loading,
}: ConditionControlsProps) {
  return (
    <section className="panel condition-panel" aria-label="Control de condiciones de caminos">
      <h2>Condiciones de caminos</h2>
      <p className="hint">
        Simula el cambio de estado de un camino para observar la deteccion del cambio (Observer) y el
        recalculo automatico de la ruta.
      </p>

      <div className="segment-table-wrapper">
        <table className="segment-table">
          <thead>
            <tr>
              <th>Camino</th>
              <th>Distancia</th>
              <th>Estado</th>
              <th>Cambiar a</th>
            </tr>
          </thead>
          <tbody>
            {segments.map((segment) => {
              const fromName = pointsById[segment.fromId]?.name ?? segment.fromId;
              const toName = pointsById[segment.toId]?.name ?? segment.toId;
              const isSelected = selectedSegmentId === segment.id;

              return (
                <tr
                  key={segment.id}
                  className={isSelected ? 'segment-row selected' : 'segment-row'}
                  onClick={() => onSelectSegment(segment.id)}
                >
                  <td>
                    {fromName} - {toName}
                  </td>
                  <td>{segment.distanceKm} km</td>
                  <td>
                    <span className={`badge badge-status-${segment.status.toLowerCase()}`}>
                      {segment.status}
                    </span>
                  </td>
                  <td>
                    <div className="status-buttons">
                      {STATUS_OPTIONS.map((option) => (
                        <button
                          key={option.status}
                          type="button"
                          className={`btn btn-status btn-status-${option.status.toLowerCase()} ${
                            segment.status === option.status ? 'active' : ''
                          }`}
                          disabled={loading || segment.status === option.status}
                          onClick={(event) => {
                            event.stopPropagation();
                            onChangeStatus(segment.id, option.status);
                          }}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
