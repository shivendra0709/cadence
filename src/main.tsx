import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './ErrorBoundary';
import './index.css';

const renderError = (err: any) => {
  const root = document.getElementById('root');
  if (root && root.innerHTML === '') {
    root.innerHTML = '<div style="color:red; padding:20px; font-family:monospace; white-space:pre-wrap;">' + 
      'FATAL INIT ERROR:\n' + (err?.stack || err?.message || String(err)) + '</div>';
  }
};

window.addEventListener('error', (e) => renderError(e.error));
window.addEventListener('unhandledrejection', (e) => renderError(e.reason));

try {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>,
  );
} catch (e) {
  renderError(e);
}
