import { useEffect, useState } from "react";

import {
  Utensils,
  Car,
  Dumbbell,
  ShoppingBag,
  CircleDollarSign,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react";


function RecentTransactions({ refreshTrigger, setCurrentPage}) {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  // =========================
  // FETCH TRANSACTIONS
  // =========================

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const token = localStorage.getItem("access");

        if (!token) {
          setError("Please login first.");
          setLoading(false);
          return;
        }

        // Fetch transactions
        const transactionResponse = await fetch(
          "http://127.0.0.1:8000/api/transactions/",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!transactionResponse.ok) {
          throw new Error("Failed to fetch transactions");
        }

        const transactionData = await transactionResponse.json();

        // Fetch categories
        const categoryResponse = await fetch(
          "http://127.0.0.1:8000/api/transactions/categories/",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!categoryResponse.ok) {
          throw new Error("Failed to fetch categories");
        }

        const categoryData = await categoryResponse.json();

        setTransactions(transactionData);
        setCategories(categoryData);

      } catch (error) {
        console.error(error);
        setError("Could not load transactions.");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [refreshTrigger]);


  // =========================
  // CATEGORY NAME
  // =========================

  const getCategoryName = (categoryId) => {
    const category = categories.find(
      (cat) => cat.id === categoryId
    );

    return category ? category.name : "Other";
  };


  // =========================
  // CATEGORY ICON
  // =========================

  const getCategoryIcon = (categoryName, type) => {
    const name = categoryName.toLowerCase();

    if (name.includes("food")) {
      return Utensils;
    }

    if (
      name.includes("transport") ||
      name.includes("travel") ||
      name.includes("fuel")
    ) {
      return Car;
    }

    if (
      name.includes("gym") ||
      name.includes("fitness") ||
      name.includes("sport")
    ) {
      return Dumbbell;
    }

    if (
      name.includes("shopping") ||
      name.includes("clothes")
    ) {
      return ShoppingBag;
    }

    if (type === "income") {
      return ArrowDownLeft;
    }

    return CircleDollarSign;
  };


  // =========================
  // DATE FORMAT
  // =========================

  const formatDate = (dateString) => {
    const date = new Date(dateString);

    const today = new Date();

    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (
      date.toDateString() === today.toDateString()
    ) {
      return "Today";
    }

    if (
      date.toDateString() === yesterday.toDateString()
    ) {
      return "Yesterday";
    }

    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };


  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="recent-card">
        <div className="recent-header">
          <div>
            <h3>Recent Transactions</h3>
            <p>Your latest financial activity</p>
          </div>
        </div>

        <p style={{ padding: "20px" }}>
          Loading transactions...
        </p>
      </div>
    );
  }


  // =========================
  // ERROR
  // =========================

  if (error) {
    return (
      <div className="recent-card">
        <div className="recent-header">
          <div>
            <h3>Recent Transactions</h3>
            <p>Your latest financial activity</p>
          </div>
        </div>

        <p style={{ padding: "20px" }}>
          {error}
        </p>
      </div>
    );
  }


  // =========================
  // UI
  // =========================

  return (
    <div className="recent-card">

      {/* Header */}

      <div className="recent-header">

        <div>
          <h3>Recent Transactions</h3>

          <p>
            Your latest financial activity
          </p>
        </div>


        <button
  className="view-all-btn"
  onClick={() => setCurrentPage("transactions")}
>
  View all

  <ArrowUpRight size={14} />

</button>

      </div>


      {/* Transaction List */}

      <div className="transaction-list">

        {transactions.length === 0 ? (

          <p style={{ padding: "20px" }}>
            No transactions yet.
          </p>

        ) : (

          transactions.slice(0, 5).map((transaction) => {

            const categoryName =
              getCategoryName(transaction.category);

            const Icon = getCategoryIcon(
              categoryName,
              transaction.type
            );

            const isIncome =
              transaction.type === "income";


            return (

              <div
                className="transaction-row"
                key={transaction.id}
              >

                {/* Icon */}

                <div
                  className={`transaction-icon ${
                    transaction.type
                  }`}
                >

                  <Icon size={18} />

                </div>


                {/* Information */}

                <div className="transaction-info">

                  <strong>
                    {transaction.description ||
                      categoryName}
                  </strong>

                  <span>

                    {categoryName}

                    {" • "}

                    {formatDate(transaction.date)}

                  </span>

                </div>


                {/* Amount */}

                <span
                  className={`transaction-amount ${
                    transaction.type
                  }`}
                >

                  {isIncome ? "+" : "-"}

                  ₹
                  {Number(
                    transaction.amount
                  ).toLocaleString("en-IN")}

                </span>

              </div>

            );

          })

        )}

      </div>

    </div>
  );
}


export default RecentTransactions;