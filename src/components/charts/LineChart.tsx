import { useEffect, useState } from 'react';

interface DataPoint {
  date: string;
  value: number;
}

interface LineChartProps {
  data: DataPoint[];
  color?: string;
  height?: number;
  showDots?: boolean;
}

export const LineChart = ({
  data,
  color = '#0ea5e9',
  height = 150,
  showDots = true
}: LineChartProps) => {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center text-gray-400 text-sm" style={{ height }}>
        No data available
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value), 1);
  const minValue = Math.min(...data.map(d => d.value), 0);
  const range = maxValue - minValue || 1;

  const points = data.map((point, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - (((point.value - minValue) / range) * 100);
    return { x, y, value: point.value, date: point.date };
  });

  const pathD = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x},${point.y}`)
    .join(' ');

  const areaD = `${pathD} L 100,100 L 0,100 Z`;

  return (
    <div className="w-full" style={{ height }}>
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="w-full h-full"
        style={{ overflow: 'visible' }}
      >
        <defs>
          <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: color, stopOpacity: 0.3 }} />
            <stop offset="100%" style={{ stopColor: color, stopOpacity: 0.05 }} />
          </linearGradient>
        </defs>

        <path
          d={areaD}
          fill={`url(#gradient-${color})`}
          className="transition-all duration-1000"
          style={{
            opacity: animate ? 1 : 0,
          }}
        />

        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          className="transition-all duration-1000"
          style={{
            strokeDasharray: animate ? 'none' : '1000',
            strokeDashoffset: animate ? 0 : 1000,
          }}
        />

        {showDots && animate && points.map((point, index) => (
          <g key={index}>
            <circle
              cx={point.x}
              cy={point.y}
              r="1.5"
              fill="white"
              stroke={color}
              strokeWidth="1.5"
              vectorEffect="non-scaling-stroke"
              className="transition-all duration-300 hover:r-3"
            >
              <title>{`${point.date}: ${point.value}`}</title>
            </circle>
          </g>
        ))}
      </svg>
    </div>
  );
};
