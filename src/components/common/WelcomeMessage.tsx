import { useEffect, useState } from 'react';
import { X, CheckCircle } from 'lucide-react';
import { useAuth } from '../../hooks';
import { useLanguage } from '../../contexts/LanguageContext';

export const WelcomeMessage = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const hasShownWelcome = sessionStorage.getItem('welcome_shown');

    if (user && !hasShownWelcome) {
      setTimeout(() => setShow(true), 500);
      sessionStorage.setItem('welcome_shown', 'true');

      const timer = setTimeout(() => {
        setShow(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [user]);

  if (!show || !user) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-4 flex items-start gap-3 max-w-md">
        <div className="flex-shrink-0">
          <CheckCircle className="w-6 h-6 text-green-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">
            {t('welcome')}, {user.name}!
          </h3>
          <p className="text-sm text-gray-600">
            {t('welcome_message')}
          </p>
        </div>
        <button
          onClick={() => setShow(false)}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
