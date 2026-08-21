import {
  ArrowRight,
  BarChart3,
  Bell,
  Bot,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  CreditCard,
  Menu,
  PiggyBank,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Wallet,
  X,
} from "lucide-react";

import { useState } from "react";
import SpecularButton from "./SpecularButton";

function LandingPage({ onGetStarted, onLogin }) {
  const [mobileMenu, setMobileMenu] = useState(false);

  const scrollToSection = (id) => {
    setMobileMenu(false);

    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
    });
  };

  return (
    <div className="landing-page">

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <nav className="landing-navbar">

        <div className="landing-nav-inner">

          {/* LOGO */}

          <button
            className="landing-logo"
            onClick={() =>
              window.scrollTo({
                top: 0,
                behavior: "smooth",
              })
            }
          >
            <div className="landing-logo-icon">
              <Wallet size={20} />
            </div>

            <span>Finwise</span>
          </button>


          {/* DESKTOP NAV */}

          <div className="landing-nav-links">

            <button
              onClick={() =>
                scrollToSection("landing-features")
              }
            >
              Features
            </button>

            <button
              onClick={() =>
                scrollToSection("landing-how-it-works")
              }
            >
              How it works
            </button>

            <button
              onClick={() =>
                scrollToSection("landing-ai")
              }
            >
              AI Assistant
            </button>

          </div>


          {/* DESKTOP ACTIONS */}

          <div className="landing-nav-actions">

            <button
              className="landing-login-btn"
              onClick={onLogin}
            >
              Log in
            </button>

            <SpecularButton
              className="landing-nav-cta"
              onClick={onGetStarted}
              size="sm"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                Get Started
                <ArrowRight size={16} />
              </div>
            </SpecularButton>

          </div>


          {/* MOBILE BUTTON */}

          <button
            className="landing-mobile-menu-btn"
            onClick={() =>
              setMobileMenu(!mobileMenu)
            }
          >
            {mobileMenu ? (
              <X size={22} />
            ) : (
              <Menu size={22} />
            )}
          </button>

        </div>


        {/* MOBILE MENU */}

        {mobileMenu && (

          <div className="landing-mobile-menu">

            <button
              onClick={() =>
                scrollToSection("landing-features")
              }
            >
              Features
            </button>

            <button
              onClick={() =>
                scrollToSection("landing-how-it-works")
              }
            >
              How it works
            </button>

            <button
              onClick={() =>
                scrollToSection("landing-ai")
              }
            >
              AI Assistant
            </button>

            <button
              className="mobile-login"
              onClick={onLogin}
            >
              Log in
            </button>

            <SpecularButton
              className="mobile-cta"
              onClick={onGetStarted}
              size="sm"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                Get Started
                <ArrowRight size={16} />
              </div>
            </SpecularButton>

          </div>

        )}

      </nav>


      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="landing-hero">

        <div className="landing-hero-inner">

          {/* LEFT */}

          <div className="landing-hero-content">

            <div className="landing-eyebrow">

              <Sparkles size={15} />

              <span>
                Smarter money management
              </span>

            </div>


            <h1>
              Take control of your
              <span> financial future.</span>
            </h1>


            <p className="landing-hero-description">

              Track your spending, manage budgets,
              build savings goals, and get intelligent
              insights about your money — all in one
              simple place.

            </p>


            <div className="landing-hero-actions">

              <SpecularButton
                className="landing-primary-btn"
                onClick={onGetStarted}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  Get Started
                  <ArrowRight size={18} />
                </div>
              </SpecularButton>


              <button
                className="landing-secondary-btn"
                onClick={() =>
                  scrollToSection(
                    "landing-how-it-works"
                  )
                }
              >
                See how it works

                <ChevronRight size={17} />

              </button>

            </div>


            <div className="landing-trust-row">

              <div className="landing-trust-item">
                <CheckCircle2 size={16} />
                <span>Simple to use</span>
              </div>

              <div className="landing-trust-item">
                <CheckCircle2 size={16} />
                <span>Private & secure</span>
              </div>

              <div className="landing-trust-item">
                <CheckCircle2 size={16} />
                <span>AI-powered</span>
              </div>

            </div>

          </div>


          {/* RIGHT — DASHBOARD PREVIEW */}

          <div className="landing-dashboard-wrapper">

            <div className="landing-glow"></div>


            <div className="landing-dashboard">

              {/* TOP */}

              <div className="preview-topbar">

                <div>

                  <div className="preview-small">
                    FINANCIAL OVERVIEW
                  </div>

                  <strong>
                    Good morning 👋
                  </strong>

                </div>

                <div className="preview-avatar">
                  J
                </div>

              </div>


              {/* STATS */}

              <div className="preview-stats">

                <div className="preview-stat">

                  <span>Total Balance</span>

                  <strong>₹84,250</strong>

                  <small className="preview-positive">
                    +12.4%
                  </small>

                </div>


                <div className="preview-stat">

                  <span>Income</span>

                  <strong>₹62,000</strong>

                  <small>
                    This month
                  </small>

                </div>


                <div className="preview-stat">

                  <span>Expenses</span>

                  <strong>₹31,840</strong>

                  <small>
                    This month
                  </small>

                </div>

              </div>


              {/* CHART */}

              <div className="preview-chart-card">

                <div className="preview-card-header">

                  <div>
                    <strong>Spending overview</strong>
                    <span>Last 7 months</span>
                  </div>

                  <BarChart3 size={18} />

                </div>


                <div className="preview-chart">

                  <div className="preview-chart-line"></div>

                  <div className="preview-bars">

                    <span style={{ height: "35%" }} />
                    <span style={{ height: "55%" }} />
                    <span style={{ height: "42%" }} />
                    <span style={{ height: "68%" }} />
                    <span style={{ height: "50%" }} />
                    <span style={{ height: "76%" }} />
                    <span style={{ height: "60%" }} />

                  </div>

                </div>

              </div>


              {/* BOTTOM */}

              <div className="preview-bottom">

                <div className="preview-goal-card">

                  <div className="preview-card-header">

                    <strong>
                      Savings goal
                    </strong>

                    <Target size={16} />

                  </div>

                  <strong className="preview-goal-amount">
                    ₹32,500
                  </strong>

                  <div className="preview-progress">

                    <div
                      style={{
                        width: "72%",
                      }}
                    />

                  </div>

                  <small>
                    72% completed
                  </small>

                </div>


                <div className="preview-ai-card">

                  <div className="preview-ai-icon">
                    <Bot size={17} />
                  </div>

                  <div>

                    <strong>
                      Finwise AI
                    </strong>

                    <span>
                      Your spending is
                      <b> 8% lower</b> this month.
                    </span>

                  </div>

                </div>

              </div>

            </div>


            {/* FLOATING CARD */}

            <div className="preview-floating-card">

              <div className="floating-icon">
                <TrendingUp size={18} />
              </div>

              <div>

                <span>
                  Savings rate
                </span>

                <strong>
                  32.6%
                </strong>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          FEATURES
      ===================================================== */}

      <section
        id="landing-features"
        className="landing-section landing-features-section"
      >

        <div className="landing-section-heading">

          <div className="landing-section-label">
            Everything in one place
          </div>

          <h2>
            Your finances,
            <span> simplified.</span>
          </h2>

          <p>
            Finwise gives you the tools you need to
            understand where your money goes and
            make better financial decisions.
          </p>

        </div>


        <div className="landing-features-grid">

          <FeatureCard
            icon={<CircleDollarSign size={22} />}
            title="Track every transaction"
            description="Keep your income and expenses organized so you always know where your money is going."
          />

          <FeatureCard
            icon={<BarChart3 size={22} />}
            title="Understand your spending"
            description="Visualize your financial habits with clear charts and meaningful analytics."
          />

          <FeatureCard
            icon={<PiggyBank size={22} />}
            title="Build your savings"
            description="Set savings goals and monitor your progress toward the things that matter to you."
          />

          <FeatureCard
            icon={<ShieldCheck size={22} />}
            title="Stay within budget"
            description="Create category-based budgets and know when your spending starts approaching the limit."
          />

          <FeatureCard
            icon={<Bell size={22} />}
            title="Never miss important events"
            description="Receive useful reminders and notifications about budgets, goals, and your financial activity."
          />

          <FeatureCard
            icon={<Bot size={22} />}
            title="Ask your AI assistant"
            description="Get personalized answers about your finances using the data already available in Finwise."
          />

        </div>

      </section>


      {/* =====================================================
          AI SECTION
      ===================================================== */}

      <section
        id="landing-ai"
        className="landing-ai-section"
      >

        <div className="landing-ai-inner">

          <div className="landing-ai-content">

            <div className="landing-section-label ai-label">
              Meet your financial assistant
            </div>

            <h2>
              Your money,
              <br />
              <span>finally makes sense.</span>
            </h2>

            <p>
              Finwise AI looks at your financial
              information and turns it into simple,
              understandable answers.
            </p>


            <div className="landing-ai-points">

              <div>
                <CheckCircle2 size={18} />
                <span>
                  Ask questions in plain English
                </span>
              </div>

              <div>
                <CheckCircle2 size={18} />
                <span>
                  Get insights based on your data
                </span>
              </div>

              <div>
                <CheckCircle2 size={18} />
                <span>
                  Understand your spending habits
                </span>
              </div>

            </div>


            <button
              className="landing-primary-btn"
              onClick={onGetStarted}
            >
              Try Finwise AI
              <ArrowRight size={18} />
            </button>

          </div>


          {/* AI CHAT */}

          <div className="landing-ai-chat">

            <div className="ai-demo-header">

              <div className="ai-demo-title">

                <div className="ai-demo-icon">
                  <Bot size={18} />
                </div>

                <div>

                  <strong>
                    Finwise AI
                  </strong>

                  <span>
                    Financial assistant
                  </span>

                </div>

              </div>

              <div className="ai-online">
                <span />
                Online
              </div>

            </div>


            <div className="ai-demo-messages">

              <div className="demo-message user">

                <span>
                  Can I afford ₹5,000 of
                  shopping this month?
                </span>

              </div>


              <div className="demo-message assistant">

                <div className="demo-assistant-avatar">
                  <Sparkles size={14} />
                </div>

                <div>

                  <p>
                    Based on your current
                    spending, you have
                    <strong> ₹12,400</strong> available
                    after your planned expenses.
                  </p>

                  <p>
                    A ₹5,000 purchase would keep
                    you within your current budget.
                  </p>

                </div>

              </div>


              <div className="demo-message user">

                <span>
                  Where am I spending the most?
                </span>

              </div>


              <div className="demo-insight">

                <div className="demo-insight-icon">
                  <TrendingUp size={16} />
                </div>

                <div>

                  <strong>
                    Food & Dining
                  </strong>

                  <span>
                    ₹8,420 · 26.4% of expenses
                  </span>

                </div>

                <ArrowRight size={15} />

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          HOW IT WORKS
      ===================================================== */}

      <section
        id="landing-how-it-works"
        className="landing-section landing-how-section"
      >

        <div className="landing-section-heading">

          <div className="landing-section-label">
            How it works
          </div>

          <h2>
            Better finances in
            <span> three simple steps.</span>
          </h2>

          <p>
            No complicated spreadsheets. No
            financial jargon. Just a clearer picture
            of your money.
          </p>

        </div>


        <div className="landing-steps">

          <Step
            number="01"
            icon={<CreditCard size={22} />}
            title="Track"
            description="Add your income and expenses and keep everything organized in one place."
          />

          <Step
            number="02"
            icon={<BarChart3 size={22} />}
            title="Understand"
            description="Use reports, charts, budgets and analytics to understand your financial habits."
          />

          <Step
            number="03"
            icon={<TrendingUp size={22} />}
            title="Improve"
            description="Set goals, build better habits and use AI-powered insights to make smarter decisions."
          />

        </div>

      </section>


      {/* =====================================================
          CTA
      ===================================================== */}

      <section className="landing-cta-section">

        <div className="landing-cta-inner">

          <div className="landing-cta-icon">
            <Wallet size={24} />
          </div>

          <h2>
            Your money deserves
            <br />
            a smarter system.
          </h2>

          <p>
            Start managing your finances with
            clarity and confidence.
          </p>

          <SpecularButton
            className="landing-cta-btn"
            onClick={onGetStarted}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              Get started with Finwise
              <ArrowRight size={18} />
            </div>
          </SpecularButton>

        </div>

      </section>


      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="landing-footer">

        <div className="landing-footer-inner">

          <div className="landing-footer-brand">

            <div className="landing-logo">

              <div className="landing-logo-icon">
                <Wallet size={18} />
              </div>

              <span>Finwise</span>

            </div>

            <p>
              A smarter way to understand,
              manage and improve your finances.
            </p>

          </div>


          <div className="landing-footer-links">

            <div>

              <strong>
                Product
              </strong>

              <button
                onClick={() =>
                  scrollToSection(
                    "landing-features"
                  )
                }
              >
                Features
              </button>

              <button
                onClick={() =>
                  scrollToSection(
                    "landing-ai"
                  )
                }
              >
                AI Assistant
              </button>

            </div>


            <div>

              <strong>
                Explore
              </strong>

              <button
                onClick={() =>
                  scrollToSection(
                    "landing-how-it-works"
                  )
                }
              >
                How it works
              </button>

              <button
                onClick={onGetStarted}
              >
                Get Started
              </button>

            </div>

          </div>

        </div>


        <div className="landing-footer-bottom">

          <span>
            © 2026 Finwise. Built to make
            money management simpler.
          </span>

          <span>
            Smart money. Better decisions.
          </span>

        </div>

      </footer>

    </div>
  );
}


/* =========================================================
   FEATURE CARD
   ========================================================= */

function FeatureCard({
  icon,
  title,
  description,
}) {
  return (
    <div className="landing-feature-card">

      <div className="landing-feature-icon">
        {icon}
      </div>

      <h3>
        {title}
      </h3>

      <p>
        {description}
      </p>

      <div className="feature-arrow">
        <ArrowRight size={16} />
      </div>

    </div>
  );
}


/* =========================================================
   STEP
   ========================================================= */

function Step({
  number,
  icon,
  title,
  description,
}) {
  return (
    <div className="landing-step">

      <div className="step-number">
        {number}
      </div>

      <div className="step-icon">
        {icon}
      </div>

      <h3>
        {title}
      </h3>

      <p>
        {description}
      </p>

    </div>
  );
}


export default LandingPage;