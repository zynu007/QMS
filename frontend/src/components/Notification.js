import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { removeNotification } from '../redux/notificationSlice';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

const NotificationContainer = () => {
  const notifications = useSelector(state => state.notifications.notifications);
  const dispatch = useDispatch();

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getBackgroundColor = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const getTitleColor = (type) => {
    switch (type) {
      case 'success':
        return 'text-green-800';
      case 'error':
        return 'text-red-800';
      case 'warning':
        return 'text-yellow-800';
      default:
        return 'text-blue-800';
    }
  };

  const getMessageColor = (type) => {
    switch (type) {
      case 'success':
        return 'text-green-700';
      case 'error':
        return 'text-red-700';
      case 'warning':
        return 'text-yellow-700';
      default:
        return 'text-blue-700';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onClose={() => dispatch(removeNotification(notification.id))}
          getIcon={getIcon}
          getBackgroundColor={getBackgroundColor}
          getTitleColor={getTitleColor}
          getMessageColor={getMessageColor}
        />
      ))}
    </div>
  );
};

const NotificationItem = ({ 
  notification, 
  onClose, 
  getIcon, 
  getBackgroundColor, 
  getTitleColor, 
  getMessageColor 
}) => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (notification.duration > 0) {
      const timer = setTimeout(() => {
        dispatch(removeNotification(notification.id));
      }, notification.duration);

      return () => clearTimeout(timer);
    }
  }, [notification.id, notification.duration, dispatch]);

  return (
    <div 
      className={`
        max-w-sm w-full shadow-lg rounded-lg pointer-events-auto 
        border ${getBackgroundColor(notification.type)}
        transform transition-all duration-300 ease-in-out
        animate-slide-in-right
      `}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {getIcon(notification.type)}
          </div>
          <div className="ml-3 w-0 flex-1 pt-0.5">
            {notification.title && (
              <p className={`text-sm font-medium ${getTitleColor(notification.type)}`}>
                {notification.title}
              </p>
            )}
            <p className={`text-sm ${getMessageColor(notification.type)} ${notification.title ? 'mt-1' : ''}`}>
              {notification.message}
            </p>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              className={`
                rounded-md inline-flex text-gray-400 hover:text-gray-600 
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
              `}
              onClick={onClose}
            >
              <span className="sr-only">Close</span>
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationContainer;

// CSS Animation for the notification (add to your global CSS)
export const notificationStyles = `
@keyframes slide-in-right {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.animate-slide-in-right {
  animation: slide-in-right 0.3s ease-out;
}
`;