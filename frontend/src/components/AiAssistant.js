import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Brain, 
  AlertTriangle, 
  FileText, 
  Lightbulb, 
  TrendingUp, 
  Bell,
  Loader2,
  X,
  ChevronDown,
  ChevronUp,
  Info,
  CheckCircle
} from 'lucide-react';
import { useDispatch } from 'react-redux';
import { fetchAudits, setFilters } from '../redux/auditSlice';

const AIAssistant = ({ audits }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [availableTools, setAvailableTools] = useState([]);
  const [selectedTool, setSelectedTool] = useState(null);
  const messagesEndRef = useRef(null);
  const dispatch = useDispatch();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    // Load available AI tools
    fetchAITools();
    
    // Add initial welcome message
    setMessages([{
      id: 'welcome',
      type: 'system',
      content: 'Hi! I\'m your QMS AI Assistant. I can help you analyze audits, identify risks, generate reports, and provide recommendations. Try asking me to "show high-risk events" or "summarize open audits".',
      timestamp: new Date().toISOString()
    }]);
  }, []);

  const fetchAITools = async () => {
    try {
      const response = await fetch('http://localhost:8000/ai/tools');
      const data = await response.json();
      if (data.success) {
        setAvailableTools(data.tools);
      }
    } catch (error) {
      console.error('Failed to fetch AI tools:', error);
    }
  };

  const getToolIcon = (iconName) => {
    const icons = {
      'alert-triangle': AlertTriangle,
      'file-text': FileText,
      'lightbulb': Lightbulb,
      'trending-up': TrendingUp,
      'bell': Bell
    };
    return icons[iconName] || Brain;
  };

  const executeAIQuery = async (tool, userQuery, context = null) => {
    setLoading(true);
    
    // Add user message
    const userMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: userQuery,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await fetch('http://localhost:8000/ai/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: userQuery,
          tool: tool,
          context: context
        })
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Add AI response
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: data.result || data,
        tool: tool,
        success: data.success,
        timestamp: new Date().toISOString(),
        error: data.error
      };
      
      setMessages(prev => [...prev, aiMessage]);

      // If the tool returns filtered audits, update the main audit list
      if (data.success && data.result && data.result.filtered_audits && data.result.filtered_audits.length > 0) {
        dispatch(fetchAudits(data.result.filtered_audits));
        dispatch(setFilters({ ai_filtered: true }));
      }

    } catch (error) {
      console.error('AI Query Error:', error);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        type: 'error',
        content: `Failed to process request: ${error.message}`,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!query.trim()) return;

    const tool = selectedTool || 'summarize_open_events';
    await executeAIQuery(tool, query);
    setQuery('');
    setSelectedTool(null);
  };

  const handleToolClick = (tool) => {
    setSelectedTool(tool.id);
    const exampleQueries = {
      'show_high_risk_events': 'Show me all high-risk audits that need immediate attention',
      'summarize_open_events': 'Summarize all open audits from the last month',
      'suggest_next_steps': 'What are the next steps for audit AUD-2025-XXXXX?',
      'identify_trends': 'What trends do you see in our audit data?',
      'generate_notification': 'Generate a notification for audit completion'
    };
    setQuery(exampleQueries[tool.id] || `Use ${tool.name} tool`);
  };

  const renderAIMessage = (message) => {
    if (!message.content) {
      return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-2">
          <div className="flex items-center text-yellow-700 text-sm">
            <Info className="w-4 h-4 mr-2" />
            <span>No response content received</span>
          </div>
        </div>
      );
    }

    // Handle error responses
    if (message.success === false || message.error) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-2">
          <div className="flex items-center text-red-700 text-sm mb-2">
            <AlertTriangle className="w-4 h-4 mr-2" />
            <span className="font-semibold">AI Processing Error</span>
          </div>
          <p className="text-red-600 text-sm mb-2">{message.error || 'Unknown error occurred'}</p>
          
          {/* Show raw response for debugging if available */}
          {message.content?.ai_response && (
            <details className="mt-2">
              <summary className="cursor-pointer text-red-600 text-xs hover:text-red-800">
                Show raw AI response for debugging
              </summary>
              <pre className="mt-2 p-2 bg-red-100 rounded text-xs text-red-800 max-h-32 overflow-y-auto">
                {typeof message.content.ai_response === 'string' 
                  ? message.content.ai_response.substring(0, 500) + '...'
                  : JSON.stringify(message.content.ai_response, null, 2)
                }
              </pre>
            </details>
          )}
        </div>
      );
    }

    const { content } = message;

    return (
      <div className="space-y-3">
        {/* AI Analysis Section */}
        {content.ai_analysis && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h4 className="font-semibold text-blue-900 text-sm mb-2 flex items-center">
              <Brain className="w-4 h-4 mr-2" />
              AI Analysis
            </h4>
            
            {content.ai_analysis.executive_summary && (
              <p className="text-blue-800 text-sm mb-2">{content.ai_analysis.executive_summary}</p>
            )}
            
            {content.ai_analysis.summary && (
              <p className="text-blue-800 text-sm mb-2">{content.ai_analysis.summary}</p>
            )}
            
            {/* High Risk Audits Display */}
            {content.ai_analysis.high_risk_audits && content.ai_analysis.high_risk_audits.length > 0 && (
              <div className="mt-2">
                <p className="font-medium text-blue-900 text-sm mb-1">
                  High Risk Audits Found: {content.ai_analysis.total_high_risk || content.ai_analysis.high_risk_audits.length}
                </p>
                <div className="space-y-1">
                  {content.ai_analysis.high_risk_audits.slice(0, 3).map((audit, idx) => (
                    <div key={idx} className="text-xs text-blue-700 flex items-center p-2 bg-blue-100 rounded">
                      <span className="w-2 h-2 bg-red-400 rounded-full mr-2 flex-shrink-0"></span>
                      <div className="flex-1">
                        <span className="font-medium">{audit.audit_id}</span> - Risk Score: {audit.risk_score}/10
                        {audit.risk_factors && audit.risk_factors.length > 0 && (
                          <div className="text-xs text-blue-600 mt-1">
                            Factors: {audit.risk_factors.join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Summary breakdowns for different tools */}
            {content.ai_analysis.breakdown && (
              <div className="mt-2 space-y-2">
                {content.ai_analysis.breakdown.by_type && (
                  <div>
                    <p className="font-medium text-blue-900 text-xs">By Type:</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {Object.entries(content.ai_analysis.breakdown.by_type).map(([type, count]) => (
                        <span key={type} className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded">
                          {type}: {count}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {content.ai_analysis.breakdown.by_status && (
                  <div>
                    <p className="font-medium text-blue-900 text-xs">By Status:</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {Object.entries(content.ai_analysis.breakdown.by_status).map(([status, count]) => (
                        <span key={status} className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded">
                          {status}: {count}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Upcoming deadlines */}
            {content.ai_analysis.upcoming_deadlines && content.ai_analysis.upcoming_deadlines.length > 0 && (
              <div className="mt-2">
                <p className="font-medium text-blue-900 text-xs mb-1">Upcoming Deadlines:</p>
                <ul className="space-y-1">
                  {content.ai_analysis.upcoming_deadlines.slice(0, 3).map((deadline, idx) => (
                    <li key={idx} className="text-xs text-orange-700 flex items-center">
                      <AlertTriangle className="w-3 h-3 mr-1 text-orange-500" />
                      {deadline}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Key concerns */}
            {content.ai_analysis.key_concerns && content.ai_analysis.key_concerns.length > 0 && (
              <div className="mt-2">
                <p className="font-medium text-blue-900 text-xs mb-1">Key Concerns:</p>
                <ul className="space-y-1">
                  {content.ai_analysis.key_concerns.slice(0, 2).map((concern, idx) => (
                    <li key={idx} className="text-xs text-red-700 flex items-start">
                      <span className="text-red-500 mr-1 mt-0.5">•</span>
                      {concern}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* AI Recommendations Section */}
        {content.ai_recommendations && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <h4 className="font-semibold text-green-900 text-sm mb-2 flex items-center">
              <Lightbulb className="w-4 h-4 mr-2" />
              AI Recommendations
            </h4>
            
            {content.ai_recommendations.immediate_actions && (
              <div className="mb-2">
                <p className="font-medium text-green-900 text-xs mb-1">Immediate Actions:</p>
                <ul className="space-y-1">
                  {content.ai_recommendations.immediate_actions.slice(0, 2).map((action, idx) => (
                    <li key={idx} className="text-xs text-green-700 flex items-start">
                      <CheckCircle className="w-3 h-3 mr-1 mt-0.5 text-green-600" />
                      {action}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {content.ai_recommendations.medium_term_actions && (
              <div className="mb-2">
                <p className="font-medium text-green-900 text-xs mb-1">Medium Term:</p>
                <ul className="space-y-1">
                  {content.ai_recommendations.medium_term_actions.slice(0, 2).map((action, idx) => (
                    <li key={idx} className="text-xs text-green-700 flex items-start">
                      <span className="text-green-600 mr-1 mt-0.5">→</span>
                      {action}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {content.ai_recommendations.timeline_recommendations && (
              <div className="mt-2 p-2 bg-green-100 rounded">
                <p className="text-xs text-green-800">
                  <strong>Timeline:</strong> {content.ai_recommendations.timeline_recommendations}
                </p>
              </div>
            )}
          </div>
        )}

        {/* AI Generated Notifications */}
        {content.ai_generated && content.ai_generated.notifications && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
            <h4 className="font-semibold text-purple-900 text-sm mb-2 flex items-center">
              <Bell className="w-4 h-4 mr-2" />
              Generated Notifications
            </h4>
            
            {content.ai_generated.recommended_type && (
              <p className="text-xs text-purple-700 mb-2">
                Recommended: <strong>{content.ai_generated.recommended_type}</strong>
              </p>
            )}

            <div className="space-y-2">
              {Object.entries(content.ai_generated.notifications).slice(0, 2).map(([type, notification]) => (
                <div key={type} className="bg-purple-100 rounded p-2">
                  <p className="text-xs font-medium text-purple-900 capitalize mb-1">{type}:</p>
                  <p className="text-xs text-purple-800">{notification.subject}</p>
                  <details className="mt-1">
                    <summary className="text-xs text-purple-600 cursor-pointer hover:text-purple-800">
                      Show preview
                    </summary>
                    <div className="mt-1 p-1 bg-white rounded text-xs text-purple-700">
                      {notification.body ? notification.body.substring(0, 150) + '...' : 'No body content'}
                    </div>
                  </details>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Trend Analysis */}
        {content.ai_analysis && (content.ai_analysis.frequency_trends || content.ai_analysis.seasonal_patterns) && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <h4 className="font-semibold text-orange-900 text-sm mb-2 flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" />
              Trend Analysis
            </h4>
            
            {content.ai_analysis.frequency_trends && (
              <p className="text-xs text-orange-800 mb-2">{content.ai_analysis.frequency_trends}</p>
            )}
            
            {content.ai_analysis.seasonal_patterns && (
              <p className="text-xs text-orange-800 mb-2">{content.ai_analysis.seasonal_patterns}</p>
            )}
            
            {content.ai_analysis.completion_metrics && (
              <div className="flex gap-4 mt-2">
                {content.ai_analysis.completion_metrics.average_days && (
                  <span className="text-xs bg-orange-200 text-orange-800 px-2 py-1 rounded">
                    Avg: {content.ai_analysis.completion_metrics.average_days} days
                  </span>
                )}
                {content.ai_analysis.completion_metrics.completion_rate && (
                  <span className="text-xs bg-orange-200 text-orange-800 px-2 py-1 rounded">
                    Rate: {content.ai_analysis.completion_metrics.completion_rate}%
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Filtered Audits Success Message */}
        {content.filtered_audits && content.filtered_audits.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-green-700 text-sm font-semibold flex items-center">
                <CheckCircle className="w-4 h-4 mr-2" />
                {content.filtered_audits.length} audit(s) filtered and displayed in main table
              </span>
            </div>
          </div>
        )}

        {/* Processing Summary */}
        {content.audit_count !== undefined && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <p className="text-gray-700 text-sm flex items-center">
              <Info className="w-4 h-4 mr-2" />
              <span className="font-semibold">Analysis completed:</span> 
              <span className="ml-1">{content.audit_count} audits processed</span>
            </p>
          </div>
        )}

        {/* Data Points Summary */}
        {content.data_points !== undefined && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <p className="text-gray-700 text-sm flex items-center">
              <Info className="w-4 h-4 mr-2" />
              <span className="font-semibold">Data processed:</span> 
              <span className="ml-1">{content.data_points} data points analyzed</span>
            </p>
          </div>
        )}
      </div>
    );
  };

  if (!isExpanded) {
    return (
      <aside className="ai-assistant-panel">
        <div className="ai-assistant-header cursor-pointer" onClick={() => setIsExpanded(true)}>
          <h3 className="font-semibold flex items-center">
            <Brain className="w-5 h-5 mr-2 text-indigo-600" />
            AI Assistant
          </h3>
          <ChevronUp className="w-4 h-4 text-gray-400" />
        </div>
        <div className="ai-assistant-chat-area">
          <div className="ai-bubble suggestion">
            <h4 className="flex items-center text-sm font-medium text-indigo-700">
              <Lightbulb className="w-4 h-4 mr-1" />
              Quick Actions
            </h4>
            <div className="mt-2 space-y-1">
              {availableTools.slice(0, 3).map(tool => {
                const IconComponent = getToolIcon(tool.icon);
                return (
                  <button
                    key={tool.id}
                    onClick={() => {
                      setIsExpanded(true);
                      handleToolClick(tool);
                    }}
                    className="w-full text-left text-xs text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 p-1 rounded flex items-center"
                  >
                    <IconComponent className="w-3 h-3 mr-1" />
                    {tool.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="ai-assistant-panel expanded">
      <div className="ai-assistant-header">
        <div className="flex items-center justify-between w-full">
          <h3 className="font-semibold flex items-center">
            <Brain className="w-5 h-5 mr-2 text-indigo-600" />
            AI Assistant
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsExpanded(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* AI Tools Quick Access */}
      <div className="px-4 py-2 border-b border-gray-200">
        <h4 className="text-xs font-semibold text-gray-700 mb-2">AI Tools</h4>
        <div className="grid grid-cols-2 gap-1">
          {availableTools.map(tool => {
            const IconComponent = getToolIcon(tool.icon);
            return (
              <button
                key={tool.id}
                onClick={() => handleToolClick(tool)}
                className={`text-left text-xs p-2 rounded flex items-center hover:bg-gray-100 transition-colors ${
                  selectedTool === tool.id ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600'
                }`}
                title={tool.description}
              >
                <IconComponent className="w-3 h-3 mr-1 flex-shrink-0" />
                <span className="truncate">{tool.name.split(' ').slice(0, 2).join(' ')}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat Messages */}
      <div className="ai-assistant-chat-area flex-1 overflow-y-auto">
        {messages.map(message => (
          <div key={message.id} className={`mb-3 ${message.type === 'user' ? 'text-right' : ''}`}>
            {message.type === 'system' && (
              <div className="ai-bubble suggestion">
                <p className="text-sm text-gray-600">{message.content}</p>
              </div>
            )}
            
            {message.type === 'user' && (
              <div className="bg-indigo-600 text-white rounded-lg p-2 inline-block max-w-[85%]">
                <p className="text-sm">{message.content}</p>
              </div>
            )}
            
            {message.type === 'ai' && (
              <div className="ai-bubble response">
                {renderAIMessage(message)}
              </div>
            )}
            
            {message.type === 'error' && (
              <div className="bg-red-100 border border-red-300 text-red-700 rounded-lg p-2">
                <p className="text-sm">{message.content}</p>
              </div>
            )}
          </div>
        ))}
        
        {loading && (
          <div className="ai-bubble response">
            <div className="flex items-center text-sm text-gray-600">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              AI is analyzing your request...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="ai-assistant-input-area">
        {selectedTool && (
          <div className="px-3 py-1 bg-indigo-50 border-b border-indigo-200">
            <p className="text-xs text-indigo-700">
              Using: {availableTools.find(t => t.id === selectedTool)?.name}
              <button 
                onClick={() => setSelectedTool(null)}
                className="ml-2 text-indigo-500 hover:text-indigo-700"
              >
                <X className="w-3 h-3 inline" />
              </button>
            </p>
          </div>
        )}
        
        <div className="relative">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Ask AI about audits, risks, trends..."
            className="w-full text-sm border-0 rounded-none py-2 px-3 pr-10 resize-none bg-white"
            rows={2}
            disabled={loading}
          />
          <button
            onClick={handleSendMessage}
            disabled={loading || !query.trim()}
            className="absolute bottom-2 right-2 flex items-center justify-center text-indigo-600 hover:text-indigo-800 disabled:text-gray-400 disabled:cursor-not-allowed"
            title="Send message"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default AIAssistant;