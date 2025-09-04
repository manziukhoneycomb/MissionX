export type CookieCategory = 'essential' | 'analytics' | 'marketing';

export interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  hasConsented: boolean;
  consentDate?: string;
}

const COOKIE_PREFERENCES_KEY = 'cookie-preferences';

const defaultPreferences: CookiePreferences = {
  essential: true,
  analytics: false,
  marketing: false,
  hasConsented: false,
};

export class CookiePreferencesService {
  static getPreferences(): CookiePreferences {
    try {
      const stored = localStorage.getItem(COOKIE_PREFERENCES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...defaultPreferences, ...parsed };
      }
    } catch (error) {
      console.warn('Failed to parse cookie preferences from localStorage:', error);
    }
    return defaultPreferences;
  }

  static savePreferences(preferences: CookiePreferences): void {
    try {
      const preferencesToSave = {
        ...preferences,
        consentDate: new Date().toISOString(),
      };
      localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(preferencesToSave));
    } catch (error) {
      console.error('Failed to save cookie preferences to localStorage:', error);
    }
  }

  static acceptAll(): void {
    const preferences: CookiePreferences = {
      essential: true,
      analytics: true,
      marketing: true,
      hasConsented: true,
      consentDate: new Date().toISOString(),
    };
    this.savePreferences(preferences);
  }

  static declineAll(): void {
    const preferences: CookiePreferences = {
      essential: true,
      analytics: false,
      marketing: false,
      hasConsented: true,
      consentDate: new Date().toISOString(),
    };
    this.savePreferences(preferences);
  }

  static hasConsented(): boolean {
    return this.getPreferences().hasConsented;
  }

  static clearPreferences(): void {
    try {
      localStorage.removeItem(COOKIE_PREFERENCES_KEY);
    } catch (error) {
      console.error('Failed to clear cookie preferences:', error);
    }
  }
}