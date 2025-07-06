import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import ReactDOM from 'react-dom/client';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

/**
 * Entry point of the React application.
 * Renders the main App component into the 'root' DOM element.
 */
const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(<App />);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
// This line unregisters the service worker, effectively disabling offline capabilities.
serviceWorkerRegistration.unregister();
