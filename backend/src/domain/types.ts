/** Estados de camino — Blueprint DT-01 / PROMPT-MAESTRO §9 */
export type SegmentStatus = 'NORMAL' | 'CONGESTIONADO' | 'BLOQUEADO';

/** Prioridad operativa de lotes — PROMPT-MAESTRO §10 */
export type LotePriority = 'NORMAL' | 'ALTA' | 'URGENTE';

export type PointType = 'ENTRADA' | 'LOTE' | 'BODEGA' | 'POI';

/** Factor de tiempo por congestión (DT-01 aprobado: ×1.5) */
export const CONGESTION_TIME_FACTOR = 1.5;

export const PRIORITY_RANK: Record<LotePriority, number> = {
  URGENTE: 3,
  ALTA: 2,
  NORMAL: 1,
};
