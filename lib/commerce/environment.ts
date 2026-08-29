/** Names only. This scaffold does not read or require these variables yet. */
export const futureMiniEnvironmentVariables = {
  dashboard: [
    "NEXT_PUBLIC_MINI_APP_URL",
    "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
    "CLERK_SECRET_KEY",
    "NEXT_PUBLIC_CLERK_SIGN_IN_URL",
    "GENESIS_API_BASE_URL",
    "GENESIS_AUTH_ENABLED",
    "GENESIS_BILLING_ENABLED",
  ],
  api: [
    "PUBLIC_API_URL",
    "DATABASE_URL",
    "CORS_ALLOWED_ORIGINS",
    "CLERK_ISSUER",
    "CLERK_AUDIENCE",
    "CLERK_JWKS_URL",
    "CLERK_WEBHOOK_SECRET",
    "BILLING_PROVIDER",
    "BILLING_SECRET_KEY",
    "BILLING_WEBHOOK_SECRET",
    "GENESIS_AUTH_ENABLED",
    "GENESIS_BILLING_ENABLED",
  ],
} as const;
