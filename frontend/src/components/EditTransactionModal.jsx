import { useEffect, useState } from "react";

import { apiFetch } from "../utils/api";

function EditTransactionModal({
  transaction,
  onClose,
  onTransactionUpdated,
}) {
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("expense");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");

  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] =
    useState(true);

  // =========================
  // LOAD EXISTING TRANSACTION
  // =========================

  useEffect(() => {
    if (!transaction) {
      return;
    }

    setAmount(transaction.amount || "");
    setType(transaction.type || "expense");

    setCategory(
      transaction.category?.id ||
        transaction.category ||
        ""
    );

    setDescription(
      transaction.description || ""
    );

    setDate(transaction.date || "");
  }, [transaction]);


  // =========================
  // FETCH CATEGORIES
  // =========================

  useEffect(() => {
    const fetchCategories = async () => {
  try {
    const response = await apiFetch(
      "/api/transactions/categories/"
    );

    if (!response.ok) {
      throw new Error(
        "Failed to fetch categories"
      );
    }

    const data = await response.json();

    setCategories(data);
  } catch (error) {
    console.error(
      "Categories error:",
      error
    );
  } finally {
    setLoadingCategories(false);
  }
};

    fetchCategories();
  }, []);


  // =========================
  // UPDATE TRANSACTION
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!amount || Number(amount) <= 0) {
      alert("Please enter a valid amount.");
      return;
    }

    if (!category) {
      alert("Please select a category.");
      return;
    }

    if (!date) {
      alert("Please select a date.");
      return;
    }

    setLoading(true);

try {
  const response = await apiFetch(
    `/api/transactions/${transaction.id}/`,
    {
      method: "PATCH",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        amount: Number(amount),
        type: type,
        category: Number(category),
        description: description,
        date: date,
      }),
    }
  );

      const data =
        await response.json();

      if (!response.ok) {
        console.error("Update error:", data);
        let errorMsg = data.detail || "Failed to update transaction.";
        if (!data.detail && typeof data === "object") {
          const messages = Object.entries(data).map(([field, msgs]) => {
            return `${field}: ${Array.isArray(msgs) ? msgs[0] : msgs}`;
          });
          if (messages.length > 0) {
            errorMsg = messages.join(" | ");
          }
        }
        throw new Error(errorMsg);
      }

      console.log(
        "Transaction updated:",
        data
      );

      // Send updated transaction
      // back to TransactionsPage
      onTransactionUpdated(data);

      onClose();

    } catch (error) {
      console.error(
        "Update transaction error:",
        error
      );

      alert(
        error.message || "Could not update transaction."
      );
    } finally {
      setLoading(false);
    }
  };


  // =========================
  // RENDER
  // =========================

  return (
    <div className="modal-overlay">

      <div className="transaction-modal">

        {/* =========================
            HEADER
        ========================= */}

        <div className="modal-header">

          <div>

            <h2>
              Edit Transaction
            </h2>

            <p>
              Update your transaction details
            </p>

          </div>

          <button
            className="close-btn"
            type="button"
            onClick={onClose}
          >
            ×
          </button>

        </div>


        {/* =========================
            FORM
        ========================= */}

        <form onSubmit={handleSubmit}>

          {/* AMOUNT */}

          <div className="form-group">

            <label>
              Amount
            </label>

            <div className="amount-input">

              <span>
                ₹
              </span>

              <input
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) =>
                  setAmount(
                    e.target.value
                  )
                }
              />

            </div>

          </div>


          {/* TYPE */}

          <div className="form-group">

            <label>
              Type
            </label>

            <select
              value={type}
              onChange={(e) =>
                setType(e.target.value)
              }
            >

              <option value="expense">
                Expense
              </option>

              <option value="income">
                Income
              </option>

            </select>

          </div>


          {/* CATEGORY */}

          <div className="form-group">

            <label>
              Category
            </label>

            <select
              value={category}
              onChange={(e) =>
                setCategory(
                  e.target.value
                )
              }
              disabled={loadingCategories}
            >

              <option value="">
                {loadingCategories
                  ? "Loading categories..."
                  : "Select category"}
              </option>

              {categories.map(
                (item) => (
                  <option
                    key={item.id}
                    value={item.id}
                  >
                    {item.name}
                  </option>
                )
              )}

            </select>

          </div>


          {/* DESCRIPTION */}

          <div className="form-group">

            <label>
              Description
            </label>

            <input
              type="text"
              placeholder="Enter description"
              value={description}
              onChange={(e) =>
                setDescription(
                  e.target.value
                )
              }
            />

          </div>


          {/* DATE */}

          <div className="form-group">

            <label>
              Date
            </label>

            <input
              type="date"
              value={date}
              onChange={(e) =>
                setDate(
                  e.target.value
                )
              }
            />

          </div>


          {/* ACTIONS */}

          <div className="modal-actions">

            <button
              type="button"
              className="cancel-btn"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="save-btn"
              disabled={loading}
            >
              {loading
                ? "Saving..."
                : "Save Changes"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default EditTransactionModal;