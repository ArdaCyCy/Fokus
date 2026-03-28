/**
 * Clerk yalnızca publishable + secret birlikte tanımlıyken etkindir.
 * Sadece publishable key bırakmak giriş/profil hatalarına yol açar; bu yüzden tek kaynak burasıdır.
 */
export function isClerkEnabled(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim() &&
      process.env.CLERK_SECRET_KEY?.trim()
  );
}
