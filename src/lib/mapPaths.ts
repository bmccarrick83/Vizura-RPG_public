
// src/lib/mapPaths.ts
// -------------------------------------------------------------
// A* Pathfinding + MST (Prim's) + Bezier smoothing for roads/rivers
// -------------------------------------------------------------

// ---- Interfaces ----
export interface Point {
  x: number;
  y: number;
}

export interface Tile {
    id: number;
    type: 'ocean' | 'plains' | 'forest' | 'mountains' | 'beach' | 'polar' | 'desert' | 'swamp';
    height: number;
    point: [number, number];
    neighbors: number[];
}


export interface PathSegment {
  points: Point[];
  type: "road" | "river";
}

// -------------------------------------------------------------
// 1️⃣ Utility helpers
// -------------------------------------------------------------
const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);

// Heuristic for A* cost - prefers lower elevation
const terrainCost = (from: Tile, to: Tile) => {
    if (to.type === 'ocean') return Infinity;
    if (to.type === 'mountains') return 10;
    if (to.type === 'forest') return 4;
    
    // Penalize going uphill
    const heightDiff = to.height - from.height;
    const elevationPenalty = heightDiff > 0 ? heightDiff * 20 : 0;
    
    return 1 + elevationPenalty;
};


// -------------------------------------------------------------
// 2️⃣ A* PATHFINDING
// -------------------------------------------------------------
function aStar(terrain: Tile[], startId: number, goalId: number): number[] {
  const open = new Set<number>([startId]);
  const cameFrom = new Map<number, number>();

  const gScore = new Map<number, number>();
  gScore.set(startId, 0);

  const fScore = new Map<number, number>();
  const startPoint = { x: terrain[startId].point[0], y: terrain[startId].point[1] };
  const goalPoint = { x: terrain[goalId].point[0], y: terrain[goalId].point[1] };
  fScore.set(startId, distance(startPoint, goalPoint));

  while (open.size > 0) {
    let currentId = -1;
    let lowestFScore = Infinity;
    for (const id of open) {
      if ((fScore.get(id) ?? Infinity) < lowestFScore) {
        lowestFScore = fScore.get(id) ?? Infinity;
        currentId = id;
      }
    }

    if (currentId === goalId) {
      const path: number[] = [goalId];
      while (cameFrom.has(currentId)) {
        currentId = cameFrom.get(currentId)!;
        path.unshift(currentId);
      }
      return path;
    }

    open.delete(currentId);

    const currentTile = terrain[currentId];
    for (const neighborId of currentTile.neighbors) {
      if (!terrain[neighborId]) continue;
      
      const cost = terrainCost(currentTile, terrain[neighborId]);
      if(cost === Infinity) continue;

      const tentativeGScore = (gScore.get(currentId) ?? Infinity) + distance({x: currentTile.point[0], y: currentTile.point[1]}, {x: terrain[neighborId].point[0], y: terrain[neighborId].point[1]}) * cost;

      if (tentativeGScore < (gScore.get(neighborId) ?? Infinity)) {
        cameFrom.set(neighborId, currentId);
        gScore.set(neighborId, tentativeGScore);
        fScore.set(neighborId, tentativeGScore + distance({x: terrain[neighborId].point[0], y: terrain[neighborId].point[1]}, goalPoint));
        if (!open.has(neighborId)) {
          open.add(neighborId);
        }
      }
    }
  }

  return []; // no path
}


// -------------------------------------------------------------
// 3️⃣ PRIM'S MST (connects cities minimally)
// -------------------------------------------------------------
function computeMST(cities: {x: number; y: number; tileId: number}[]): [number, number][] {
  if (cities.length < 2) return [];
  const edges: [number, number][] = [];
  const connected = new Set<number>();
  connected.add(cities[0].tileId);

  while (connected.size < cities.length) {
    let bestA: number | null = null;
    let bestB: number | null = null;
    let bestDist = Infinity;

    for (const aId of connected) {
      const cityA = cities.find(c => c.tileId === aId)!;
      for (const cityB of cities) {
         if (connected.has(cityB.tileId)) continue;
        const d = distance(cityA, cityB);
        if (d < bestDist) {
          bestDist = d;
          bestA = cityA.tileId;
          bestB = cityB.tileId;
        }
      }
    }

    if (bestA !== null && bestB !== null) {
      edges.push([bestA, bestB]);
      connected.add(bestB);
    } else break;
  }

  return edges;
}

