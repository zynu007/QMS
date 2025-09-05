import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { auditAPI } from '../services/api';

// Async thunks
export const fetchAudits = createAsyncThunk(
  'audits/fetchAudits',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const data = await auditAPI.getAudits(filters);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch audits');
    }
  }
);

export const fetchAuditById = createAsyncThunk(
  'audits/fetchAuditById',
  async (auditId, { rejectWithValue }) => {
    try {
      const data = await auditAPI.getAudit(auditId);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch audit');
    }
  }
);

export const createAudit = createAsyncThunk(
  'audits/createAudit',
  async (auditData, { rejectWithValue }) => {
    try {
      const data = await auditAPI.createAudit(auditData);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to create audit');
    }
  }
);

export const updateAudit = createAsyncThunk(
  'audits/updateAudit',
  async ({ auditId, auditData }, { rejectWithValue }) => {
    try {
      const data = await auditAPI.updateAudit(auditId, auditData);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to update audit');
    }
  }
);

export const deleteAudit = createAsyncThunk(
  'audits/deleteAudit',
  async (auditId, { rejectWithValue }) => {
    try {
      await auditAPI.deleteAudit(auditId);
      return auditId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to delete audit');
    }
  }
);

const initialState = {
  audits: [],
  currentAudit: null,
  loading: false,
  error: null,
  filters: {
    audit_id: '',
    audit_type: 'All',
    status: 'All',
    lead_auditor: 'All',
    site: 'All'
  },
  wizardData: {
    step: 1,
    data: {
      // Step 1: Initialization
      audit_title: '',
      audit_type: '',
      audit_scope: '',
      audit_objective: '',
      
      // Step 2: Auditee Details
      auditee_name: '',
      auditee_site_location: '',
      auditee_country: '',
      primary_contact_name: '',
      primary_contact_email: '',
      
      // Step 3: Scheduling & Team
      proposed_start_date: '',
      proposed_end_date: '',
      confirmed_start_date: '',
      confirmed_end_date: '',
      lead_auditor: '',
      audit_team: '',
      
      // Step 4: Audit Plan
      audit_criteria: '',
      audit_agenda: ''
    }
  }
};

const auditSlice = createSlice({
  name: 'audits',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    setCurrentAudit: (state, action) => {
      state.currentAudit = action.payload;
    },
    clearCurrentAudit: (state) => {
      state.currentAudit = null;
    },
    setWizardStep: (state, action) => {
      state.wizardData.step = action.payload;
    },
    updateWizardData: (state, action) => {
      state.wizardData.data = { ...state.wizardData.data, ...action.payload };
    },
    resetWizard: (state) => {
      state.wizardData = initialState.wizardData;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch audits
      .addCase(fetchAudits.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAudits.fulfilled, (state, action) => {
        state.loading = false;
        state.audits = action.payload;
      })
      .addCase(fetchAudits.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch audit by ID
      .addCase(fetchAuditById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAuditById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentAudit = action.payload;
      })
      .addCase(fetchAuditById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create audit
      .addCase(createAudit.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAudit.fulfilled, (state, action) => {
        state.loading = false;
        state.audits.unshift(action.payload);
        state.currentAudit = action.payload;
      })
      .addCase(createAudit.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update audit
      .addCase(updateAudit.fulfilled, (state, action) => {
        const index = state.audits.findIndex(audit => audit.audit_id === action.payload.audit_id);
        if (index !== -1) {
          state.audits[index] = action.payload;
        }
        if (state.currentAudit && state.currentAudit.audit_id === action.payload.audit_id) {
          state.currentAudit = action.payload;
        }
      })
      
      // Delete audit
      .addCase(deleteAudit.fulfilled, (state, action) => {
        state.audits = state.audits.filter(audit => audit.audit_id !== action.payload);
        if (state.currentAudit && state.currentAudit.audit_id === action.payload) {
          state.currentAudit = null;
        }
      });
  }
});

export const {
  setFilters,
  clearFilters,
  setCurrentAudit,
  clearCurrentAudit,
  setWizardStep,
  updateWizardData,
  resetWizard,
  clearError
} = auditSlice.actions;

export default auditSlice.reducer;