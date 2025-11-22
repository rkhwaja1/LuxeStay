import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { Amplify } from 'aws-amplify';

// CONFIGURE AMPLIFY HERE
// You must replace these values with your actual AWS Cognito details.
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: 'us-east-1_XXXXX', // Your User Pool ID
      userPoolClientId: '3n4b5c6d7e8f9g0h1i2j3k4l5', // Your Client ID
      loginWith: {
        oauth: {
          domain: 'your-domain-prefix.auth.us-east-1.amazoncognito.com', // Your Cognito Domain
          scopes: ['email', 'profile', 'openid', 'aws.cognito.signin.user.admin'],
          redirectSignIn: ['http://localhost:3000/'], // Must match your callback URLs in Cognito
          redirectSignOut: ['http://localhost:3000/'], // Must match your signout URLs in Cognito
          responseType: 'code',
        },
      },
    },
  },
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