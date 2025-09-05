import React, { useState } from 'react';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import AuditList from './components/AuditList';
import AuditWizard from './components/AuditWizard';
import AuditDetail from './components/AuditDetail';
import NotificationContainer from './components/Notification';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('list'); // 'list', 'create', 'detail'
  const [selectedAuditId, setSelectedAuditId] = useState(null);

  const handleViewAudit = (auditId) => {
    setSelectedAuditId(auditId);
    setCurrentView('detail');
  };

  const handleCreateAudit = () => {
    setCurrentView('create');
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedAuditId(null);
  };

  const handleAuditCreated = (auditId) => {
    setSelectedAuditId(auditId);
    setCurrentView('detail');
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'create':
        return (
          <AuditWizard 
            onBack={handleBackToList}
            onComplete={handleAuditCreated}
          />
        );
      case 'detail':
        return (
          <AuditDetail 
            auditId={selectedAuditId}
            onBack={handleBackToList}
          />
        );
      default:
        return (
          <AuditList 
            onViewAudit={handleViewAudit}
            onCreateAudit={handleCreateAudit}
          />
        );
    }
  };

  return (
    <Provider store={store}>
      <div className="App">
        {renderCurrentView()}
        <NotificationContainer />
      </div>
    </Provider>
  );
}

export default App;