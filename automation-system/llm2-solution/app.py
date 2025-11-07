"""
LLM2 Solution Generator Layer
Analyzes errors and generates code fixes or alert suggestions
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os
from dotenv import load_dotenv
import json

load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes


class CodeFixGenerator:
    """Generates code fixes based on error analysis"""
    
    # Mock code repository (in real implementation, would fetch from GitHub)
    MOCK_CODE_SNIPPETS = {
        'src/api/users.js': '''const express = require('express');
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
});''',
        'src/api/payments.js': '''// BUG 6: Unhandled promise rejection
router.post('/process', async (req, res, next) => {
  try {
    const { userId, amount, paymentMethod } = req.body;
    
    // BUG: Promise chain without proper error handling
    paymentService.validatePayment(userId, amount)
      .then(isValid => {
        if (!isValid) {
          throw new Error('Payment validation failed');
        }
        return paymentService.processPayment(paymentMethod, amount);
      })
      .then(result => {
        res.json(result);
      });
    // Missing .catch() - unhandled promise rejection
    
  } catch (error) {
    next(error);
  }
});''',
        'src/services/userService.js': '''async deleteUser(id) {
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Simulates database connection issue (BUG 4)
    if (Math.random() < 0.3) {
      throw new Error('Database connection lost');
    }
    
    this.users.delete(id);
  }'''
    }
    
    def analyze_error(self, diagnostic):
        """Analyze error to determine if code fix or alert is needed"""
        error_category = diagnostic.get('error', {}).get('category')
        occurrence_count = diagnostic.get('context', {}).get('occurrenceCount', 0)
        
        # Decision logic
        if error_category in ['NULL_REFERENCE', 'UNHANDLED_PROMISE', 'MATH_ERROR']:
            return 'CODE_FIX'
        elif error_category in ['TIMEOUT', 'RESOURCE_LEAK'] and occurrence_count < 10:
            return 'ALERT_SUGGESTION'
        elif error_category == 'ACCESS_CONTROL':
            return 'ALERT_SUGGESTION'
        else:
            return 'CODE_FIX'
    
    def get_code_context(self, file_path, line_number=None):
        """Fetch code context from repository"""
        # In real implementation, would call GitHub API
        # For demo, use mock snippets
        return self.MOCK_CODE_SNIPPETS.get(file_path, '// Code not found in mock')
    
    def generate_code_fix(self, diagnostic):
        """Generate code fix for the error"""
        error_category = diagnostic.get('error', {}).get('category')
        error_message = diagnostic.get('error', {}).get('message')
        source_file = diagnostic.get('source', {}).get('file')
        source_line = diagnostic.get('source', {}).get('line')
        
        # Get original code
        original_code = self.get_code_context(source_file, source_line)
        
        # Generate fix based on category
        if error_category == 'NULL_REFERENCE':
            fixed_code = self.fix_null_reference(original_code, error_message)
            explanation = "Added null/undefined check before accessing properties"
        elif error_category == 'UNHANDLED_PROMISE':
            fixed_code = self.fix_unhandled_promise(original_code)
            explanation = "Added proper error handling with .catch() or try/catch with await"
        elif error_category == 'MATH_ERROR':
            fixed_code = self.fix_math_error(original_code)
            explanation = "Added validation to prevent division by zero"
        elif error_category == 'RESOURCE_LEAK':
            fixed_code = self.fix_resource_leak(original_code)
            explanation = "Added proper resource cleanup"
        else:
            fixed_code = original_code
            explanation = "Manual review required"
        
        return {
            'file': source_file,
            'line': source_line,
            'originalCode': original_code,
            'fixedCode': fixed_code,
            'explanation': explanation,
            'category': error_category
        }
    
    def fix_null_reference(self, code, error_message):
        """Fix null reference errors"""
        # Example fix: Add null check
        if 'user.id' in code:
            return code.replace(
                "console.log(`Fetching profile for user: ${user.id}`);",
                """if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    console.log(`Fetching profile for user: ${user.id}`);"""
            )
        return code
    
    def fix_unhandled_promise(self, code):
        """Fix unhandled promise rejections"""
        # Convert promise chain to async/await
        fixed = '''// FIXED: Using async/await with proper error handling
router.post('/process', async (req, res, next) => {
  try {
    const { userId, amount, paymentMethod } = req.body;
    
    const isValid = await paymentService.validatePayment(userId, amount);
    
    if (!isValid) {
      return res.status(400).json({ error: 'Payment validation failed' });
    }
    
    const result = await paymentService.processPayment(paymentMethod, amount);
    res.json(result);
    
  } catch (error) {
    next(error);
  }
});'''
        return fixed
    
    def fix_math_error(self, code):
        """Fix division by zero and math errors"""
        return code.replace(
            "const averageAmount = totalAmount / transactions.length;",
            """const averageAmount = transactions.length > 0 
      ? totalAmount / transactions.length 
      : 0;"""
        )
    
    def fix_resource_leak(self, code):
        """Fix resource leaks"""
        return code.replace(
            "this.users.delete(id);",
            """this.users.delete(id);
    // Ensure any open connections are closed"""
        )
    
    def generate_alert_suggestion(self, diagnostic):
        """Generate operational alert/suggestion for non-code issues"""
        error_category = diagnostic.get('error', {}).get('category')
        error_message = diagnostic.get('error', {}).get('message')
        occurrence_count = diagnostic.get('context', {}).get('occurrenceCount', 0)
        container = diagnostic.get('context', {}).get('containerName')
        
        suggestions = []
        
        if error_category == 'TIMEOUT':
            suggestions = [
                {
                    'type': 'INFRASTRUCTURE',
                    'priority': 'HIGH',
                    'action': 'Increase timeout configuration for payment gateway',
                    'details': f'Payment gateway timeouts occurring {occurrence_count} times',
                    'recommendedValue': '30s -> 60s'
                },
                {
                    'type': 'MONITORING',
                    'priority': 'MEDIUM',
                    'action': 'Set up alert for payment gateway response time',
                    'details': 'Alert when response time > 25s',
                    'recommendedValue': 'Alert threshold: 25000ms'
                }
            ]
        elif error_category == 'RESOURCE_LEAK':
            suggestions = [
                {
                    'type': 'OPERATIONS',
                    'priority': 'HIGH',
                    'action': f'Restart container: {container}',
                    'details': 'Database connections not being properly closed',
                    'recommendedValue': 'Scheduled restart + connection pool monitoring'
                },
                {
                    'type': 'CONFIGURATION',
                    'priority': 'MEDIUM',
                    'action': 'Review database connection pool settings',
                    'details': 'Ensure max connections and idle timeout are configured',
                    'recommendedValue': 'maxConnections: 20, idleTimeout: 30000'
                }
            ]
        elif error_category == 'ACCESS_CONTROL':
            suggestions = [
                {
                    'type': 'SECURITY',
                    'priority': 'HIGH',
                    'action': 'Review access control policies',
                    'details': error_message,
                    'recommendedValue': 'Implement proper authorization checks before data access'
                }
            ]
        else:
            suggestions = [
                {
                    'type': 'MONITORING',
                    'priority': 'MEDIUM',
                    'action': 'Monitor error frequency',
                    'details': f'Error occurred {occurrence_count} times',
                    'recommendedValue': 'Set up alert if occurrences > 50 in 1 hour'
                }
            ]
        
        return {
            'category': error_category,
            'errorMessage': error_message,
            'occurrenceCount': occurrence_count,
            'suggestions': suggestions
        }


@app.route('/generate-solution', methods=['POST'])
def generate_solution():
    """
    Main solution generation endpoint
    Input: diagnostic data from LLM1
    Output: Code fix OR Alert suggestion
    """
    try:
        diagnostic = request.json.get('diagnostic')
        
        if not diagnostic:
            return jsonify({
                'success': False,
                'message': 'Diagnostic data required'
            }), 400
        
        generator = CodeFixGenerator()
        
        # Determine solution type
        solution_type = generator.analyze_error(diagnostic)
        
        if solution_type == 'CODE_FIX':
            fix = generator.generate_code_fix(diagnostic)
            return jsonify({
                'success': True,
                'solutionType': 'CODE_FIX',
                'fix': fix,
                'diagnostic': diagnostic
            })
        else:
            alert = generator.generate_alert_suggestion(diagnostic)
            return jsonify({
                'success': True,
                'solutionType': 'ALERT_SUGGESTION',
                'alert': alert,
                'diagnostic': diagnostic
            })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'service': 'llm2-solution'})


if __name__ == '__main__':
    port = int(os.getenv('PORT', 5002))
    app.run(host='0.0.0.0', port=port, debug=True)
