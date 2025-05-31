import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from './store/store';
import AppLayout from './components/layout/AppLayout';
import { checkSession } from './features/user/userSlice';

function App() {
  useEffect(() => {
    store.dispatch(checkSession());
  }, []);

  return (
    <Provider store={store}>
      <AppLayout />
    </Provider>
  );
}