
'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { createNoise2D } from 'simplex-noise';
import { Delaunay } from 'd3-delaunay';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ZoomIn,
  ZoomOut,
  Expand,
  ChevronDown,
  RefreshCw,
  Type,
  ArrowUp,
  ArrowDown,
  Trash2,
} from 'lucide-react';
import {
  Tooltip,
  TooltipProvider,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { generatePathsAndRivers, PathSegment } from '@/lib/mapPaths';
import { Input } from "@/components/ui/input";


// --- Type Definitions ---
export interface Tile {
  id: number;
  type:
    | 'ocean'
    | 'plains'
    | 'forest'
    | 'mountains'
    | 'beach'
    | 'polar'
    | 'desert'
    | 'swamp';
  height: number;
  polygon: [number, number][];
  point: [number, number];
  neighbors: number[];
}

export interface City {
  x: number;
  y: number;
  name: string;
  tileId: number;
}

export interface LabelData {
  x: number;
  y: number;
  text: string;
}

export interface MapState {
  terrain: Tile[];
  cities: City[];
  labels: LabelData[];
  roads: PathSegment[];
  rivers: PathSegment[];
  oceanLevel: number;
  seed: number;
}

interface ProceduralMapGeneratorProps {
  onStateChange?: (newState: MapState) => void;
}

// --- FANTASY NAME GENERATOR ---
const fantasyNameGenerator = () => {
  const beginnings = ["Ver", "Cor", "Sil", "Lun", "Ast", "Aer", "Val", "El", "Riv", "Pyr"];
  const middles = ["en", "o", "a", "i", "u", "ar", "er", "on", "in", "ia"];
  const endings = ["dale", "gard", "ia", "grad", "port", "stead", "wich", "fell", "crest", "wick"];
  
  const beginning = beginnings[Math.floor(Math.random() * beginnings.length)];
  const middle = middles[Math.floor(Math.random() * middles.length)];
  const end = endings[Math.floor(Math.random() * endings.length)];
  
  return beginning + middle + end;
};

export function ProceduralMapGenerator({
  onStateChange,
}: ProceduralMapGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mapState, setMapState] = useState<MapState>({
      terrain: [],
      cities: [],
      labels: [],
      roads: [],
      rivers: [],
      oceanLevel: 0.35,
      seed: Math.random(),
    }
  );
  const [currentZoomPercentage, setCurrentZoomPercentage] = useState(100);

  const [isLabelMode, setIsLabelMode] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputPosition, setInputPosition] = useState<{ x: number; y: number } | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [inputAbsolutePosition, setInputAbsolutePosition] = useState<{ x: number; y: number } | null>(null);
  const [editingCity, setEditingCity] = useState<City | null>(null);

  // Map controls
  const zoomRef = useRef(1);
  const offsetRef = useRef({ x: 0, y: 0 });
  const targetZoomRef = useRef(1);
  const targetOffsetRef = useRef({ x: 0, y: 0 });
  const animationFrameRef = useRef<number | null>(null);
  const isDraggingRef = useRef(false);
  const lastMouseRef = useRef({ x: 0, y: 0 });

  const mapWidth = 2000;
  const mapHeight = 2000;
  const numPoints = 15000;
  const minZoom = 0.1;
  const maxZoom = 8;
  
  useEffect(() => {
    if (onStateChange) {
      onStateChange(mapState);
    }
  }, [mapState, onStateChange]);

  useEffect(() => {
    if (inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [inputPosition, editingCity]);
  
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
        finalizeLabel();
    } else if (e.key === "Escape") {
        setInputPosition(null);
        setEditingCity(null);
    }
  };

  const finalizeLabel = () => {
    if (editingCity) { // We were editing a city name
        setMapState(prev => ({
            ...prev,
            cities: prev.cities.map(c => 
                c.tileId === editingCity.tileId ? { ...c, name: inputValue.trim() } : c
            )
        }));
    } else if (inputPosition) { // We were adding a new label
      if (inputValue.trim()) {
        const dpr = window.devicePixelRatio || 1;
        const mapX = (inputPosition.x * dpr - offsetRef.current.x) / zoomRef.current;
        const mapY = (inputPosition.y * dpr - offsetRef.current.y) / zoomRef.current;
        setMapState(prev => ({
            ...prev,
            labels: [...prev.labels, { x: mapX, y: mapY, text: inputValue.trim() }],
        }));
      }
    }
    setInputPosition(null);
    setEditingCity(null);
    setIsLabelMode(false);
  };

  const drawMap = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !mapState.terrain.length) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.translate(offsetRef.current.x, offsetRef.current.y);
    ctx.scale(zoomRef.current, zoomRef.current);

    // Background
    ctx.fillStyle = '#1e90ff';
    ctx.fillRect(0, 0, mapWidth, mapHeight);

    ctx.imageSmoothingEnabled = false;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    const strokeWidthMapUnits = Math.max(0.5 / zoomRef.current, 0.2);

    for (const tile of mapState.terrain) {
      let color;
      if (tile.type === 'ocean') color = '#1e90ff';
      else if (tile.type === 'plains') color = '#32cd32';
      else if (tile.type === 'forest') color = '#228b22';
      else if (tile.type === 'mountains') color = '#808080';
      else if (tile.type === 'beach') color = '#D2B48C';
      else if (tile.type === 'desert') color = '#C2B280';
      else if (tile.type === 'swamp') color = '#9DC183'; // sage green
      else if (tile.type === 'polar') color = '#ffffff';
      else color = '#ffffff';

      const poly = tile.polygon;
      if (!poly || poly.length === 0) continue;

      const cx = tile.point[0];
      const cy = tile.point[1];
      let maxR = 0;
      for (const p of poly) {
        const dx = p[0] - cx;
        const dy = p[1] - cy;
        const r = Math.hypot(dx, dy);
        if (r > maxR) maxR = r;
      }
      const overlapFraction = Math.min(0.06, 8 / Math.max(8, maxR));
      const expandScale = 1 + overlapFraction;

      ctx.beginPath();
      const v0 = poly[0];
      ctx.moveTo(
        cx + (v0[0] - cx) * expandScale,
        cy + (v0[1] - cy) * expandScale
      );
      for (let i = 1; i < poly.length; i++) {
        const v = poly[i];
        ctx.lineTo(
          cx + (v[0] - cx) * expandScale,
          cy + (v[1] - cy) * expandScale
        );
      }
      ctx.closePath();

      ctx.fillStyle = color;
      ctx.fill();

      ctx.lineWidth = strokeWidthMapUnits;
      ctx.strokeStyle = color;
      ctx.stroke();
    }

    // Draw Rivers
    ctx.strokeStyle = '#4682B4'; // SteelBlue for rivers
    ctx.lineWidth = Math.max(1.5 / zoomRef.current, 0.5);
    for (const river of mapState.rivers) {
      if (river.points.length < 2) continue;
      ctx.beginPath();
      ctx.moveTo(river.points[0].x, river.points[0].y);
      for (let i = 1; i < river.points.length; i++) {
        ctx.lineTo(river.points[i].x, river.points[i].y);
      }
      ctx.stroke();
    }

    // Draw Roads
    ctx.strokeStyle = '#444'; // Dark gray for roads
    ctx.lineWidth = Math.max(1 / zoomRef.current, 0.3);
    ctx.setLineDash([4 / zoomRef.current, 2 / zoomRef.current]);
    for (const road of mapState.roads) {
      if (road.points.length < 2) continue;
      ctx.beginPath();
      ctx.moveTo(road.points[0].x, road.points[0].y);
      for (let i = 1; i < road.points.length; i++) {
        ctx.lineTo(road.points[i].x, road.points[i].y);
      }
      ctx.stroke();
    }
    ctx.setLineDash([]);

    for (const city of mapState.cities) {
      ctx.beginPath();
      const radius = 3 / zoomRef.current;
      ctx.fillStyle = '#FFD700';
      ctx.arc(city.x, city.y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw City and custom labels
    const zoom = zoomRef.current;
    
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "white"; // Set fill to white

    // City labels
    ctx.font = `bold ${zoom < 0.8 ? 20 : 26}px 'EB Garamond', serif`;
    ctx.strokeStyle = "black";
    ctx.lineWidth = 4 / zoom; // Thicker outline
    for (const city of mapState.cities) {
        if (editingCity?.tileId === city.tileId) continue; 
        ctx.strokeText(city.name, city.x, city.y + (15 / zoom));
        ctx.fillText(city.name, city.x, city.y + (15 / zoom));
    }
    
    // Custom labels
    ctx.font = `bold ${zoom < 0.8 ? 18 : 24}px 'EB Garamond', serif`;
    ctx.lineWidth = 3 / zoom;
    for (const label of mapState.labels) {
        ctx.strokeText(label.text, label.x, label.y);
        ctx.fillText(label.text, label.x, label.y);
    }
    ctx.restore();

  }, [mapState, editingCity]);

  const animate = useCallback(() => {
    // Jump directly to target without animation
    zoomRef.current = targetZoomRef.current;
    offsetRef.current = { ...targetOffsetRef.current };
    setCurrentZoomPercentage(Math.round(targetZoomRef.current * 100));
    drawMap();
    if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
    }
    animationFrameRef.current = null;
  }, [drawMap]);

  const startAnimation = useCallback(() => {
    if (animationFrameRef.current === null) {
      animationFrameRef.current = requestAnimationFrame(animate);
    }
  }, [animate]);

  const handlePan = useCallback(
    (dx: number, dy: number) => {
      targetOffsetRef.current.x += dx;
      targetOffsetRef.current.y += dy;
      startAnimation();
    },
    [startAnimation]
  );

  const handleZoom = useCallback(
    (delta: number, mouseX?: number, mouseY?: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      const mx = (mouseX ?? rect.width / 2);
      const my = (mouseY ?? rect.height / 2);

      const newZoom = Math.max(
        minZoom,
        Math.min(maxZoom, targetZoomRef.current * delta)
      );
      const oldZoom = targetZoomRef.current;

      if (newZoom === oldZoom) return;
      
      const worldX = (mx * dpr - targetOffsetRef.current.x) / oldZoom;
      const worldY = (my * dpr - targetOffsetRef.current.y) / oldZoom;

      targetOffsetRef.current.x = mx * dpr - worldX * newZoom;
      targetOffsetRef.current.y = my * dpr - worldY * newZoom;

      targetZoomRef.current = newZoom;
      startAnimation();
    },
    [startAnimation]
  );

  const setZoomLevel = useCallback(
    (level: number) => {
      const delta = level / targetZoomRef.current;
      handleZoom(delta);
    },
    [handleZoom]
  );

  const handleCenter = useCallback(
    (snap: boolean = false) => {
      const canvas = canvasRef.current;
      if (!canvas || mapState.terrain.length === 0) return;
      const landTiles = mapState.terrain.filter((t) => t.type !== 'ocean');
      if (landTiles.length === 0) return;

      const xs = landTiles.flatMap((t) => t.polygon.map((p) => p[0]));
      const ys = landTiles.flatMap((t) => t.polygon.map((p) => p[1]));
      const minX = Math.min(...xs);
      const maxX = Math.max(...xs);
      const minY = Math.min(...ys);
      const maxY = Math.max(...ys);
      const landWidth = maxX - minX;
      const landHeight = maxY - minY;

      const dpr = window.devicePixelRatio || 1;
      const cssWidth = canvas.getBoundingClientRect().width;
      const cssHeight = canvas.getBoundingClientRect().height;

      const padding = 40;
      const zoomX = (cssWidth - padding * 2) / landWidth;
      const zoomY = (cssHeight - padding * 2) / landHeight;
      const newZoom = Math.min(zoomX, zoomY, maxZoom);

      targetZoomRef.current = newZoom;
      targetOffsetRef.current = {
        x: (cssWidth / 2 - (minX + landWidth / 2) * newZoom) * dpr,
        y: (cssHeight / 2 - (minY + landHeight / 2) * newZoom) * dpr,
      };

      if (snap) {
        zoomRef.current = targetZoomRef.current;
        offsetRef.current = targetOffsetRef.current;
        setCurrentZoomPercentage(Math.round(targetZoomRef.current * 100));
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
        drawMap();
      } else {
        startAnimation();
      }
    },
    [mapState.terrain, startAnimation, drawMap]
  );

  const recomputeBiomes = useCallback((level: number, terrain: Tile[]) => {
    if (terrain.length === 0) return { updatedTerrain: [], newCities: [] };

    const updatedTerrain = terrain.map((tile) => {
      let type: Tile['type'];
      const latitude = Math.abs(tile.point[1] / mapHeight - 0.5);

      if (tile.height < level) type = 'ocean';
      else if (tile.height < level + 0.03) type = 'beach';
      else if (tile.height < 0.6) type = 'plains';
      else if (tile.height < 0.75) type = 'forest';
      else if (tile.height < 0.9) type = 'mountains';
      else type = 'polar';

      if (latitude > 0.45 && type !== 'ocean') {
        type = 'polar';
      }

      if (tile.type === 'swamp') {
        // Preserve swamps
        if (tile.height < level) type = 'ocean';
        else type = 'swamp';
      }

      if (type === 'mountains' && tile.height > 0.9) {
        type = 'polar'; // snow-capped
      }

      return { ...tile, type };
    });

    const cityCandidates = updatedTerrain.filter((t) =>
      ['plains', 'forest', 'desert'].includes(t.type)
    );
    const newCities: City[] = [];
    const potentialCityTiles = cityCandidates.sort(() => 0.5 - Math.random());

    for (const tile of potentialCityTiles) {
      if (newCities.length >= 20) break;
      const tooClose = newCities.some(
        (c) => Math.hypot(c.x - tile.point[0], c.y - tile.point[1]) < 150
      );
      if (!tooClose) {
        newCities.push({
          x: tile.point[0],
          y: tile.point[1],
          name: fantasyNameGenerator(),
          tileId: tile.id,
        });
      }
    }
    return { updatedTerrain, newCities };
  }, []);

  const generateMap = useCallback(
    (seed: number) => {
      const noiseGen = createNoise2D(() => seed);
      const points: [number, number][] = Array.from({ length: numPoints }, () => [
        Math.random() * mapWidth,
        Math.random() * mapHeight,
      ]);
      const d = Delaunay.from(points);
      const v = d.voronoi([0, 0, mapWidth, mapHeight]);

      const continentSeedX = Math.random() * 2 - 1;
      const continentSeedY = Math.random() * 2 - 1;

      let newTerrain: Tile[] = [];

      for (let i = 0; i < points.length; i++) {
        const [x, y] = points[i];
        const polygon = v.cellPolygon(i);
        if (!polygon) continue;

        const nx = x / mapWidth - 0.5;
        const ny = y / mapHeight - 0.5;

        const islandMask = Math.pow(Math.max(0, 1 - Math.sqrt(nx * nx + ny * ny) * 1.5), 1.2);
        const continentalShift = noiseGen(nx * 0.5 + continentSeedX, ny * 0.5 + continentSeedY) * 0.15;

        const value = (() => {
          let sum = 0,
            amp = 1,
            freq = 2,
            maxV = 0;
          for (let o = 0; o < 5; o++) {
            sum += noiseGen(nx * freq, ny * freq) * amp;
            maxV += amp;
            amp *= 0.5;
            freq *= 2;
          }
          return (sum / maxV + 1) / 2;
        })();
        
        const latitude = Math.abs(ny);
        const latitudeFalloff = 0.6 + 0.4 * Math.sin(latitude * Math.PI);
        
        let height = value * 0.9 + islandMask * 0.4 + continentalShift;
        height *= latitudeFalloff;

        if (height > 0.05 && height < 0.15 && Math.random() < 0.15) {
          height = 0.04;
        }

        newTerrain.push({
          id: i,
          point: [x, y],
          polygon: polygon as [number, number][],
          neighbors: Array.from(d.neighbors(i)),
          height,
          type: 'plains',
        });
      }

      const swampTiles = newTerrain.filter(
        (t) => t.height > 0.35 && t.height < 0.45 && Math.random() < 0.05
      );
      swampTiles.forEach((tile) => {
        tile.type = 'swamp';
      });

      const { updatedTerrain, newCities } = recomputeBiomes(
        mapState.oceanLevel,
        newTerrain
      );
      const { roads, rivers } = generatePathsAndRivers(updatedTerrain, newCities);

      setMapState((prev) => ({
        ...prev,
        terrain: updatedTerrain,
        cities: newCities,
        roads,
        rivers,
        labels: [],
        seed,
      }));
      handleCenter(true);
    },
    [recomputeBiomes, mapState.oceanLevel, handleCenter]
  );
  

  const handleOceanLevelChange = useCallback(
    (newLevel: number) => {
      const { updatedTerrain, newCities } = recomputeBiomes(
        newLevel,
        mapState.terrain
      );
      const { roads, rivers } = generatePathsAndRivers(updatedTerrain, newCities);
      setMapState((prev) => ({
        ...prev,
        oceanLevel: newLevel,
        terrain: updatedTerrain,
        cities: newCities,
        roads,
        rivers,
      }));
    },
    [recomputeBiomes, mapState.terrain]
  );

  useEffect(() => {
    generateMap(mapState.seed);
  }, []);

  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const cssWidth = parent.clientWidth;
    const cssHeight = parent.clientHeight;

    const dpr = window.devicePixelRatio || 1;
    
    if (canvas.width !== Math.round(cssWidth * dpr) || canvas.height !== Math.round(cssHeight * dpr)) {
      canvas.style.width = `${cssWidth}px`;
      canvas.style.height = `${cssHeight}px`;
      canvas.width = Math.round(cssWidth * dpr);
      canvas.height = Math.round(cssHeight * dpr);
      drawMap();
    }
  }, [drawMap]);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial call
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseDown = (e: MouseEvent) => {
        const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;

        if (isLabelMode) {
            setInputPosition({ x: clickX, y: clickY });
            setInputAbsolutePosition({ x: e.clientX, y: e.clientY });
            setInputValue('');
            setEditingCity(null);
            return;
        }

        isDraggingRef.current = true;
        lastMouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!isDraggingRef.current) return;
        const dx = e.clientX - lastMouseRef.current.x;
        const dy = e.clientY - lastMouseRef.current.y;
        lastMouseRef.current = { x: e.clientX, y: e.clientY };
        handlePan(dx, dy);
    };

    const handleMouseUp = () => {
        isDraggingRef.current = false;
    };

    const handleWheel = (e: WheelEvent) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
        handleZoom(delta, e.clientX - rect.left, e.clientY - rect.top);
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('wheel', handleWheel);
    return () => {
        if (canvas) {
            canvas.removeEventListener('mousedown', handleMouseDown);
        }
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        if (canvas) {
            canvas.removeEventListener('wheel', handleWheel);
        }
    };
}, [isLabelMode, handlePan, handleZoom]);
  

  useEffect(() => {
    drawMap();
  }, [drawMap]);
  
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.style.cursor = isDraggingRef.current
        ? 'grabbing'
        : isLabelMode
        ? 'crosshair'
        : 'grab';
    }
  }, [isDraggingRef.current, isLabelMode]);

  const handleClearLabels = useCallback(() => {
    setMapState(prev => ({ ...prev, labels: [] }));
  }, []);

  const handleZoomIn = useCallback(() => handleZoom(1.1), [handleZoom]);
  const handleZoomOut = useCallback(() => handleZoom(0.9), [handleZoom]);
  const handleCenterMap = useCallback(() => handleCenter(), [handleCenter]);
  const handleGenerateMap = useCallback(
    () => generateMap(Math.random()),
    [generateMap]
  );
  
  const handleRaiseOcean = useCallback(
    () => handleOceanLevelChange(Math.min(mapState.oceanLevel + 0.02, 1)),
    [handleOceanLevelChange, mapState.oceanLevel]
  );
  const handleLowerOcean = useCallback(
    () => handleOceanLevelChange(Math.max(mapState.oceanLevel - 0.02, 0)),
    [handleOceanLevelChange, mapState.oceanLevel]
  );


  return (
      <div
        ref={containerRef}
        className="map-container"
        style={{ 
          position: 'relative', 
          width: '100%', 
          height: '100%',
          cursor: isLabelMode ? "crosshair" : (isDraggingRef.current ? "grabbing" : "grab"),
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            width: '100%',
            height: '100%',
            display: 'block',
          }}
        />

        {inputPosition && inputAbsolutePosition && (
          <input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleInputKeyDown}
            onBlur={finalizeLabel}
            placeholder="Enter name..."
            style={{
              position: 'fixed',
              left: `${inputAbsolutePosition.x}px`,
              top: `${inputAbsolutePosition.y}px`,
              transform: 'translate(-50%, -50%)',
              zIndex: 100,
              width: '150px',
              pointerEvents: 'auto',
              color: 'black',
              background: "rgba(255,255,220,0.9)",
              border: "1px solid #ccc",
              borderRadius: "4px",
              padding: "2px 4px",
              fontSize: "12px",
            }}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          />
        )}

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur-sm text-foreground rounded-lg p-1 flex items-center gap-1 border shadow-lg">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleGenerateMap}
                >
                  <RefreshCw className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Generate a new map</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant={isLabelMode ? "secondary" : "ghost"} size="icon" onClick={() => setIsLabelMode(prev => !prev)}>
                        <Type className="h-5 w-5" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{isLabelMode ? "Click on map to label..." : "Add Label"}</p>
                </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={handleClearLabels}>
                        <Trash2 className="h-5 w-5" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Clear all labels</p>
                </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={handleLowerOcean}>
                  <ArrowDown className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Lower Ocean Level</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={handleRaiseOcean}>
                  <ArrowUp className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Raise Ocean Level</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-20 text-sm">
                {currentZoomPercentage}%
                <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center">
              <DropdownMenuItem onSelect={() => setZoomLevel(0.25)}>
                25%
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setZoomLevel(0.5)}>
                50%
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setZoomLevel(0.75)}>
                75%
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setZoomLevel(1)}>
                100%
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setZoomLevel(1.5)}>
                150%
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setZoomLevel(2)}>
                200%
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={handleCenterMap}>
                  <Expand className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Center map</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={handleZoomIn}>
                  <ZoomIn className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Zoom in</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={handleZoomOut}>
                  <ZoomOut className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Zoom out</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
    </div>
  );
}
