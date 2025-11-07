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

// BUG 2: Unhandled promise rejection in validation
router.post('/', async (req, res, next) => {
  try {
    // BUG: validateUser returns a promise but we don't await it
    const isValid = validateUser(req.body);
    
    if (isValid) {
      const newUser = await userService.createUser(req.body);
      res.status(201).json(newUser);
    } else {
      res.status(400).json({ error: 'Invalid user data' });
    }
  } catch (error) {
    next(error);
  }
});

// BUG 3: Race condition with concurrent updates
router.put('/:id', async (req, res, next) => {
  try {
    const userId = req.params.id;
    
    // BUG: Multiple concurrent requests can cause inconsistent state
    const currentUser = await userService.getUserById(userId);
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Another request might have modified the user in the meantime
    const updatedUser = await userService.updateUser(userId, {
      ...currentUser,
      ...req.body
    });
    
    res.json(updatedUser);
  } catch (error) {
    next(error);
  }
});

// BUG 4: Missing error handling for database connection
router.delete('/:id', async (req, res, next) => {
  try {
    // BUG: No check if database connection exists
    await userService.deleteUser(req.params.id);
    res.status(204).send();
  } catch (error) {
    // Error is caught but database connection leak occurs
    next(error);
  }
});

// BUG 5: Memory leak - event listeners not cleaned up
router.get('/:id/activity', async (req, res, next) => {
  try {
    const userId = req.params.id;
    
    // BUG: Creates new event listener on each request without cleanup
    const stream = userService.getActivityStream(userId);
    
    stream.on('data', (activity) => {
      // Event listener never removed, causing memory leak
      console.log('Activity:', activity);
    });
    
    const activities = await userService.getUserActivities(userId);
    res.json(activities);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
