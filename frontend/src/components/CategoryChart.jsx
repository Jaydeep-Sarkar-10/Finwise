import { useEffect, useState } from "react";
import { apiFetch } from "../utils/api";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";


const COLORS = [
  "#287a43",
  "#6d9f7a",
  "#a7c8b0",
  "#c7dfce",
  "#e0ebe2",
  "#4f8f64",
  "#8bb59a",
];


function CategoryChart({ refreshTrigger }) {

  const [data, setData] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");


  // =========================
  // FETCH CATEGORY SUMMARY
  // =========================

  useEffect(() => {

    const fetchCategorySummary = async () => {

      const token = localStorage.getItem("access");

      if (!token) {
        setLoading(false);
        return;
      }


      try {

        const response = await apiFetch(
  "/api/transactions/category-summary/"
);


        if (!response.ok) {
          throw new Error(
            "Failed to fetch category summary"
          );
        }


        const result = await response.json();


        // Convert backend Decimal values
        // into JavaScript numbers

        const formattedData = result.map(
          (item) => ({
            name: item.name,
            value: Number(item.value),
          })
        );


        setData(formattedData);


      } catch (error) {

        console.error(
          "Category summary error:",
          error
        );

        setError(
          "Could not load category spending."
        );


      } finally {

        setLoading(false);

      }

    };


    fetchCategorySummary();

  }, [refreshTrigger]);


  // =========================
  // LOADING
  // =========================

  if (loading) {

    return (
      <div className="chart-card category-card">

        <div className="chart-header">

          <div>

            <h3>
              Spending by Category
            </h3>

            <p>
              Where your money is going
            </p>

          </div>

        </div>


        <div
          style={{
            padding: "30px",
            textAlign: "center",
          }}
        >
          Loading...
        </div>

      </div>
    );

  }


  // =========================
  // ERROR
  // =========================

  if (error) {

    return (
      <div className="chart-card category-card">

        <div className="chart-header">

          <div>

            <h3>
              Spending by Category
            </h3>

            <p>
              Where your money is going
            </p>

          </div>

        </div>


        <div
          style={{
            padding: "30px",
            textAlign: "center",
          }}
        >
          {error}
        </div>

      </div>
    );

  }


  // =========================
  // EMPTY STATE
  // =========================

  if (data.length === 0) {

    return (
      <div className="chart-card category-card">

        <div className="chart-header">

          <div>

            <h3>
              Spending by Category
            </h3>

            <p>
              Where your money is going
            </p>

          </div>

        </div>


        <div
          style={{
            padding: "30px",
            textAlign: "center",
          }}
        >
          No expenses yet.
        </div>

      </div>
    );

  }


  // =========================
  // TOTAL SPENDING
  // =========================

  const totalSpending = data.reduce(
    (total, item) =>
      total + item.value,
    0
  );


  return (

    <div className="chart-card category-card">


      {/* ========================= */}
      {/* HEADER */}
      {/* ========================= */}

      <div className="chart-header">

        <div>

          <h3>
            Spending by Category
          </h3>

          <p>
            Where your money is going
          </p>

        </div>

      </div>


      {/* ========================= */}
      {/* CHART CONTENT */}
      {/* ========================= */}

      <div className="category-content">


        {/* ========================= */}
        {/* PIE CHART */}
        {/* ========================= */}

        <div className="pie-container">

          <ResponsiveContainer
            width="100%"
            height="100%"
          >

            <PieChart>

              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={55}
                outerRadius={82}
                paddingAngle={3}
              >

                {data.map(
                  (entry, index) => (

                    <Cell
                      key={`cell-${index}`}
                      fill={
                        COLORS[
                          index % COLORS.length
                        ]
                      }
                    />

                  )
                )}

              </Pie>


              <Tooltip
                formatter={(value) =>
                  `₹${Number(
                    value
                  ).toLocaleString("en-IN")}`
                }
              />

            </PieChart>

          </ResponsiveContainer>

        </div>


        {/* ========================= */}
        {/* CATEGORY LIST */}
        {/* ========================= */}

        <div className="category-list">

          {data.map(
            (item, index) => (

              <div
                className="category-item"
                key={item.name}
              >

                <div className="category-name">

                  <span
                    className="category-dot"
                    style={{
                      background:
                        COLORS[
                          index %
                            COLORS.length
                        ],
                    }}
                  ></span>


                  {item.name}

                </div>


                <strong>

                  ₹
                  {item.value.toLocaleString(
                    "en-IN"
                  )}

                </strong>

              </div>

            )
          )}

        </div>


      </div>

    </div>

  );
}


export default CategoryChart;