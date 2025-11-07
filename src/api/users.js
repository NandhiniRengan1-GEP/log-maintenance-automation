const express = require('express');
const router = express.Router();
const UserService = require('../services/userService');
const { validateUser } = require('../utils/validators');

const userService = new UserService();

// BUG 1: Null reference error - accessing property of undefined
router.get('/:id', async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);
    
    // BUG: user might be null/undefined, but we access user.id without checking
    console.log(`Fetching profile for user: ${user.id}`);
    
    // This will throw: TypeError: Cannot read property 'id' of undefined
    const profile = await userService.getUserProfile(user.id);
    
    res.json({
      user,
      profile
    });
  } catch (error) {
    next(error);
  }
});
