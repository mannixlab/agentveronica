import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Find the root element where the application will be mounted
const rootElement = document.getElementById('root');

if (rootElement) {
    // Use the modern createRoot API for React 18+ to render the application.
    ReactDOM.createRoot(rootElement).render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
} else {
    // If the root element is not found, log an error (shouldn't happen with your index.html)
    console.error("Failed to find the root element to render the app.");
}
