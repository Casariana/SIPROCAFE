import type { LotePriority, PointType } from './types.js';

export class NavigationPoint {
  constructor(
    readonly id: string,
    readonly name: string,
    readonly type: PointType,
    readonly priority: LotePriority = 'NORMAL',
    readonly loteId?: string,
  ) {}

  isLote(): boolean {
    return this.type === 'LOTE';
  }
}
