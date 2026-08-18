import { useEffect, useState } from "react";
import { apiFetch } from "../utils/api"; 

import {
  Tags,
  Plus,
  Trash2,
} from "lucide-react";

function CategoriesPage() {
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showAddForm, setShowAddForm] = useState(false);
  const [categoryName, setCategoryName] = useState("");

  const [adding, setAdding] = useState(false);

  // =========================
  // FETCH CATEGORIES
  // =========================

  const fetchCategories = async () => {
  try {
    setLoading(true);
    setError("");

    const response = await apiFetch(
      "/api/transactions/categories/"
    );

    if (!response.ok) {
      const errorData =
        await response.json().catch(() => null);

      console.error(
        "Fetch categories error:",
        errorData
      );

      throw new Error(
        "Failed to fetch categories"
      );
    }

    const data = await response.json();

    setCategories(data);

  } catch (error) {
    console.error(
      "Category fetch error:",
      error
    );

    setError(
      "Could not load categories."
    );

  } finally {
    setLoading(false);
  }
};

  // =========================
  // LOAD CATEGORIES
  // =========================

  useEffect(() => {
    fetchCategories();
  }, []);

  // =========================
  // ADD CATEGORY
  // =========================

  const handleAddCategory = async (e) => {
  e.preventDefault();

  const trimmedName = categoryName.trim();

  if (!trimmedName) {
    return;
  }

  try {
    setAdding(true);

    const response = await apiFetch(
      "/api/transactions/categories/",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          name: trimmedName,
          icon: "circle",
        }),
      }
    );

    const data =
      await response.json().catch(() => null);

    if (!response.ok) {
      console.error(
        "Add category error:",
        data
      );

      throw new Error(
        "Failed to add category"
      );
    }

    // ADD TO UI
    setCategories((prev) => [
      ...prev,
      data,
    ]);

    // CLEAR FORM
    setCategoryName("");

    // CLOSE FORM
    setShowAddForm(false);

  } catch (error) {
    console.error(
      "Add category error:",
      error
    );

    alert(
      "Could not add category."
    );

  } finally {
    setAdding(false);
  }
};

  // =========================
  // DELETE CATEGORY
  // =========================

  const handleDeleteCategory = async (category) => {
  const confirmed = window.confirm(
    `Delete "${category.name}"?`
  );

  if (!confirmed) {
    return;
  }

  try {
    const response = await apiFetch(
      `/api/transactions/categories/${category.id}/`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      const errorData =
        await response.json().catch(() => null);

      console.error(
        "Delete category error:",
        errorData
      );

      throw new Error(
        "Failed to delete category"
      );
    }

    // REMOVE FROM UI
    setCategories((prev) =>
      prev.filter(
        (item) =>
          item.id !== category.id
      )
    );

  } catch (error) {
    console.error(
      "Delete category error:",
      error
    );

    alert(
      "This category may already be used by a transaction, so it cannot be deleted."
    );
  }
};

  // =========================
  // CLOSE ADD FORM
  // =========================

  const closeAddForm = () => {
    setShowAddForm(false);
    setCategoryName("");
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="categories-page">

        <div className="categories-page-header">

          <div>

            <p className="page-subtitle">
              ORGANIZE YOUR MONEY
            </p>

            <h1>
              Categories
            </h1>

            <p className="page-description">
              Manage the categories you use
              to organize your transactions.
            </p>

          </div>

        </div>

        <div className="categories-card">

          <p className="categories-message">
            Loading categories...
          </p>

        </div>

      </div>
    );
  }

  // =========================
  // PAGE
  // =========================

  return (
    <div className="categories-page">

      {/* =========================
          HEADER
      ========================= */}

      <div className="categories-page-header">

        <div>

          <p className="page-subtitle">
            ORGANIZE YOUR MONEY
          </p>

          <h1>
            Categories
          </h1>

          <p className="page-description">
            Manage the categories you use
            to organize your transactions.
          </p>

        </div>

        <button
          className="add-category-btn"
          onClick={() => setShowAddForm(true)}
        >
          <Plus size={16} />

          Add Category
        </button>

      </div>


      {/* =========================
          ERROR
      ========================= */}

      {error && (
        <div className="categories-error">
          {error}
        </div>
      )}


      {/* =========================
          ADD CATEGORY FORM
      ========================= */}

      {showAddForm && (

        <div className="add-category-card">

          {/* Header */}

          <div className="add-category-header">

            <div>

              <h3>
                Create Category
              </h3>

              <p>
                Add a custom category for
                your transactions.
              </p>

            </div>

            <button
              className="close-btn"
              type="button"
              onClick={closeAddForm}
            >
              ×
            </button>

          </div>


          {/* Form */}

          <form
            onSubmit={handleAddCategory}
          >

            {/* =========================
                CATEGORY NAME
            ========================= */}

            <div className="form-group">

              <label>
                Category Name
              </label>

              <input
                type="text"
                placeholder="e.g. Shopping"
                value={categoryName}
                onChange={(e) =>
                  setCategoryName(
                    e.target.value
                  )
                }
                autoFocus
              />

            </div>


            {/* =========================
                ACTIONS
            ========================= */}

            <div className="modal-actions">

              <button
                type="button"
                className="cancel-btn"
                onClick={closeAddForm}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="save-btn"
                disabled={
                  adding ||
                  !categoryName.trim()
                }
              >
                {adding
                  ? "Adding..."
                  : "Add Category"}
              </button>

            </div>

          </form>

        </div>

      )}


      {/* =========================
          CATEGORY LIST
      ========================= */}

      <div className="categories-card">

        {/* Card Header */}

        <div className="categories-card-header">

          <div>

            <h3>
              Your Categories
            </h3>

            <p>
              {categories.length} categories
            </p>

          </div>

        </div>


        {/* Categories */}

        <div className="categories-grid">

          {categories.map((category) => (

            <div
              className="category-page-item"
              key={category.id}
            >

              {/* =========================
                  DEFAULT ICON
              ========================= */}

              <div className="category-page-icon">

                <Tags size={18} />

              </div>


              {/* =========================
                  CATEGORY INFO
              ========================= */}

              <div className="category-page-info">

                <strong>
                  {category.name}
                </strong>

                <span>
                  {category.user
                    ? "Custom category"
                    : "Default category"}
                </span>

              </div>


              {/* =========================
                  DELETE CUSTOM CATEGORY
              ========================= */}

              {category.user && (

                <button
                  className="category-delete-btn"
                  onClick={() =>
                    handleDeleteCategory(
                      category
                    )
                  }
                  title="Delete category"
                >

                  <Trash2 size={16} />

                </button>

              )}

            </div>

          ))}


          {/* =========================
              EMPTY STATE
          ========================= */}

          {categories.length === 0 && (

            <div className="categories-empty">

              <Tags size={30} />

              <h3>
                No categories yet
              </h3>

              <p>
                Create your first category
                to organize your transactions.
              </p>

            </div>

          )}

        </div>

      </div>

    </div>
  );
}

export default CategoriesPage;