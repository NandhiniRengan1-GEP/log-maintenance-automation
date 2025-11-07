"""
LLM1 Diagnostics Layer
Retrieves error information from New Relic and gathers context
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

# MCP Server endpoints
NEWRELIC_MCP_URL = os.getenv('NEWRELIC_MCP_URL', 'http://localhost:3002')
AZURE_MCP_URL = os.getenv('AZURE_MCP_URL', 'http://localhost:3003')
GITHUB_MCP_URL = os.getenv('GITHUB_MCP_URL', 'http://localhost:3004')

# Mock mapping: role instance -> pipeline info
ROLE_INSTANCE_MAPPING = {
    'aks-nodepool1-12345': {
        'pipelineId': 'pipeline-001',
        'pipelineName': 'user-service-ci-cd',
        'buildNumber': '234',
        'repository': 'company/user-service'
    },
    'aks-nodepool1-67890': {
        'pipelineId': 'pipeline-002',
        'pipelineName': 'payment-service-ci-cd',
        'buildNumber': '156',
        'repository': 'company/payment-service'
    },
    'aks-nodepool1-11223': {
        'pipelineId': 'pipeline-003',
        'pipelineName': 'analytics-service-ci-cd',
        'buildNumber': '89',
        'repository': 'company/analytics-service'
    }
}

# Mock service -> repository mapping
SERVICE_REPO_MAPPING = {
    'user-service': 'company/user-service',
    'payment-service': 'company/payment-service',
    'analytics-service': 'company/analytics-service',
    'order-service': 'company/order-service'
}


class DiagnosticsEngine:
    """Retrieves and correlates error diagnostics from multiple sources"""
    
    def fetch_error_from_newrelic(self, transaction_id=None, scope_id=None, time_range='24h'):
        """Fetch error details from New Relic MCP"""
        try:
            if transaction_id:
                url = f"{NEWRELIC_MCP_URL}/api/errors/transaction/{transaction_id}"
                response = requests.get(url)
            elif scope_id:
                url = f"{NEWRELIC_MCP_URL}/api/errors/scope/{scope_id}"
                params = {'timeRange': time_range}
                response = requests.get(url, params=params)
            else:
                return None
            
            if response.status_code == 200:
                data = response.json()
                # If scope query, get the most recent error
                if isinstance(data, dict) and 'errors' in data:
                    return data['errors'][0] if data['errors'] else None
                return data
            return None
        except Exception as e:
            print(f"Error fetching from New Relic: {e}")
            return None
    
    def fetch_pipeline_info(self, role_instance):
        """Fetch pipeline info from Azure MCP (or mock mapping)"""
        # In real implementation, would call Azure DevOps API
        return ROLE_INSTANCE_MAPPING.get(role_instance, {
            'pipelineId': 'unknown',
            'pipelineName': 'unknown-pipeline',
            'buildNumber': 'N/A',
            'repository': 'unknown/unknown'
        })
    
    def fetch_repository_info(self, service_name):
        """Fetch repository info from GitHub MCP"""
        # Extract service name from scopeId or metadata
        for service, repo in SERVICE_REPO_MAPPING.items():
            if service in service_name.lower():
                return {
                    'repository': repo,
                    'branch': 'main',
                    'lastCommit': 'abc123def456'
                }
        return {
            'repository': 'unknown/unknown',
            'branch': 'main',
            'lastCommit': 'unknown'
        }
    
    def analyze_error_context(self, error_data):
        """Analyze error and gather full context"""
        if not error_data:
            return None
        
        # Extract key information
        error_message = error_data.get('error', {}).get('message', '')
        error_type = error_data.get('error', {}).get('type', '')
        stack_trace = error_data.get('error', {}).get('stack', '')
        container_name = error_data.get('containerName', '')
        role_instance = error_data.get('roleInstance', '')
        occurrence_count = error_data.get('occurrenceCount', 0)
        
        # Get pipeline info
        pipeline_info = self.fetch_pipeline_info(role_instance)
        
        # Get repository info
        service_name = error_data.get('metadata', {}).get('service', 
                                      error_data.get('scopeId', ''))
        repo_info = self.fetch_repository_info(service_name)
        
        # Determine error category and source file
        source_file, line_number = self.extract_source_location(stack_trace)
        
        return {
            'error': {
                'message': error_message,
                'type': error_type,
                'stack': stack_trace,
                'category': self.categorize_error(error_type, error_message)
            },
            'context': {
                'containerName': container_name,
                'roleInstance': role_instance,
                'occurrenceCount': occurrence_count,
                'firstOccurrence': error_data.get('firstOccurrence'),
                'lastOccurrence': error_data.get('lastOccurrence')
            },
            'pipeline': pipeline_info,
            'repository': repo_info,
            'source': {
                'file': source_file,
                'line': line_number
            }
        }
    
    def extract_source_location(self, stack_trace):
        """Extract file and line number from stack trace"""
        if not stack_trace:
            return None, None
        
        # Parse stack trace to find source file
        lines = stack_trace.split('\n')
        for line in lines:
            if '/app/src/' in line or 'src/' in line:
                # Extract file path and line number
                # Example: "at /app/src/api/users.js:11:51"
                parts = line.strip().split()
                for part in parts:
                    if '.js:' in part or '.ts:' in part:
                        file_and_line = part.strip('()')
                        if ':' in file_and_line:
                            file_path = file_and_line.split(':')[0]
                            line_num = file_and_line.split(':')[1] if len(file_and_line.split(':')) > 1 else None
                            # Clean up file path
                            if '/app/' in file_path:
                                file_path = file_path.split('/app/')[-1]
                            return file_path, line_num
        return None, None
    
    def categorize_error(self, error_type, error_message):
        """Categorize error to determine fix strategy"""
        error_lower = error_message.lower()
        
        if 'cannot read property' in error_lower or 'undefined' in error_lower:
            return 'NULL_REFERENCE'
        elif 'unhandled' in error_lower and 'promise' in error_lower:
            return 'UNHANDLED_PROMISE'
        elif 'division' in error_lower or 'divide' in error_lower:
            return 'MATH_ERROR'
        elif 'access denied' in error_lower or 'permission' in error_lower:
            return 'ACCESS_CONTROL'
        elif 'connection' in error_lower:
            return 'RESOURCE_LEAK'
        elif 'timeout' in error_lower:
            return 'TIMEOUT'
        else:
            return 'RUNTIME_ERROR'


@app.route('/diagnose', methods=['POST'])
def diagnose():
    """
    Main diagnostics endpoint
    Input: { transactionId?, scopeId?, docName?, timeRange? }
    Output: Full diagnostic context
    """
    try:
        data = request.json
        transaction_id = data.get('transactionId')
        scope_id = data.get('scopeId')
        time_range = data.get('timeRange', '24h')
        
        engine = DiagnosticsEngine()
        
        # Fetch error from New Relic
        error_data = engine.fetch_error_from_newrelic(
            transaction_id=transaction_id,
            scope_id=scope_id,
            time_range=time_range
        )
        
        if not error_data:
            return jsonify({
                'success': False,
                'message': 'No error found for the given criteria'
            }), 404
        
        # Analyze and gather full context
        diagnostic = engine.analyze_error_context(error_data)
        
        return jsonify({
            'success': True,
            'diagnostic': diagnostic
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'service': 'llm1-diagnostics'})


if __name__ == '__main__':
    port = int(os.getenv('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=True)
