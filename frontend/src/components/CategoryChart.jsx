import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";

const data = [
  { name: "Food", value: 5000 },
  { name: "Transport", value: 3000 },
  { name: "Shopping", value: 2500 },
  { name: "Gym", value: 1500 },
  { name: "Others", value: 2000 },
];

const COLORS = [
  "#287a43",
  "#6d9f7a",
  "#a7c8b0",
  "#c7dfce",
  "#e0ebe2",
];

function CategoryChart() {
  return (
    <div className="chart-card category-card">
      <div className="chart-header">
        <div>
          <h3>Spending by Category</h3>
          <p>Where your money is going</p>
        </div>
      </div>

      <div className="category-content">
        <div className="pie-container">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={55}
                outerRadius={82}
                paddingAngle={3}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index]}
                  />
                ))}
              </Pie>

              <Tooltip
                formatter={(value) => `₹${value.toLocaleString()}`}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="category-list">
          {data.map((item, index) => (
            <div className="category-item" key={item.name}>
              <div className="category-name">
                <span
                  className="category-dot"
                  style={{ background: COLORS[index] }}
                ></span>

                {item.name}
              </div>

              <strong>₹{item.value.toLocaleString()}</strong>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CategoryChart;