import { User, Mail, LogOut, ArrowLeft } from "lucide-react";

function Profile({ user, onLogout, onBack }) {
  const username = user?.username || "User";
  const email = user?.email || "No email available";

  const avatarLetter = username
    ? username.charAt(0).toUpperCase()
    : "U";

  return (
    <div className="profile-page">

      {/* Header */}
      <div className="profile-page-header">
        <button
          className="profile-back-btn"
          onClick={onBack}
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <div>
          <h1>Profile</h1>
          <p>Manage your Finwise account</p>
        </div>
      </div>


      {/* Profile Card */}
      <div className="profile-card">

        {/* Avatar */}
        <div className="profile-avatar-large">
          {avatarLetter}
        </div>

        <h2>{username}</h2>

        <p className="profile-email">
          {email}
        </p>

        <span className="account-badge">
          Personal Account
        </span>


        {/* Account Information */}
        <div className="profile-section">

          <h3>Account Information</h3>

          <div className="profile-info-row">

            <div className="profile-info-icon">
              <User size={18} />
            </div>

            <div>
              <span>Username</span>
              <strong>{username}</strong>
            </div>

          </div>


          <div className="profile-info-row">

            <div className="profile-info-icon">
              <Mail size={18} />
            </div>

            <div>
              <span>Email</span>
              <strong>{email}</strong>
            </div>

          </div>

        </div>


        {/* Logout */}
        <button
          className="profile-logout-btn"
          onClick={onLogout}
        >
          <LogOut size={18} />
          Logout
        </button>

      </div>

    </div>
  );
}

export default Profile;