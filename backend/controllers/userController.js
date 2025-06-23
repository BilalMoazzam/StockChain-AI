// controllers/userController.js (Your provided code, with minor adjustments for consistency)
const User = require("../models/User") // Ensure this path is correct
const mongoose = require("mongoose") // For ObjectId validation

// Helper to format user data for frontend
const formatUserForFrontend = (user) => {
  if (!user) return null
  const userObj = user.toObject ? user.toObject() : user // Handle both Mongoose doc and plain object
  return {
    id: userObj._id.toString(),
    name: `${userObj.firstName} ${userObj.lastName}`.trim(), // Combine first and last name
    firstName: userObj.firstName,
    lastName: userObj.lastName,
    email: userObj.email,
    phone: userObj.phone,
    role: userObj.role,
    department: userObj.department,
    status: userObj.isActive ? "Active" : "Inactive", // Map isActive to status
    lastActive: userObj.lastLogin ? userObj.lastLogin.toISOString() : new Date().toISOString(), // Map lastLogin to lastActive
  }
}

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin/Manager/Employee)
const getUsers = async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const query = {}

    if (req.query.role) {
      query.role = req.query.role
    }
    if (req.query.department) {
      query.department = req.query.department
    }
    if (req.query.status) {
      query.isActive = req.query.status === "Active" // Map frontend status to backend isActive
    }
    if (req.query.search) {
      query.$or = [
        { firstName: { $regex: req.query.search, $options: "i" } },
        { lastName: { $regex: req.query.search, $options: "i" } },
        { email: { $regex: req.query.search, $options: "i" } },
      ]
    }

    const users = await User.find(query).select("-password").sort({ createdAt: -1 }).skip(skip).limit(limit)

    const total = await User.countDocuments(query)

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      users: users.map(formatUserForFrontend), // ✅ Changed 'data' to 'users' and format
    })
  } catch (error) {
    console.error("Get users error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

// @desc    Get single user
// @route   GET /api/admin/users/:id
// @access  Private
const getUser = async (req, res) => {
  try {
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid User ID" })
    }

    const user = await User.findById(req.params.id).select("-password")

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    res.status(200).json({
      success: true,
      user: formatUserForFrontend(user), // ✅ Changed 'data' to 'user' and format
    })
  } catch (error) {
    console.error("Get user error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

// @desc    Create new user
// @route   POST /api/admin/users
// @access  Private (Admin/Manager)
const createUser = async (req, res) => {
  try {
    const {
      name, // Frontend sends 'name', split into firstName/lastName
      email,
      password = "Default@123", // Default password for new users
      phone = "+0000000000",
      role = "Employee",
      department = "General",
      status = "Active", // Frontend sends 'status'
      lastActive = new Date().toISOString(), // Frontend sends 'lastActive'
    } = req.body

    if (!email || !name) {
      return res.status(400).json({
        success: false,
        message: "Name and Email are required",
      })
    }

    let user = await User.findOne({ email })

    if (user) {
      return res.status(200).json({
        success: true,
        message: "User already exists",
        user: formatUserForFrontend(user), // Format existing user
      })
    }

    // Split 'name' into firstName and lastName
    const nameParts = name.split(" ")
    const firstName = nameParts[0] || ""
    const lastName = nameParts.slice(1).join(" ") || ""

    user = await User.create({
      firstName,
      lastName,
      email,
      password,
      phone,
      role,
      department,
      isActive: status === "Active", // Map frontend status to backend isActive
      lastLogin: new Date(lastActive), // Map frontend lastActive to backend lastLogin
    })

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: formatUserForFrontend(user), // Format new user
    })
  } catch (error) {
    console.error("Create user error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private
const updateUser = async (req, res) => {
  try {
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid User ID" })
    }

    const {
      name, // Frontend sends 'name'
      email,
      phone,
      role,
      department,
      status, // Frontend sends 'status'
      lastActive, // Frontend sends 'lastActive'
    } = req.body

    const user = await User.findById(req.params.id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    // Authorization check (simplified for this example)
    // if (req.user.id !== req.params.id && req.user.role !== "Admin") {
    //   return res.status(403).json({
    //     success: false,
    //     message: "Not authorized to update this user",
    //   });
    // }

    // Update fields based on what's provided by frontend
    if (name !== undefined) {
      const nameParts = name.split(" ")
      user.firstName = nameParts[0] || ""
      user.lastName = nameParts.slice(1).join(" ") || ""
    }
    if (email !== undefined) user.email = email
    if (phone !== undefined) user.phone = phone
    if (role !== undefined) user.role = role
    if (department !== undefined) user.department = department
    if (status !== undefined) user.isActive = status === "Active" // Map frontend status to backend isActive
    if (lastActive !== undefined) user.lastLogin = new Date(lastActive) // Map frontend lastActive to backend lastLogin

    await user.save()

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: formatUserForFrontend(user), // Format updated user
    })
  } catch (error) {
    console.error("Update user error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin only)
const deleteUser = async (req, res) => {
  try {
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid User ID" })
    }

    const user = await User.findById(req.params.id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    // Authorization check (simplified for this example)
    // if (req.user.id === req.params.id) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Cannot delete your own account",
    //   });
    // }

    await User.findByIdAndDelete(req.params.id)

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    })
  } catch (error) {
    console.error("Delete user error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

// @desc    Get user statistics
// @route   GET /api/admin/users/stats
// @access  Private (Admin/Manager)
const getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments()
    const activeUsers = await User.countDocuments({ isActive: true })
    const inactiveUsers = await User.countDocuments({ isActive: false })

    const usersByRole = await User.aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }])

    const usersByDepartment = await User.aggregate([{ $group: { _id: "$department", count: { $sum: 1 } } }])

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        inactiveUsers,
        usersByRole,
        usersByDepartment,
      },
    })
  } catch (error) {
    console.error("Get user stats error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getUserStats,
}
