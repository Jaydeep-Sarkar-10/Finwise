import { useState } from "react";

import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import StatCard from "./components/StatCard";
import SpendingChart from "./components/SpendingChart";
import CategoryChart from "./components/CategoryChart";
import RecentTransactions from "./components/RecentTransactions";
import AddTransactionModal from "./components/AddTransactionModal";
import AuthModal from "./components/AuthModal";
import Profile from "./components/Profile";


function App() {
  const [showTransactionModal, setShowTransactionModal] = useState(false);

  // Authentication state
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

  // Auth modal
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Current page
  const [currentPage, setCurrentPage] = useState("home");


  // =========================
  // LOGIN SUCCESS
  // =========================

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setShowAuthModal(false);
  };


  // =========================
  // LOGOUT
  // =========================

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user");

    setUser(null);

    // Go back to dashboard
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


  return (
    <div className="app">

      {/* Sidebar */}
      <Sidebar
        user={user}
        onAuthClick={() => setShowAuthModal(true)}
        onProfileClick={handleProfileClick}
      />


      <main className="main-content">

        {/* ========================= */}
        {/* PROFILE PAGE */}
        {/* ========================= */}

        {currentPage === "profile" && user ? (

          <Profile
            user={user}
            onLogout={handleLogout}
            onBack={() => setCurrentPage("home")}
          />

        ) : (

          /* ========================= */
          /* HOME / DASHBOARD */
          /* ========================= */

          <>

            {/* Topbar */}
            <Topbar
              onAddTransaction={() =>
                setShowTransactionModal(true)
              }
              onProfileClick={handleProfileClick}
              user={user}
            />


            {/* Financial Summary Cards */}
            <section className="stats-grid">

              <StatCard
                title="Total Balance"
                amount="₹30,000"
                change="+8.2%"
                type="balance"
              />

              <StatCard
                title="Income"
                amount="₹50,000"
                change="+12.5%"
                type="income"
              />

              <StatCard
                title="Expenses"
                amount="₹20,000"
                change="-4.8%"
                type="expense"
              />

              <StatCard
                title="Savings"
                amount="₹30,000"
                change="+18.3%"
                type="savings"
              />

            </section>


            {/* Charts */}
            <section className="charts-grid">

              <SpendingChart />

              <CategoryChart />

            </section>


            {/* Recent Transactions */}
            <section className="bottom-grid">

              <RecentTransactions />

            </section>

          </>
        )}


        {/* ========================= */}
        {/* ADD TRANSACTION MODAL */}
        {/* ========================= */}

        {showTransactionModal && (
          <AddTransactionModal
            onClose={() =>
              setShowTransactionModal(false)
            }
          />
        )}


        {/* ========================= */}
        {/* AUTH MODAL */}
        {/* ========================= */}

        {showAuthModal && (
          <AuthModal
            onClose={() =>
              setShowAuthModal(false)
            }
            onLoginSuccess={handleLoginSuccess}
          />
        )}

      </main>

    </div>
  );
}


export default App;