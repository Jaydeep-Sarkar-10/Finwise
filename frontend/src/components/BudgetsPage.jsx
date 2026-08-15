import { useEffect, useState } from "react";
import {
  WalletCards,
  Plus,
  Trash2,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

function BudgetsPage() {
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [adding, setAdding] = useState(false);

  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState("");
  const [month, setMonth] = useState("");

  // =========================
  // FETCH BUDGETS
  // =========================

  const fetchBudgets = async () => {
    const token = localStorage.getItem("access");

    if (!token) {
      setBudgets([]);
      return;
    }

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/transactions/budgets/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch budgets");
      }

      const data = await response.json();
      setBudgets(data);
    } catch (error) {
      console.error("Budget fetch error:", error);
    }
  };

  // =========================
  // FETCH CATEGORIES
  // =========================

  const fetchCategories = async () => {
    const token = localStorage.getItem("access");

    if (!token) return;

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/transactions/categories/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }

      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("Category fetch error:", error);
    }
  };

  // =========================
  // FETCH TRANSACTIONS
  // =========================

  const fetchTransactions = async () => {
    const token = localStorage.getItem("access");

    if (!token) return;

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/transactions/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch transactions");
      }

      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error("Transaction fetch error:", error);
    }
  };

  // =========================
  // LOAD EVERYTHING
  // =========================

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      await Promise.all([
        fetchBudgets(),
        fetchCategories(),
        fetchTransactions(),
      ]);

      setLoading(false);
    };

    loadData();
  }, []);

  // =========================
  // CATEGORY NAME
  // =========================

  const getCategoryName = (categoryId) => {
    const category = categories.find(
      (item) => item.id === categoryId
    );

    return category?.name || `Category ${categoryId}`;
  };

  // =========================
  // GET SPENDING
  // =========================

  const getBudgetSpending = (budget) => {
    if (!budget.month) return 0;

    const budgetMonth = budget.month.slice(0, 7);

    return transactions
      .filter((transaction) => {
        if (transaction.type !== "expense") {
          return false;
        }

        if (transaction.category !== budget.category) {
          return false;
        }

        return transaction.date?.slice(0, 7) === budgetMonth;
      })
      .reduce(
        (total, transaction) =>
          total + Number(transaction.amount),
        0
      );
  };

  // =========================
  // ADD BUDGET
  // =========================

  const handleAddBudget = async (e) => {
    e.preventDefault();

    if (!categoryId || !amount || !month) {
      return;
    }

    const token = localStorage.getItem("access");

    if (!token) {
      alert("Please login first.");
      return;
    }

    try {
      setAdding(true);

      const response = await fetch(
        "http://127.0.0.1:8000/api/transactions/budgets/",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            category: Number(categoryId),
            amount: Number(amount),
            month: `${month}-01`,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error("Add budget error:", data);
        throw new Error("Failed to add budget");
      }

      setBudgets((prev) => [data, ...prev]);

      setCategoryId("");
      setAmount("");
      setMonth("");

      setShowAddForm(false);
    } catch (error) {
      console.error("Add budget error:", error);
      alert("Could not add budget.");
    } finally {
      setAdding(false);
    }
  };

  // =========================
  // DELETE BUDGET
  // =========================

  const handleDeleteBudget = async (budget) => {
    const confirmed = window.confirm(
      `Delete the ${getCategoryName(
        budget.category
      )} budget?`
    );

    if (!confirmed) return;

    const token = localStorage.getItem("access");

    if (!token) {
      alert("Please login first.");
      return;
    }

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/transactions/budgets/${budget.id}/`,
        {
          method: "DELETE",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete budget");
      }

      setBudgets((prev) =>
        prev.filter(
          (item) => item.id !== budget.id
        )
      );
    } catch (error) {
      console.error("Delete budget error:", error);
      alert("Could not delete budget.");
    }
  };

  // =========================
  // FORMAT MONTH
  // =========================

  const formatMonth = (month) => {
    if (!month) return "";

    return new Date(month).toLocaleDateString(
      "en-US",
      {
        month: "long",
        year: "numeric",
      }
    );
  };

  // =========================
  // RESET FORM
  // =========================

  const resetForm = () => {
    setShowAddForm(false);
    setCategoryId("");
    setAmount("");
    setMonth("");
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="budget-page">

        <div className="budget-page-header">
          <div>
            <p className="page-subtitle">
              CONTROL YOUR SPENDING
            </p>

            <h1>Budgets</h1>

            <p className="page-description">
              Set spending limits and stay
              on track with your money.
            </p>
          </div>
        </div>

        <div className="budget-card">
          <p className="budget-message">
            Loading budgets...
          </p>
        </div>

      </div>
    );
  }

  // =========================
  // PAGE
  // =========================

  return (
    <div className="budget-page">

      {/* =========================
          HEADER
      ========================= */}

      <div className="budget-page-header">

        <div>
          <p className="page-subtitle">
            CONTROL YOUR SPENDING
          </p>

          <h1>Budgets</h1>

          <p className="page-description">
            Set spending limits and stay
            on track with your money.
          </p>
        </div>

        <button
          className="add-budget-btn"
          onClick={() => setShowAddForm(true)}
        >
          <Plus size={17} />
          Add Budget
        </button>

      </div>

      {/* =========================
          ADD BUDGET
      ========================= */}

      {showAddForm && (
        <div className="add-budget-card">

          <div className="add-budget-header">

            <div>
              <h3>Create Budget</h3>

              <p>
                Set a spending limit for a
                category and month.
              </p>
            </div>

            <button
              className="close-btn"
              type="button"
              onClick={resetForm}
            >
              ×
            </button>

          </div>

          <form onSubmit={handleAddBudget}>

            <div className="form-group">

              <label>Category</label>

              <select
                value={categoryId}
                onChange={(e) =>
                  setCategoryId(e.target.value)
                }
              >
                <option value="">
                  Select category
                </option>

                {categories.map((category) => (
                  <option
                    key={category.id}
                    value={category.id}
                  >
                    {category.name}
                  </option>
                ))}
              </select>

            </div>

            <div className="form-group">

              <label>Budget Amount</label>

              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g. 5000"
                value={amount}
                onChange={(e) =>
                  setAmount(e.target.value)
                }
              />

            </div>

            <div className="form-group">

              <label>Month</label>

              <input
                type="month"
                value={month}
                onChange={(e) =>
                  setMonth(e.target.value)
                }
              />

            </div>

            <div className="modal-actions">

              <button
                type="button"
                className="cancel-btn"
                onClick={resetForm}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="save-btn"
                disabled={
                  adding ||
                  !categoryId ||
                  !amount ||
                  !month
                }
              >
                {adding
                  ? "Adding..."
                  : "Add Budget"}
              </button>

            </div>

          </form>

        </div>
      )}

      {/* =========================
          BUDGET CARD
      ========================= */}

      <div className="budget-card">

        <div className="budget-card-header">

          <div>
            <h3>Your Budgets</h3>

            <p>
              {budgets.length}{" "}
              {budgets.length === 1
                ? "budget"
                : "budgets"}
            </p>
          </div>

        </div>

        <div className="budgets-grid">

          {budgets.map((budget) => {

            const spent =
              getBudgetSpending(budget);

            const budgetAmount =
              Number(budget.amount);

            const remaining =
              budgetAmount - spent;

            const percentage =
              budgetAmount > 0
                ? (spent / budgetAmount) * 100
                : 0;

            const progress =
              Math.min(percentage, 100);

            let status = "on-track";

            if (percentage >= 100) {
              status = "over-budget";
            } else if (percentage >= 80) {
              status = "near-limit";
            }

            return (
              <div
                className="budget-item"
                key={budget.id}
              >

                {/* TOP */}

                <div className="budget-item-top">

                  <div className="budget-icon">
                    <WalletCards size={20} />
                  </div>

                  <div className="budget-info">

                    <strong>
                      {getCategoryName(
                        budget.category
                      )}
                    </strong>

                    <span>
                      {formatMonth(
                        budget.month
                      )}
                    </span>

                  </div>

                  <button
                    className="budget-delete-btn"
                    onClick={() =>
                      handleDeleteBudget(
                        budget
                      )
                    }
                    title="Delete budget"
                  >
                    <Trash2 size={16} />
                  </button>

                </div>

                {/* AMOUNTS */}

                <div className="budget-values">

                  <div>
                    <span>Spent</span>

                    <strong>
                      ₹
                      {spent.toLocaleString(
                        "en-IN"
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>Budget</span>

                    <strong>
                      ₹
                      {budgetAmount.toLocaleString(
                        "en-IN"
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>Remaining</span>

                    <strong
                      className={
                        remaining < 0
                          ? "negative"
                          : ""
                      }
                    >
                      ₹
                      {Math.abs(
                        remaining
                      ).toLocaleString(
                        "en-IN"
                      )}
                    </strong>
                  </div>

                </div>

                {/* PROGRESS */}

                <div className="budget-progress-wrapper">

                  <div className="budget-progress-header">

                    <span>
                      {Math.round(
                        percentage
                      )}% used
                    </span>

                    <span>
                      {percentage >= 100
                        ? "Limit exceeded"
                        : `${Math.max(
                            0,
                            Math.round(
                              budgetAmount -
                                spent
                            )
                          ).toLocaleString(
                            "en-IN"
                          )} left`}
                    </span>

                  </div>

                  <div className="budget-progress">

                    <div
                      className={`budget-progress-bar ${status}`}
                      style={{
                        width: `${progress}%`,
                      }}
                    />

                  </div>

                </div>

                {/* STATUS */}

                <div
                  className={`budget-status ${status}`}
                >
                  {status === "on-track" && (
                    <>
                      <CheckCircle2 size={14} />
                      On track
                    </>
                  )}

                  {status === "near-limit" && (
                    <>
                      <AlertTriangle size={14} />
                      Near limit
                    </>
                  )}

                  {status === "over-budget" && (
                    <>
                      <TrendingUp size={14} />
                      Over budget
                    </>
                  )}
                </div>

              </div>
            );
          })}

          {/* EMPTY */}

          {budgets.length === 0 && (
            <div className="budgets-empty">

              <WalletCards size={32} />

              <h3>No budgets yet</h3>

              <p>
                Create your first budget to
                start controlling your
                spending.
              </p>

              <button
                className="empty-budget-btn"
                onClick={() =>
                  setShowAddForm(true)
                }
              >
                <Plus size={16} />
                Create Budget
              </button>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}

export default BudgetsPage;