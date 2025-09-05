import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Filter, Plus, Eye, ArrowRight, ChevronRight, Bot } from 'lucide-react';
import { fetchAudits, setFilters, clearFilters } from '../redux/auditSlice';
import AIAssistant from './AiAssistant';
import LoadingSpinner from './LoadingSpinner';

const AuditList = ({ onViewAudit, onCreateAudit }) => {
  const dispatch = useDispatch();
  const { audits, loading, error, filters } = useSelector(state => state.audits);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    dispatch(fetchAudits(filters));
  }, [dispatch, filters]);

  const handleFilterChange = (filterName, value) => {
    dispatch(setFilters({ [filterName]: value }));
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      'Planned': 'status-badge planned',
      'In Progress': 'status-badge in_progress', 
      'Closed': 'status-badge closed',
      'Cancelled': 'status-badge cancelled'
    };
    return statusClasses[status] || 'status-badge gray';
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="main-layout">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 flex items-center justify-between flex-shrink-0 h-14">
        <div className="flex items-center">
          <h1 className="text-lg font-semibold text-slate-800">QMS Audit Management</h1>
        </div>
      </header>

      {/* Sub Navigation */}
      <div className="sub-navigation-container">
        <nav className="sub-nav">
          <a href="#" className="sub-nav-item active">
            <i className="lucide-icon" data-lucide="clipboard-check"></i>
            Audit Management
          </a>
          <a href="#" className="sub-nav-item">
            <i className="lucide-icon" data-lucide="truck"></i>
            Suppliers
          </a>
        </nav>
      </div>

      <div className="content-area-wrapper">
        <main className="content-view flex-grow overflow-y-auto p-6">
          {/* View Header */}
          <div className="view-header">
            <h1 className="view-title">Audit Management</h1>
            <div className="view-actions">
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className="action-button secondary"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </button>
              <button 
                onClick={onCreateAudit}
                className="action-button primary"
              >
                <Plus className="w-4 h-4 mr-2" />
                Schedule New Audit
              </button>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="filter-panel" style={{ display: 'block' }}>
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-semibold">Filter Audits</h4>
                <button 
                  onClick={handleClearFilters}
                  className="text-sm text-indigo-600 hover:text-indigo-800"
                >
                  Clear All
                </button>
              </div>
              <div className="filter-grid">
                <div>
                  <label className="block text-sm font-medium mb-1">Audit ID</label>
                  <input
                    type="text"
                    value={filters.audit_id || ''}
                    onChange={(e) => handleFilterChange('audit_id', e.target.value)}
                    placeholder="Enter audit ID..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select
                    value={filters.audit_type || 'All'}
                    onChange={(e) => handleFilterChange('audit_type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="All">All</option>
                    <option value="Internal">Internal</option>
                    <option value="Supplier/Vendor">Supplier/Vendor</option>
                    <option value="Regulatory">Regulatory</option>
                    <option value="CRO">CRO</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select
                    value={filters.status || 'All'}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="All">All</option>
                    <option value="Planned">Planned</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Closed">Closed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Lead Auditor</label>
                  <select
                    value={filters.lead_auditor || 'All'}
                    onChange={(e) => handleFilterChange('lead_auditor', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="All">All</option>
                    <option value="QA Manager">QA Manager</option>
                    <option value="Supplier Quality">Supplier Quality</option>
                    <option value="QA Specialist">QA Specialist</option>
                    <option value="Head of Quality">Head of Quality</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Site / Region</label>
                  <select
                    value={filters.site || 'All'}
                    onChange={(e) => handleFilterChange('site', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="All">All</option>
                    <option value="USA">USA</option>
                    <option value="India">India</option>
                    <option value="Germany">Germany</option>
                    <option value="China">China</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              Error: {error}
            </div>
          )}

          {/* AI Filter Indicator */}
          {filters.ai_filtered && (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded mb-4 flex items-center justify-between">
              <div className="flex items-center">
                <Bot className="w-4 h-4 mr-2" />
                <span className="text-sm font-medium">Results filtered by AI Assistant</span>
              </div>
              <button
                onClick={() => handleFilterChange('ai_filtered', false)}
                className="text-blue-600 hover:text-blue-800 text-sm underline"
              >
                Clear AI Filter
              </button>
            </div>
          )}

          {/* Audits Table */}
          <div className="content-card">
            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Audit ID</th>
                    <th className="wrap-text">Title</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Auditee</th>
                    <th>Lead Auditor</th>
                    <th>End Date</th>
                    <th>Site</th>
                    <th className="action-cell">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {audits.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="text-center py-8 text-gray-500">
                        {filters.ai_filtered 
                          ? "No audits match the AI filter criteria. Try a different AI query."
                          : "No audits found. Click \"Schedule New Audit\" to create one."
                        }
                      </td>
                    </tr>
                  ) : (
                    audits.map((audit) => (
                      <tr key={audit.id} className="hover:bg-gray-50">
                        <td 
                          className="linkable font-medium cursor-pointer text-indigo-600 hover:text-indigo-800"
                          onClick={() => onViewAudit(audit.audit_id)}
                        >
                          {audit.audit_id}
                        </td>
                        <td className="wrap-text max-w-xs">
                          {audit.audit_title}
                        </td>
                        <td>{audit.audit_type}</td>
                        <td>
                          <span className={getStatusBadge(audit.status)}>
                            {audit.status}
                          </span>
                        </td>
                        <td className="linkable">{audit.auditee_name}</td>
                        <td className="linkable">{audit.lead_auditor}</td>
                        <td>{new Date(audit.confirmed_end_date).toLocaleDateString()}</td>
                        <td>{audit.auditee_country}</td>
                        <td className="action-cell">
                          <button 
                            onClick={() => onViewAudit(audit.audit_id)}
                            className="text-gray-600 hover:text-indigo-600 p-1"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Audit Count */}
          <div className="mt-4 text-sm text-gray-600">
            Showing {audits.length} audit{audits.length !== 1 ? 's' : ''}
            {filters.ai_filtered && ' (AI filtered)'}
          </div>
        </main>

        {/* AI Assistant Panel */}
        <AIAssistant audits={audits} />
      </div>
    </div>
  );
};

export default AuditList;