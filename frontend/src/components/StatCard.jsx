import { ArrowDown, ArrowUp, Wallet, PiggyBank } from "lucide-react";

function StatCard({ title, amount, change, type }) {
  const icons = {
    balance: <Wallet size={20} />,
    income: <ArrowDown size={20} />,
    expense: <ArrowUp size={20} />,
    savings: <PiggyBank size={20} />,
  };

  return (
    <div className="stat-card">
      <div className="stat-card-top">
        <div className={`stat-icon ${type}`}>
          {icons[type]}
        </div>

        <span className={`stat-change ${type}`}>
          {change}
        </span>
      </div>

      <p className="stat-title">{title}</p>
      <h2 className="stat-amount">{amount}</h2>
    </div>
  );
}

export default StatCard;