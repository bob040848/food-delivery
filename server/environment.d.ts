declare namespace NodeJS {
  interface ProcessEnv {
    EMAIL_USER: string;
    EMAIL_PASS: string;
    DB_CONNECTION: string;
    FRONTEND_ENDPOINT: string;
  }
}
