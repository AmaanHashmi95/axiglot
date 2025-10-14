// src/lib/disposable.ts
const DISPOSABLE = new Set(["mailinator.com","guerrillamail.com","tempmail.com" /* … */]);
export function isDisposable(email: string) {
  const domain = email.split("@").pop()?.toLowerCase();
  return !!domain && DISPOSABLE.has(domain);
}
