import { useEffect, useState } from "react";

import { apiFetch } from "../utils/api";

import {
  Bell,
  CheckCheck,
  Trash2,
  Target,
  WalletCards,
  PiggyBank,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [showPanel, setShowPanel] = useState(false);
  const [loading, setLoading] = useState(false);

  // =========================
  // FETCH NOTIFICATIONS
  // =========================

 const fetchNotifications = async () => {
  const token = localStorage.getItem("access");

  if (!token) {
    setNotifications([]);
    return;
  }

  try {
    setLoading(true);

    const response = await apiFetch(
      "/api/transactions/notifications/"
    );

    if (!response.ok) {
      throw new Error("Failed to fetch notifications");
    }

    const data = await response.json();

    setNotifications(
      Array.isArray(data)
        ? data
        : data.results || []
    );
  } catch (error) {
    console.error(
      "Notification fetch error:",
      error
    );
  } finally {
    setLoading(false);
  }
};

  // =========================
  // LOAD
  // =========================

  useEffect(() => {
    fetchNotifications();

    const interval = setInterval(
      fetchNotifications,
      30000
    );

    return () => clearInterval(interval);
  }, []);

  // =========================
  // UNREAD COUNT
  // =========================

  const unreadCount = notifications.filter(
    (item) => !item.is_read
  ).length;

  // =========================
  // MARK ONE AS READ
  // =========================

  const markAsRead = async (notification) => {
  const token = localStorage.getItem("access");

  if (!token || notification.is_read) {
    return;
  }

  try {
    const response = await apiFetch(
      `/api/transactions/notifications/${notification.id}/read/`,
      {
        method: "PATCH",
      }
    );

    if (!response.ok) {
      throw new Error(
        "Failed to mark notification as read"
      );
    }

    setNotifications((prev) =>
      prev.map((item) =>
        item.id === notification.id
          ? {
              ...item,
              is_read: true,
            }
          : item
      )
    );
  } catch (error) {
    console.error(
      "Mark read error:",
      error
    );
  }
};
  // =========================
  // MARK ALL AS READ
  // =========================

  const markAllAsRead = async () => {
  const token = localStorage.getItem("access");

  if (!token || unreadCount === 0) {
    return;
  }

  try {
    const response = await apiFetch(
      "/api/transactions/notifications/mark-all-read/",
      {
        method: "POST",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(
        "Mark all read error:",
        data
      );

      throw new Error(
        "Failed to mark all notifications as read"
      );
    }

    setNotifications((prev) =>
      prev.map((item) => ({
        ...item,
        is_read: true,
      }))
    );
  } catch (error) {
    console.error(
      "Mark all read error:",
      error
    );
  }
};


// =========================
// DELETE NOTIFICATION
// =========================

const deleteNotification = async (notification) => {
  const token = localStorage.getItem("access");

  if (!token) {
    return;
  }

  try {
    const response = await apiFetch(
      `/api/transactions/notifications/${notification.id}/`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      const errorData = await response.text();

      console.error(
        "Delete notification error:",
        errorData
      );

      throw new Error(
        "Failed to delete notification"
      );
    }

    setNotifications((prev) =>
      prev.filter(
        (item) => item.id !== notification.id
      )
    );
  } catch (error) {
    console.error(
      "Delete notification error:",
      error
    );
  }
};

  // =========================
  // ICON
  // =========================

  const getNotificationIcon = (type) => {
    switch (type) {
      case "budget_warning":
      case "budget_exceeded":
        return <WalletCards size={17} />;

      case "goal_deadline":
      case "goal_overdue":
      case "goal_milestone":
      case "goal_completed":
        return <Target size={17} />;

      case "savings_added":
        return <PiggyBank size={17} />;

      case "spending_alert":
        return <TrendingUp size={17} />;

      default:
        return <Bell size={17} />;
    }
  };

  // =========================
  // TIME
  // =========================

  const formatTime = (date) => {
    if (!date) {
      return "";
    }

    return new Date(date).toLocaleString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        hour: "numeric",
        minute: "2-digit",
      }
    );
  };

  return (
    <div className="notification-wrapper">

      {/* =========================
          BELL BUTTON
      ========================= */}

      <button
        className="notification-btn"
        onClick={() => {
          setShowPanel((prev) => !prev);

          if (!showPanel) {
            fetchNotifications();
          }
        }}
        aria-label="Notifications"
      >
        <Bell size={19} />

        {unreadCount > 0 && (
          <span className="notification-dot"></span>
        )}
      </button>


      {/* =========================
          DROPDOWN
      ========================= */}

      {showPanel && (
        <div className="notification-panel">

          {/* HEADER */}

          <div className="notification-panel-header">

            <div className="notification-panel-title">

              <h3>
                Notifications
              </h3>

              {unreadCount > 0 && (
                <span className="notification-count">
                  {unreadCount}
                </span>
              )}

            </div>


            {unreadCount > 0 && (
              <button
                className="mark-all-btn"
                onClick={markAllAsRead}
              >
                <CheckCheck size={14} />
                Mark all read
              </button>
            )}

          </div>


          {/* CONTENT */}

          <div className="notification-list">

            {loading ? (

              <div className="notifications-message">
                Loading notifications...
              </div>

            ) : notifications.length === 0 ? (

              <div className="notifications-empty">

                <div className="notifications-empty-icon">
                  <Bell size={24} />
                </div>

                <h3>
                  You're all caught up
                </h3>

                <p>
                  You don't have any
                  notifications right now.
                </p>

              </div>

            ) : (

              notifications.map(
                (notification) => (

                  <div
                    key={notification.id}
                    className={`notification-item ${
                      !notification.is_read
                        ? "notification-unread"
                        : ""
                    }`}
                    onClick={() =>
                      markAsRead(notification)
                    }
                  >

                    {/* ICON */}

                    <div
                      className={`notification-icon notification-${notification.type}`}
                    >
                      {getNotificationIcon(
                        notification.type
                      )}
                    </div>


                    {/* CONTENT */}

                    <div className="notification-content">

                      <strong>
                        {notification.title}
                      </strong>

                      <p>
                        {notification.message}
                      </p>

                      <span>
                        {formatTime(
                          notification.created_at
                        )}
                      </span>

                    </div>


                    {/* DELETE */}

                    <div className="notification-actions">

                      <button
                        type="button"
                        title="Delete notification"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(
                            notification
                          );
                        }}
                      >
                        <Trash2 size={14} />
                      </button>

                    </div>

                  </div>

                )
              )

            )}

          </div>

        </div>
      )}

    </div>
  );
}

export default Notifications;