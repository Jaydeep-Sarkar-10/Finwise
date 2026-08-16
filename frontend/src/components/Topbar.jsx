import { Plus, UserRound } from "lucide-react";
import Notifications from "./Notifications";

function Topbar({
  onAddTransaction,
  onProfileClick,
}) {
  return (
    <header className="topbar">

      {/* =========================
          WELCOME
      ========================= */}

      <div>

        <p className="welcome-small">
          Good morning 👋
        </p>

        <h1>
          Welcome back, Jaydeep
        </h1>

        <p className="welcome-subtitle">
          Here's what's happening with your finances today.
        </p>

      </div>


      {/* =========================
          ACTIONS
      ========================= */}

      <div className="topbar-actions">

        {/* PROFILE */}

        <button
          className="profile-btn"
          onClick={onProfileClick}
          aria-label="Profile"
        >
          <UserRound size={19} />
        </button>


        {/* NOTIFICATIONS */}

        <Notifications />


        {/* ADD TRANSACTION */}

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