class AnalyticsService {
  constructor() {
    this.connections = [];
  }

  async getConnection() {
    await new Promise(resolve => setTimeout(resolve, 30));
    
    // Simulates database connection (BUG 13 - never closed)
    const connection = {
      id: `conn-${Date.now()}`,
      query: async (sql) => {
        await new Promise(resolve => setTimeout(resolve, 50));
        return [
          { metric: 'users', value: 1250 },
          { metric: 'revenue', value: 45000 }
        ];
      },
      close: () => {
        console.log(`Connection ${connection.id} closed`);
      }
    };
    
    this.connections.push(connection);
    return connection;
  }

  async processChunk(index) {
    await new Promise(resolve => setTimeout(resolve, 10));
    console.log(`Processing chunk ${index}`);
  }
}

module.exports = AnalyticsService;
