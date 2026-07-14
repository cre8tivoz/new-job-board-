import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { PassportProvider } from './PassportContext.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PassportProvider>
      <App />
    </PassportProvider>
  </StrictMode>,
);
