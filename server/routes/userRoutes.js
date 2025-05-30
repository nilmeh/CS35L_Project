import express from 'express';
import User from '../models/User.js';
import admin from '../firebase.js';

const router = express.Router();

// Register new user
router.post('/signup', async (req, res) => {
  try {
    const { firebaseId, name, username, email, allergens, vegetarian, vegan } = req.body;
    if (!firebaseId || !name || !username || !email) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const existingUser = await User.findOne({ $or: [{ firebaseId }, { username }, { email }] });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }
    const user = new User({ firebaseId, name, username, email, allergens, vegetarian, vegan });
    await user.save();
    res.status(201).json({ message: 'User registered', user });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
});

// Login (fetch user profile by firebaseId)
router.post('/login', async (req, res) => {
  try {
    const { firebaseId } = req.body;
    if (!firebaseId) return res.status(400).json({ message: 'Missing firebaseId' });
    const user = await User.findOne({ firebaseId });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
});

export default router;
