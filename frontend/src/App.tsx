import { ThemeProvider } from 'next-themes';
import { AuthProvider }  from './contexts/AuthContext';
import { AppRouter }     from './router/AppRouter';
import { Toaster }       from './components/ui/sonner';

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" disableTransitionOnChange>
      <AuthProvider>
        <AppRouter />
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  );
}
