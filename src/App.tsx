import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from './store/store';
import AppLayout from './components/layout/AppLayout';
import { checkSession } from './features/user/userSlice';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  useEffect(() => {
    store.dispatch(checkSession());
  }, []);

  return (
    <Provider store={store}>
      <ThemeProvider>
        <AppLayout />
      </ThemeProvider>
    </Provider>
  );
}

export default App;