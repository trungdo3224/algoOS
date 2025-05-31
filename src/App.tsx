import React from 'react';
import { AuthProvider } from './context/AuthContext';
import AppLayout from './components/layout/AppLayout';

function App() {
  return (
    <AuthProvider>
      <AppLayout />
    </AuthProvider>
  );
}

export default App;