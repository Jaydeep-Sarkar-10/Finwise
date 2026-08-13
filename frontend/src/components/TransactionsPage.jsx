import { useEffect, useState } from "react";
import EditTransactionModal from "./EditTransactionModal";

function TransactionsPage({
  onAddTransaction,
  refreshTrigger,
}) {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================
  // FILTER STATE
  // =========================

  const [categoryFilter, setCategoryFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  // =========================
  // EDIT STATE
  // =========================

  const [showEditModal, setShowEditModal] =
    useState(false);

  const [selectedTransaction, setSelectedTransaction] =
    useState(null);


  // =========================
  // FETCH TRANSACTIONS
  // =========================

  useEffect(() => {
    const fetchTransactions = async () => {
      const token = localStorage.getItem("access");

      if (!token) {
        setTransactions([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "http://127.0.0.1:8000/api/transactions/",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(
            "Failed to fetch transactions"
          );
        }

        const data = await response.json();

        console.log("Transactions:", data);

        setTransactions(data);

      } catch (error) {
        console.error(
          "Transactions error:",
          error
        );

        setError(
          "Could not load transactions."
        );

      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();

  }, [refreshTrigger]);


  // =========================
  // FETCH CATEGORIES
  // =========================

  useEffect(() => {
    const fetchCategories = async () => {
      const token = localStorage.getItem("access");

      if (!token) {
        return;
      }

      try {
        const response = await fetch(
          "http://127.0.0.1:8000/api/transactions/categories/",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(
            "Failed to fetch categories"
          );
        }

        const data = await response.json();

        console.log("Categories:", data);

        setCategories(data);

      } catch (error) {
        console.error(
          "Categories error:",
          error
        );
      }
    };

    fetchCategories();

  }, [refreshTrigger]);


  // =========================
  // CLEAR FILTERS
  // =========================

  const handleClearFilters = () => {
    setCategoryFilter("");
    setDateFilter("");
  };


  // =========================
  // FILTER TRANSACTIONS
  // =========================

  const filteredTransactions =
    transactions.filter((transaction) => {

      // CATEGORY FILTER
      if (categoryFilter) {

        const transactionCategoryId =
          String(
            transaction.category
          );

        if (
          transactionCategoryId !==
          String(categoryFilter)
        ) {
          return false;
        }
      }


      // DATE FILTER
      if (dateFilter) {

        if (
          transaction.date !==
          dateFilter
        ) {
          return false;
        }
      }

      return true;
    });


  // =========================
  // DELETE TRANSACTION
  // =========================

  const handleDelete = async (id) => {

    const confirmed = window.confirm(
      "Are you sure you want to delete this transaction?"
    );

    if (!confirmed) {
      return;
    }

    const token =
      localStorage.getItem("access");

    if (!token) {
      alert("Please login first.");
      return;
    }

    try {

      const response = await fetch(
        `http://127.0.0.1:8000/api/transactions/${id}/`,
        {
          method: "DELETE",

          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to delete transaction"
        );
      }

      setTransactions((prev) =>
        prev.filter(
          (transaction) =>
            transaction.id !== id
        )
      );

    } catch (error) {

      console.error(
        "Delete transaction error:",
        error
      );

      alert(
        "Could not delete transaction."
      );
    }
  };


  // =========================
  // EDIT TRANSACTION
  // =========================

  const handleEdit = (transaction) => {

    setSelectedTransaction(transaction);

    setShowEditModal(true);
  };


  // =========================
  // TRANSACTION UPDATED
  // =========================

  const handleTransactionUpdated = (
    updatedTransaction
  ) => {

    setTransactions((prev) =>
      prev.map((transaction) =>
        transaction.id ===
        updatedTransaction.id
          ? updatedTransaction
          : transaction
      )
    );

    setShowEditModal(false);

    setSelectedTransaction(null);
  };


  // =========================
  // GET CATEGORY NAME
  // =========================

  const getCategoryName = (transaction) => {

    // If serializer already gives category_name
    if (transaction.category_name) {
      return transaction.category_name;
    }

    // If category is an object
    if (
      typeof transaction.category ===
      "object"
    ) {
      return (
        transaction.category.name ||
        "Unknown Category"
      );
    }

    // If category is an ID
    const category = categories.find(
      (cat) =>
        String(cat.id) ===
        String(transaction.category)
    );

    return category
      ? category.name
      : "Unknown Category";
  };


  // =========================
  // RENDER
  // =========================

  return (
    <div className="transactions-page">


      {/* =========================
          HEADER
      ========================= */}

      <div className="transactions-page-header">

        <div>

          <p className="page-subtitle">
            Financial activity
          </p>

          <h1>
            Transactions
          </h1>

          <p className="page-description">
            View and manage all your
            transactions.
          </p>

        </div>


        <button
          className="add-transaction-page-btn"
          onClick={onAddTransaction}
        >
          + Add Transaction
        </button>

      </div>


      {/* =========================
          FILTERS
      ========================= */}

      {/* =========================
    FILTERS
========================= */}

<div className="transaction-filters">

  {/* CATEGORY FILTER */}
  <div className="filter-group">

    <label htmlFor="category-filter">
      Category
    </label>

    <select
      id="category-filter"
      value={categoryFilter}
      onChange={(e) =>
        setCategoryFilter(e.target.value)
      }
    >
      <option value="">
        All Categories
      </option>

      {categories.map((category) => (
        <option
          key={category.id}
          value={category.id}
        >
          {category.name}
        </option>
      ))}
    </select>

  </div>


  {/* DATE FILTER */}
  <div className="filter-group">

    <label htmlFor="date-filter">
      Date
    </label>

    <input
      id="date-filter"
      type="date"
      value={dateFilter}
      onChange={(e) =>
        setDateFilter(e.target.value)
      }
    />

  </div>


  {/* CLEAR FILTERS */}
  <button
    type="button"
    className="clear-filters-btn"
    onClick={handleClearFilters}
    disabled={!categoryFilter && !dateFilter}
  >
    Clear Filters
  </button>

</div>

      {/* =========================
          TRANSACTIONS CARD
      ========================= */}

      <div className="transactions-card">

        {/* LOADING */}

        {loading ? (

          <p className="transactions-message">
            Loading transactions...
          </p>


        ) : error ? (

          <p className="transactions-message">
            {error}
          </p>


        ) : filteredTransactions.length ===
          0 ? (

          <div className="transactions-empty">

            <h3>
              No matching transactions
            </h3>

            <p>
              Try changing your category
              or date filter.
            </p>

            <button
              type="button"
              className="add-transaction-page-btn"
              onClick={
                handleClearFilters
              }
            >
              Clear Filters
            </button>

          </div>


        ) : (

          <div className="transactions-list">

            {filteredTransactions.map(
              (transaction) => (

                <div
                  className="transaction-row"
                  key={transaction.id}
                >

                  {/* INFORMATION */}

                  <div className="transaction-info">

                    <h3>
                      {transaction.description ||
                        "No description"}
                    </h3>

                    <p>

                      {getCategoryName(
                        transaction
                      )}

                      {" • "}

                      {transaction.date}

                    </p>

                  </div>


                  {/* ACTIONS */}

                  <div className="transaction-actions">

                    {/* AMOUNT */}

                    <div
                      className={`transaction-amount ${
                        transaction.type
                      }`}
                    >

                      {transaction.type ===
                      "income"
                        ? "+"
                        : "-"}

                      ₹

                      {Number(
                        transaction.amount
                      ).toLocaleString(
                        "en-IN"
                      )}

                    </div>


                    {/* EDIT */}

                    <button
                      className="edit-transaction-btn"
                      onClick={() =>
                        handleEdit(
                          transaction
                        )
                      }
                    >
                      Edit
                    </button>


                    {/* DELETE */}

                    <button
                      className="delete-transaction-btn"
                      onClick={() =>
                        handleDelete(
                          transaction.id
                        )
                      }
                    >
                      Delete
                    </button>

                  </div>

                </div>

              )
            )}

          </div>

        )}

      </div>


      {/* =========================
          EDIT MODAL
      ========================= */}

      {showEditModal &&
        selectedTransaction && (

          <EditTransactionModal

            transaction={
              selectedTransaction
            }

            onClose={() => {

              setShowEditModal(false);

              setSelectedTransaction(null);

            }}

            onTransactionUpdated={
              handleTransactionUpdated
            }

          />

        )}

    </div>
  );
}

export default TransactionsPage;