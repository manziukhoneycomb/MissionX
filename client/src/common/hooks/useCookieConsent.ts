import { useState, useEffect } from 'react';

export interface CookiesPreferences {
  analytics: boolean;
}

const COOKIES_CONSENT_KEY = 'cookies-consent';
const COOKIES_PREFERENCES_KEY = 'cookies-preferences';

const defaultPreferences: CookiesPreferences = {
  analytics: false,
};

export const useCookieConsent = () => {
  const [hasConsent, setHasConsent] = useState<boolean>(false);
  const [preferences, setPreferences] = useState<CookiesPreferences>(defaultPreferences);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    const consentValue = localStorage.getItem(COOKIES_CONSENT_KEY);
    const preferencesValue = localStorage.getItem(COOKIES_PREFERENCES_KEY);

    setHasConsent(consentValue === 'true');

    if (preferencesValue) {
      try {
        setPreferences(JSON.parse(preferencesValue));
      } catch {
        setPreferences(defaultPreferences);
      }
    }

    setIsLoaded(true);
  }, []);

  const updatePreferences = (newPreferences: CookiesPreferences) => {
    setPreferences(newPreferences);
    setHasConsent(true);
    localStorage.setItem(COOKIES_CONSENT_KEY, 'true');
    localStorage.setItem(COOKIES_PREFERENCES_KEY, JSON.stringify(newPreferences));
  };

  const acceptAll = () => {
    const allAcceptedPreferences: CookiesPreferences = {
      analytics: true,
    };
    updatePreferences(allAcceptedPreferences);
  };

  const declineAll = () => {
    const declinedPreferences: CookiesPreferences = {
      analytics: false,
    };
    updatePreferences(declinedPreferences);
  };

  const resetConsent = () => {
    localStorage.removeItem(COOKIES_CONSENT_KEY);
    localStorage.removeItem(COOKIES_PREFERENCES_KEY);
    setHasConsent(false);
    setPreferences(defaultPreferences);
  };

  return {
    hasConsent,
    preferences,
    isLoaded,
    updatePreferences,
    acceptAll,
    declineAll,
    resetConsent,
  };
};