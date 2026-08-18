import { Plus, UserRound } from "lucide-react";
import Notifications from "./Notifications";

function Topbar({
  onAddTransaction,
  onProfileClick,
  user,
}) {

  // =========================
  // DYNAMIC GREETING
  // =========================

  const hour = new Date().getHours();

  let greeting;
  let emoji;

  if (hour >= 5 && hour < 12) {
    greeting = "Good morning";
    emoji = "👋";
  } else if (hour >= 12 && hour < 17) {
    greeting = "Good afternoon";
    emoji = "☀️";
  } else if (hour >= 17 && hour < 21) {
    greeting = "Good evening";
    emoji = "🌆";
  } else {
    greeting = "Good night";
    emoji = "🌙";
  }

  // =========================
  // USERNAME
  // =========================

  const username = user?.username || "there";

  return (
    <header className="topbar">

      {/* =========================
          WELCOME
      ========================= */}

      <div>

        <p className="welcome-small">
          {greeting} {emoji}
        </p>

        <h1>
          Welcome back, {username}
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