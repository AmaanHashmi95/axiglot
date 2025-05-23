'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function VerifyEmailPage() {
  const [message, setMessage] = useState<'loading' | 'success' | 'error'>('loading');
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setMessage('error');
      return;
    }

    fetch(`/api/auth/verify-email?token=${token}`)
      .then((res) => {
        if (res.ok) {
          setMessage('success');
          setTimeout(() => router.push('/login?verified=true'), 3000);
        } else {
          setMessage('error');
        }
      })
      .catch(() => setMessage('error'));
  }, [token]);

  return (
    <main className="flex h-screen items-center justify-center">
      {message === 'loading' && <p className="text-lg">Verifying your email...</p>}
      {message === 'success' && (
        <p className="text-green-600 text-lg">Email verified! Redirecting to login...</p>
      )}
      {message === 'error' && (
        <p className="text-red-600 text-lg">Invalid or expired link. Please try again. If it does not work, please email info@axiglot.com so we can resolve the issue for you.</p>
      )}
    </main>
  );
}
