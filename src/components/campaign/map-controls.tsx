'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { createNoise2D } from 'simplex-noise';
import { Delaunay } from 'd3-delaunay';

// --- Type Definitions ---
interface Tile {
  id: number;
  type: 'ocean' | 'plains' | 'forest' | 'mountains' | 'beach' | 'polar';
  height: number;
  polygon: [number, number][];
  point: [number, number];
  neighbors: number[];
}

interface City {
    x: number;
    y: number;
    name: string;
}

interface Label {
    x: number;
    y: number;
    text: string;
}

export function MapRenderer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [terrain, setTerrain] = useState<Tile[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [labels, setLabels] = useState<Label[]>([]);
  const [voronoi, setVoronoi] = useState<Delaunay.Voronoi<[number, number]> | null>(null);
  const [delaunay, setDelaunay] = useState<Delaunay<[number, number]> | null>(null);

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
  const minZoom = 0.2;
  const maxZoom = 5;

  const handleCenter = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || terrain.length === 0) return;
    const landTiles = terrain.filter(t => t.type !== 'ocean');
    if (landTiles.length === 0) return;

    const xs = landTiles.flatMap(t => t.polygon.map(p => p[0]));
    const ys = landTiles.flatMap(t => t.polygon.map(p => p[1]));
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const landWidth = maxX - minX;
    const landHeight = maxY - minY;
    const { width, height } = canvas;
    const padding = 40;
    const zoomX = (width - padding * 2) / landWidth;
    const zoomY = (height - padding * 2) / landHeight;
    const newZoom = Math.min(zoomX, zoomY, maxZoom);
    targetZoomRef.current = newZoom;
    targetOffsetRef.current = {
      x: width / 2 - (minX + landWidth / 2) * newZoom,
      y: height / 2 - (minY + landHeight / 2) * newZoom,
    };
    startAnimation();
  }, [terrain, startAnimation]);

  // Generate terrain
  const generateMap = useCallback(() => {
    const noiseGen = createNoise2D(Math.random);
    const points: [number, number][] = Array.from({ length: numPoints }, () => [
      Math.random() * mapWidth,
      Math.random() * mapHeight,
    ]);
    const d = Delaunay.from(points);
    const v = d.voronoi([0, 0, mapWidth, mapHeight]);
    setDelaunay(d);
    setVoronoi(v);

    const newTerrain: Tile[] = [];
    for (let i = 0; i < points.length; i++) {
      const point = points[i];
      const polygon = v.cellPolygon(i);
      if (!polygon) continue;
      const [x, y] = point;

      const nx = (x / mapWidth) - 0.5;
      const ny = (y / mapHeight) - 0.5;

      // Terrain value based on noise
      const value = (() => {
        let sum = 0, amp = 1, freq = 2, maxV = 0;
        for (let o = 0; o < 5; o++) {
          sum += noiseGen(nx * freq, ny * freq) * amp;
          maxV += amp;
          amp *= 0.5;
          freq *= 2;
        }
        return (sum / maxV + 1) / 2;
      })();
      
      const islandValue = value - Math.sqrt(nx * nx + ny * ny) * 0.6;

      // Assign terrain type
      let type: Tile['type'] = 'mountains';
      if (islandValue < 0.2) type = 'ocean';
      else if (islandValue < 0.23) type = 'beach';
      else if (islandValue < 0.5) type = 'plains';
      else if (islandValue < 0.7) type = 'forest';
      else type = 'mountains';

      const neighbors = Array.from(d.neighbors(i));
      newTerrain.push({ id: i, point: [x, y], type, height: islandValue, polygon: polygon as [number, number][], neighbors });
    }
    
     // Post-process to ensure beaches are adjacent to oceans
    const finalTerrain: Tile[] = newTerrain.map(tile => {
        if (tile.type === 'beach') {
            const hasOceanNeighbor = tile.neighbors.some(nIndex => newTerrain[nIndex]?.type === 'ocean');
            if (!hasOceanNeighbor) {
                return { ...tile, type: 'plains' }; // Revert to plains if no ocean nearby
            }
        }
        return tile;
    });

    setTerrain(finalTerrain);

    // Generate cities on plains/forests
    const cityCandidates = finalTerrain.filter(t => t.type === 'plains' || t.type === 'forest');
    const newCities: City[] = [];
    for (let i = 0; i < 15; i++) {
      const tile = cityCandidates[Math.floor(Math.random() * cityCandidates.length)];
      if (tile) {
        const tooClose = newCities.some(c => Math.hypot(c.x - tile.point[0], c.y - tile.point[1]) < 150);
        if (!tooClose) newCities.push({ x: tile.point[0], y: tile.point[1], name: '' });
      }
    }
    setCities(newCities);
    setLabels([]);
    handleCenter();
  }, []);

  // Draw map with optimized rendering
  const drawMap = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !terrain.length || !voronoi || !delaunay) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.translate(offsetRef.current.x, offsetRef.current.y);
    ctx.scale(zoomRef.current, zoomRef.current);

    // Draw tiles with fill only, no outlines
    for (const tile of terrain) {
      let color;
      if (tile.type === 'ocean') color = '#1e90ff';
      else if (tile.type === 'plains') color = '#32cd32';
      else if (tile.type === 'forest') color = '#228b22';
      else if (tile.type === 'mountains') color = '#808080';
      else if (tile.type === 'beach') color = '#f4a460';


      ctx.beginPath();
      if (tile.polygon.length > 0) {
        ctx.moveTo(tile.polygon[0][0], tile.polygon[0][1]);
        for (let i = 1; i < tile.polygon.length; i++) {
          ctx.lineTo(tile.polygon[i][0], tile.polygon[i][1]);
        }
        ctx.closePath();
      }
      ctx.fillStyle = color as string;
      ctx.fill();
    }
    
    // Draw cities
    for (const city of cities) {
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.arc(city.x, city.y, 3 / zoomRef.current, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }, [terrain, cities, voronoi, delaunay]);

  // Animate zoom & pan
  const animate = useCallback(() => {
    const zoom = zoomRef.current;
    const offset = offsetRef.current;
    const targetZoom = targetZoomRef.current;
    const targetOffset = targetOffsetRef.current;

    const zoomDiff = targetZoom - zoom;
    const offsetXDiff = targetOffset.x - offset.x;
    const offsetYDiff = targetOffset.y - offset.y;

    if (
      Math.abs(zoomDiff) < 0.001 &&
      Math.abs(offsetXDiff) < 0.1 &&
      Math.abs(offsetYDiff) < 0.1
    ) {
      zoomRef.current = targetZoom;
      offsetRef.current = targetOffset;
      if(animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    } else {
      zoomRef.current += zoomDiff * 0.2;
      offsetRef.current.x += offsetXDiff * 0.2;
      offsetRef.current.y += offsetYDiff * 0.2;
      animationFrameRef.current = requestAnimationFrame(animate);
    }
    drawMap();
  }, [drawMap]);

  const startAnimation = useCallback(() => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    animationFrameRef.current = requestAnimationFrame(animate);
  }, [animate]);

  // Map control handlers
  const handleZoom = useCallback(
    (delta: number) => {
        const newZoom = Math.max(minZoom, Math.min(maxZoom, targetZoomRef.current * delta));
        targetZoomRef.current = newZoom;
        startAnimation();
    },
    [startAnimation]
);

  const handlePan = useCallback((dx: number, dy: number) => {
    targetOffsetRef.current.x += dx;
    targetOffsetRef.current.y += dy;
    startAnimation();
  }, [startAnimation]);

  // Generate map on load
  useEffect(() => {
    generateMap();
  }, [generateMap]);

  // Center map after terrain generated
  useEffect(() => {
    handleCenter();
  }, [terrain, handleCenter]);

  // Drawing on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const handleResize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
        handleCenter(); // Recenter on resize
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial size
    
    return () => window.removeEventListener('resize', handleResize);
  }, [handleCenter]);
  
  useEffect(() => {
    drawMap();
  }, [drawMap, terrain]);

  // Animate panning & zoom
  useEffect(() => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    animationFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if(animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [animate]);

  // Mouse events for dragging
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      lastMouseRef.current = { x: e.clientX, y: e.clientY };
      canvas.style.cursor = 'grabbing';
    };
    const onMouseUp = () => {
      isDraggingRef.current = false;
      canvas.style.cursor = 'grab';
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const dx = e.clientX - lastMouseRef.current.x;
      const dy = e.clientY - lastMouseRef.current.y;
      lastMouseRef.current = { x: e.clientX, y: e.clientY };
      handlePan(dx, dy);
    };

    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mousemove', onMouseMove);
    return () => {
      if (canvas) {
        canvas.removeEventListener('mousedown', onMouseDown);
      }
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, [handlePan]);

  return (
    <div className="map-container" style={{ position: 'relative', width: '100%', height: '100%' }}>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '100%', display: 'block', cursor: 'grab' }}
      />
      <div style={{
        position: 'absolute',
        bottom: 10,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '10px'
      }}>
        <button onClick={() => handleZoom(1.2)}>+</button>
        <button onClick={() => handleZoom(0.8)}>-</button>
        <button onClick={handleCenter}>Center</button>
        <button onClick={generateMap}>Generate</button>
      </div>
    </div>
  );
}