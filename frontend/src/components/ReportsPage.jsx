import { useEffect, useState } from "react";
import { apiFetch } from "../utils/api";
import MonthSelector from "./MonthSelector";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

import {
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Wallet,
  Target,
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Sparkles,
  Calendar,
  Layers,
  BarChart3,
} from "lucide-react";

function ReportsPage() {
  const currentMonthStr = (() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}`;
  })();

  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReports = async (monthToFetch) => {
    const token = localStorage.getItem("access");

    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const month = monthToFetch || selectedMonth;
      const response = await apiFetch(`/api/transactions/reports/?month=${month}`);

      if (!response.ok) {
        throw new Error("Failed to fetch reports");
      }

      const data = await response.json();
      setReport(data);
    } catch (error) {
      console.error("Reports fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports(selectedMonth);
  }, [selectedMonth]);

  const formatCurrency = (value) => {
    return `₹${Number(value || 0).toLocaleString("en-IN")}`;
  };

  const formatMonth = (value) => {
    if (!value) return "";
    const [year, month] = value.split("-");
    const date = new Date(Number(year), Number(month) - 1, 1);
    return date.toLocaleDateString("en-IN", {
      month: "short",
      year: "numeric",
    });
  };

  const formatMonthLong = (value) => {
    if (!value) return "";
    const [year, month] = value.split("-");
    const date = new Date(Number(year), Number(month) - 1, 1);
    return date.toLocaleDateString("en-IN", {
      month: "long",
      year: "numeric",
    });
  };

  if (loading && !report) {
    return (
      <div className="reports-page">
        <div className="reports-page-header">
          <div>
            <p className="page-subtitle">UNDERSTAND YOUR MONEY</p>
            <h1>Monthly Reports & Analytics</h1>
            <p className="page-description">
              Analyze your income, spending, savings, and month-over-month performance.
            </p>
          </div>
        </div>

        <div className="reports-card">
          <p className="reports-message">Loading report data...</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="reports-page">
        <div className="reports-card">
          <p className="reports-message">Could not load reports.</p>
        </div>
      </div>
    );
  }

  const {
    overview,
    comparison,
    monthly,
    categories,
    budgets,
    goals,
    available_months = [],
  } = report;

  const maxMonthlyValue = Math.max(
    ...monthly.flatMap((item) => [
      Number(item.income || 0),
      Number(item.expenses || 0),
    ]),
    1
  );

  const prevMonthName = comparison?.prev_month
    ? formatMonthLong(comparison.prev_month)
    : "Previous Month";

  const currentMonthName = formatMonthLong(selectedMonth);

  return (
    <div className="reports-page">
      {/* =========================
          HEADER & MONTH SELECTOR
      ========================= */}
      <div className="reports-page-header">
        <div>
          <p className="page-subtitle">UNDERSTAND YOUR MONEY</p>
          <h1>Monthly Reports & Analytics</h1>
          <p className="page-description">
            Comprehensive financial statement and comparative analytics for{" "}
            <strong>{currentMonthName}</strong>.
          </p>
        </div>

        <MonthSelector
          selectedMonth={selectedMonth}
          onChangeMonth={setSelectedMonth}
          availableMonths={available_months}
        />
      </div>

      {/* =========================
          MONTH-OVER-MONTH INSIGHT BANNER
      ========================= */}
      {comparison && (
        <div className="reports-insights-banner">
          <div className="insights-icon-circle">
            <Sparkles size={20} />
          </div>
          <div className="insights-text">
            <strong>Month-over-Month Comparison ({currentMonthName} vs {prevMonthName})</strong>
            <p>
              {comparison.income.diff >= 0 ? (
                <span>Income increased by <strong>{formatCurrency(comparison.income.diff)}</strong> (+{comparison.income.pct_change}%)</span>
              ) : (
                <span>Income decreased by <strong>{formatCurrency(Math.abs(comparison.income.diff))}</strong> ({comparison.income.pct_change}%)</span>
              )}
              {" • "}
              {comparison.expenses.diff <= 0 ? (
                <span>Spending reduced by <strong>{formatCurrency(Math.abs(comparison.expenses.diff))}</strong> ({comparison.expenses.pct_change}%)</span>
              ) : (
                <span>Spending increased by <strong>{formatCurrency(comparison.expenses.diff)}</strong> (+{comparison.expenses.pct_change}%)</span>
              )}
              {" • "}
              <span>
                Net Savings for this month: <strong>{formatCurrency(overview.savings)}</strong> (Savings rate: {overview.savings_rate}%)
              </span>
            </p>
          </div>
        </div>
      )}

      {/* =========================
          COMPARATIVE METRICS GRID
      ========================= */}
      <div className="reports-mom-grid">
        {/* INCOME CARD */}
        <div className="report-mom-card">
          <div className="report-mom-card-top">
            <div className="report-summary-icon income-icon">
              <TrendingUp size={20} />
            </div>
            {comparison?.income && (
              <span
                className={`mom-trend-badge ${
                  comparison.income.diff >= 0 ? "positive" : "negative"
                }`}
              >
                {comparison.income.diff >= 0 ? (
                  <ArrowUpRight size={14} />
                ) : (
                  <ArrowDownRight size={14} />
                )}
                {Math.abs(comparison.income.pct_change)}%
              </span>
            )}
          </div>

          <div className="report-mom-card-body">
            <span className="mom-label">Monthly Income</span>
            <strong className="mom-value">{formatCurrency(overview.income)}</strong>
            {comparison?.income && (
              <div className="mom-subtext">
                vs {prevMonthName}:{" "}
                <span className={comparison.income.diff >= 0 ? "text-green" : "text-red"}>
                  {comparison.income.diff >= 0 ? "+" : ""}
                  {formatCurrency(comparison.income.diff)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* EXPENSES CARD */}
        <div className="report-mom-card">
          <div className="report-mom-card-top">
            <div className="report-summary-icon expense-icon">
              <TrendingDown size={20} />
            </div>
            {comparison?.expenses && (
              <span
                className={`mom-trend-badge ${
                  comparison.expenses.diff <= 0 ? "positive" : "negative"
                }`}
              >
                {comparison.expenses.diff <= 0 ? (
                  <ArrowDownRight size={14} />
                ) : (
                  <ArrowUpRight size={14} />
                )}
                {Math.abs(comparison.expenses.pct_change)}%
              </span>
            )}
          </div>

          <div className="report-mom-card-body">
            <span className="mom-label">Monthly Expenses</span>
            <strong className="mom-value">{formatCurrency(overview.expenses)}</strong>
            {comparison?.expenses && (
              <div className="mom-subtext">
                vs {prevMonthName}:{" "}
                <span className={comparison.expenses.diff <= 0 ? "text-green" : "text-red"}>
                  {comparison.expenses.diff >= 0 ? "+" : ""}
                  {formatCurrency(comparison.expenses.diff)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* SAVINGS CARD */}
        <div className="report-mom-card savings-mom-card">
          <div className="report-mom-card-top">
            <div className="report-summary-icon savings-icon">
              <PiggyBank size={20} />
            </div>
            {comparison?.savings && (
              <span
                className={`mom-trend-badge ${
                  comparison.savings.diff >= 0 ? "positive" : "neutral"
                }`}
              >
                {comparison.savings.diff >= 0 ? (
                  <ArrowUpRight size={14} />
                ) : (
                  <ArrowDownRight size={14} />
                )}
                {Math.abs(comparison.savings.pct_change)}%
              </span>
            )}
          </div>

          <div className="report-mom-card-body">
            <span className="mom-label">Monthly Savings</span>
            <strong className="mom-value text-savings-green">{formatCurrency(overview.savings)}</strong>
            <div className="mom-subtext">
              Savings Rate: <strong className="text-savings-green">{Number(overview.savings_rate || 0).toFixed(1)}%</strong>
            </div>
          </div>
        </div>

        {/* MONTHLY NET CASHFLOW / BALANCE */}
        <div className="report-mom-card">
          <div className="report-mom-card-top">
            <div className="report-summary-icon balance-icon">
              <Wallet size={20} />
            </div>
            <span className="mom-badge-neutral">
              All-Time: {formatCurrency(overview.all_time_balance)}
            </span>
          </div>

          <div className="report-mom-card-body">
            <span className="mom-label">Month's Net Balance</span>
            <strong
              className={`mom-value ${
                overview.balance >= 0 ? "text-green" : "text-red"
              }`}
            >
              {formatCurrency(overview.balance)}
            </strong>
            <div className="mom-subtext">
              Income − Expenses − Savings
            </div>
          </div>
        </div>
      </div>

      {/* =========================
          MULTI-MONTH HISTORICAL CHART
      ========================= */}
      <div className="chart-card reports-chart-card">
        <div className="chart-header">
          <div>
            <h3>Monthly Historical Comparison</h3>
            <p>Compare Income, Expenses, and Savings across recorded months</p>
          </div>
        </div>

        {monthly.length === 0 ? (
          <div className="reports-empty-small">
            No historical transaction data recorded yet.
          </div>
        ) : (
          <div style={{ width: "100%", height: "300px", marginTop: "12px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthly.map((m) => {
                  const [y, mon] = m.month.split("-");
                  const dObj = new Date(Number(y), Number(mon) - 1, 1);
                  const label = dObj.toLocaleDateString("en-IN", {
                    month: "short",
                    year: "numeric",
                  });
                  return {
                    monthKey: m.month,
                    name: label,
                    Income: Number(m.income || 0),
                    Expenses: Number(m.expenses || 0),
                    Savings: Number(m.savings || 0),
                  };
                })}
                margin={{ top: 15, right: 15, left: 0, bottom: 0 }}
                onClick={(e) => {
                  if (e && e.activePayload && e.activePayload[0]) {
                    const clickedMonth = e.activePayload[0].payload.monthKey;
                    if (clickedMonth) {
                      setSelectedMonth(clickedMonth);
                    }
                  }
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e8ebe6"
                />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#727770", fontSize: 12 }}
                  axisLine={{ stroke: "#e2e6df" }}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={(val) => `₹${val}`}
                  tick={{ fill: "#727770", fontSize: 12 }}
                  axisLine={{ stroke: "#e2e6df" }}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: "rgba(40, 122, 67, 0.05)" }}
                  formatter={(value, name) => [
                    `₹${Number(value).toLocaleString("en-IN")}`,
                    name,
                  ]}
                  contentStyle={{
                    backgroundColor: "#20231f",
                    borderRadius: "10px",
                    border: "none",
                    color: "#ffffff",
                    padding: "10px 14px",
                    fontSize: "13px",
                    boxShadow: "0 4px 14px rgba(0, 0, 0, 0.15)",
                  }}
                  itemStyle={{ color: "#ffffff", padding: "2px 0" }}
                  labelStyle={{
                    color: "#9ca19a",
                    fontWeight: "600",
                    marginBottom: "4px",
                  }}
                />
                <Legend
                  wrapperStyle={{ paddingTop: "12px", fontSize: "13px" }}
                />
                <Bar
                  dataKey="Income"
                  fill="#287a43"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={36}
                />
                <Bar
                  dataKey="Expenses"
                  fill="#e66a6a"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={36}
                />
                <Bar
                  dataKey="Savings"
                  fill="#52b774"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={36}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* =========================
          CATEGORY SPENDING & COMPARISON
      ========================= */}
      <div className="reports-two-column">
        {/* CATEGORY SPENDING WITH MOM COMPARISON */}
        <div className="reports-card">
          <div className="reports-card-header">
            <div>
              <h3>Category Spending & Shifts</h3>
              <p>Spending for {currentMonthName} vs {prevMonthName}</p>
            </div>
          </div>

          {categories.length === 0 ? (
            <div className="reports-empty-small">
              No spending data recorded for {currentMonthName}.
            </div>
          ) : (
            <div className="category-report-list">
              {categories.map((category) => {
                const totalExpenses = Number(overview.expenses || 0);
                const percentage =
                  totalExpenses > 0
                    ? (Number(category.value) / totalExpenses) * 100
                    : 0;

                const diff = Number(category.diff || 0);
                const hasPrev = Number(category.prev_value || 0) > 0;

                return (
                  <div className="category-report-item" key={category.id}>
                    <div className="category-report-top">
                      <div>
                        <strong>{category.name}</strong>
                        {hasPrev && (
                          <span className="category-prev-note">
                            (was {formatCurrency(category.prev_value)})
                          </span>
                        )}
                      </div>

                      <div className="category-report-amounts">
                        <strong>{formatCurrency(category.value)}</strong>
                        {category.diff !== 0 && (
                          <span
                            className={`category-diff-pill ${
                              diff < 0 ? "reduced" : "increased"
                            }`}
                          >
                            {diff > 0 ? `+${formatCurrency(diff)}` : formatCurrency(diff)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="category-report-track">
                      <div
                        className="category-report-fill"
                        style={{
                          width: `${Math.min(percentage, 100)}%`,
                        }}
                      />
                    </div>

                    <div className="category-report-bottom">
                      <span className="category-report-percent">
                        {percentage.toFixed(1)}% of month's expenses
                      </span>
                      {hasPrev && (
                        <span className="category-shift-pct">
                          {category.pct_change >= 0 ? "+" : ""}
                          {category.pct_change}% vs last month
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* SAVINGS OVERVIEW & ALL-TIME STANDING */}
        <div className="reports-card">
          <div className="reports-card-header">
            <div>
              <h3>Savings & Financial Health</h3>
              <p>Your progress for {currentMonthName}</p>
            </div>
          </div>

          <div className="savings-report-content">
            <div className="savings-big-number">
              {formatCurrency(overview.savings)}
            </div>

            <span className="savings-subtitle">
              Saved in {currentMonthName}
            </span>

            <div className="savings-rate-box">
              <PiggyBank size={22} />
              <div>
                <strong>
                  {Number(overview.savings_rate || 0).toFixed(1)}%
                </strong>
                <span>of monthly income saved</span>
              </div>
            </div>

            <div className="alltime-standing-box">
              <div className="standing-row">
                <span>Cumulative Savings (All-Time):</span>
                <strong>{formatCurrency(overview.all_time_savings)}</strong>
              </div>
              <div className="standing-row">
                <span>Total Accumulated Balance:</span>
                <strong>{formatCurrency(overview.all_time_balance)}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================
          BUDGET PERFORMANCE
      ========================= */}
      <div className="reports-card">
        <div className="reports-card-header">
          <div>
            <h3>Budget Performance for {currentMonthName}</h3>
            <p>See how well you're staying within your budget limits</p>
          </div>
        </div>

        {budgets.length === 0 ? (
          <div className="reports-empty-small">
            No budgets found for this month.
          </div>
        ) : (
          <div className="report-budget-list">
            {budgets.map((budget) => (
              <div className="report-budget-item" key={budget.id}>
                <div className="report-budget-main">
                  <strong>{budget.category}</strong>
                  <span>Budget: {formatCurrency(budget.amount)}</span>
                </div>

                <div className="report-budget-progress">
                  <div className="report-budget-track">
                    <div
                      className={`report-budget-fill ${budget.status}`}
                      style={{
                        width: `${Math.min(
                          Number(budget.percentage || 0),
                          100
                        )}%`,
                      }}
                    />
                  </div>
                  <span>{Number(budget.percentage || 0).toFixed(0)}%</span>
                </div>

                <div className="report-budget-right">
                  <strong>{formatCurrency(budget.spent)}</strong>
                  {budget.status === "exceeded" ? (
                    <span className="budget-status exceeded">
                      <AlertTriangle size={14} />
                      Exceeded
                    </span>
                  ) : budget.status === "near_limit" ? (
                    <span className="budget-status near">
                      <AlertTriangle size={14} />
                      Near limit
                    </span>
                  ) : (
                    <span className="budget-status healthy">
                      <CheckCircle2 size={14} />
                      Healthy
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* =========================
          GOAL PROGRESS
      ========================= */}
      <div className="reports-card">
        <div className="reports-card-header">
          <div>
            <h3>Financial Goals Progress</h3>
            <p>Track progress toward your targets</p>
          </div>
        </div>

        {goals.length === 0 ? (
          <div className="reports-empty-small">
            No financial goals created yet.
          </div>
        ) : (
          <div className="report-goal-list">
            {goals.map((goal) => (
              <div className="report-goal-item" key={goal.id}>
                <div className="report-goal-icon">
                  {goal.completed ? (
                    <CheckCircle2 size={19} />
                  ) : (
                    <Target size={19} />
                  )}
                </div>

                <div className="report-goal-main">
                  <strong>{goal.name}</strong>
                  <span>
                    {formatCurrency(goal.saved_amount)} of{" "}
                    {formatCurrency(goal.target_amount)}
                  </span>

                  <div className="report-goal-track">
                    <div
                      className="report-goal-fill"
                      style={{
                        width: `${Math.min(
                          Number(goal.percentage || 0),
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="report-goal-percent">
                  <strong>{Number(goal.percentage || 0).toFixed(0)}%</strong>
                  <span>{goal.completed ? "Completed" : "In progress"}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ReportsPage;