import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

interface BarChartProps {
  data: Array<{ label: string; value: number; }>;
  color: string;
  isHorizontal: boolean;
}

export function BarChart({ data, color, isHorizontal }: BarChartProps) {
  const maxValue = Math.max(...data.map(item => item.value));

  // Calculate proper axis max based on tick intervals
  const calculateAxisMax = (max: number) => {
    if (max <= 10) {
      // For values 0-10, use increments of 1 or 2
      const increment = max <= 5 ? 1 : 2;
      return Math.ceil(max / increment) * increment + (2 * increment);
    } else if (max <= 50) {
      // For values 10-50, use increments of 5
      const increment = 5;
      return Math.ceil(max / increment) * increment + (2 * increment);
    } else if (max <= 100) {
      // For values 50-100, use increments of 10
      const increment = 10;
      return Math.ceil(max / increment) * increment + (2 * increment);
    } else {
      // For larger values, use increments of 20
      const increment = 20;
      return Math.ceil(max / increment) * increment + (2 * increment);
    }
  };

  const axisMax = calculateAxisMax(maxValue);

  const chartData = {
    labels: data.map(item => item.label),
    datasets: [
      {
        label: 'Percentage',
        data: data.map(item => item.value),
        backgroundColor: `${color}80`,
        borderRadius: 4,
        maxBarThickness: 40,
      },
    ],
  };

  const options: ChartOptions<'bar'> & {
    plugins: {
      datalabels: any;
      [key: string]: any;
    };
  } = {
    indexAxis: isHorizontal ? 'y' : 'x',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#ffffff',
        titleColor: '#374151',
        bodyColor: '#374151',
        borderColor: '#5e17eb',
        borderWidth: 1,
        cornerRadius: 8,
      },
      datalabels: {
        display: true,
        color: '#374151',
        font: {
          weight: 'bold',
          size: 11,
        },
        formatter: (value: number) => `${value}%`,
        anchor: isHorizontal ? 'end' : 'end',
        align: isHorizontal ? 'right' : 'top',
        offset: 4,
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        max: isHorizontal ? axisMax : undefined,
        grid: {
          display: false
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 12,
            weight: 'bold'
          }
        }
      },
      y: {
        beginAtZero: true,
        max: !isHorizontal ? axisMax : undefined,
        grid: {
          display: false
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 12,
            weight: 'bold'
          }
        }
      }
    }
  };

  return (
    <div className="w-full h-64 relative">
      <Bar data={chartData} options={options} />
    </div>
  );
}
