import { Bell, Plus, UserRound } from "lucide-react";

function Topbar({ onAddTransaction, onProfileClick }) {
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

        {/* Profile */}
        <button
          className="profile-btn"
          onClick={onProfileClick}
          aria-label="Profile"
        >
          <UserRound size={19} />
        </button>

        {/* Notifications */}
        <button className="notification-btn">
          <Bell size={19} />
          <span className="notification-dot"></span>
        </button>

        {/* Add Transaction */}
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