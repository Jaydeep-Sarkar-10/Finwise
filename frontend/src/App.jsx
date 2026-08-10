import { useState } from "react";

import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import StatCard from "./components/StatCard";
import SpendingChart from "./components/SpendingChart";
import CategoryChart from "./components/CategoryChart";
import RecentTransactions from "./components/RecentTransactions";
import AddTransactionModal from "./components/AddTransactionModal";

function App() {
  const [showTransactionModal, setShowTransactionModal] = useState(false);

  return (
    <div className="app">
      <Sidebar />

      <main className="main-content">
        {/* Topbar */}
        <Topbar
          onAddTransaction={() => setShowTransactionModal(true)}
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

        {/* Add Transaction Modal */}
        {showTransactionModal && (
          <AddTransactionModal
            onClose={() => setShowTransactionModal(false)}
          />
        )}
      </main>
    </div>
  );
}

export default App;