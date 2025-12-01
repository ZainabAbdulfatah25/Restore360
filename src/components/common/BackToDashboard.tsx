import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';

export const BackToDashboard = () => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate('/dashboard')}
      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    >
      <Home className="w-4 h-4" />
      Back to Dashboard
    </button>
  );
};
