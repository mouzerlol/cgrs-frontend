import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md mx-auto text-center px-4">
        <div className="text-6xl mb-6">🔍</div>
        <h1 className="text-4xl font-bold text-charcoal-grey mb-4">
          Page Not Found
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
        </p>
        <div className="space-y-4">
          <Button variant="primary" size="lg" asChild>
            <Link href="/">Go Home</Link>
          </Button>
          <div className="text-sm text-gray-500">
            <Link href="/contact" className="text-vibrant-green hover:underline">
              Contact us if you need help
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
