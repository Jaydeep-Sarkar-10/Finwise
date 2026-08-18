import { useEffect, useState } from "react";
import { apiFetch } from "../utils/api";

import {
  Target,
  Plus,
  Pencil,
  Trash2,
  CalendarDays,
  CheckCircle2,
  Clock3,
} from "lucide-react";


function GoalsPage() {
  const [goals, setGoals] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);

  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [targetDate, setTargetDate] = useState("");

  // =========================
  // FETCH GOALS
  // =========================

  const fetchGoals = async () => {
  const token = localStorage.getItem("access");

  if (!token) {
    setGoals([]);
    setLoading(false);
    return;
  }

  try {
    setLoading(true);

    const response = await apiFetch(
      "/api/transactions/goals/"
    );

    if (!response.ok) {
      throw new Error("Failed to fetch goals");
    }

    const data = await response.json();

    setGoals(data);
  } catch (error) {
    console.error("Goal fetch error:", error);
  } finally {
    setLoading(false);
  }
};

  // =========================
  // LOAD GOALS
  // =========================

  useEffect(() => {
    fetchGoals();
  }, []);

  // =========================
  // RESET FORM
  // =========================

  const resetForm = () => {
    setName("");
    setTargetAmount("");
    setTargetDate("");
    setEditingGoal(null);
    setShowForm(false);
  };

  // =========================
  // OPEN CREATE FORM
  // =========================

  const handleCreateClick = () => {
    setEditingGoal(null);
    setName("");
    setTargetAmount("");
    setTargetDate("");
    setShowForm(true);
  };

  // =========================
  // OPEN EDIT FORM
  // =========================

  const handleEditClick = (goal) => {
    setEditingGoal(goal);

    setName(goal.name);
    setTargetAmount(goal.target_amount);

    setTargetDate(
      goal.target_date
        ? goal.target_date.substring(0, 10)
        : ""
    );

    setShowForm(true);
  };

  // =========================
  // CREATE / UPDATE GOAL
  // =========================

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!name || !targetAmount || !targetDate) {
    return;
  }

  try {
    setSaving(true);

    const isEditing = Boolean(editingGoal);

    const endpoint = isEditing
      ? `/api/transactions/goals/${editingGoal.id}/`
      : "/api/transactions/goals/";

    const method = isEditing ? "PUT" : "POST";

    const response = await apiFetch(
      endpoint,
      {
        method,

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          name,
          target_amount: Number(targetAmount),
          target_date: targetDate,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(
        "Goal save error:",
        data
      );

      throw new Error(
        "Failed to save goal"
      );
    }

    if (isEditing) {
      setGoals((prev) =>
        prev.map((goal) =>
          goal.id === editingGoal.id
            ? data
            : goal
        )
      );
    } else {
      setGoals((prev) => [
        data,
        ...prev,
      ]);
    }

    resetForm();

  } catch (error) {

    console.error(
      "Goal save error:",
      error
    );

    alert(
      editingGoal
        ? "Could not update goal."
        : "Could not create goal."
    );

  } finally {
    setSaving(false);
  }
};

  // =========================
  // DELETE GOAL
  // =========================

  const handleDelete = async (goal) => {
  const confirmed = window.confirm(
    `Delete "${goal.name}" goal?`
  );

  if (!confirmed) {
    return;
  }

  const token = localStorage.getItem("access");

  if (!token) {
    alert("Please login first.");
    return;
  }

  try {
    const response = await apiFetch(
      `/api/transactions/goals/${goal.id}/`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to delete goal");
    }

    setGoals((prev) =>
      prev.filter(
        (item) => item.id !== goal.id
      )
    );
  } catch (error) {
    console.error(
      "Goal delete error:",
      error
    );

    alert("Could not delete goal.");
  }
};
  // =========================
  // FORMAT CURRENCY
  // =========================

  const formatCurrency = (value) => {
    return `₹${Number(value || 0).toLocaleString(
      "en-IN"
    )}`;
  };

  // =========================
  // FORMAT DATE
  // =========================

  const formatDate = (date) => {
    if (!date) {
      return "No date";
    }

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  };

  // =========================
  // DAYS REMAINING
  // =========================

  const getDaysRemaining = (date) => {
    if (!date) {
      return 0;
    }

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const target = new Date(date);

    target.setHours(0, 0, 0, 0);

    const difference =
      target.getTime() -
      today.getTime();

    return Math.ceil(
      difference /
        (1000 * 60 * 60 * 24)
    );
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="goals-page">

        <div className="goals-page-header">
          <div>
            <p className="page-subtitle">
              PLAN YOUR FUTURE
            </p>

            <h1>Goals</h1>

            <p className="page-description">
              Set financial goals and track
              your progress with your savings.
            </p>
          </div>
        </div>

        <div className="goals-card">
          <p className="goals-message">
            Loading goals...
          </p>
        </div>

      </div>
    );
  }

  // =========================
  // PAGE
  // =========================

  return (
    <div className="goals-page">

      {/* =========================
          HEADER
      ========================= */}

      <div className="goals-page-header">

        <div>

          <p className="page-subtitle">
            PLAN YOUR FUTURE
          </p>

          <h1>
            Goals
          </h1>

          <p className="page-description">
            Set financial goals and track
            your progress with your savings.
          </p>

        </div>

        <button
          className="add-goal-btn"
          onClick={handleCreateClick}
        >
          <Plus size={17} />

          Add Goal
        </button>

      </div>


      {/* =========================
          ADD / EDIT FORM
      ========================= */}

      {showForm && (

        <div className="goal-form-card">

          <div className="goal-form-header">

            <div>

              <h3>
                {editingGoal
                  ? "Edit Goal"
                  : "Create Goal"}
              </h3>

              <p>
                {editingGoal
                  ? "Update your financial goal."
                  : "Set a target and start working towards it."}
              </p>

            </div>

            <button
              type="button"
              className="goal-close-btn"
              onClick={resetForm}
            >
              ×
            </button>

          </div>


          <form onSubmit={handleSubmit}>

            {/* NAME */}

            <div className="goal-form-group">

              <label>
                Goal Name
              </label>

              <input
                type="text"
                placeholder="e.g. New Laptop"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
              />

            </div>


            {/* TARGET AMOUNT */}

            <div className="goal-form-group">

              <label>
                Target Amount
              </label>

              <input
                type="number"
                min="1"
                step="0.01"
                placeholder="e.g. 75000"
                value={targetAmount}
                onChange={(e) =>
                  setTargetAmount(
                    e.target.value
                  )
                }
              />

            </div>


            {/* TARGET DATE */}

            <div className="goal-form-group">

              <label>
                Target Date
              </label>

              <input
                type="date"
                value={targetDate}
                onChange={(e) =>
                  setTargetDate(
                    e.target.value
                  )
                }
              />

            </div>


            {/* ACTIONS */}

            <div className="goal-form-actions">

              <button
                type="button"
                className="goal-cancel-btn"
                onClick={resetForm}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="goal-save-btn"
                disabled={
                  saving ||
                  !name ||
                  !targetAmount ||
                  !targetDate
                }
              >
                {saving
                  ? "Saving..."
                  : editingGoal
                  ? "Update Goal"
                  : "Create Goal"}
              </button>

            </div>

          </form>

        </div>
      )}


      {/* =========================
          GOALS SUMMARY
      ========================= */}

      {goals.length > 0 && (

        <div className="goals-summary-grid">

          <div className="goal-summary-card">

            <div className="goal-summary-icon">
              <Target size={19} />
            </div>

            <div>
              <span>
                Total Goals
              </span>

              <strong>
                {goals.length}
              </strong>
            </div>

          </div>


          <div className="goal-summary-card">

            <div className="goal-summary-icon">
              <CheckCircle2 size={19} />
            </div>

            <div>
              <span>
                Completed
              </span>

              <strong>
                {
                  goals.filter(
                    (goal) =>
                      goal.completed
                  ).length
                }
              </strong>
            </div>

          </div>


          <div className="goal-summary-card">

            <div className="goal-summary-icon">
              <Target size={19} />
            </div>

            <div>
              <span>
                Total Target
              </span>

              <strong>
                {formatCurrency(
                  goals.reduce(
                    (total, goal) =>
                      total +
                      Number(
                        goal.target_amount || 0
                      ),
                    0
                  )
                )}
              </strong>
            </div>

          </div>

        </div>
      )}


      {/* =========================
          GOALS LIST
      ========================= */}

      <div className="goals-card">

        <div className="goals-card-header">

          <div>

            <h3>
              Your Goals
            </h3>

            <p>
              {goals.length}{" "}
              {goals.length === 1
                ? "goal"
                : "goals"}
            </p>

          </div>

        </div>


        <div className="goals-grid">

          {goals.map((goal) => {

            const percentage = Math.min(
              Number(
                goal.percentage || 0
              ),
              100
            );

            const daysRemaining =
              getDaysRemaining(
                goal.target_date
              );

            const completed =
              Boolean(goal.completed);

            return (

              <div
                className={`goal-item ${
                  completed
                    ? "goal-completed"
                    : ""
                }`}
                key={goal.id}
              >

                {/* =========================
                    TOP
                ========================= */}

                <div className="goal-item-top">

                  <div className="goal-main-icon">
                    {completed ? (
                      <CheckCircle2
                        size={21}
                      />
                    ) : (
                      <Target
                        size={21}
                      />
                    )}
                  </div>


                  <div className="goal-title">

                    <strong>
                      {goal.name}
                    </strong>

                    <span>
                      Target:{" "}
                      {formatCurrency(
                        goal.target_amount
                      )}
                    </span>

                  </div>


                  <div className="goal-actions">

                    <button
                      className="goal-edit-btn"
                      onClick={() =>
                        handleEditClick(goal)
                      }
                      title="Edit goal"
                    >
                      <Pencil size={15} />
                    </button>

                    <button
                      className="goal-delete-btn"
                      onClick={() =>
                        handleDelete(goal)
                      }
                      title="Delete goal"
                    >
                      <Trash2 size={15} />
                    </button>

                  </div>

                </div>


                {/* =========================
                    PROGRESS
                ========================= */}

                <div className="goal-progress-section">

                  <div className="goal-progress-info">

                    <span>
                      Saved{" "}
                      <strong>
                        {formatCurrency(
                          goal.saved_amount
                        )}
                      </strong>
                    </span>

                    <strong>
                      {percentage.toFixed(0)}%
                    </strong>

                  </div>


                  <div className="goal-progress-track">

                    <div
                      className="goal-progress-fill"
                      style={{
                        width: `${percentage}%`,
                      }}
                    />

                  </div>

                </div>


                {/* =========================
                    DETAILS
                ========================= */}

                <div className="goal-details">

                  <div className="goal-detail">

                    <span>
                      Remaining
                    </span>

                    <strong>
                      {formatCurrency(
                        goal.remaining_amount
                      )}
                    </strong>

                  </div>


                  <div className="goal-detail">

                    <span>
                      Target Date
                    </span>

                    <strong>
                      {formatDate(
                        goal.target_date
                      )}
                    </strong>

                  </div>


                  <div className="goal-detail">

                    <span>
                      Status
                    </span>

                    <strong
                      className={
                        completed
                          ? "goal-status-complete"
                          : daysRemaining < 0
                          ? "goal-status-overdue"
                          : "goal-status-active"
                      }
                    >
                      {completed
                        ? "Completed"
                        : daysRemaining < 0
                        ? "Overdue"
                        : `${daysRemaining} days left`}
                    </strong>

                  </div>

                </div>


                {/* =========================
                    FOOTER
                ========================= */}

                <div className="goal-footer">

                  {completed ? (

                    <div className="goal-complete-message">

                      <CheckCircle2
                        size={16}
                      />

                      Goal completed

                    </div>

                  ) : (

                    <div className="goal-saving-message">

                      <Clock3
                        size={15}
                      />

                      Savings automatically
                      contribute to this goal.

                    </div>

                  )}

                </div>

              </div>
            );
          })}


          {/* =========================
              EMPTY STATE
          ========================= */}

          {goals.length === 0 && (

            <div className="goals-empty">

              <div className="goals-empty-icon">
                <Target size={34} />
              </div>

              <h3>
                No goals yet
              </h3>

              <p>
                Create your first financial
                goal and start building
                towards it with your savings.
              </p>

              <button
                className="empty-add-goal-btn"
                onClick={handleCreateClick}
              >
                <Plus size={16} />
                Create Your First Goal
              </button>

            </div>

          )}

        </div>

      </div>

    </div>
  );
}

export default GoalsPage;