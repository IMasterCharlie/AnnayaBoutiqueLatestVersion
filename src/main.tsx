import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { Auth0Provider } from '@auth0/auth0-react';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Auth0Provider
      domain="dev-vos48ex46zdohk7b.us.auth0.com"
      clientId="8VeMv4eUR81aVXJeBHykPoNeOBE4Tj3p"
      authorizationParams={{ redirect_uri: window.location.origin }}
    >
      <App />
    </Auth0Provider>
  </StrictMode>,
);
