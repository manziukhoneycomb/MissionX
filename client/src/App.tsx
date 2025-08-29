import { SignedIn, SignedOut } from '@clerk/clerk-react';
import AppRoutes from './routes/AppRoutes';
import Login from './modules/login/Login';

function App() {
  return (
    <>
      <SignedOut>
        <Login />
      </SignedOut>
      <SignedIn>
        <AppRoutes />
      </SignedIn>
    </>
  );
}

export default App;
