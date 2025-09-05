import api from './api';

export const aiAPI = {
  // Get available AI tools
  getAITools: async () => {
    try {
      const response = await api.get('/ai/tools');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch AI tools:', error);
      throw new Error(`Failed to fetch AI tools: ${error.response?.data?.detail || error.message}`);
    }
  },

  // Execute AI query with specific tool
  executeAIQuery: async (tool, query, context = null) => {
    try {
      const response = await api.post('/ai/query', {
        tool,
        query,
        context
      });
      return response.data;
    } catch (error) {
      console.error('AI query failed:', error);
      throw new Error(`AI query failed: ${error.response?.data?.detail || error.message}`);
    }
  },

  // General AI chat interface
  aiChat: async (message, context = null) => {
    try {
      const response = await api.post('/ai/chat', {
        message,
        context
      });
      return response.data;
    } catch (error) {
      console.error('AI chat failed:', error);
      throw new Error(`AI chat failed: ${error.response?.data?.detail || error.message}`);
    }
  },

  // Specialized AI tool functions
  showHighRiskEvents: async (query = "Show me high-risk audit events") => {
    return await aiAPI.executeAIQuery('show_high_risk_events', query);
  },

  summarizeOpenEvents: async (query = "Summarize open audit events from the last month") => {
    return await aiAPI.executeAIQuery('summarize_open_events', query);
  },

  suggestNextSteps: async (auditId, query = null) => {
    const defaultQuery = `What are the recommended next steps for audit ${auditId}?`;
    return await aiAPI.executeAIQuery('suggest_next_steps', query || defaultQuery, {
      audit_id: auditId
    });
  },

  identifyTrends: async (query = "What trends do you see in our audit data?") => {
    return await aiAPI.executeAIQuery('identify_trends', query);
  },

  generateNotification: async (auditId = null, type = "general", query = null) => {
    const defaultQuery = auditId 
      ? `Generate a notification for audit ${auditId}` 
      : "Generate audit notifications";
    
    return await aiAPI.executeAIQuery('generate_notification', query || defaultQuery, {
      audit_id: auditId,
      type
    });
  }
};

export default aiAPI;