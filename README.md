#  Frontend - Online Public Access

## 📚 Project Description
This is the frontend application for an Online Public Access system, built with Angular. The application provides a user-friendly interface for library management, user authentication, and catalog browsing.

## 🚀 Features
- User Authentication
- Role-based Access Control
- Library Catalog Management
- Responsive Design
- Secure Routes
- Dynamic Configuration

## 🛠 Technologies Used
- Angular
- TypeScript
- RxJS
- Angular Material
- Authentication Services
- Environment Configuration

## 📋 Prerequisites
- Node.js (v18+ recommended)
- npm (v9+)
- Angular CLI

## 🔧 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/opac-frontend.git
cd opac-frontend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment
Create or modify `src/environments/environment.ts` with your configuration:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost',
  // Add other configurations
};
```

### 4. Run the Application
```bash
ng serve
```
Navigate to `http://localhost:4200/`

## 🧪 Running Tests
```bash
ng test
```

## 🚢 Build for Production
```bash
ng build --configuration=production
```

## 📦 Project Structure
```
src/
├── app/
│   ├── core/           # Core services, guards, interceptors
│   ├── features/       # Feature modules
│   ├── shared/         # Shared components, pipes, directives
│   └── environments/   # Environment configurations
├── assets/             # Static assets
└── styles/             # Global styles
```

## 🔒 Authentication Policies
- User registration can be enabled/disabled
- Configurable password complexity rules
- Role-based access control

## 🤝 Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request


```
