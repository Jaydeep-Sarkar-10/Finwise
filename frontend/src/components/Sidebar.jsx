import { useState } from "react";
import { createPortal } from "react-dom";
import logo from "../assets/finwise-logo.png";

import {
  Home,
  Receipt,
  Tags,
  WalletCards,
  Target,
  BarChart3,
  Sparkles,
  Crown,
  User,
} from "lucide-react";


function Sidebar({
  user,
  onAuthClick,
  currentPage,
  onNavigate,
  isOpen,
  onClose,
}) {

  // =========================
  // PREMIUM MODAL STATE
  // =========================

  const [showPremiumModal, setShowPremiumModal] =
    useState(false);


  const username = user?.username || "Sign Up";


  const avatarLetter = user
    ? username.charAt(0).toUpperCase()
    : "J";


  return (
    <>
      {/* Mobile overlay — closes sidebar when tapping outside */}
      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside className="sidebar" data-open={isOpen}>

      {/* =========================
          LOGO
      ========================= */}

      <div className="logo">
        <img src={logo} alt="Finwise" style={{ height: "32px", width: "auto" }} />
      </div>


      {/* =========================
          MAIN NAVIGATION
      ========================= */}

      <nav className="nav-menu">

        <p className="nav-title">
          MENU
        </p>


        {/* =========================
            HOME
        ========================= */}

        <a
          href="#"
          className={`nav-item ${
            currentPage === "home"
              ? "active"
              : ""
          }`}
          onClick={(e) => {

            e.preventDefault();

            if (onNavigate) {
              onNavigate("home");
            }

          }}
        >

          <Home size={19} />

          <span>
            Home
          </span>

        </a>


        {/* =========================
            TRANSACTIONS
        ========================= */}

        <a
          href="#"
          className={`nav-item ${
            currentPage === "transactions"
              ? "active"
              : ""
          }`}
          onClick={(e) => {

            e.preventDefault();

            if (onNavigate) {
              onNavigate("transactions");
            }

          }}
        >

          <Receipt size={19} />

          <span>
            Transactions
          </span>

        </a>


        {/* =========================
            CATEGORIES
        ========================= */}

        <a
          href="#"
          className={`nav-item ${
            currentPage === "categories"
              ? "active"
              : ""
          }`}
          onClick={(e) => {

            e.preventDefault();

            if (onNavigate) {
              onNavigate("categories");
            }

          }}
        >

          <Tags size={19} />

          <span>
            Categories
          </span>

        </a>


        {/* =========================
            BUDGETS
        ========================= */}

        <a
          href="#"
          className={`nav-item ${
            currentPage === "budgets"
              ? "active"
              : ""
          }`}
          onClick={(e) => {

            e.preventDefault();

            if (onNavigate) {
              onNavigate("budgets");
            }

          }}
        >

          <WalletCards size={19} />

          <span>
            Budgets
          </span>

        </a>


        {/* =========================
            GOALS
        ========================= */}

        <a
          href="#"
          className={`nav-item ${
            currentPage === "goals"
              ? "active"
              : ""
          }`}
          onClick={(e) => {

            e.preventDefault();

            if (onNavigate) {
              onNavigate("goals");
            }

          }}
        >

          <Target size={19} />

          <span>
            Goals
          </span>

        </a>


        {/* =========================
            REPORTS
        ========================= */}

        <a
          href="#"
          className={`nav-item ${
            currentPage === "reports"
              ? "active"
              : ""
          }`}
          onClick={(e) => {

            e.preventDefault();

            if (onNavigate) {
              onNavigate("reports");
            }

          }}
        >

          <BarChart3 size={19} />

          <span>
            Reports
          </span>

        </a>


        {/* =========================
            AI ASSISTANT
        ========================= */}

        <a
          href="#"
          className={`nav-item ${
            currentPage === "ai"
              ? "active"
              : ""
          }`}
          onClick={(e) => {

            e.preventDefault();

            if (onNavigate) {
              onNavigate("ai");
            }

          }}
        >

          <Sparkles size={19} />

          <span>
            AI Assistant
          </span>

        </a>

      </nav>


      {/* =========================
          PREMIUM CARD
      ========================= */}

      <div
        className="premium-card"
        onClick={() =>
          setShowPremiumModal(true)
        }
        style={{
          cursor: "pointer",
        }}
      >

        <div className="premium-icon">

          <Crown size={18} />

        </div>


        <div>

          <h4>
            Go Premium
          </h4>

          <p>
            Unlock smarter insights
          </p>

        </div>

      </div>


      {/* =========================
          SIDEBAR BOTTOM
      ========================= */}

      <div className="sidebar-bottom">


        {/* =========================
            SETTINGS
        ========================= */}

        


        {/* =========================
            ACCOUNT / PROFILE
        ========================= */}

        <div
          className="profile"
          onClick={() => {

            if (user && onNavigate) {

              onNavigate("profile");

            } else if (
              !user &&
              onAuthClick
            ) {

              onAuthClick();

            }

          }}
          style={{
            cursor: "pointer",
          }}
        >

          {/* Avatar */}

          <div className="avatar">

            {user ? (
              avatarLetter
            ) : (
              <User size={17} />
            )}

          </div>


          {/* Profile information */}

          <div className="profile-info">

            <strong>

              {user
                ? username
                : "Sign Up"}

            </strong>


            <span>

              {user
                ? "Personal Account"
                : "Login to Finwise"}

            </span>

          </div>

        </div>

      </div>


      {/* =========================
          PREMIUM MODAL
      ========================= */}

      {showPremiumModal &&
        createPortal(

          <div
            className="premium-modal-overlay"
            onClick={() =>
              setShowPremiumModal(false)
            }
          >

            <div
              className="premium-modal"
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              {/* Premium Icon */}

              <div className="premium-modal-icon">

                <Crown size={24} />

              </div>


              {/* Title */}

              <h2>
                Premium Coming Soon
              </h2>


              {/* Message */}

              <p>
                Premium features are currently
                under development. Stay tuned!
              </p>


              {/* Close Button */}

              <button
                type="button"
                onClick={() =>
                  setShowPremiumModal(false)
                }
              >
                Got it
              </button>

            </div>

          </div>,

          document.body

        )}

    </aside>
    </>
  );
}


export default Sidebar;