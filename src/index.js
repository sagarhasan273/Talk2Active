import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from 'react-query';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import GlobalContextProvider from './context/GlobalContextProvider';
import ThemeContextProvider from './context/ThemeContextProvider';
import GlobalThemeProvider from './theme';

const root = ReactDOM.createRoot(document.getElementById('root'));

const queryClient = new QueryClient();

root.render(
  <React.StrictMode>
    <ThemeContextProvider>
      <GlobalThemeProvider>
        <BrowserRouter>
          <QueryClientProvider client={queryClient}>
            <GlobalContextProvider>
              <App />
            </GlobalContextProvider>
          </QueryClientProvider>
        </BrowserRouter>
      </GlobalThemeProvider>
    </ThemeContextProvider>
  </React.StrictMode>
);
