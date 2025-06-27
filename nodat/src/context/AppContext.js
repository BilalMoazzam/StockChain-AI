"use client"

import { createContext, useContext, useReducer, useEffect } from "react"
import axios from "axios"

// Initial state
const initialState = {
  user: null,
  sidebarCollapsed: false,
  darkMode: false,
  notifications: [],
  unreadNotifications: 0,
  loading: false,
  error: null,
}

// Action types
const actionTypes = {
  SET_USER: "SET_USER",
  TOGGLE_SIDEBAR: "TOGGLE_SIDEBAR",
  TOGGLE_DARK_MODE: "TOGGLE_DARK_MODE",
  SET_NOTIFICATIONS: "SET_NOTIFICATIONS",
  ADD_NOTIFICATION: "ADD_NOTIFICATION",
  MARK_NOTIFICATION_READ: "MARK_NOTIFICATION_READ",
  SET_LOADING: "SET_LOADING",
  SET_ERROR: "SET_ERROR",
  CLEAR_ERROR: "CLEAR_ERROR",
}

// Reducer function
const appReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.SET_USER:
      return { ...state, user: action.payload }
    case actionTypes.TOGGLE_SIDEBAR:
      return { ...state, sidebarCollapsed: !state.sidebarCollapsed }
    case actionTypes.TOGGLE_DARK_MODE:
      return { ...state, darkMode: !state.darkMode }
    case actionTypes.SET_NOTIFICATIONS:
      return {
        ...state,
        notifications: action.payload,
        unreadNotifications: action.payload.filter((n) => !n.read).length,
      }
    case actionTypes.ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
        unreadNotifications: state.unreadNotifications + 1,
      }
    case actionTypes.MARK_NOTIFICATION_READ:
      return {
        ...state,
        notifications: state.notifications.map((n) => (n.id === action.payload ? { ...n, read: true } : n)),
      }
    case actionTypes.SET_LOADING:
      return { ...state, loading: action.payload }
    case actionTypes.SET_ERROR:
      return { ...state, error: action.payload, loading: false }
    case actionTypes.CLEAR_ERROR:
      return { ...state, error: null }
    default:
      return state
  }
}

// Create context
const AppContext = createContext()

