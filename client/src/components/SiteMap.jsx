import { useState, useRef, useEffect } from 'react';
import { apiUrl } from '../utils/api';
import '../styles/SiteMap.css';

const SiteMap = ({ onAreaSelect, selectedArea }) => {
  const canvasRef = useRef(null);
  const [areas, setAreas] = useState([
    { id: 'site-office', name: 'Site Office', x: 20, y: 20 },
    { id: 'main-workshop', name: 'Main Workshop', x: 60, y: 40 },
    { id: 'electrical-room', name: 'Electrical Room', x: 30, y: 60 },
    { id: 'mechanical-room', name: 'Mechanical Room', x: 70, y: 60 },
    { id: 'storage-area', name: 'Storage Area', x: 50, y: 80 },
    { id: 'zone-a', name: 'Construction Zone A', x: 20, y: 80 },
    { id: 'zone-b', name: 'Construction Zone B', x: 80, y: 80 },
    { id: 'outdoor', name: 'Outdoor Work Area', x: 50, y: 20 }
  ]);

  const [toolLocations, setToolLocations] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    fetchToolLocations();
  }, []);

  const fetchToolLocations = async () => {
    try {
      const response = await fetch(apiUrl('/api/tools/locations'));
      const data = await response.json();
      setToolLocations(data);
    } catch (error) {
      console.error('Failed to fetch tool locations:', error);
    }
  };

  const drawMap = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw areas
    areas.forEach(area => {
      ctx.beginPath();
      ctx.arc(area.x * width / 100, area.y * height / 100, 20, 0, Math.PI * 2);
      ctx.fillStyle = area.id === selectedArea ? '#3498db' : '#e2e8f0';
      ctx.fill();
      ctx.strokeStyle = '#2c3e50';
      ctx.stroke();

      // Draw area name
      ctx.fillStyle = '#2c3e50';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(area.name, area.x * width / 100, area.y * height / 100 + 35);
    });

    // Draw tool locations
    toolLocations.forEach(tool => {
      ctx.beginPath();
      ctx.arc(tool.x * width / 100, tool.y * height / 100, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#e74c3c';
      ctx.fill();
    });
  };

  useEffect(() => {
    drawMap();
  }, [areas, toolLocations, selectedArea]);

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // Find clicked area
    const clickedArea = areas.find(area => {
      const dx = area.x - x;
      const dy = area.y - y;
      return Math.sqrt(dx * dx + dy * dy) < 20;
    });

    if (clickedArea) {
      onAreaSelect(clickedArea.id);
    }
  };

  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    setDragStart({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setIsDragging(true);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Update tool locations based on drag
    setToolLocations(prev => prev.map(tool => ({
      ...tool,
      x: ((x - dragStart.x) / rect.width) * 100,
      y: ((y - dragStart.y) / rect.height) * 100
    })));

    setDragStart({ x, y });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="site-map">
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        onClick={handleCanvasClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
      <div className="map-legend">
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#3498db' }}></div>
          <span>Selected Area</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#e2e8f0' }}></div>
          <span>Available Area</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#e74c3c' }}></div>
          <span>Tool Location</span>
        </div>
      </div>
    </div>
  );
};

export default SiteMap; 