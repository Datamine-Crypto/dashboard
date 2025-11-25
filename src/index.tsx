import '@fontsource-variable/roboto';
import ReactDOM from 'react-dom/client';
import App from '@/react/App';

/**
 * Entry point of the React application.
 * Renders the main App component into the 'root' DOM element.
 */
const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(<App />);
