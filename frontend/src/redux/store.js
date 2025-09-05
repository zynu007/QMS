import { configureStore } from '@reduxjs/toolkit';
import auditReducer from './auditSlice';
import notificationReducer from './notificationSlice';

export const store = configureStore({
  reducer: {
    audits: auditReducer,
    notifications: notificationReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;