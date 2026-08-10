import { Bell, Plus } from "lucide-react";

function Topbar({ onAddTransaction }) {
  return (
    <header className="topbar">
      <div>
        <p className="welcome-small">Good morning 👋</p>

        <h1>Welcome back, Jaydeep</h1>

        <p className="welcome-subtitle">
          Here's what's happening with your finances today.
        </p>
      </div>

      <div className="topbar-actions">
        <button className="notification-btn">
          <Bell size={19} />
          <span className="notification-dot"></span>
        </button>

        <button
          className="add-transaction-btn"
          onClick={onAddTransaction}
        >
          <Plus size={18} />
          Add Transaction
        </button>
      </div>
    </header>
  );
}

export default Topbar;