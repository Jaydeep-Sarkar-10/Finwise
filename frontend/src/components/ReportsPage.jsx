import { useEffect, useState } from "react";
import { apiFetch } from "../utils/api";

import {
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Wallet,
  Target,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";


function ReportsPage() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
  const token = localStorage.getItem("access");

  if (!token) {
    setLoading(false);
    return;
  }

  try {
    const response = await apiFetch(
      "/api/transactions/reports/"
    );

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
    fetchReports();
  }, []);

  const formatCurrency = (value) => {
    return `₹${Number(value || 0).toLocaleString("en-IN")}`;
  };

  const formatMonth = (value) => {
    if (!value) return "";

    const date = new Date(`${value}-01`);

    return date.toLocaleDateString("en-IN", {
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="reports-page">
        <div className="reports-page-header">
          <div>
            <p className="page-subtitle">
              UNDERSTAND YOUR MONEY
            </p>

            <h1>Reports</h1>

            <p className="page-description">
              Analyze your income, spending,
              savings, budgets and goals.
            </p>
          </div>
        </div>

        <div className="reports-card">
          <p className="reports-message">
            Loading reports...
          </p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="reports-page">
        <div className="reports-card">
          <p className="reports-message">
            Could not load reports.
          </p>
        </div>
      </div>
    );
  }

  const {
    overview,
    monthly,
    categories,
    budgets,
    goals,
  } = report;

  const maxMonthlyValue = Math.max(
    ...monthly.flatMap((item) => [
      Number(item.income || 0),
      Number(item.expenses || 0),
    ]),
    1
  );

  return (
    <div className="reports-page">

      {/* =========================
          HEADER
      ========================= */}

      <div className="reports-page-header">

        <div>
          <p className="page-subtitle">
            UNDERSTAND YOUR MONEY
          </p>

          <h1>Reports</h1>

          <p className="page-description">
            Analyze your income, spending,
            savings, budgets and goals.
          </p>
        </div>

      </div>


      {/* =========================
          OVERVIEW
      ========================= */}

      <div className="reports-summary-grid">

        <div className="report-summary-card">
          <div className="report-summary-icon">
            <TrendingUp size={19} />
          </div>

          <div>
            <span>Total Income</span>

            <strong>
              {formatCurrency(overview.income)}
            </strong>
          </div>
        </div>


        <div className="report-summary-card">
          <div className="report-summary-icon">
            <TrendingDown size={19} />
          </div>

          <div>
            <span>Total Expenses</span>

            <strong>
              {formatCurrency(overview.expenses)}
            </strong>
          </div>
        </div>


        <div className="report-summary-card">
          <div className="report-summary-icon">
            <PiggyBank size={19} />
          </div>

          <div>
            <span>Total Savings</span>

            <strong>
              {formatCurrency(overview.savings)}
            </strong>
          </div>
        </div>


        <div className="report-summary-card">
          <div className="report-summary-icon">
            <Wallet size={19} />
          </div>

          <div>
            <span>Current Balance</span>

            <strong>
              {formatCurrency(overview.balance)}
            </strong>
          </div>
        </div>


        <div className="report-summary-card">
          <div className="report-summary-icon">
            <PiggyBank size={19} />
          </div>

          <div>
            <span>Savings Rate</span>

            <strong>
              {Number(
                overview.savings_rate || 0
              ).toFixed(1)}
              %
            </strong>
          </div>
        </div>

      </div>


      {/* =========================
          MONTHLY REPORT
      ========================= */}

      <div className="reports-card">

        <div className="reports-card-header">

          <div>
            <h3>Income vs Expenses</h3>

            <p>
              Monthly financial activity
            </p>
          </div>

        </div>


        {monthly.length === 0 ? (

          <div className="reports-empty-small">
            No transaction data available yet.
          </div>

        ) : (

          <div className="monthly-report-list">

            {monthly.map((item) => {

              const incomeWidth =
                (Number(item.income || 0) /
                  maxMonthlyValue) *
                100;

              const expenseWidth =
                (Number(item.expenses || 0) /
                  maxMonthlyValue) *
                100;

              return (
                <div
                  className="monthly-report-item"
                  key={item.month}
                >

                  <div className="monthly-report-title">
                    {formatMonth(item.month)}
                  </div>


                  <div className="monthly-report-bars">

                    <div className="report-bar-row">

                      <span>Income</span>

                      <div className="report-bar-track">
                        <div
                          className="report-bar income-bar"
                          style={{
                            width: `${incomeWidth}%`,
                          }}
                        />
                      </div>

                      <strong>
                        {formatCurrency(item.income)}
                      </strong>

                    </div>


                    <div className="report-bar-row">

                      <span>Expenses</span>

                      <div className="report-bar-track">
                        <div
                          className="report-bar expense-bar"
                          style={{
                            width: `${expenseWidth}%`,
                          }}
                        />
                      </div>

                      <strong>
                        {formatCurrency(item.expenses)}
                      </strong>

                    </div>

                  </div>

                </div>
              );
            })}

          </div>
        )}

      </div>


      {/* =========================
          CATEGORY SPENDING
      ========================= */}

      <div className="reports-two-column">

        <div className="reports-card">

          <div className="reports-card-header">

            <div>
              <h3>Spending by Category</h3>

              <p>
                Where your money goes
              </p>
            </div>

          </div>


          {categories.length === 0 ? (

            <div className="reports-empty-small">
              No spending data available.
            </div>

          ) : (

            <div className="category-report-list">

              {categories.map((category) => {

                const totalExpenses =
                  Number(overview.expenses || 0);

                const percentage =
                  totalExpenses > 0
                    ? (
                        Number(category.value) /
                        totalExpenses
                      ) * 100
                    : 0;

                return (
                  <div
                    className="category-report-item"
                    key={category.id}
                  >

                    <div className="category-report-top">

                      <strong>
                        {category.name}
                      </strong>

                      <span>
                        {formatCurrency(
                          category.value
                        )}
                      </span>

                    </div>


                    <div className="category-report-track">

                      <div
                        className="category-report-fill"
                        style={{
                          width: `${percentage}%`,
                        }}
                      />

                    </div>


                    <span className="category-report-percent">
                      {percentage.toFixed(1)}%
                    </span>

                  </div>
                );
              })}

            </div>
          )}

        </div>


        {/* =========================
            SAVINGS
        ========================= */}

        <div className="reports-card">

          <div className="reports-card-header">

            <div>
              <h3>Savings Overview</h3>

              <p>
                Your saving progress
              </p>
            </div>

          </div>


          <div className="savings-report-content">

            <div className="savings-big-number">
              {formatCurrency(
                overview.savings
              )}
            </div>

            <span>
              Total saved
            </span>


            <div className="savings-rate-box">

              <PiggyBank size={20} />

              <div>
                <strong>
                  {Number(
                    overview.savings_rate || 0
                  ).toFixed(1)}
                  %
                </strong>

                <span>
                  of your income saved
                </span>
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
            <h3>Budget Performance</h3>

            <p>
              See how well you're staying
              within your limits.
            </p>
          </div>

        </div>


        {budgets.length === 0 ? (

          <div className="reports-empty-small">
            No budgets created yet.
          </div>

        ) : (

          <div className="report-budget-list">

            {budgets.map((budget) => (

              <div
                className="report-budget-item"
                key={budget.id}
              >

                <div className="report-budget-main">

                  <strong>
                    {budget.category}
                  </strong>

                  <span>
                    Budget{" "}
                    {formatCurrency(
                      budget.amount
                    )}
                  </span>

                </div>


                <div className="report-budget-progress">

                  <div className="report-budget-track">

                    <div
                      className={`report-budget-fill ${budget.status}`}
                      style={{
                        width: `${Math.min(
                          Number(
                            budget.percentage
                          ),
                          100
                        )}%`,
                      }}
                    />

                  </div>

                  <span>
                    {Number(
                      budget.percentage || 0
                    ).toFixed(0)}
                    %
                  </span>

                </div>


                <div className="report-budget-right">

                  <strong>
                    {formatCurrency(
                      budget.spent
                    )}
                  </strong>

                  {budget.status ===
                    "exceeded" ? (

                    <span className="budget-status exceeded">
                      <AlertTriangle size={14} />
                      Exceeded
                    </span>

                  ) : budget.status ===
                    "near_limit" ? (

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
            <h3>Goal Progress</h3>

            <p>
              Track progress toward your
              financial goals.
            </p>
          </div>

        </div>


        {goals.length === 0 ? (

          <div className="reports-empty-small">
            No financial goals created yet.
          </div>

        ) : (

          <div className="report-goal-list">

            {goals.map((goal) => (

              <div
                className="report-goal-item"
                key={goal.id}
              >

                <div className="report-goal-icon">
                  {goal.completed ? (
                    <CheckCircle2 size={19} />
                  ) : (
                    <Target size={19} />
                  )}
                </div>


                <div className="report-goal-main">

                  <strong>
                    {goal.name}
                  </strong>

                  <span>
                    {formatCurrency(
                      goal.saved_amount
                    )}{" "}
                    of{" "}
                    {formatCurrency(
                      goal.target_amount
                    )}
                  </span>

                  <div className="report-goal-track">

                    <div
                      className="report-goal-fill"
                      style={{
                        width: `${Math.min(
                          Number(
                            goal.percentage
                          ),
                          100
                        )}%`,
                      }}
                    />

                  </div>

                </div>


                <div className="report-goal-percent">

                  <strong>
                    {Number(
                      goal.percentage || 0
                    ).toFixed(0)}
                    %
                  </strong>

                  <span>
                    {goal.completed
                      ? "Completed"
                      : "In progress"}
                  </span>

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