// Mock Chart.js components for compilation

export const Chart = {
  register: () => {},
  defaults: {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Chart' }
    }
  }
};

export const CategoryScale = {};
export const LinearScale = {};
export const BarElement = {};
export const Title = {};
export const Tooltip = {};
export const Legend = {};

// Mock react-chartjs-2 components
export const Bar = ({ data, options, ...props }) => (
  <div className="w-full h-64 bg-gray-100 rounded flex items-center justify-center">
    <span className="text-gray-500">Bar Chart Placeholder</span>
  </div>
);

export const Line = ({ data, options, ...props }) => (
  <div className="w-full h-64 bg-gray-100 rounded flex items-center justify-center">
    <span className="text-gray-500">Line Chart Placeholder</span>
  </div>
);

export const Pie = ({ data, options, ...props }) => (
  <div className="w-full h-64 bg-gray-100 rounded flex items-center justify-center">
    <span className="text-gray-500">Pie Chart Placeholder</span>
  </div>
);

export const Doughnut = ({ data, options, ...props }) => (
  <div className="w-full h-64 bg-gray-100 rounded flex items-center justify-center">
    <span className="text-gray-500">Doughnut Chart Placeholder</span>
  </div>
);