// -------------------------------------------------------------
// 4️⃣ BEZIER SMOOTHING
// -------------------------------------------------------------
function bezierSmooth(points: Point[]): Point[] {
  if (points.length < 3) return points;
  const smoothed: Point[] = [points[0]];
  for (let i = 0; i < points.length - 2; i++) {
    const p0 = i === 0 ? points[0] : { x: (points[i].x + points[i+1].x) / 2, y: (points[i].y + points[i+1].y) / 2 };
    const p1 = points[i+1];
    const p2 = i === points.length - 3 ? points[i+2] : { x: (points[i+1].x + points[i+2].x) / 2, y: (points[i+1].y + points[i+2].y) / 2 };
    
    for (let t = 0.1; t <= 1; t += 0.1) {
      const x = (1 - t) * (1 - t) * p0.x + 2 * (1 - t) * t * p1.x + t * t * p2.x;
      const y = (1 - t) * (1 - t) * p0.y + 2 * (1 - t) * t * p1.y + t * t * p2.y;
      smoothed.push({ x, y });
    }
  }
  smoothed.push(points[points.length-1]);
  return smoothed;
}


// -------------------------------------------------------------
// 5️⃣ RIVER GENERATION (height-gradient flow)
// -------------------------------------------------------------
function generateRivers(terrain: Tile[], sources: number[]): PathSegment[] {
  const rivers: PathSegment[] = [];

  for (const srcId of sources) {
    const path: Point[] = [{x: terrain[srcId].point[0], y: terrain[srcId].point[1]}];
    let currentId = srcId;
    let safety = 0;

    while (safety++ < 500) {
      const currentTile = terrain[currentId];
      if (currentTile.type === 'ocean') break;

      let lowestNeighborId = -1;
      let lowestHeight = currentTile.height;
      
      for (const neighborId of currentTile.neighbors) {
         if(!terrain[neighborId]) continue;
        const neighborTile = terrain[neighborId];
        if (neighborTile.height < lowestHeight) {
          lowestHeight = neighborTile.height;
          lowestNeighborId = neighborId;
        }
      }

      if (lowestNeighborId !== -1) {
        path.push({x: terrain[lowestNeighborId].point[0], y: terrain[lowestNeighborId].point[1]});
        currentId = lowestNeighborId;
      } else {
        break; // Flow is blocked
      }
    }

    if (path.length > 2) {
      rivers.push({ points: path, type: "river" });
    }
  }

  return rivers;
}

// -------------------------------------------------------------
// 6️⃣ MASTER FUNCTION: GENERATE PATHS + RIVERS
// -------------------------------------------------------------
export function generatePathsAndRivers(
  terrain: Tile[],
  cities: {x: number, y: number, tileId: number}[],
): { roads: PathSegment[]; rivers: PathSegment[] } {
  const roads: PathSegment[] = [];

  // --- Roads (MST + A*) ---
  const mstEdges = computeMST(cities);
  for (const [aId, bId] of mstEdges) {
    const rawPathIds = aStar(terrain, aId, bId);
    if (rawPathIds.length > 0) {
      const pathPoints = rawPathIds.map(id => ({x: terrain[id].point[0], y: terrain[id].point[1]}));
      const smoothed = bezierSmooth(pathPoints);
      roads.push({ points: smoothed, type: "road" });
    }
  }

  // --- Rivers ---
  const mountainTops = terrain.filter(t => t.type === 'mountains' && t.height > 0.85);
  const polarEdges = terrain.filter(t => t.type === 'polar' && t.neighbors.some(n => terrain[n]?.type !== 'polar' && terrain[n]?.type !== 'ocean'));
  const riverSources = [...mountainTops, ...polarEdges];
  const riverSourceIds = riverSources.sort(() => 0.5 - Math.random()).slice(0, 40).map(t => t.id);
  const rivers = generateRivers(terrain, riverSourceIds);

  return { roads, rivers };
}
