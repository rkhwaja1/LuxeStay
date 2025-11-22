import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { Amplify } from 'aws-amplify';

// Configure Amplify with the specific User Pool details provided
try {
  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId: 'us-east-1_oxMLOWFKu',
        userPoolClientId: '57e203u7b7d97fu86h836jhfj2',
      }
    }
  });
} catch (e) {
  console.error("Failed to configure Amplify", e);
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);