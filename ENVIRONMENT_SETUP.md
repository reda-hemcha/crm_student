# Environment Configuration

## Setup Instructions

1. Create a `.env.local` file in the `frontend` directory
2. Add the following environment variables:

```bash
# Backend API Configuration
VITE_API_BASE_URL=https://7364dad43d3c.ngrok-free.app/api

# Development Configuration
VITE_APP_NAME=CRM School Management
VITE_APP_VERSION=1.0.0

# Environment
VITE_NODE_ENV=development
```

## Available Endpoints

Based on the backend server at https://7364dad43d3c.ngrok-free.app, the following endpoints are available:

- **Auth**: `/api/auth`
- **Schools**: `/api/schools`
- **Admins**: `/api/admins`
- **Classes**: `/api/classes`
- **Students**: `/api/students`
- **Parents**: `/api/parents`

## Configuration Details

The application uses the `environment.js` configuration file located at `src/config/environment.js` to manage all environment variables.

### Key Features:

- Automatic fallback to the new ngrok URL if environment variable is not set
- Support for different environments (development, production)
- Centralized configuration management

## Usage

The backend URL is automatically used in all API calls through the `axiosInstance` configuration. No manual URL updates are needed in individual API files.
