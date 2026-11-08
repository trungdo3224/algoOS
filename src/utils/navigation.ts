/**
 * Client-side SPA navigation utility
 * Updates browser history and dispatches a popstate event to trigger state updates in AppLayout
 */
export const navigateTo = (path: string): void => {
  if (typeof window === 'undefined') return;
  if (window.location.pathname !== path) {
    window.history.pushState(null, '', path);
  }
  window.dispatchEvent(new PopStateEvent('popstate'));
};
