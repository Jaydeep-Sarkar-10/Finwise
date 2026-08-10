import {
  Home,
  Receipt,
  Tags,
  WalletCards,
  Target,
  BarChart3,
  Sparkles,
  Settings,
  Crown,
} from "lucide-react";

function Sidebar() {
  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="logo">
        <div className="logo-icon">F</div>
        <span>Finwise</span>
      </div>

      {/* Main Navigation */}
      <nav className="nav-menu">
        <p className="nav-title">MENU</p>

        <a href="#" className="nav-item active">
          <Home size={19} />
          <span>Home</span>
        </a>

        <a href="#" className="nav-item">
          <Receipt size={19} />
          <span>Transactions</span>
        </a>

        <a href="#" className="nav-item">
          <Tags size={19} />
          <span>Categories</span>
        </a>

        <a href="#" className="nav-item">
          <WalletCards size={19} />
          <span>Budgets</span>
        </a>

        <a href="#" className="nav-item">
          <Target size={19} />
          <span>Goals</span>
        </a>

        <a href="#" className="nav-item">
          <BarChart3 size={19} />
          <span>Reports</span>
        </a>

        <a href="#" className="nav-item">
          <Sparkles size={19} />
          <span>AI Assistant</span>
        </a>
      </nav>

      {/* Premium Card */}
      <div className="premium-card">
        <div className="premium-icon">
          <Crown size={18} />
        </div>

        <div>
          <h4>Go Premium</h4>
          <p>Unlock smarter insights</p>
        </div>
      </div>

      {/* Bottom */}
      <div className="sidebar-bottom">
        <a href="#" className="nav-item">
          <Settings size={19} />
          <span>Settings</span>
        </a>

        <div className="profile">
          <div className="avatar">J</div>

          <div className="profile-info">
            <strong>Jaydeep Sarkar</strong>
            <span>Personal Account</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;