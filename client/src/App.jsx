// client/src/App.jsx
import React from 'react';
import { AuthProvider } from './context/AuthContext.jsx';
import { AppProvider } from './context/AppContext.jsx';
import { AppRoutes } from './routes/AppRoutes.jsx';

export function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
