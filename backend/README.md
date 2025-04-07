# Dicel Security Company ERP Backend

This is the backend service for the Dicel Security Company ERP system. It provides a RESTful API for managing security company operations including employee management, client management, equipment tracking, and more.

## Features

- 🔐 Authentication and Authorization
- 👥 Employee Management
- 🏢 Client Management
- 📋 Project Management
- ⏰ Attendance Tracking
- 📅 Leave Management
- 🔧 Equipment Management
- 📝 Incident Reporting
- 💰 Payroll Management
- 📊 Report Generation (CSV, Excel, PDF)
- 📚 API Documentation (Swagger)
- 🔒 Security Features (Rate Limiting, Helmet)
- 🗄️ PostgreSQL Database with Prisma ORM
- 🐳 Docker Support

## Prerequisites

- Node.js v20 or later
- PostgreSQL v15 or later
- Docker (optional)

## Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Generate Prisma client:
   ```bash
   npm run prisma:generate
   ```

5. Run database migrations:
   ```bash
   npm run prisma:migrate
   ```

6. Seed the database:
   ```bash
   npm run prisma:seed
   ```

## Development

Start the development server:
```bash
npm run dev
```

The server will start at http://localhost:5000 (or the port specified in your .env file).

## Testing

Run tests:
```bash
npm test
```

Run tests with coverage:
```bash
npm run test:coverage
```

## API Documentation

Once the server is running, you can access the Swagger documentation at:
```
http://localhost:5000/api-docs
```

## Docker Deployment

1. Build and run using Docker Compose:
   ```bash
   docker-compose up -d
   ```

2. Stop the services:
   ```bash
   docker-compose down
   ```

## Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start the development server
- `npm run build` - Build the TypeScript code
- `npm test` - Run tests
- `npm run test:coverage` - Run tests with coverage
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio
- `npm run prisma:seed` - Seed the database

## Default Admin Account

After seeding the database, you can log in with:
- Email: admin@dicelsecurity.com
- Password: admin123

**Important**: Change the default admin password after first login.

## Project Structure

```
backend/
├── src/
│   ├── config/         # Configuration files
│   ├── controllers/    # Route controllers
│   ├── middleware/     # Custom middleware
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   ├── schemas/        # Validation schemas
│   ├── services/       # Business logic
│   ├── tests/          # Test files
│   └── utils/          # Utility functions
├── prisma/
│   ├── migrations/     # Database migrations
│   ├── schema.prisma   # Prisma schema
│   └── seed.ts        # Database seeder
└── package.json
```

## Security Features

- JWT Authentication
- Rate Limiting
- CORS Protection
- Helmet Security Headers
- Input Validation
- Password Hashing
- SQL Injection Protection (via Prisma)

## Contributing

1. Create a new branch
2. Make your changes
3. Run tests
4. Submit a pull request

## License

ISC 