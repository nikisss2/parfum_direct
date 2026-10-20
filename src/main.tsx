import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

if (typeof window !== 'undefined') {
  (window as any).__marome_loaded = true;
}

createRoot(document.getElementById('root')!).render(<App />);
