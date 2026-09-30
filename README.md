# SIPROCAFE — Módulo de planificación y navegación de recorridos

Evolución académica de **SIPROCAFE** (Actividad 6: *Navegando Mareas*).  
Planifica recorridos entre lotes sobre un **grafo simulado**, con estrategias intercambiables (**Strategy**) y recálculo ante cambios de condición (**Observer**).

**No es** una aplicación de GPS ni de mapas reales.

## Requisitos previos

- Node.js 20+ (recomendado) y npm
- Sistema operativo con terminal (Windows / macOS / Linux)
- Navegador moderno para la UI

## Instalación

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

Desde la raíz del repo también puedes usar:

```bash
npm run test          # ejecuta pruebas del backend
npm run dev:backend   # API
npm run dev:frontend  # UI
```

## Cómo levantar el backend

```bash
cd backend
npm run dev
```

API local: **http://localhost:3001**

## Cómo levantar el frontend

```bash
cd frontend
npm run dev
```

UI local: **http://localhost:5173**

> Estas son URLs **locales** del prototipo. No son URLs públicas de despliegue.

## Cómo ejecutar pruebas

```bash
cd backend
npm test
```

Seis escenarios Vitest (Casos 1–4 + comparación). Deben pasar en verde.

## Cómo reproducir métricas

```bash
cd backend
npm test
```

La corrida escribe resultados **reales** (no inventados) en:

`docs/metrics/results.json`

Métricas: distancia (km), tiempo estimado (min), tiempo de cálculo (ms), segmentos, nodos visitados, recálculos.

## Demo rápida

1. Origen: **Entrada**
2. Lotes: **A, B, D**
3. Estrategia: **Menor distancia** → Calcular
4. Cambiar a **Menor tiempo** y observar métricas/ruta
5. Bloquear un segmento del recorrido → notificación + ruta recalculada
6. **Comparar estrategias**

Nota: una ruta como `entrada → lote-a → lote-b → lote-a → lote-d` puede repetir un nodo como **tránsito**, no como doble atención del lote.

## Arquitectura

```
Frontend (React+Vite) → Navigation API (Express) → NavigationService
                              ↓                        ↓
                      StrategyEngine          RouteConditionMonitor
                              ↓
                      RoutingStrategy
                 (Distance | Time | Priority)
                              ↓
                      GraphRepository (JSON)
```

## Patrones

| Patrón | Implementación |
|--------|----------------|
| **Strategy** | `RoutingStrategy` ← `ShortestDistanceStrategy`, `FastestRouteStrategy`, `PriorityRouteStrategy` vía `StrategyEngine` |
| **Observer** | `RouteConditionMonitor` notifica a `NavigationService` → recalcula |
| **Command** | No usado (fuera de necesidad del alcance) |

## Alcance y limitaciones

**Incluye:** grafo simulado Finca El Horizonte, 3 estrategias, SVG, simulación NORMAL/CONGESTIONADO/BLOQUEADO, pruebas y métricas reales, UML.

**Fuera de alcance:** GPS, mapas externos, IoT, autenticación real, microservicios, Kafka/Redis/K8s, pagos, app móvil, IA/ML, cuarta estrategia “por agregar”.

Los resultados valen **solo** para este grafo y semilla de prueba; no demuestran superioridad universal de una estrategia.

## Entregables académicos

| Entregable | Ubicación |
|------------|-----------|
| Informe markdown + figuras UML | `docs/report/` |
| UML PlantUML | `docs/architecture/*.puml` |
| Métricas | `docs/metrics/results.json` |


## Estructura

```text
SIPROCAFE-NAVIGATION/
├── backend/
├── frontend/
├── tests/
├── docs/
│   ├── architecture/   # UML PlantUML
│   ├── metrics/        # results.json
├── README.md
├── package.json
└── .gitignore
```
