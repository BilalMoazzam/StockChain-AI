// routes/admin.js
const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const { connectToDatabase } = require('../db'); // ✅ Fix: Import connection

let usersCollection;

(async () => {
  const db = await connectToDatabase();
  usersCollection = db.collection('users');
})();

// Dummy token-based auth middleware
const authenticate = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  next();
};

// --- Routes ---

// GET all users
// routes/admin.js
router.get('/users', authenticate, async (req, res) => {
  const users = await usersCollection.find({}).toArray();

  const result = users.map((user) => {
    return {
      ...user,
      id: user._id.toString(), // ✅ Add this
      _id: undefined            // ✅ Remove original Mongo ID
    };
  });

  res.json({ users: result });
});


// POST new user
router.post('/users', authenticate, async (req, res) => {
  const { name, email, role, department = 'General', status = 'Active' } = req.body;
  if (!name || !email || !role) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const newUser = {
    name,
    email,
    role,
    department,
    status,
    lastActive: new Date().toISOString(),
  };

  try {
    const result = await usersCollection.insertOne(newUser);
    res.status(201).json({
      message: 'User added successfully',
      user: { ...newUser, id: result.insertedId.toString() },
    });
  } catch (err) {
    res.status(500).json({ message: 'Error adding user' });
  }
});

// PUT update user
router.put('/users/:id', authenticate, async (req, res) => {
  const userId = req.params.id;
  let updates = req.body;
  updates.lastActive = new Date().toISOString();

  try {
    const result = await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: updates }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const updatedUser = await usersCollection.findOne({ _id: new ObjectId(userId) });
    res.json({
      message: 'User updated successfully',
      user: { ...updatedUser, id: updatedUser._id.toString(), _id: undefined },
    });
  } catch (err) {
    return res.status(400).json({ message: 'Invalid ID' });
  }
});

// DELETE user
router.delete('/users/:id', authenticate, async (req, res) => {
  const userId = req.params.id;

  try {
    const result = await usersCollection.deleteOne({ _id: new ObjectId(userId) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    return res.status(400).json({ message: 'Invalid ID' });
  }
});

module.exports = router;
