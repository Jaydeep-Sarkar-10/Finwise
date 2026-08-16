import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Plus,
  Pencil,
} from "lucide-react";

function StatCard({
  title,
  amount,
  change,
  type,
  onAddSavings,
  onEditSavings,
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

        {/* Savings buttons */}
{type === "savings" && (
  <div className="savings-actions">

    {/* Add */}
    <button
      className="add-savings-btn"
      type="button"
      onClick={onAddSavings}
      title="Add Savings"
    >
      <Plus size={18} />
    </button>

    {/* Edit */}
    <button
      className="edit-savings-btn"
      type="button"
      onClick={onEditSavings}
      title="Edit Savings"
    >
      <Pencil size={16} />
    </button>

  </div>
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