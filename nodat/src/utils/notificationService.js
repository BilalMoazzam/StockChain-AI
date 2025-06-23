const NOTIFICATIONS_KEY = "appNotifications"

// Helper to get current notifications from localStorage
const getStoredNotifications = () => {
  try {
    const stored = localStorage.getItem(NOTIFICATIONS_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error("Failed to parse notifications from localStorage:", error)
    return []
  }
}

// Helper to save notifications to localStorage
const saveNotifications = (notifications) => {
  try {
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications))
  } catch (error) {
    console.error("Failed to save notifications to localStorage:", error)
  }
}

/**
 * Adds a new notification to the system.
 * @param {object} notification - The notification object.
 * @param {string} notification.type - Category of the notification (e.g., "order", "alert", "system", "shipment", "inventory", "user", "payment", "settings").
 * @param {string} notification.title - Main title of the notification.
 * @param {string} notification.description - Detailed description.
 * @param {string} [notification.priority="normal"] - Priority level ("high", "medium", "normal").
 * @param {string} [notification.icon="bell"] - Lucide icon name (e.g., "shopping-cart", "alert", "info", "truck", "package", "check", "user").
 * @param {string} [notification.link="/"] - Link to navigate to when clicked.
 */
export const addNotification = ({ type, title, description, priority = "normal", icon = "bell", link = "/" }) => {
  const notifications = getStoredNotifications()
  const newNotification = {
    id: Date.now() + Math.random().toString(36).substring(2, 9), // Unique ID
    type,
    title,
    description,
    timestamp: new Date().toISOString(), // ISO string for consistent sorting
    isRead: false,
    priority,
    icon,
    link,
  }
  notifications.unshift(newNotification) // Add to the beginning
  saveNotifications(notifications)
  console.log("Notification added:", newNotification)
  // You might want to dispatch a custom event here to notify listeners
  window.dispatchEvent(new CustomEvent("notificationAdded"))
}

/**
 * Retrieves all notifications.
 * @returns {Array<object>} An array of notification objects.
 */
export const getNotifications = () => {
  return getStoredNotifications()
}

/**
 * Marks a specific notification as read.
 * @param {string} id - The ID of the notification to mark as read.
 */
export const markNotificationAsRead = (id) => {
  const notifications = getStoredNotifications()
  const updatedNotifications = notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n))
  saveNotifications(updatedNotifications)
  window.dispatchEvent(new CustomEvent("notificationUpdated"))
}

/**
 * Marks all notifications as read.
 */
export const markAllNotificationsAsRead = () => {
  const notifications = getStoredNotifications()
  const updatedNotifications = notifications.map((n) => ({ ...n, isRead: true }))
  saveNotifications(updatedNotifications)
  window.dispatchEvent(new CustomEvent("notificationUpdated"))
}

/**
 * Deletes a specific notification.
 * @param {string} id - The ID of the notification to delete.
 */
export const deleteNotification = (id) => {
  const notifications = getStoredNotifications()
  const updatedNotifications = notifications.filter((n) => n.id !== id)
  saveNotifications(updatedNotifications)
  window.dispatchEvent(new CustomEvent("notificationUpdated"))
}

/**
 * Deletes all notifications.
 */
export const deleteAllNotifications = () => {
  localStorage.removeItem(NOTIFICATIONS_KEY)
  window.dispatchEvent(new CustomEvent("notificationUpdated"))
}
