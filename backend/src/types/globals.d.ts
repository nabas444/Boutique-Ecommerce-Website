// AI TEMPORARILY DISABLED
// Minimal global declarations to avoid requiring @types/node installation
// This keeps the project compiling when environment types aren't present.

declare var process: any;
declare var console: any;

declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV?: string;
    PORT?: string;
    FRONTEND_URL?: string;
    OPENAI_API_KEY?: string;
    STRIPE_WEBHOOK_SECRET?: string;
  }
}
