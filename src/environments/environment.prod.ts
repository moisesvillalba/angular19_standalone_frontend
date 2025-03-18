// src/environments/environment.prod.ts
export const environment = {
    production: true,
    apiUrl: 'https://your-production-api.com/api',
    devMode: false,
    
    // Authentication Policies (more strict in production)
    auth: {
      registration: {
        enabled: false, // Disable self-registration in production
        requireEmailVerification: true,
        allowedDomains: ['yourcompany.com'], // Restrict to company domain
      },
      
      password: {
        minLength: 12,
        maxLength: 64,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
        specialCharsRegex: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/,
        
        resetPassword: {
          enabled: true,
          maxResetAttempts: 3,
          resetTokenExpiration: 10 // shorter token expiration in production
        }
      },
      
      login: {
        maxFailedAttempts: 3,
        lockoutDuration: 30,
        requireTwoFactor: true
      }
    }
  };