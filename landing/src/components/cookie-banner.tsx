import { motion, AnimatePresence } from 'framer-motion';
import { useCookieConsent } from '../hooks/use-cookie-consent';

export default function CookieBanner() {
  const { showBanner, acceptCookies, rejectCookies } = useCookieConsent();

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed bottom-0 left-0 right-0 z-50 bg-slate-800 border-t border-slate-700 p-4 md:p-6"
        >
          <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-white text-sm md:text-base text-center md:text-left">
              We use cookies to improve your experience. By continuing, you accept our use of cookies.
            </div>
            <div className="flex gap-3 shrink-0">
              <button
                onClick={rejectCookies}
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white border border-slate-600 hover:border-slate-500 rounded-md transition-colors"
              >
                Reject All
              </button>
              <button
                onClick={acceptCookies}
                className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-black rounded-md transition-colors"
              >
                Accept All
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}