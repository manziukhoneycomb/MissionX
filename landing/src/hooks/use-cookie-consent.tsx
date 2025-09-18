import { useState, useEffect } from 'react';

const COOKIE_CONSENT_KEY = 'cookie-consent';

type CookieConsentState = 'pending' | 'accepted' | 'rejected';

export function useCookieConsent() {
  const [consent, setConsent] = useState<CookieConsentState>('pending');

  useEffect(() => {
    try {
      const storedConsent = localStorage.getItem(COOKIE_CONSENT_KEY);
      if (storedConsent === 'accepted' || storedConsent === 'rejected') {
        setConsent(storedConsent);
      }
    } catch {
      // localStorage not available, keep default state
    }
  }, []);

  const acceptCookies = () => {
    try {
      localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
      setConsent('accepted');
    } catch {
      // localStorage not available, only update state
      setConsent('accepted');
    }
  };

  const rejectCookies = () => {
    try {
      localStorage.setItem(COOKIE_CONSENT_KEY, 'rejected');
      setConsent('rejected');
    } catch {
      // localStorage not available, only update state
      setConsent('rejected');
    }
  };

  return {
    consent,
    acceptCookies,
    rejectCookies,
    showBanner: consent === 'pending',
  };
}