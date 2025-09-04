import { SignedIn, SignedOut } from '@clerk/clerk-react';
import AppRoutes from './routes/AppRoutes';
import Login from './modules/login/Login';
import CookiesBanner from './common/components/CookiesBanner';
import { useCookieConsent, CookiesPreferences } from './common/hooks/useCookieConsent';

function App() {
  const cookieConsent = useCookieConsent();

  const handleAcceptAll = () => {
    cookieConsent.acceptAll();
  };

  const handleDecline = () => {
    cookieConsent.declineAll();
  };

  const handleConfigure = (preferences: CookiesPreferences) => {
    cookieConsent.updatePreferences(preferences);
  };

  return (
    <>
      <SignedOut>
        <Login />
      </SignedOut>
      <SignedIn>
        <AppRoutes />
      </SignedIn>
      <CookiesBanner 
        onAcceptAll={handleAcceptAll}
        onDecline={handleDecline}
        onConfigure={handleConfigure}
      />
    </>
  );
}

export default App;
