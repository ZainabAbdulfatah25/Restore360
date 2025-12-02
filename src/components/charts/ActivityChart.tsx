import { useEffect, useState } from 'react';
import { TrendingUp } from 'lucide-react';

interface ActivityDataPoint {
  label: string;
  value: number;
  color: string;
}

interface ActivityChartProps {
  data: ActivityDataPoint[];
  title?: string;
  height?: number;
}

export const ActivityChart = ({ data, title = 'Activity Overview', height = 200 }: ActivityChartProps) => {
  const [animatedData, setAnimatedData] = useState<ActivityDataPoint[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedData(data);
    }, 100);

    return () => clearTimeout(timer);
  }, [data]);

  const maxValue = Math.max(...data.map(d => d.value), 1);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-teal-600" />
          {title}
        </h3>
      </div>

      <div className="space-y-3 sm:space-y-4" style={{ minHeight: height }}>
        {animatedData.map((item, index) => {
          const percentage = (item.value / maxValue) * 100;

          return (
            <div key={index} className="space-y-1">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="font-medium text-gray-700 truncate max-w-[60%]">{item.label}</span>
                <span className="font-bold text-gray-900 ml-2">{item.value}</span>
              </div>

              <div className="relative w-full bg-gray-100 rounded-full h-3 sm:h-4 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: item.color,
                  }}
                >
                  <div
                    className="absolute inset-0 opacity-20"
                    style={{
                      background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.5) 50%, transparent 100%)',
                      animation: 'shimmer 2s infinite',
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};
