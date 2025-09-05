import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  notifications: []
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action) => {
      const notification = {
        id: Date.now() + Math.random(),
        type: action.payload.type || 'info', // success, error, warning, info
        message: action.payload.message,
        title: action.payload.title || null,
        duration: action.payload.duration || 5000,
        timestamp: Date.now()
      };
      state.notifications.push(notification);
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        notification => notification.id !== action.payload
      );
    },
    clearAllNotifications: (state) => {
      state.notifications = [];
    }
  }
});

export const { addNotification, removeNotification, clearAllNotifications } = notificationSlice.actions;

// Helper functions for common notification types
export const showSuccessNotification = (message, title = 'Success') => 
  addNotification({ type: 'success', message, title });

export const showErrorNotification = (message, title = 'Error') => 
  addNotification({ type: 'error', message, title });

export const showWarningNotification = (message, title = 'Warning') => 
  addNotification({ type: 'warning', message, title });

export const showInfoNotification = (message, title = 'Information') => 
  addNotification({ type: 'info', message, title });

export default notificationSlice.reducer;