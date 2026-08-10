import {
  Utensils,
  Car,
  Dumbbell,
  ShoppingBag,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react";

const transactions = [
  {
    name: "Pizza",
    category: "Food",
    amount: "-₹500",
    date: "Today, 2:30 PM",
    type: "expense",
    icon: Utensils,
  },
  {
    name: "Uber",
    category: "Transport",
    amount: "-₹250",
    date: "Today, 11:15 AM",
    type: "expense",
    icon: Car,
  },
  {
    name: "Gym Membership",
    category: "Fitness",
    amount: "-₹800",
    date: "Yesterday",
    type: "expense",
    icon: Dumbbell,
  },
  {
    name: "New Shoes",
    category: "Shopping",
    amount: "-₹2,500",
    date: "Yesterday",
    type: "expense",
    icon: ShoppingBag,
  },
  {
    name: "Salary",
    category: "Income",
    amount: "+₹50,000",
    date: "Aug 1, 2026",
    type: "income",
    icon: ArrowDownLeft,
  },
];

function RecentTransactions() {
  return (
    <div className="recent-card">
      <div className="recent-header">
        <div>
          <h3>Recent Transactions</h3>
          <p>Your latest financial activity</p>
        </div>

        <button className="view-all-btn">
          View all
          <ArrowUpRight size={14} />
        </button>
      </div>

      <div className="transaction-list">
        {transactions.map((transaction, index) => {
          const Icon = transaction.icon;

          return (
            <div className="transaction-row" key={index}>
              <div className={`transaction-icon ${transaction.type}`}>
                <Icon size={18} />
              </div>

              <div className="transaction-info">
                <strong>{transaction.name}</strong>
                <span>
                  {transaction.category} • {transaction.date}
                </span>
              </div>

              <span className={`transaction-amount ${transaction.type}`}>
                {transaction.amount}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default RecentTransactions;