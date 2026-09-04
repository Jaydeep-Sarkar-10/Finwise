import { useEffect, useState } from "react";

import { apiFetch } from "./utils/api";

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
import Notifications from "./components/Notifications";
import AIAssistant from "./components/AIAssistant";
import MonthSelector from "./components/MonthSelector";
import MobileBackHeader from "./components/MobileBackHeader";

import LandingPage from "./components/LandingPage";

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

  const [showEditSavingsModal, setShowEditSavingsModal] =
  useState(false);

const [editingSavingsId, setEditingSavingsId] =
  useState(null);

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

  const getPageTitle = (page) => {
    switch (page) {
      case "profile": return "Profile";
      case "transactions": return "Transactions";
      case "categories": return "Categories";
      case "budgets": return "Budgets";
      case "goals": return "Goals";
      case "reports": return "Reports";
      case "notifications": return "Notifications";
      case "ai": return "AI Chat";
      default: return "";
    }
  };

  // =========================
  // REFRESH TRIGGER
  // =========================

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // =========================
  // MOBILE SIDEBAR STATE
  // =========================

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // =========================
  // SELECTED MONTH STATE
  // =========================

  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}`;
  });

  // =========================
  // FINANCIAL SUMMARY
  // =========================

  const [summary, setSummary] = useState({
    total_balance: 0,
    income: 0,
    expenses: 0,
    savings: 0,
    total_savings: 0,
    monthly_balance: 0,
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
          total_savings: 0,
          monthly_balance: 0,
        });

        setLoadingSummary(false);
        return;
      }

      setLoadingSummary(true);

      try {
        const url = selectedMonth
          ? `/api/transactions/summary/?month=${selectedMonth}`
          : "/api/transactions/summary/";

        const response = await apiFetch(url);

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
          total_savings: Number(data.total_savings || 0),
          monthly_balance: Number(data.monthly_balance || 0),
          available_months: data.available_months || [],
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
          total_savings: 0,
          monthly_balance: 0,
        });
      } finally {
        setLoadingSummary(false);
      }
    };

    fetchSummary();
  }, [user, refreshTrigger, selectedMonth]);

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
      const response = await apiFetch(
  "/api/transactions/savings/",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: amount,
    }),
  }
);

      const data = await response.json();

      if (!response.ok) {
        console.error("Savings error:", data);
        let errorMsg = data.detail || "Failed to save savings.";
        if (!data.detail && typeof data === "object") {
          const messages = Object.entries(data).map(([field, msgs]) => {
            return `${field}: ${Array.isArray(msgs) ? msgs[0] : msgs}`;
          });
          if (messages.length > 0) {
            errorMsg = messages.join(" | ");
          }
        }
        throw new Error(errorMsg);
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
      console.error("Savings error:", error);
      alert(error.message || "Could not add savings.");
    }
  };

// =========================
// EDIT SAVINGS
// =========================

const handleEditSavings = async () => {
  const amount = Number(savingsInput);

  if (!amount || amount <= 0) {
    alert("Please enter a valid savings amount.");
    return;
  }

  const token = localStorage.getItem("access");

  if (!token) {
    alert("Please login first.");
    return;
  }

  if (!editingSavingsId) {
    alert("Savings record not found.");
    return;
  }

  try {
    const response = await apiFetch(
  `/api/transactions/savings/${editingSavingsId}/`,
  {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: amount,
    }),
  }
);

    const data = await response.json();

    if (!response.ok) {
      console.error("Savings edit error:", data);
      let errorMsg = data.detail || "Failed to update savings.";
      if (!data.detail && typeof data === "object") {
        const messages = Object.entries(data).map(([field, msgs]) => {
          return `${field}: ${Array.isArray(msgs) ? msgs[0] : msgs}`;
        });
        if (messages.length > 0) {
          errorMsg = messages.join(" | ");
        }
      }
      throw new Error(errorMsg);
    }

    console.log(
      "Savings updated:",
      data
    );

    // Reset
    setSavingsInput("");
    setEditingSavingsId(null);

    // Close modal
    setShowEditSavingsModal(false);

    // Refresh dashboard
    setRefreshTrigger(
      (prev) => prev + 1
    );

  } catch (error) {
    console.error("Savings edit error:", error);
    alert(error.message || "Could not update savings.");
  }
};

// =========================
// OPEN EDIT SAVINGS
// =========================

const openEditSavings = async () => {
  const token = localStorage.getItem("access");

  if (!token) {
    alert("Please login first.");
    return;
  }

  try {
    const response = await apiFetch(
  "/api/transactions/savings/"
);

    if (!response.ok) {
      throw new Error("Failed to fetch savings");
    }

    const data = await response.json();

    const savingsList = Array.isArray(data)
      ? data
      : data.results || [];

    if (savingsList.length === 0) {
      alert("No savings record found.");
      return;
    }

    // Use the latest savings record for editing
    const latestSavings = savingsList.sort(
      (a, b) =>
        new Date(b.created_at) -
        new Date(a.created_at)
    )[0];

    // Store ONLY the ID.
    // Do NOT put the existing amount in the input.
    setEditingSavingsId(latestSavings.id);

    // Empty input
    setSavingsInput("");

    // Open modal
    setShowEditSavingsModal(true);

  } catch (error) {
    console.error(
      "Open edit savings error:",
      error
    );

    alert("Could not load savings.");
  }
};
  // =========================
// RENDER
// =========================

if (!user) {
  return (
    <>
      <LandingPage
        onGetStarted={() => setShowAuthModal(true)}
      />

      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      )}
    </>
  );
}

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
  onNavigate={(page) => {
    setCurrentPage(page);
    setSidebarOpen(false); // close drawer on mobile nav
  }}
  isOpen={sidebarOpen}
  onClose={() => setSidebarOpen(false)}
/>

      <main className="main-content">

        {currentPage !== "home" && (
          <MobileBackHeader 
            title={getPageTitle(currentPage)} 
            onBack={() => setCurrentPage("home")} 
          />
        )}

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

) : currentPage === "notifications" ? (

  <Notifications />

) : currentPage === "ai" ? (

  <AIAssistant />

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
              onMenuToggle={() =>
                setSidebarOpen((prev) => !prev)
              }
              user={user}
            />

            {/* ========================= */}
            {/* DASHBOARD MONTH CONTROLS */}
            {/* ========================= */}
            <div className="dashboard-month-banner">
              <div className="dashboard-month-info">
                <span className="dashboard-month-label">ACTIVE VIEW</span>
                <p className="dashboard-month-description">
                  Showing financial summary & analytics for selected period
                </p>
              </div>
              <MonthSelector
                selectedMonth={selectedMonth}
                onChangeMonth={setSelectedMonth}
                availableMonths={summary.available_months || []}
              />
            </div>

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
                title="Monthly Income"
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
                title="Monthly Expenses"
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
  title="Total Savings"
  amount={
    loadingSummary
      ? "Loading..."
      : `₹${Number(
          summary.total_savings
        ).toLocaleString("en-IN")}`
  }
  type="savings"
  onAddSavings={() =>
    setShowSavingsModal(true)
  }
  onEditSavings={openEditSavings}
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
                selectedMonth={
                  selectedMonth
                }
              />

              <CategoryChart
                refreshTrigger={
                  refreshTrigger
                }
                selectedMonth={
                  selectedMonth
                }
              />

            </section>

            {/* ========================= */}
            {/* RECENT TRANSACTIONS */}
            {/* ========================= */}

            <section className="bottom-grid">

              <RecentTransactions
  refreshTrigger={refreshTrigger}
  setCurrentPage={setCurrentPage}
  user={user}
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
                  summary.total_savings || 0
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

        {/* =========================
    EDIT SAVINGS MODAL
========================= */}

{showEditSavingsModal && (

  <div className="modal-overlay">

    <div className="transaction-modal">

      {/* HEADER */}

      <div className="modal-header">

        <div>

          <h2>
            Edit Savings
          </h2>

          <p>
            Update your savings amount
          </p>

        </div>

        <button
          className="close-btn"
          type="button"
          onClick={() => {
            setShowEditSavingsModal(false);
            setSavingsInput("");
            setEditingSavingsId(null);
          }}
        >
          ×
        </button>

      </div>


      {/* INPUT */}

      <div className="form-group">

        <label>
          Savings Amount
        </label>

        <div className="amount-input">

          <span>
            ₹
          </span>

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


      {/* ACTIONS */}

      <div className="modal-actions">

        <button
          type="button"
          className="cancel-btn"
          onClick={() => {
            setShowEditSavingsModal(false);
            setSavingsInput("");
            setEditingSavingsId(null);
          }}
        >
          Cancel
        </button>

        <button
          type="button"
          className="save-btn"
          onClick={handleEditSavings}
          disabled={
            !savingsInput ||
            Number(savingsInput) <= 0
          }
        >
          Save Changes
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