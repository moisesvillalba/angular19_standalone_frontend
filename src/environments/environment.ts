// src/environments/environment.ts
export const environment = {
    production: false,
    apiUrl: 'http://localhost:4200/api',
    devMode: true,
    
    // Authentication Policies
    auth: {
      // User registration settings
      registration: {
        enabled: true, // Can users register themselves?
        requireEmailVerification: true,
        allowedDomains: ['*'], // Restrict registration to specific email domains
      },
      
      // Password policies
      password: {
        minLength: 8,
        maxLength: 32,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
        specialCharsRegex: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/,
        
        // Password reset settings
        resetPassword: {
          enabled: true,
          maxResetAttempts: 3,
          resetTokenExpiration: 15 // minutes
        }
      },
      
      // Login attempt policies
      login: {
        maxFailedAttempts: 5,
        lockoutDuration: 15, // minutes
        requireTwoFactor: false
      }
    }
  };