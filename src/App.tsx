import React from 'react';
import { AuthProvider } from './context/AuthContext';
import AppLayout from './components/layout/AppLayout';
import { Provider } from 'react-redux';
import { store } from './store/store';

function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </Provider>
  );
}

export default App;
