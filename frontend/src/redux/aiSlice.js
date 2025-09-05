import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunk for executing AI queries
export const executeAIQuery = createAsyncThunk(
  'ai/executeQuery',
  async ({ tool, query, context }, { rejectWithValue }) => {
    try {
      const response = await fetch('http://localhost:8000/ai/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tool,
          query,
          context
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for fetching available AI tools
export const fetchAITools = createAsyncThunk(
  'ai/fetchTools',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('http://localhost:8000/ai/tools');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.tools || [];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  // AI Tools
  availableTools: [],
  selectedTool: null,
  toolsLoading: false,
  toolsError: null,

  // Chat/Messages
  messages: [{
    id: 'welcome',
    type: 'system',
    content: 'Hi! I\'m your QMS AI Assistant. I can help you analyze audits, identify risks, generate reports, and provide recommendations. Try asking me to "show high-risk events" or "summarize open audits".',
    timestamp: new Date().toISOString()
  }],
  
  // Query state
  queryLoading: false,
  queryError: null,
  lastQuery: null,
  lastResult: null,

  // UI state
  isExpanded: false,
  currentQuery: ''
};

const aiSlice = createSlice({
  name: 'ai',
  initialState,
  reducers: {
    // UI Actions
    setExpanded: (state, action) => {
      state.isExpanded = action.payload;
    },
    
    setCurrentQuery: (state, action) => {
      state.currentQuery = action.payload;
    },
    
    setSelectedTool: (state, action) => {
      state.selectedTool = action.payload;
    },

    // Message Management
    addMessage: (state, action) => {
      state.messages.push({
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        ...action.payload
      });
    },

    addUserMessage: (state, action) => {
      state.messages.push({
        id: Date.now().toString(),
        type: 'user',
        content: action.payload,
        timestamp: new Date().toISOString()
      });
    },

    addAIMessage: (state, action) => {
      state.messages.push({
        id: (Date.now() + 1).toString(),
        type: 'ai',
        timestamp: new Date().toISOString(),
        ...action.payload
      });
    },

    addErrorMessage: (state, action) => {
      state.messages.push({
        id: (Date.now() + 1).toString(),
        type: 'error',
        content: action.payload,
        timestamp: new Date().toISOString()
      });
    },

    clearMessages: (state) => {
      state.messages = [state.messages[0]]; // Keep welcome message
    },

    // Clear errors
    clearQueryError: (state) => {
      state.queryError = null;
    },

    clearToolsError: (state) => {
      state.toolsError = null;
    }
  },
  extraReducers: (builder) => {
    // AI Tools fetching
    builder
      .addCase(fetchAITools.pending, (state) => {
        state.toolsLoading = true;
        state.toolsError = null;
      })
      .addCase(fetchAITools.fulfilled, (state, action) => {
        state.toolsLoading = false;
        state.availableTools = action.payload;
      })
      .addCase(fetchAITools.rejected, (state, action) => {
        state.toolsLoading = false;
        state.toolsError = action.payload;
      });

    // AI Query execution
    builder
      .addCase(executeAIQuery.pending, (state, action) => {
        state.queryLoading = true;
        state.queryError = null;
        state.lastQuery = action.meta.arg.query;
      })
      .addCase(executeAIQuery.fulfilled, (state, action) => {
        state.queryLoading = false;
        state.lastResult = action.payload;
        
        // Add AI response message
        const aiMessage = {
          type: 'ai',
          content: action.payload.result,
          tool: action.payload.tool,
          success: action.payload.success,
          error: action.payload.error
        };
        
        state.messages.push({
          id: (Date.now() + 1).toString(),
          timestamp: new Date().toISOString(),
          ...aiMessage
        });
      })
      .addCase(executeAIQuery.rejected, (state, action) => {
        state.queryLoading = false;
        state.queryError = action.payload;
        
        // Add error message
        state.messages.push({
          id: (Date.now() + 1).toString(),
          type: 'error',
          content: `Failed to process request: ${action.payload}`,
          timestamp: new Date().toISOString()
        });
      });
  }
});

export const {
  setExpanded,
  setCurrentQuery,
  setSelectedTool,
  addMessage,
  addUserMessage,
  addAIMessage,
  addErrorMessage,
  clearMessages,
  clearQueryError,
  clearToolsError
} = aiSlice.actions;

// Selectors
export const selectAI = (state) => state.ai;
export const selectAITools = (state) => state.ai.availableTools;
export const selectAIMessages = (state) => state.ai.messages;
export const selectAILoading = (state) => state.ai.queryLoading;
export const selectAIExpanded = (state) => state.ai.isExpanded;
export const selectSelectedTool = (state) => state.ai.selectedTool;

export default aiSlice.reducer;