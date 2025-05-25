import { useEffect } from 'react';
import { Router } from './router';
import { ThemeProvider } from './components/ThemeProvider';
import SolanaWalletProvider from './components/SolanaWalletProvider';
import { ToastProvider } from './components/ui/use-toast';

function App() {
  useEffect(() => {
    // Add dark class to html element
    document.documentElement.classList.add('dark');
    // Add background color to body
    document.body.style.backgroundColor = '#0f172a';
    document.body.style.minHeight = '100vh';
  }, []);

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <ToastProvider>
        <SolanaWalletProvider>
          <Router />
        </SolanaWalletProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;