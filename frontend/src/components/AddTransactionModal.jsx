import { X } from "lucide-react";
import { useEffect, useState } from "react";

function AddTransactionModal({ onClose }) {
  const [type, setType] = useState("expense");

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

  // Get categories from Django
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem("access");

        const response = await fetch(
          "http://127.0.0.1:8000/api/transactions/categories/",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch categories");
        }

        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error(error);
        setError("Could not load categories.");
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // Submit transaction
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSaving(true);

    try {
      const token = localStorage.getItem("access");

      const transactionData = {
        amount: amount,
        type: type,
        category: Number(category),
        description: description,
        date: date,
      };

      const response = await fetch(
        "http://127.0.0.1:8000/api/transactions/",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify(transactionData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error(data);
        throw new Error("Failed to create transaction");
      }

      console.log("Transaction created:", data);

      // Close modal after successful submission
      onClose();

    } catch (error) {
      console.error(error);
      setError("Could not save transaction. Please try again.");
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
            <p>Record your income or expense</p>
          </div>

          <button
            className="close-btn"
            onClick={onClose}
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
              onClick={() => setType("expense")}
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
              onClick={() => setType("income")}
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
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Category */}
          <div className="form-group">
            <label>Category</label>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              disabled={loadingCategories}
            >
              <option value="">
                {loadingCategories
                  ? "Loading categories..."
                  : "Select category"}
              </option>

              {categories.map((cat) => (
                <option
                  key={cat.id}
                  value={cat.id}
                >
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div className="form-group">
            <label>Description</label>

            <input
              type="text"
              placeholder="What was this transaction for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Date */}
          <div className="form-group">
            <label>Date</label>

            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
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