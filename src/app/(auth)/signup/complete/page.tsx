'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function Page() {
  const [status, setStatus] = useState<'loading' | 'sent' | 'error'>('loading');
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (!sessionId) {
      setStatus('error');
      return;
    }

    fetch('/api/send-verification-after-payment', {
      method: 'POST',
      body: JSON.stringify({ sessionId }),
    })
      .then((res) => {
        if (res.ok) setStatus('sent');
        else setStatus('error');
      })
      .catch(() => setStatus('error'));
  }, [sessionId]);

  return (
    <main className="h-screen flex justify-center items-center">
      <div className="text-center space-y-3">
        <h1 className="text-2xl font-bold">Thanks for subscribing!</h1>
        {status === 'loading' && <p>Finalizing setup…</p>}
        {status === 'sent' && <p>Check your email to verify your account, you might have to check your spam. If you do not receive anything, please email info@axiglot.com so we can resolve the issue for you.</p>}
        {status === 'error' && <p className="text-red-600">Something went wrong. Please email info@axiglot.com so we can resolve the issue for you.</p>}
      </div>
    </main>
  );
}
