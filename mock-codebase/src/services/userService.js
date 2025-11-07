const { EventEmitter } = require('events');

class UserService {
  constructor() {
    this.users = new Map();
    this.activityStreams = new Map();
    this.initializeMockData();
  }

  initializeMockData() {
    // Seed some mock users
    this.users.set('1', {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      createdAt: new Date()
    });
    this.users.set('2', {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      createdAt: new Date()
    });
  }

  async getUserById(id) {
    // Simulate database delay
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Returns undefined for non-existent users (causes BUG 1)
    return this.users.get(id);
  }

  async getUserProfile(userId) {
    await new Promise(resolve => setTimeout(resolve, 30));
    
    return {
      userId,
      bio: 'Sample bio',
      preferences: {},
      lastLogin: new Date()
    };
  }

  async createUser(userData) {
    await new Promise(resolve => setTimeout(resolve, 50));
    
    const id = String(this.users.size + 1);
    const user = {
      id,
      ...userData,
      createdAt: new Date()
    };
    
    this.users.set(id, user);
    return user;
  }

  async updateUser(id, updates) {
    await new Promise(resolve => setTimeout(resolve, 50));
    
    const user = this.users.get(id);
    if (!user) {
      throw new Error(`User ${id} not found`);
    }
    
    const updated = { ...user, ...updates, updatedAt: new Date() };
    this.users.set(id, updated);
    return updated;
  }

  async deleteUser(id) {
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Simulates database connection issue (BUG 4)
    if (Math.random() < 0.3) {
      throw new Error('Database connection lost');
    }
    
    this.users.delete(id);
  }

  getActivityStream(userId) {
    // Creates a new EventEmitter each time (BUG 5 - memory leak)
    const emitter = new EventEmitter();
    this.activityStreams.set(userId, emitter);
    
    // Simulate activity events
    setTimeout(() => {
      emitter.emit('data', { type: 'login', userId, timestamp: new Date() });
    }, 100);
    
    return emitter;
  }

  async getUserActivities(userId) {
    await new Promise(resolve => setTimeout(resolve, 50));
    
    return [
      { type: 'login', timestamp: new Date(Date.now() - 3600000) },
      { type: 'profile_update', timestamp: new Date(Date.now() - 7200000) }
    ];
  }
}

module.exports = UserService;
