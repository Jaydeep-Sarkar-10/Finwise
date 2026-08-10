import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const data = [
  { month: "Jan", income: 42000, expense: 18000 },
  { month: "Feb", income: 45000, expense: 21000 },
  { month: "Mar", income: 48000, expense: 19000 },
  { month: "Apr", income: 46000, expense: 24000 },
  { month: "May", income: 52000, expense: 22000 },
  { month: "Jun", income: 50000, expense: 20000 },
];

function SpendingChart() {
  return (
    <div className="chart-card spending-card">
      <div className="chart-header">
        <div>
          <h3>Spending Overview</h3>
          <p>Your income and expenses over time</p>
        </div>

        <select className="chart-select">
          <option>Last 6 months</option>
          <option>Last 12 months</option>
        </select>
      </div>

      <div className="chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />

            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `₹${value / 1000}k`}
            />

            <Tooltip
              formatter={(value) => `₹${value.toLocaleString()}`}
            />

            <Area
              type="monotone"
              dataKey="income"
              stroke="#287a43"
              fill="#e5f5e9"
              strokeWidth={2}
            />

            <Area
              type="monotone"
              dataKey="expense"
              stroke="#d85b55"
              fill="#fff0ef"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default SpendingChart;