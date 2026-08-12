import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Plus,
} from "lucide-react";

function StatCard({
  title,
  amount,
  change,
  type,
  onAddSavings,
}) {
  const icons = {
    balance: Wallet,
    income: TrendingUp,
    expense: TrendingDown,
    savings: PiggyBank,
  };

  const Icon = icons[type];

  return (
    <div className={`stat-card ${type}`}>

      {/* Top section */}
      <div className="stat-top">

        {/* Icon */}
        <div className={`stat-icon ${type}`}>
          <Icon size={20} />
        </div>

        {/* Change */}
        {change && (
          <span className={`stat-change ${type}`}>
            {change}
          </span>
        )}

        {/* Savings + button */}
        {type === "savings" && (
          <button
            className="add-savings-btn"
            type="button"
            onClick={onAddSavings}
            title="Add Savings"
          >
            <Plus size={18} />
          </button>
        )}

      </div>

      {/* Title */}
      <p className="stat-title">
        {title}
      </p>

      {/* Amount */}
      <h2 className="stat-amount">
        {amount}
      </h2>

    </div>
  );
}

export default StatCard;