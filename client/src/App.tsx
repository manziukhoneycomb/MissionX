import { SignedIn, SignedOut } from '@clerk/clerk-react';
import AppRoutes from './routes/AppRoutes';
import Login from './modules/login/Login';
import { ThemeProvider } from './common/contexts/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <SignedOut>
        <Login />
      </SignedOut>
      <SignedIn>
        <AppRoutes />
      </SignedIn>
    </ThemeProvider>
  );
}

export default App;
