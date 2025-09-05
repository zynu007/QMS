import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  ArrowLeft,
  FileWarning,
  UserCog,
  CheckCircle,
  MoreHorizontal,
  GitFork,
  ShieldAlert,
  Thermometer,
  UserCheck,
  Calendar,
  Flag,
  Info,
  SearchCheck,
  Link,
  Sparkles,
  FileText,
  ClipboardList,
  Zap,
  Package,
  Box,
  Hash,
  Server,
  Archive,
  Users,
  CalendarDays,
  Award,
  Users2,
  ShieldCheck,
  BookMarked,
  ListChecks,
  CheckCircle2,
  Building2,
  Factory,
  MapPin,
  Globe,
  User,
  Mail
} from 'lucide-react';
import { fetchAuditById } from '../redux/auditSlice';
import LoadingSpinner from './LoadingSpinner';

const AuditDetail = ({ auditId, onBack }) => {
  const dispatch = useDispatch();
  const { currentAudit, loading, error } = useSelector(state => state.audits);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    if (auditId) {
      dispatch(fetchAuditById(auditId));
    }
  }, [dispatch, auditId]);

  if (loading) return <LoadingSpinner fullScreen text="Loading audit details..." />;

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-red-600 mb-4">Error: {error}</div>
          <button onClick={onBack} className="btn btn-secondary">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to List
          </button>
        </div>
      </div>
    );
  }

  if (!currentAudit) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-gray-600 mb-4">Audit not found</div>
          <button onClick={onBack} className="btn btn-secondary">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to List
          </button>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    const statusClasses = {
      'Planned': 'status-badge blue',
      'In Progress': 'status-badge yellow',
      'Closed': 'status-badge green',
      'Cancelled': 'status-badge gray'
    };
    return statusClasses[status] || 'status-badge gray';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  const renderDetailsTab = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 space-y-4">
        {/* Audit Description */}
        <div className="detail-section">
          <div className="detail-section-header">
            <h3><FileText className="w-3.5 h-3.5 mr-1.5" />Audit Description</h3>
          </div>
          <div className="text-sm text-slate-700">
            <p><strong>Scope:</strong> {currentAudit.audit_scope}</p>
            <p className="mt-2"><strong>Objective:</strong> {currentAudit.audit_objective}</p>
          </div>
        </div>

        {/* Audit Identification */}
        <div className="detail-section">
          <div className="detail-section-header">
            <h3><ClipboardList className="w-3.5 h-3.5 mr-1.5" />Audit Information</h3>
          </div>
          <dl className="detail-grid">
            <div className="detail-field">
              <dt><CalendarDays className="w-3 h-3 mr-1" />Start Date</dt>
              <dd>{formatDate(currentAudit.confirmed_start_date)}</dd>
            </div>
            <div className="detail-field">
              <dt><CalendarDays className="w-3 h-3 mr-1" />End Date</dt>
              <dd>{formatDate(currentAudit.confirmed_end_date)}</dd>
            </div>
            <div className="detail-field">
              <dt><Award className="w-3 h-3 mr-1" />Lead Auditor</dt>
              <dd>{currentAudit.lead_auditor}</dd>
            </div>
            <div className="detail-field">
              <dt><Users2 className="w-3 h-3 mr-1" />Audit Team</dt>
              <dd>{currentAudit.audit_team || 'Not specified'}</dd>
            </div>
          </dl>
        </div>

        {/* Audit Criteria */}
        <div className="detail-section">
          <div className="detail-section-header">
            <h3><ShieldCheck className="w-3.5 h-3.5 mr-1.5" />Audit Criteria & Standards</h3>
          </div>
          <div className="text-sm text-slate-700">
            <p>{currentAudit.audit_criteria}</p>
            {currentAudit.audit_agenda && (
              <div className="mt-3">
                <p><strong>Audit Agenda:</strong></p>
                <pre className="whitespace-pre-wrap mt-1 text-xs">{currentAudit.audit_agenda}</pre>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="lg:col-span-1 space-y-4">
        {/* Auditee Information */}
        <div className="detail-section">
          <div className="detail-section-header">
            <h3><Building2 className="w-3.5 h-3.5 mr-1.5" />Auditee Information</h3>
          </div>
          <dl className="detail-grid grid-cols-1">
            <div className="detail-field">
              <dt><Factory className="w-3 h-3 mr-1" />Auditee Name</dt>
              <dd>{currentAudit.auditee_name}</dd>
            </div>
            <div className="detail-field">
              <dt><MapPin className="w-3 h-3 mr-1" />Location</dt>
              <dd>{currentAudit.auditee_site_location}</dd>
            </div>
            <div className="detail-field">
              <dt><Globe className="w-3 h-3 mr-1" />Country</dt>
              <dd>{currentAudit.auditee_country}</dd>
            </div>
            <div className="detail-field">
              <dt><User className="w-3 h-3 mr-1" />Primary Contact</dt>
              <dd>{currentAudit.primary_contact_name}</dd>
            </div>
            {currentAudit.primary_contact_email && (
              <div className="detail-field">
                <dt><Mail className="w-3 h-3 mr-1" />Contact Email</dt>
                <dd>{currentAudit.primary_contact_email}</dd>
              </div>
            )}
          </dl>
        </div>

        {/* Proposed Dates */}
        {(currentAudit.proposed_start_date || currentAudit.proposed_end_date) && (
          <div className="detail-section">
            <div className="detail-section-header">
              <h3><Calendar className="w-3.5 h-3.5 mr-1.5" />Proposed Dates</h3>
            </div>
            <dl className="detail-grid grid-cols-1">
              {currentAudit.proposed_start_date && (
                <div className="detail-field">
                  <dt>Proposed Start</dt>
                  <dd>{formatDate(currentAudit.proposed_start_date)}</dd>
                </div>
              )}
              {currentAudit.proposed_end_date && (
                <div className="detail-field">
                  <dt>Proposed End</dt>
                  <dd>{formatDate(currentAudit.proposed_end_date)}</dd>
                </div>
              )}
            </dl>
          </div>
        )}
      </div>
    </div>
  );

  const renderPlaceholderTab = (title, description) => (
    <div className="detail-section">
      <h3 className="detail-section-header">
        <Info className="w-3.5 h-3.5 mr-1.5" />
        {title}
      </h3>
      <p className="text-center text-slate-400 italic py-4 text-xs">{description}</p>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'details':
        return renderDetailsTab();
      case 'investigation':
        return renderPlaceholderTab('Investigation & CAPA', 'Investigation planning, root cause analysis, and CAPA management features would be implemented here.');
      case 'related':
        return renderPlaceholderTab('Related Records', 'Links to related equipment, documents, batches, and other audit records would be displayed here.');
      case 'ai-insights':
        return renderPlaceholderTab('AI Insights', 'AI-powered analysis, suggestions, and insights about this audit would be shown here.');
      default:
        return renderDetailsTab();
    }
  };

  return (
    <div className="main-layout">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 h-14 flex-shrink-0"></header>

      <div className="content-area-wrapper">
        <main className="content-area">
          {/* Header Card */}
          <div className="header-card">
            <div className="top-row">
              <div className="flex items-center">
                <button 
                  onClick={onBack}
                  className="mr-3 p-2 hover:bg-gray-100 rounded-full"
                  title="Back to Audit List"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="flex items-center">
                  <FileWarning className="text-indigo-600 mr-2" />
                  <span>{currentAudit.audit_id}: {currentAudit.audit_title}</span>
                </h1>
              </div>
              <div className="detail-actions">
                <button className="btn btn-primary">
                  <UserCog className="w-4 h-4 mr-1" />
                  Assign
                </button>
                <button className="btn btn-secondary">
                  <MapPin className="w-4 h-4 mr-1" />
                  Initiate CAPA
                </button>
                <button className="btn btn-success">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Close Audit
                </button>
                <button className="btn btn-secondary icon-only">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="header-meta">
              <span className="meta-item">
                <GitFork className="w-3 h-3 mr-1" />
                <strong>Type:</strong>&nbsp;{currentAudit.audit_type}
              </span>
              <span className="meta-item">
                <Flag className="w-3 h-3 mr-1" />
                <strong>Status:</strong>&nbsp;
                <span className={getStatusBadge(currentAudit.status)}>{currentAudit.status}</span>
              </span>
              <span className="meta-item">
                <Award className="w-3 h-3 mr-1" />
                <strong>Lead Auditor:</strong>&nbsp;{currentAudit.lead_auditor}
              </span>
              <span className="meta-item">
                <Calendar className="w-3 h-3 mr-1" />
                <strong>Created:</strong>&nbsp;{formatDate(currentAudit.created_at)}
              </span>
              <span className="meta-item">
                <Building2 className="w-3 h-3 mr-1" />
                <strong>Auditee:</strong>&nbsp;{currentAudit.auditee_name}
              </span>
            </div>
          </div>

          {/* Tabs */}
          <div className="px-0 border-b border-slate-200 flex-shrink-0">
            <nav className="detail-tabs -mb-px flex space-x-3">
              <button 
                className={`detail-tab-button ${activeTab === 'details' ? 'active' : ''}`}
                onClick={() => setActiveTab('details')}
              >
                <Info className="w-3.5 h-3.5 mr-1" />
                Details
              </button>
              <button 
                className={`detail-tab-button ${activeTab === 'investigation' ? 'active' : ''}`}
                onClick={() => setActiveTab('investigation')}
              >
                <SearchCheck className="w-3.5 h-3.5 mr-1" />
                Investigation & CAPA
              </button>
              <button 
                className={`detail-tab-button ${activeTab === 'related' ? 'active' : ''}`}
                onClick={() => setActiveTab('related')}
              >
                <Link className="w-3.5 h-3.5 mr-1" />
                Related Records
              </button>
              <button 
                className={`detail-tab-button ${activeTab === 'ai-insights' ? 'active' : ''}`}
                onClick={() => setActiveTab('ai-insights')}
              >
                <Sparkles className="w-3.5 h-3.5 mr-1" />
                AI Insights
              </button>
            </nav>
          </div>

          <div className="detail-tab-content-wrapper">
            <div className="detail-tab-content active">
              {renderTabContent()}
            </div>
          </div>
        </main>

        {/* AI Assistant Panel */}
        <aside className="ai-assistant-panel">
          <div className="ai-assistant-header">
            <h3><Sparkles className="w-5 h-5 mr-2" />AI Assistant</h3>
          </div>
          <div className="ai-assistant-chat-area">
            <div className="ai-bubble suggestion">
              <p>Viewing Audit <strong>{currentAudit.audit_id}</strong>. Ask me to 'summarize this audit', 'find similar audits', or 'suggest next steps'.</p>
            </div>
          </div>
          <div className="ai-assistant-input-area">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Ask about this audit..." 
                className="w-full text-xs border rounded-full py-1.5 px-3 pr-8"
              />
              <button 
                title="Send" 
                className="absolute inset-y-0 right-0 flex items-center pr-2 text-indigo-600"
              >
                <i className="w-4 h-4" data-lucide="send"></i>
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default AuditDetail;