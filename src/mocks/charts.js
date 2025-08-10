// Real Chart.js implementation
// Install: npm install chart.js react-chartjs-2

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Export Chart.js for manual registration if needed
export const Chart = ChartJS;
export { CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend };

// Default chart options
export const defaultOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: 'Chart',
    },
  },
  scales: {
    y: {
      beginAtZero: true,
    },
  },
};

// Export react-chartjs-2 components with error handling
export const BarChart = ({ data, options = {}, ...props }) => {
  if (!data) {
    return (
      <div className="w-full h-64 bg-gray-100 rounded flex items-center justify-center">
        <span className="text-gray-500">Không có dữ liệu để hiển thị</span>
      </div>
    );
  }

  return (
    <div className="w-full h-64">
      <Bar data={data} options={{ ...defaultOptions, ...options }} {...props} />
    </div>
  );
};

export const LineChart = ({ data, options = {}, ...props }) => {
  if (!data) {
    return (
      <div className="w-full h-64 bg-gray-100 rounded flex items-center justify-center">
        <span className="text-gray-500">Không có dữ liệu để hiển thị</span>
      </div>
    );
  }

  return (
    <div className="w-full h-64">
      <Line data={data} options={{ ...defaultOptions, ...options }} {...props} />
    </div>
  );
};

export const PieChart = ({ data, options = {}, ...props }) => {
  if (!data) {
    return (
      <div className="w-full h-64 bg-gray-100 rounded flex items-center justify-center">
        <span className="text-gray-500">Không có dữ liệu để hiển thị</span>
      </div>
    );
  }

  return (
    <div className="w-full h-64">
      <Pie data={data} options={{ ...defaultOptions, ...options }} {...props} />
    </div>
  );
};

export const DoughnutChart = ({ data, options = {}, ...props }) => {
  if (!data) {
    return (
      <div className="w-full h-64 bg-gray-100 rounded flex items-center justify-center">
        <span className="text-gray-500">Không có dữ liệu để hiển thị</span>
      </div>
    );
  }

  return (
    <div className="w-full h-64">
      <Doughnut data={data} options={{ ...defaultOptions, ...options }} {...props} />
    </div>
  );
};

// For backward compatibility, export with original names
export { BarChart as Bar, LineChart as Line, PieChart as Pie, DoughnutChart as Doughnut };