// Context provider component
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState)

  // Load preferences and initial user from localStorage
  useEffect(() => {
    const savedPreferences = localStorage.getItem("appPreferences")
    if (savedPreferences) {
      try {
        const preferences = JSON.parse(savedPreferences)
        if (preferences.darkMode) {
          dispatch({ type: actionTypes.TOGGLE_DARK_MODE })
        }
        if (preferences.sidebarCollapsed) {
          dispatch({ type: actionTypes.TOGGLE_SIDEBAR })
        }
      } catch (error) {
        console.error("Error loading preferences:", error)
      }
    }

    // Attempt to load user from localStorage on app start
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      try {
        dispatch({ type: actionTypes.SET_USER, payload: JSON.parse(storedUser) })
      } catch (error) {
        console.error("Error parsing stored user:", error)
        localStorage.removeItem("user") // Clear invalid user data
      }
    }
  }, [])

  // Save preferences
  useEffect(() => {
    const preferences = {
      darkMode: state.darkMode,
      sidebarCollapsed: state.sidebarCollapsed,
    }
    localStorage.setItem("appPreferences", JSON.stringify(preferences))
  }, [state.darkMode, state.sidebarCollapsed])

  // ✅ Enhanced Login Function
  const login = async (email, password, rememberMe = false) => {
    try {
      dispatch({ type: actionTypes.SET_LOADING, payload: true })

      // Step 1: Authenticate with your auth backend
      const authResponse = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      if (!authResponse.ok) {
        const errorData = await authResponse.json()
        throw new Error(errorData.message || "Authentication failed")
      }

      const authData = await authResponse.json()
      console.log("Authentication Backend Response (authData):", authData)

      const userDataFromAuth = authData.employee // This is where userData comes from

      if (!userDataFromAuth) {
        throw new Error("Authentication successful, but user data is missing from response.")
      }

      const token = authData.token

      // Save to localStorage
      localStorage.setItem("authToken", token)
      // Temporarily save user data from auth, will be updated from user management backend
      localStorage.setItem("user", JSON.stringify(userDataFromAuth))
      if (rememberMe) localStorage.setItem("rememberMe", "true")

      // Step 2: Sync user to User Management backend (if not already there)
      const userManagementAPI = process.env.REACT_APP_ADMIN_USERS_API_URL || "http://localhost:3000/api/admin/users"
      let finalUserData = { ...userDataFromAuth } // Start with data from auth backend

      try {
        const existingUsersResponse = await axios.get(userManagementAPI, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const existingUsers = existingUsersResponse.data.users || []
        const existingUserInManagement = existingUsers.find((u) => u.email === userDataFromAuth.email)

        const currentTime = new Date().toISOString() // Capture current time for lastActive

        const payloadForManagement = {
          name: userDataFromAuth.name || "Unnamed User",
          email: userDataFromAuth.email,
          role: userDataFromAuth.role || "employee",
          department: userDataFromAuth.department || "General",
          status: "Active", // Always set to Active on login
          lastActive: currentTime, // Update last active time on login
        }

        if (!existingUserInManagement) {
          const addResponse = await axios.post(userManagementAPI, payloadForManagement, {
            headers: { Authorization: `Bearer ${token}` },
          })
          finalUserData = { ...finalUserData, ...(addResponse.data.user || addResponse.data) } // Merge with response from add
          console.log("User added to User Management backend and set to Active. Payload:", payloadForManagement)
        } else {
          // If user exists, update their status and lastActive time
          const updateResponse = await axios.put(
            `${userManagementAPI}/${existingUserInManagement.id}`,
            payloadForManagement, // Send the full payload to update all relevant fields
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          )
          finalUserData = { ...finalUserData, ...(updateResponse.data.user || updateResponse.data) } // Merge with response from update
          console.log(
            "User already exists in User Management backend. Status and last active time updated. Payload:",
            payloadForManagement,
          )
        }
      } catch (err) {
        console.warn("Error syncing user to User Management backend:", err.message)
        if (err.response) {
          console.warn("Backend response for sync error:", err.response.data)
        }
        // If sync fails, still proceed with login using auth data
      }

      
      localStorage.setItem("user", JSON.stringify(finalUserData))
      dispatch({ type: actionTypes.SET_USER, payload: finalUserData })
      dispatch({ type: actionTypes.SET_LOADING, payload: false })

      // return true
      return finalUserData;
    } catch (error) {
      dispatch({ type: actionTypes.SET_ERROR, payload: error.message })
      throw error
    }
  }

  // Logout function
  const logout = async () => {
    const currentUser = state.user
    const token = localStorage.getItem("authToken")

    if (currentUser && currentUser.id && token) {
      try {
        const userManagementAPI = process.env.REACT_APP_ADMIN_USERS_API_URL || "http://localhost:3000/api/admin/users"
        const currentTime = new Date().toISOString() // Capture current time for lastActive
        // Update lastActive time and status in the user management backend upon logout
        await axios.put(
          `${userManagementAPI}/${currentUser.id}`,
          { lastActive: currentTime, status: "Inactive" }, // Set status to Inactive on logout
          { headers: { Authorization: `Bearer ${token}` } },
        )
        console.log(
          `User ${currentUser.email} status set to Inactive and last active time updated on logout. Payload:`,
          { lastActive: currentTime, status: "Inactive" },
        )
      } catch (error) {
        console.error("Error updating last active time/status on logout:", error)
        if (error.response) {
          console.error("Backend response for logout sync error:", error.response.data)
        }
      }
    }

    localStorage.removeItem("authToken")
    localStorage.removeItem("user")
    localStorage.removeItem("rememberMe")
    dispatch({ type: actionTypes.SET_USER, payload: null })
  }

  const actions = {
    setUser: (user) => dispatch({ type: actionTypes.SET_USER, payload: user }),
    toggleSidebar: () => dispatch({ type: actionTypes.TOGGLE_SIDEBAR }),
    toggleDarkMode: () => dispatch({ type: actionTypes.TOGGLE_DARK_MODE }),
    setNotifications: (notifications) => dispatch({ type: actionTypes.SET_NOTIFICATIONS, payload: notifications }),
    addNotification: (notification) => dispatch({ type: actionTypes.ADD_NOTIFICATION, payload: notification }),
    markNotificationRead: (id) => dispatch({ type: actionTypes.MARK_NOTIFICATION_READ, payload: id }),
    setLoading: (loading) => dispatch({ type: actionTypes.SET_LOADING, payload: loading }),
    setError: (error) => dispatch({ type: actionTypes.SET_ERROR, payload: error }),
    clearError: () => dispatch({ type: actionTypes.CLEAR_ERROR }),
    login,
    logout,
  }

  const value = { state, actions }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

// Custom hook
export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) throw new Error("useApp must be used within an AppProvider")
  return context
}

export default AppContext
