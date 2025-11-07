/**
 * New Relic Agent Configuration
 * Mock configuration for demonstration
 */
'use strict'

exports.config = {
  app_name: ['Mock Code Service'],
  license_key: 'mock-license-key-for-demo',
  logging: {
    level: 'info',
    filepath: 'stdout'
  },
  
  // Custom instrumentation
  allow_all_headers: true,
  attributes: {
    enabled: true,
    include: ['transactionId', 'scopeId']
  },
  
  // Error collector
  error_collector: {
    enabled: true,
    ignore_status_codes: [404]
  },
  
  // For demo purposes, disable actual New Relic reporting
  agent_enabled: process.env.NEW_RELIC_ENABLED === 'true'
}
