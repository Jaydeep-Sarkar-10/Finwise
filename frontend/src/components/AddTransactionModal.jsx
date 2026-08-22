import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { apiFetch } from "../utils/api";

function AddTransactionModal({ onClose, onTransactionAdded }) {
  const [type, setType] = useState("expense");

  // Helper to switch type and auto-assign income category
  const handleTypeChange = (newType) => {
    setType(newType);
    if (newType === "income") {
      const incomeCat = categories.find(
        (c) => c.name.toLowerCase() === "income"
      );
      setCategory(incomeCat ? String(incomeCat.id) : "");
    } else {
      setCategory("");
    }
  };

  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

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
          throw new Error("Failed to fetch categories");
        }

        const data = await response.json();

        console.log("Categories received:", data);

        setCategories(data);
      } catch (error) {
        console.error("Category error:", error);
        setError("Could not load categories.");
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // =========================
  // SUBMIT TRANSACTION
  // =========================

  const handleSubmit = async (e) => {
  e.preventDefault();

  setError("");
  setSaving(true);

  try {
    // For income, always resolve to the "Income" category id
    let resolvedCategory = category;
    if (type === "income") {
      const incomeCat = categories.find(
        (c) => c.name.toLowerCase() === "income"
      );
      resolvedCategory = incomeCat ? String(incomeCat.id) : category;
    }

    const transactionData = {
      amount: amount,
      type: type,
      category: Number(resolvedCategory),
      description: description,
      date: date,
    };

    console.log("Sending transaction:", transactionData);

    const response = await apiFetch(
      "/api/transactions/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(transactionData),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Backend error:", data);

      throw new Error(
        data.detail || "Failed to add transaction."
      );
    }

    console.log("Transaction created:", data);

    if (onTransactionAdded) {
      onTransactionAdded(data);
    }

    onClose();

  } catch (error) {
    console.error("Transaction error:", error);

    setError(
      error.message || "Something went wrong."
    );

  } finally {
    setSaving(false);
  }
};

  return (
    <div className="modal-overlay">

      <div className="transaction-modal">

        {/* Header */}

        <div className="modal-header">

          <div>
            <h2>Add Transaction</h2>

            <p>
              Record your income or expense
            </p>
          </div>

          <button
            className="close-btn"
            onClick={onClose}
            type="button"
          >
            <X size={20} />
          </button>

        </div>


        <form onSubmit={handleSubmit}>

          {/* Income / Expense */}

          <div className="transaction-type">

            <button
              type="button"
              className={
                type === "expense"
                  ? "type-btn active-expense"
                  : "type-btn"
              }
              onClick={() => handleTypeChange("expense")}
            >
              Expense
            </button>

            <button
              type="button"
              className={
                type === "income"
                  ? "type-btn active-income"
                  : "type-btn"
              }
              onClick={() => handleTypeChange("income")}
            >
              Income
            </button>

          </div>


          {/* Amount */}

          <div className="form-group">

            <label>Amount</label>

            <div className="amount-input">

              <span>₹</span>

              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={amount}
                onChange={(e) =>
                  setAmount(e.target.value)
                }
                required
              />

            </div>

          </div>


          {/* Category — only shown for Expense */}

          {type === "expense" && (
            <div className="form-group">

              <label>Category</label>

              <select
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value)
                }
                required
              >

                <option value="">
                  {loadingCategories
                    ? "Loading categories..."
                    : "Select category"}
                </option>

                {!loadingCategories &&
                  categories
                    .filter(
                      (cat) =>
                        cat.name.toLowerCase() !== "income"
                    )
                    .map((cat) => (
                      <option
                        key={cat.id}
                        value={cat.id}
                      >
                        {cat.name}
                      </option>
                    ))}

              </select>

            </div>
          )}


          {/* Description */}

          <div className="form-group">

            <label>Description</label>

            <input
              type="text"
              placeholder="What was this transaction for?"
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
            />

          </div>


          {/* Date */}

          <div className="form-group">

            <label>Date</label>

            <input
              type="date"
              value={date}
              onChange={(e) =>
                setDate(e.target.value)
              }
              required
            />

          </div>


          {/* Error */}

          {error && (
            <p className="form-error">
              {error}
            </p>
          )}


          {/* Buttons */}

          <div className="modal-actions">

            <button
              type="button"
              className="cancel-btn"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="save-btn"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : "Add Transaction"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default AddTransactionModal;