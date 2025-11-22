import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { Amplify } from 'aws-amplify';

// --- AMPIFY CONFIGURATION ---
// Replace these values with your actual values from amplify_outputs.json
// or your AWS Cognito Console.
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: 'us-east-1_EXAMPLE', // YOUR_USER_POOL_ID
      userPoolClientId: 'exampleclientid12345', // YOUR_USER_POOL_CLIENT_ID
      loginWith: {
        oauth: {
          domain: 'your-domain-prefix.auth.us-east-1.amazoncognito.com', // YOUR_COGNITO_DOMAIN
          scopes: ['email', 'profile', 'openid', 'aws.cognito.signin.user.admin'],
          redirectSignIn: ['http://localhost:3000/'], // YOUR_REDIRECT_URL
          redirectSignOut: ['http://localhost:3000/'], // YOUR_REDIRECT_URL
          responseType: 'code', 
        },
        email: true,
      }
    }
  }
});

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