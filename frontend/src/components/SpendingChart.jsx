import { useEffect, useState } from "react";
import { apiFetch } from "../utils/api";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";


function SpendingChart({ refreshTrigger, selectedMonth }) {

  const [data, setData] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");


  // =========================
  // FETCH SPENDING SUMMARY
  // =========================

  useEffect(() => {

    const fetchSpendingSummary = async () => {

      const token = localStorage.getItem("access");

      if (!token) {
        setLoading(false);
        return;
      }


      try {
        const url = selectedMonth
          ? `/api/transactions/spending-summary/?month=${selectedMonth}`
          : "/api/transactions/spending-summary/";

        const response = await apiFetch(url);


        if (!response.ok) {
          throw new Error(
            "Failed to fetch spending summary"
          );
        }


        const result = await response.json();


        const formattedData = result.map(
          (item) => ({
            date: item.date,
            spending: Number(item.value),
          })
        );


        setData(formattedData);


      } catch (error) {

        console.error(
          "Spending summary error:",
          error
        );

        setError(
          "Could not load spending data."
        );


      } finally {

        setLoading(false);

      }

    };


    fetchSpendingSummary();

  }, [refreshTrigger, selectedMonth]);


  // =========================
  // LOADING
  // =========================

  if (loading) {

    return (
      <div className="chart-card">

        <div className="chart-header">

          <div>
            <h3>Spending Overview</h3>

            <p>
              Your spending activity
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
      <div className="chart-card">

        <div className="chart-header">

          <div>
            <h3>Spending Overview</h3>

            <p>
              Your spending activity
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
      <div className="chart-card">

        <div className="chart-header">

          <div>
            <h3>Spending Overview</h3>

            <p>
              Your spending activity
            </p>
          </div>

        </div>

        <div
          style={{
            padding: "30px",
            textAlign: "center",
          }}
        >
          No spending data yet.
        </div>

      </div>
    );

  }


  return (

    <div className="chart-card">


      {/* ========================= */}
      {/* HEADER */}
      {/* ========================= */}

      <div className="chart-header">

        <div>

          <h3>
            Spending Overview
          </h3>

          <p>
            Your spending activity
          </p>

        </div>

      </div>


      {/* ========================= */}
      {/* CHART */}
      {/* ========================= */}

      <div
        style={{
          width: "100%",
          height: "280px",
        }}
      >

        <ResponsiveContainer
          width="100%"
          height="100%"
        >

          <AreaChart
            data={data}
            margin={{
              top: 10,
              right: 10,
              left: 0,
              bottom: 0,
            }}
          >

            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
            />

            <XAxis
              dataKey="date"
              tickFormatter={(date) => {

                const formattedDate =
                  new Date(date);

                return formattedDate.toLocaleDateString(
                  "en-IN",
                  {
                    day: "numeric",
                    month: "short",
                  }
                );

              }}
            />

            <YAxis
              tickFormatter={(value) =>
                `₹${value}`
              }
            />

            <Tooltip
              formatter={(value) =>
                `₹${Number(
                  value
                ).toLocaleString("en-IN")}`
              }

              labelFormatter={(date) => {

                const formattedDate =
                  new Date(date);

                return formattedDate.toLocaleDateString(
                  "en-IN",
                  {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  }
                );

              }}
            />


            <Area
              type="monotone"
              dataKey="spending"
              stroke="#287a43"
              fill="#c7dfce"
              strokeWidth={2}
            />

          </AreaChart>

        </ResponsiveContainer>

      </div>


    </div>

  );

}


export default SpendingChart;