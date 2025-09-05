import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  ArrowLeft, 
  ArrowRight, 
  Save, 
  Check,
  FileCheck2,
  Edit3,
  Tags,
  Target,
  Search,
  Flag,
  Building2,
  Factory,
  MapPin,
  Globe,
  Users,
  User,
  Mail,
  CalendarDays,
  Calendar,
  CalendarCheck,
  UserCheck,
  Award,
  Users2,
  ShieldCheck,
  BookMarked,
  ListChecks,
  FileText,
  CheckCircle2,
  ClipboardCheck
} from 'lucide-react';
import { 
  updateWizardData, 
  setWizardStep, 
  resetWizard, 
  createAudit 
} from '../redux/auditSlice';
import { addNotification } from '../redux/notificationSlice';
import LoadingSpinner from './LoadingSpinner';

const AuditWizard = ({ onBack, onComplete }) => {
  const dispatch = useDispatch();
  const { wizardData, loading, error } = useSelector(state => state.audits);
  const [validationErrors, setValidationErrors] = useState({});
  const [currentStep, setCurrentStepState] = useState(wizardData.step);

  const totalSteps = 5;

  useEffect(() => {
    setCurrentStepState(wizardData.step);
  }, [wizardData.step]);

  // Add the CSS styles from the original HTML
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      :root {
        --font-size-base: 0.75rem;
        --font-size-xs: 0.85rem;
        --font-size-sm: 0.75rem;
      }
      
      .wizard-step-content { display: none; animation: fadeIn 0.3s ease-out; }
      .wizard-step-content.active { display: block; }
      @keyframes fadeIn { from { opacity: 0; transform: translateY(3px); } to { opacity: 1; transform: translateY(0); } }

      .step-indicator { align-items: flex-start; }
      .step-indicator .step-circle {
        width: 1.125rem; height: 1.125rem; border-radius: 9999px; display: flex; flex-shrink: 0;
        align-items: center; justify-content: center; border-width: 1px; font-weight: 600;
        font-size: var(--font-size-xs); border-color: #cbd5e1; color: #64748b; background-color: white; transition: all 0.2s ease;
        margin-top: 0.125rem;
      }
      .step-indicator.completed .step-circle { border-color: #10b981; background-color: #10b981; color: white; }
      .step-indicator.completed .step-circle .lucide { width: 0.625rem; height: 0.625rem; stroke-width: 3; }
      .step-indicator.active .step-circle { border-color: #4f46e5; background-color: #4f46e5; color: white; }
      .step-label-container { margin-left: 0.375rem; display: none; flex-direction: column; line-height: 1.2; }
      @media (min-width: 768px) { .step-label-container { display: flex; } }
      .step-label-title { font-size: var(--font-size-xs); font-weight: 500; color: #64748b; }
      .step-label-desc { font-size: 0.6875rem; color: #94a3b8; }
      .step-indicator.active .step-label-title { color: #3730a3; font-weight: 600; }
      .step-indicator.active .step-label-desc { color: #4f46e5; }
      .step-indicator.completed .step-label-title { color: #047857; }
      .step-indicator.completed .step-label-desc { color: #065f46; }
      .step-separator { color: #cbd5e1; margin: 0 0.25rem; font-size: var(--font-size-xs); align-self: center; }

      .wizard-form-section { margin-bottom: 1rem; padding: 0.75rem; background-color: white; border-radius: 0.375rem; border: 1px solid #e2e8f0; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
      .wizard-form-section h3 { font-size: var(--font-size-sm); font-weight: 600; color: #1e293b; margin-bottom: 0.75rem; padding-bottom: 0.375rem; border-bottom: 1px solid #f1f5f9; display: flex; align-items: center; }
      .wizard-form-section h3 .lucide { width: 0.875rem; height: 0.875rem; margin-right: 0.375rem; color: #64748b; }
      .wizard-input-group { margin-bottom: 0.75rem; }
      .wizard-input-group label { display: block; font-weight: 500; margin-bottom: 0.125rem; font-size: var(--font-size-xs); display: flex; align-items: center;}
      .wizard-input-group label .lucide { width: 0.75rem; height: 0.75rem; margin-right: 0.15rem; color: #94a3b8; }
      .wizard-input-group input[type="text"], .wizard-input-group input[type="email"], .wizard-input-group input[type="date"], .wizard-input-group select, .wizard-input-group textarea {
        width: 100%; padding: 0.25rem 0.5rem; border: 1px solid #cbd5e1; border-radius: 0.25rem;
        box-shadow: none; font-size: var(--font-size-sm); color: #334155; transition: border-color 0.2s ease;
      }
      .wizard-input-group input:focus, .wizard-input-group select:focus, .wizard-input-group textarea:focus {
        outline: 1px solid transparent; outline-offset: 1px; border-color: #4f46e5; box-shadow: 0 0 0 1px #c7d2fe;
      }
      .wizard-input-group textarea { min-height: 80px; }
      .wizard-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 0.75rem; }

      .btn {
        display: inline-flex; align-items: center; justify-content: center; padding: 0.25rem 0.5rem;
        border: 1px solid transparent; font-size: var(--font-size-xs); font-weight: 500; border-radius: 0.25rem;
        box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.05); transition: all 0.15s ease-in-out; cursor: pointer; line-height: 1.2;
      }
      .btn-primary { color: white; background-color: #4f46e5; border-color: #4f46e5; } .btn-primary:hover { background-color: #4338ca; }
      .btn-secondary { color: #334155; background-color: white; border-color: #cbd5e1; } .btn-secondary:hover { background-color: #f8fafc; }
      .btn-success { color: white; background-color: #16a34a; border-color: #16a34a; } .btn-success:hover { background-color: #15803d; }
      .btn .lucide { width: 0.75rem; height: 0.75rem; } .btn .lucide.ml-1 { margin-left: 0.15rem; } .btn .lucide.mr-1 { margin-right: 0.15rem; }
      .btn.disabled\\:opacity-50:disabled { opacity: 0.5; } .btn.disabled\\:cursor-not-allowed:disabled { cursor: not-allowed; }
      
      .border-error { border-color: #ef4444 !important; }
    `;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  const validateStep = (step) => {
    const errors = {};
    const data = wizardData.data;

    switch (step) {
      case 1:
        if (!data.audit_title?.trim()) errors.audit_title = 'Audit title is required';
        if (!data.audit_type) errors.audit_type = 'Audit type is required';
        if (!data.audit_scope?.trim()) errors.audit_scope = 'Audit scope is required';
        if (!data.audit_objective?.trim()) errors.audit_objective = 'Audit objective is required';
        break;

      case 2:
        if (!data.auditee_name?.trim()) errors.auditee_name = 'Auditee name is required';
        if (!data.auditee_site_location?.trim()) errors.auditee_site_location = 'Site location is required';
        if (!data.auditee_country) errors.auditee_country = 'Country is required';
        if (!data.primary_contact_name?.trim()) errors.primary_contact_name = 'Primary contact name is required';
        if (data.primary_contact_email && !isValidEmail(data.primary_contact_email)) {
          errors.primary_contact_email = 'Invalid email format';
        }
        break;

      case 3:
        if (!data.confirmed_start_date) errors.confirmed_start_date = 'Confirmed start date is required';
        if (!data.confirmed_end_date) errors.confirmed_end_date = 'Confirmed end date is required';
        if (!data.lead_auditor) errors.lead_auditor = 'Lead auditor is required';
        
        if (data.confirmed_start_date && data.confirmed_end_date) {
          if (new Date(data.confirmed_end_date) <= new Date(data.confirmed_start_date)) {
            errors.confirmed_end_date = 'End date must be after start date';
          }
        }
        if (data.proposed_start_date && data.proposed_end_date) {
          if (new Date(data.proposed_end_date) <= new Date(data.proposed_start_date)) {
            errors.proposed_end_date = 'Proposed end date must be after proposed start date';
          }
        }
        break;

      case 4:
        if (!data.audit_criteria?.trim()) errors.audit_criteria = 'Audit criteria is required';
        break;

      default:
        break;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleInputChange = (field, value) => {
    dispatch(updateWizardData({ [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep) && currentStep < totalSteps) {
      const nextStep = currentStep + 1;
      setCurrentStepState(nextStep);
      dispatch(setWizardStep(nextStep));
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      const prevStep = currentStep - 1;
      setCurrentStepState(prevStep);
      dispatch(setWizardStep(prevStep));
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    try {
      const auditData = {
        ...wizardData.data,
        proposed_start_date: wizardData.data.proposed_start_date || null,
        proposed_end_date: wizardData.data.proposed_end_date || null,
        confirmed_start_date: wizardData.data.confirmed_start_date,
        confirmed_end_date: wizardData.data.confirmed_end_date,
        primary_contact_email: wizardData.data.primary_contact_email?.trim() || null
      };

      const result = await dispatch(createAudit(auditData)).unwrap();
      
      dispatch(addNotification({
        type: 'success',
        title: 'Success!',
        message: 'New audit logged successfully!'
      }));

      dispatch(resetWizard());
      onComplete(result.audit_id);
    } catch (err) {
      dispatch(addNotification({
        type: 'error',
        title: 'Error',
        message: err || 'Failed to create audit'
      }));
    }
  };

  const getStepIndicatorClass = (stepNum) => {
    if (stepNum < currentStep) return 'step-indicator completed';
    if (stepNum === currentStep) return 'step-indicator active';
    return 'step-indicator';
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-3">
            <div className="wizard-form-section">
              <h3><FileCheck2 />Audit Definition</h3>
              <div className="wizard-grid">
                <div className="wizard-input-group">
                  <label><Edit3 />Audit Title *</label>
                  <input
                    type="text"
                    value={wizardData.data.audit_title || ''}
                    onChange={(e) => handleInputChange('audit_title', e.target.value)}
                    placeholder="e.g., Annual GMP Audit of Facility X"
                    className={validationErrors.audit_title ? 'border-error' : ''}
                  />
                  {validationErrors.audit_title && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.audit_title}</p>
                  )}
                </div>
                <div className="wizard-input-group">
                  <label><Tags />Audit Type *</label>
                  <select
                    value={wizardData.data.audit_type || ''}
                    onChange={(e) => handleInputChange('audit_type', e.target.value)}
                    className={validationErrors.audit_type ? 'border-error' : ''}
                  >
                    <option value="">Select Type...</option>
                    <option value="Internal">Internal (Self-Inspection)</option>
                    <option value="Supplier/Vendor">Supplier / Vendor</option>
                    <option value="Regulatory">Regulatory Agency</option>
                    <option value="CRO">CRO / Partner</option>
                    <option value="For-Cause">For-Cause</option>
                    <option value="Pre-Approval Inspection (PAI)">Pre-Approval Inspection (PAI)</option>
                    <option value="Surveillance">Surveillance</option>
                  </select>
                  {validationErrors.audit_type && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.audit_type}</p>
                  )}
                </div>
              </div>
            </div>
            <div className="wizard-form-section">
              <h3><Target />Scope & Objective</h3>
              <div className="wizard-input-group">
                <label><Search />Audit Scope *</label>
                <textarea
                  value={wizardData.data.audit_scope || ''}
                  onChange={(e) => handleInputChange('audit_scope', e.target.value)}
                  rows="3"
                  placeholder="Define the areas, processes, products, and time period to be audited. e.g., 'Manufacturing, packaging, and QC testing of Product Y from Jan 1, 2024 to Dec 31, 2024 at the Bengaluru site.'"
                  className={validationErrors.audit_scope ? 'border-error' : ''}
                />
                {validationErrors.audit_scope && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.audit_scope}</p>
                )}
              </div>
              <div className="wizard-input-group">
                <label><Flag />Audit Objective *</label>
                <textarea
                  value={wizardData.data.audit_objective || ''}
                  onChange={(e) => handleInputChange('audit_objective', e.target.value)}
                  rows="3"
                  placeholder="Describe the purpose of the audit. e.g., 'To verify compliance with cGMP as per 21 CFR 210/211 and internal SOPs. To assess the effectiveness of the QMS.'"
                  className={validationErrors.audit_objective ? 'border-error' : ''}
                />
                {validationErrors.audit_objective && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.audit_objective}</p>
                )}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-3">
            <div className="wizard-form-section">
              <h3><Building2 />Auditee Information</h3>
              <div className="wizard-grid">
                <div className="wizard-input-group">
                  <label><Factory />Auditee Name / Department *</label>
                  <input
                    type="text"
                    value={wizardData.data.auditee_name || ''}
                    onChange={(e) => handleInputChange('auditee_name', e.target.value)}
                    placeholder="e.g., Acme Pharmaceuticals Inc. or Internal QC Dept"
                    className={validationErrors.auditee_name ? 'border-error' : ''}
                  />
                  {validationErrors.auditee_name && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.auditee_name}</p>
                  )}
                </div>
                <div className="wizard-input-group">
                  <label><MapPin />Site Location / Address *</label>
                  <input
                    type="text"
                    value={wizardData.data.auditee_site_location || ''}
                    onChange={(e) => handleInputChange('auditee_site_location', e.target.value)}
                    placeholder="Full address of the facility being audited"
                    className={validationErrors.auditee_site_location ? 'border-error' : ''}
                  />
                  {validationErrors.auditee_site_location && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.auditee_site_location}</p>
                  )}
                </div>
                <div className="wizard-input-group">
                  <label><Globe />Country *</label>
                  <select
                    value={wizardData.data.auditee_country || ''}
                    onChange={(e) => handleInputChange('auditee_country', e.target.value)}
                    className={validationErrors.auditee_country ? 'border-error' : ''}
                  >
                    <option value="">Select Country...</option>
                    <option value="USA">United States</option>
                    <option value="India">India</option>
                    <option value="Germany">Germany</option>
                    <option value="China">China</option>
                    <option value="UK">United Kingdom</option>
                    <option value="Switzerland">Switzerland</option>
                  </select>
                  {validationErrors.auditee_country && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.auditee_country}</p>
                  )}
                </div>
              </div>
            </div>
            <div className="wizard-form-section">
              <h3><Users />Key Auditee Contacts</h3>
              <div className="wizard-grid">
                <div className="wizard-input-group">
                  <label><User />Primary Site Contact *</label>
                  <input
                    type="text"
                    value={wizardData.data.primary_contact_name || ''}
                    onChange={(e) => handleInputChange('primary_contact_name', e.target.value)}
                    placeholder="Name of the main contact for the audit"
                    className={validationErrors.primary_contact_name ? 'border-error' : ''}
                  />
                  {validationErrors.primary_contact_name && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.primary_contact_name}</p>
                  )}
                </div>
                <div className="wizard-input-group">
                  <label><Mail />Contact Email</label>
                  <input
                    type="email"
                    value={wizardData.data.primary_contact_email || ''}
                    onChange={(e) => handleInputChange('primary_contact_email', e.target.value)}
                    placeholder="email@example.com"
                    className={validationErrors.primary_contact_email ? 'border-error' : ''}
                  />
                  {validationErrors.primary_contact_email && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.primary_contact_email}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-3">
            <div className="wizard-form-section">
              <h3><CalendarDays />Audit Schedule</h3>
              <div className="wizard-grid">
                <div className="wizard-input-group">
                  <label><Calendar />Proposed Start Date</label>
                  <input
                    type="date"
                    value={wizardData.data.proposed_start_date || ''}
                    onChange={(e) => handleInputChange('proposed_start_date', e.target.value)}
                    className={validationErrors.proposed_start_date ? 'border-error' : ''}
                  />
                  {validationErrors.proposed_start_date && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.proposed_start_date}</p>
                  )}
                </div>
                <div className="wizard-input-group">
                  <label><Calendar />Proposed End Date</label>
                  <input
                    type="date"
                    value={wizardData.data.proposed_end_date || ''}
                    onChange={(e) => handleInputChange('proposed_end_date', e.target.value)}
                    className={validationErrors.proposed_end_date ? 'border-error' : ''}
                  />
                  {validationErrors.proposed_end_date && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.proposed_end_date}</p>
                  )}
                </div>
                <div className="wizard-input-group">
                  <label><CalendarCheck />Confirmed Start Date *</label>
                  <input
                    type="date"
                    value={wizardData.data.confirmed_start_date || ''}
                    onChange={(e) => handleInputChange('confirmed_start_date', e.target.value)}
                    className={validationErrors.confirmed_start_date ? 'border-error' : ''}
                  />
                  {validationErrors.confirmed_start_date && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.confirmed_start_date}</p>
                  )}
                </div>
                <div className="wizard-input-group">
                  <label><CalendarCheck />Confirmed End Date *</label>
                  <input
                    type="date"
                    value={wizardData.data.confirmed_end_date || ''}
                    onChange={(e) => handleInputChange('confirmed_end_date', e.target.value)}
                    className={validationErrors.confirmed_end_date ? 'border-error' : ''}
                  />
                  {validationErrors.confirmed_end_date && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.confirmed_end_date}</p>
                  )}
                </div>
              </div>
            </div>
            <div className="wizard-form-section">
              <h3><UserCheck />Audit Team</h3>
              <div className="wizard-grid">
                <div className="wizard-input-group">
                  <label><Award />Lead Auditor *</label>
                  <select
                    value={wizardData.data.lead_auditor || ''}
                    onChange={(e) => handleInputChange('lead_auditor', e.target.value)}
                    className={validationErrors.lead_auditor ? 'border-error' : ''}
                  >
                    <option value="">Select Lead Auditor...</option>
                    <option value="Sakthivel G">Sakthivel G</option>
                    <option value="Jane Smith">Jane Smith</option>
                    <option value="John Doe">John Doe</option>
                    <option value="QA Manager">QA Manager</option>
                    <option value="Supplier Quality">Supplier Quality</option>
                    <option value="QA Specialist">QA Specialist</option>
                    <option value="Head of Quality">Head of Quality</option>
                  </select>
                  {validationErrors.lead_auditor && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.lead_auditor}</p>
                  )}
                </div>
                <div className="wizard-input-group">
                  <label><Users2 />Other Auditors / SMEs</label>
                  <input
                    type="text"
                    value={wizardData.data.audit_team || ''}
                    onChange={(e) => handleInputChange('audit_team', e.target.value)}
                    placeholder="Comma-separated names"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-3">
            <div className="wizard-form-section">
              <h3><ShieldCheck />Audit Criteria & Standards</h3>
              <div className="wizard-input-group">
                <label><BookMarked />Applicable Regulations / Standards *</label>
                <textarea
                  value={wizardData.data.audit_criteria || ''}
                  onChange={(e) => handleInputChange('audit_criteria', e.target.value)}
                  rows="3"
                  placeholder="List all standards, regulations, guidelines, and internal procedures the audit will be conducted against. e.g., FDA 21 CFR Part 211, ISO 13485:2016, ICH Q7, Company SOP-QA-001."
                  className={validationErrors.audit_criteria ? 'border-error' : ''}
                />
                {validationErrors.audit_criteria && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.audit_criteria}</p>
                )}
              </div>
            </div>
            <div className="wizard-form-section">
              <h3><ListChecks />Audit Agenda</h3>
              <div className="wizard-input-group">
                <label><FileText />Audit Plan / Agenda</label>
                <textarea
                  value={wizardData.data.audit_agenda || ''}
                  onChange={(e) => handleInputChange('audit_agenda', e.target.value)}
                  rows="6"
                  placeholder="Provide a detailed day-by-day plan.&#10;Day 1: Opening Meeting, Facility Tour, Documentation Review (QMS)...&#10;Day 2: Production Area Review, Warehouse Operations...&#10;Day 3: QC Lab, Closing Meeting..."
                />
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="wizard-form-section">
            <h3><CheckCircle2 />Review Audit Details</h3>
            <p className="text-xs text-slate-500 mb-4">Please review all entered information for accuracy before logging the new audit record.</p>
            <div className="space-y-3 text-xs">
              <dl className="wizard-grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                {Object.entries({
                  'Audit Title': wizardData.data.audit_title,
                  'Audit Type': wizardData.data.audit_type,
                  'Scope': wizardData.data.audit_scope,
                  'Objective': wizardData.data.audit_objective,
                  'Auditee': wizardData.data.auditee_name,
                  'Location': wizardData.data.auditee_site_location,
                  'Country': wizardData.data.auditee_country,
                  'Primary Contact': wizardData.data.primary_contact_name,
                  'Contact Email': wizardData.data.primary_contact_email || 'Not provided',
                  'Start Date': wizardData.data.confirmed_start_date,
                  'End Date': wizardData.data.confirmed_end_date,
                  'Lead Auditor': wizardData.data.lead_auditor,
                  'Team Members': wizardData.data.audit_team || 'Not provided',
                  'Criteria': wizardData.data.audit_criteria,
                  'Agenda': wizardData.data.audit_agenda || 'Not provided'
                }).map(([label, value]) => (
                  <div key={label} className="p-1 rounded bg-slate-50">
                    <dt className="font-semibold text-slate-600">{label}</dt>
                    <dd className="text-slate-800 whitespace-pre-wrap">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) return <LoadingSpinner fullScreen text="Creating audit..." />;

  return (
    <div className="audit-wizard-container flex h-screen overflow-hidden">
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-1.5 px-2 border-b border-slate-200 bg-white flex justify-between items-center flex-shrink-0">
          <div>
            <h1 className="text-sm font-semibold text-indigo-700 flex items-center">
              <ClipboardCheck className="w-3.5 h-3.5 mr-1.5 text-indigo-600" />
              New Audit Record
            </h1>
            <span className="text-xs text-slate-500 ml-6">ID: (Generated upon save)</span>
          </div>
        </div>

        {/* Step Indicators */}
        <nav className="px-3 py-1.5 border-b border-slate-200 bg-white overflow-x-auto whitespace-nowrap flex-shrink-0">
          <ol className="flex items-center space-x-1 sm:space-x-2">
            {[
              { step: 1, title: 'Initialization', desc: 'Type, Scope & Objective' },
              { step: 2, title: 'Auditee Details', desc: 'Entity & Location' },
              { step: 3, title: 'Scheduling & Team', desc: 'Dates & Personnel' },
              { step: 4, title: 'Audit Plan', desc: 'Criteria & Agenda' },
              { step: 5, title: 'Review & Log', desc: 'Confirm Details' }
            ].map((item, index) => (
              <React.Fragment key={item.step}>
                <li className={getStepIndicatorClass(item.step)} style={{ display: 'flex', alignItems: 'flex-start' }}>
                  <span className="step-circle">
                    {item.step < currentStep ? (
                      <Check className="lucide" />
                    ) : (
                      item.step
                    )}
                  </span>
                  <div className="step-label-container">
                    <span className="step-label-title">{item.title}</span>
                    <span className="step-label-desc">{item.desc}</span>
                  </div>
                </li>
                {index < 4 && <li className="step-separator">→</li>}
              </React.Fragment>
            ))}
          </ol>
        </nav>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-2 md:p-3">
          <div className="wizard-step-content active">
            {renderStepContent()}
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="px-2 py-1.5 border-t border-slate-200 bg-slate-50 flex justify-between items-center flex-shrink-0">
          <button 
            type="button"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="mr-1" />
            Previous
          </button>
          
          {currentStep < totalSteps ? (
            <button 
              type="button"
              onClick={handleNext}
              className="btn btn-primary"
            >
              Next
              <ArrowRight className="ml-1" />
            </button>
          ) : (
            <button 
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="btn btn-success"
            >
              <Save className="mr-1" />
              Log New Audit
            </button>
          )}
        </div>
      </main>
    </div>
  );
};

export default AuditWizard;