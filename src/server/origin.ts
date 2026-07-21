function httpsOrigin(hostname: string | undefined) {
  const value = hostname?.trim();
  return value ? `https://${value}` : undefined;
}

export function deploymentOrigin() {
  if (process.env.VERCEL_ENV === 'production') {
    return httpsOrigin(process.env.VERCEL_PROJECT_PRODUCTION_URL) || httpsOrigin(process.env.VERCEL_URL);
  }
  return httpsOrigin(process.env.VERCEL_URL);
}

export function trustedApplicationOrigins(localOrigin?: string) {
  return [...new Set([
    process.env.APP_ORIGIN?.trim(),
    process.env.BETTER_AUTH_URL?.trim(),
    deploymentOrigin(),
    localOrigin,
  ].filter((value): value is string => Boolean(value)))];
}
