import { Link } from 'react-router';
import { Button } from '../components/ui/button';
import { Home } from 'lucide-react';

export function NotFound() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
      <h1 className="text-slate-900 mb-4">404 - Page Not Found</h1>
      <p className="text-slate-600 mb-8">
        The page you're looking for doesn't exist.
      </p>
      <Button asChild>
        <Link to="/">
          <Home className="size-4 mr-2" />
          Go Home
        </Link>
      </Button>
    </div>
  );
}
