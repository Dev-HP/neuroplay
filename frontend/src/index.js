import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import axios from 'axios';
import App from './App';
import { isDemoMode } from './shared/config/api';
import { installDemoBackend } from './shared/demo/localBackend';
import { registerServiceWorker } from './registerServiceWorker';

if (isDemoMode()) {
  installDemoBackend(axios);
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

registerServiceWorker();
