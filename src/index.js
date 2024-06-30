import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import ThemeContextProvider from './context/ThemeContextProvider';
import GlobalThemeProvider from './theme';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeContextProvider>
      <GlobalThemeProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </GlobalThemeProvider>
    </ThemeContextProvider>
  </React.StrictMode>
);
