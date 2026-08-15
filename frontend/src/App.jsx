import { useEffect, useState } from "react";

import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import StatCard from "./components/StatCard";
import SpendingChart from "./components/SpendingChart";
import CategoryChart from "./components/CategoryChart";
import RecentTransactions from "./components/RecentTransactions";
import AddTransactionModal from "./components/AddTransactionModal";
import AuthModal from "./components/AuthModal";
import Profile from "./components/Profile";
import TransactionsPage from "./components/TransactionsPage";
import CategoriesPage from "./components/CategoriesPage";
import BudgetsPage from "./components/BudgetsPage";
import GoalsPage from "./components/GoalsPage";
import ReportsPage from "./components/ReportsPage";

function App() {
  // =========================
  // TRANSACTION MODAL
  // =========================

  const [showTransactionModal, setShowTransactionModal] =
    useState(false);

  // =========================
  // SAVINGS MODAL
  // =========================

  const [showSavingsModal, setShowSavingsModal] =
    useState(false);

  const [savingsInput, setSavingsInput] = useState("");

  // =========================
  // AUTHENTICATION STATE
  // =========================

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");

    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch {
        return null;
      }
    }

    return null;
  });

  // =========================
  // AUTH MODAL
  // =========================

  const [showAuthModal, setShowAuthModal] =
    useState(false);

  // =========================
  // CURRENT PAGE
  // =========================

  const [currentPage, setCurrentPage] = useState("home");

  // =========================
  // REFRESH TRIGGER
  // =========================

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // =========================
  // FINANCIAL SUMMARY
  // =========================

  const [summary, setSummary] = useState({
    total_balance: 0,
    income: 0,
    expenses: 0,
    savings: 0,
  });

  const [loadingSummary, setLoadingSummary] =
    useState(true);

  // =========================
  // FETCH FINANCIAL SUMMARY
  // =========================

  useEffect(() => {
    const fetchSummary = async () => {
      const token = localStorage.getItem("access");

      // User is not logged in
      if (!token) {
        setSummary({
          total_balance: 0,
          income: 0,
          expenses: 0,
          savings: 0,
        });

        setLoadingSummary(false);
        return;
      }

      setLoadingSummary(true);

      try {
        const response = await fetch(
          "http://127.0.0.1:8000/api/transactions/summary/",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(
            "Failed to fetch financial summary"
          );
        }

        const data = await response.json();

        setSummary({
          total_balance: Number(data.total_balance || 0),
          income: Number(data.income || 0),
          expenses: Number(data.expenses || 0),
          savings: Number(data.savings || 0),
        });
      } catch (error) {
        console.error(
          "Financial summary error:",
          error
        );

        setSummary({
          total_balance: 0,
          income: 0,
          expenses: 0,
          savings: 0,
        });
      } finally {
        setLoadingSummary(false);
      }
    };

    fetchSummary();
  }, [user, refreshTrigger]);

  // =========================
  // LOGIN SUCCESS
  // =========================

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setShowAuthModal(false);

    // Refresh dashboard after login
    setRefreshTrigger((prev) => prev + 1);
  };

  // =========================
  // LOGOUT
  // =========================

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user");

    setUser(null);

    setSummary({
      total_balance: 0,
      income: 0,
      expenses: 0,
      savings: 0,
    });

    setCurrentPage("home");
  };

  // =========================
  // PROFILE
  // =========================

  const handleProfileClick = () => {
    if (user) {
      setCurrentPage("profile");
    } else {
      setShowAuthModal(true);
    }
  };

  // =========================
  // TRANSACTION ADDED
  // =========================

  const handleTransactionAdded = (transaction) => {
    console.log(
      "New transaction:",
      transaction
    );

    // Refresh:
    // - Financial Summary
    // - Spending Chart
    // - Category Chart
    // - Recent Transactions

    setRefreshTrigger((prev) => prev + 1);
  };

  // =========================
  // ADD SAVINGS
  // =========================

  const handleAddSavings = async () => {
    const amount = Number(savingsInput);

    if (!amount || amount <= 0) {
      return;
    }

    const token = localStorage.getItem("access");

    if (!token) {
      alert("Please login first.");
      return;
    }

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/transactions/savings/",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            amount: amount,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error(
          "Savings error:",
          data
        );

        throw new Error(
          "Failed to save savings."
        );
      }

      console.log(
        "Savings added:",
        data
      );

      // Clear input
      setSavingsInput("");

      // Close modal
      setShowSavingsModal(false);

      // Fetch new savings from backend
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      console.error(
        "Savings error:",
        error
      );

      alert(
        "Could not add savings."
      );
    }
  };

  // =========================
  // RENDER
  // =========================

  return (
    <div className="app">

      {/* ========================= */}
      {/* SIDEBAR */}
      {/* ========================= */}

      <Sidebar
  user={user}
  onAuthClick={() =>
    setShowAuthModal(true)
  }
  currentPage={currentPage}
  onNavigate={setCurrentPage}
/>

      <main className="main-content">

        {/* ========================= */}
        {/* PROFILE PAGE */}
        {/* ========================= */}
{currentPage === "profile" && user ? (

  <Profile
    user={user}
    onLogout={handleLogout}
    onBack={() =>
      setCurrentPage("home")
    }
  />

) : currentPage === "transactions" ? (

  <TransactionsPage
    onAddTransaction={() =>
      setShowTransactionModal(true)
    }
    refreshTrigger={refreshTrigger}
  />

) : currentPage === "categories" ? (

  <CategoriesPage />

) : currentPage === "budgets" ? (

  <BudgetsPage />

) : currentPage === "goals" ? (

  <GoalsPage />

) : currentPage === "reports" ? (

  <ReportsPage />

) : (

  <>
            {/* ========================= */}
            {/* TOPBAR */}
            {/* ========================= */}

            <Topbar
              onAddTransaction={() =>
                setShowTransactionModal(true)
              }
              onProfileClick={
                handleProfileClick
              }
              user={user}
            />

            {/* ========================= */}
            {/* FINANCIAL SUMMARY */}
            {/* ========================= */}

            <section className="stats-grid">

              {/* TOTAL BALANCE */}

              <StatCard
                title="Total Balance"
                amount={
                  loadingSummary
                    ? "Loading..."
                    : `₹${Number(
                        summary.total_balance
                      ).toLocaleString(
                        "en-IN"
                      )}`
                }
                type="balance"
              />

              {/* INCOME */}

              <StatCard
                title="Income"
                amount={
                  loadingSummary
                    ? "Loading..."
                    : `₹${Number(
                        summary.income
                      ).toLocaleString(
                        "en-IN"
                      )}`
                }
                type="income"
              />

              {/* EXPENSES */}

              <StatCard
                title="Expenses"
                amount={
                  loadingSummary
                    ? "Loading..."
                    : `₹${Number(
                        summary.expenses
                      ).toLocaleString(
                        "en-IN"
                      )}`
                }
                type="expense"
              />

              {/* SAVINGS */}

              <StatCard
                title="Savings"
                amount={
                  loadingSummary
                    ? "Loading..."
                    : `₹${Number(
                        summary.savings
                      ).toLocaleString(
                        "en-IN"
                      )}`
                }
                type="savings"
                onAddSavings={() =>
                  setShowSavingsModal(true)
                }
              />

            </section>

            {/* ========================= */}
            {/* CHARTS */}
            {/* ========================= */}

            <section className="charts-grid">

              <SpendingChart
                refreshTrigger={
                  refreshTrigger
                }
              />

              <CategoryChart
                refreshTrigger={
                  refreshTrigger
                }
              />

            </section>

            {/* ========================= */}
            {/* RECENT TRANSACTIONS */}
            {/* ========================= */}

            <section className="bottom-grid">

              <RecentTransactions
                refreshTrigger={
                  refreshTrigger
                }
                setCurrentPage={setCurrentPage}
              />

            </section>
          </>
        )}

        {/* ========================= */}
        {/* ADD TRANSACTION MODAL */}
        {/* ========================= */}

        {showTransactionModal && (

          <AddTransactionModal
            onClose={() =>
              setShowTransactionModal(
                false
              )
            }
            onTransactionAdded={
              handleTransactionAdded
            }
          />

        )}

        {/* ========================= */}
        {/* SAVINGS MODAL */}
        {/* ========================= */}

        {showSavingsModal && (

          <div className="modal-overlay">

            <div className="transaction-modal">

              {/* HEADER */}

              <div className="modal-header">

                <div>
                  <h2>Add Savings</h2>

                  <p>
                    Set aside money for your savings
                  </p>
                </div>

                <button
                  className="close-btn"
                  type="button"
                  onClick={() => {
                    setShowSavingsModal(false);
                    setSavingsInput("");
                  }}
                >
                  ×
                </button>

              </div>

              {/* FORM */}

              <div className="form-group">

                <label>
                  Enter savings
                </label>

                <div className="amount-input">

                  <span>₹</span>

                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    placeholder="0.00"
                    value={savingsInput}
                    onChange={(e) =>
                      setSavingsInput(
                        e.target.value
                      )
                    }
                    autoFocus
                  />

                </div>

              </div>

              {/* CURRENT SAVINGS */}

              <p
                style={{
                  marginTop: "10px",
                  color: "#777",
                  fontSize: "14px",
                }}
              >
                Current savings: ₹
                {Number(
                  summary.savings || 0
                ).toLocaleString(
                  "en-IN"
                )}
              </p>

              {/* ACTIONS */}

              <div className="modal-actions">

                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => {
                    setShowSavingsModal(
                      false
                    );
                    setSavingsInput("");
                  }}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="save-btn"
                  onClick={
                    handleAddSavings
                  }
                  disabled={
                    !savingsInput ||
                    Number(savingsInput) <= 0
                  }
                >
                  Add Savings
                </button>

              </div>

            </div>

          </div>

        )}

        {/* ========================= */}
        {/* AUTH MODAL */}
        {/* ========================= */}

        {showAuthModal && (

          <AuthModal
            onClose={() =>
              setShowAuthModal(false)
            }
            onLoginSuccess={
              handleLoginSuccess
            }
          />

        )}

      </main>

    </div>
  );
}

export default App;