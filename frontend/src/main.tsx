import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@fontsource-variable/manrope';
import { AppProvider } from './app-context';
import App from './App';
import './styles.css';

const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, retry: false, refetchOnWindowFocus: false }, mutations: { retry: false } } });
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode><QueryClientProvider client={queryClient}><BrowserRouter><AppProvider><App /></AppProvider></BrowserRouter></QueryClientProvider></React.StrictMode>,
);
