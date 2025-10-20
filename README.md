# 👣 Jejak

> **Smart Pedestrian Tracking & Safety Platform**

[![Status](https://img.shields.io/badge/Status-Finalist-brightgreen)](https://gemastik.id)
[![Competition](https://img.shields.io/badge/Competition-Gemastik%2018-blue)](https://gemastik.id)
[![Team](https://img.shields.io/badge/Team-GajahBiru%20%7C%20ITB-informational)](https://www.itb.ac.id)
[![License](https://img.shields.io/badge/License-Proprietary-red)](#)

## 🏆 Competition Information

**Jejak** is a finalist project competing in **Gemastik 18** held by **PusPresNas** (Pusat Prestasi Nasional). Our team **GajahBiru** from **Institut Teknologi Bandung (ITB)** is proud to be among the finalists and will compete for the championship in the final round.

- 🎯 **Competition**: Gemastik 18
- 🏛️ **Organizer**: PusPresNas (Pusat Prestasi Nasional)
- 👥 **Team**: GajahBiru
- 🎓 **Institution**: Institut Teknologi Bandung (ITB)
- 🥇 **Status**: Finalist (Competing for Final Round)

---

## 📱 About Jejak

**Jejak** is an innovative pedestrian tracking and safety platform designed to enhance urban mobility and pedestrian security. The platform combines mobile accessibility with powerful backend services to provide real-time pedestrian route tracking, safety monitoring, and community-based incident reporting.

### Key Features

- 🗺️ **Real-time Route Tracking**: Track pedestrian journeys with precise GPS coordinates
- � **Safety Monitoring**: Real-time safety alerts and crowd density analysis
- 📍 **Incident Reporting**: Community-based reporting system for hazards and unsafe areas
- 🔐 **Secure Authentication**: Enterprise-grade security for user data
- 📱 **Cross-platform Support**: Native mobile experience on iOS and Android
- ☁️ **Cloud Integration**: Seamless S3-based storage for incident photos and evidence
- 🤖 **AI-Powered Analysis**: Leveraging Google Gemini AI for intelligent route suggestions and risk assessment

---

## 🏗️ Project Architecture

This is a **monorepo** project built with modern technologies:

```
jejak/
├── apps/
│   ├── api/           # Backend API (Hono.js)
│   └── ui/            # Mobile App (React Native/Expo)
├── package.json       # Workspace configuration
└── tsconfig.json      # TypeScript configuration
```

### Backend (`apps/api`)

- **Framework**: [Hono.js](https://hono.dev) - Lightweight web framework
- **Database**: PostgreSQL with [Drizzle ORM](https://orm.drizzle.team)
- **Authentication**: [Better Auth](https://better-auth.vercel.app)
- **API Validation**: Zod for type-safe validation
- **Testing**: Bun test framework
- **Linting**: oxlint for code quality

**Tech Stack**: Hono, Drizzle ORM, PostgreSQL, Zod, Better Auth, Google Gemini AI

### Frontend (`apps/ui`)

- **Framework**: [React Native](https://reactnative.dev) with [Expo](https://expo.dev)
- **Routing**: Expo Router (file-based routing)
- **State Management**: React Query for server state
- **Authentication**: Better Auth for seamless user sessions
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Maps**: Expo Maps integration
- **Location**: Expo Location API

**Tech Stack**: React Native, Expo, Expo Router, React Query, NativeWind, Better Auth

---

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh) v1.2.19 or later
- Node.js 18+ (for compatibility)
- Git

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/satriadhikara/jejak.git
   cd jejak
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

### Development

#### Run All Services

```bash
bun run dev
```

#### Run Only Mobile UI

```bash
bun run dev:ui
```

To start the Expo development server:

```bash
cd apps/ui
bun run start
# Or for specific platforms:
bun run ios      # iOS
bun run android  # Android
bun run web      # Web
```

#### Run Only Backend API

```bash
bun run dev:api
```

The API will be available at `http://localhost:3000` (or configured port)

### Database

#### Initialize Database

```bash
cd apps/api
bun run db:generate   # Generate Drizzle client
bun run db:migrate    # Apply migrations
```

#### Database Studio

Open Drizzle Studio to visualize and manage data:

```bash
cd apps/api
bun run db:studio
```

---

## 📋 Available Scripts

### Root Level

| Script            | Description                          |
| ----------------- | ------------------------------------ |
| `bun run dev`     | Run all services in development mode |
| `bun run dev:ui`  | Run only the mobile UI               |
| `bun run dev:api` | Run only the backend API             |

### API (`apps/api`)

| Script                | Description                 |
| --------------------- | --------------------------- |
| `bun run dev`         | Start API with hot reload   |
| `bun run start`       | Start API for production    |
| `bun run test`        | Run test suite              |
| `bun run lint`        | Lint code with oxlint       |
| `bun run db:generate` | Generate Drizzle ORM client |
| `bun run db:migrate`  | Run database migrations     |
| `bun run db:studio`   | Open Drizzle Studio         |

### UI (`apps/ui`)

| Script             | Description                   |
| ------------------ | ----------------------------- |
| `bun run start`    | Start Expo development server |
| `bun run android`  | Build and run on Android      |
| `bun run ios`      | Build and run on iOS          |
| `bun run web`      | Run in web browser            |
| `bun run lint`     | Lint and check formatting     |
| `bun run format`   | Format code automatically     |
| `bun run prebuild` | Prebuild native apps          |

---

## 🔧 Configuration

### Environment Variables

Create `.env` files in each app:

**`apps/api/.env`**

```env
DATABASE_URL=postgresql://user:password@localhost:5432/jejak
BETTER_AUTH_SECRET=your_secret_key
GOOGLE_GENAI_API_KEY=your_google_api_key
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_REGION=your_aws_region
AWS_S3_BUCKET=your_bucket_name
```

**`apps/ui/.env`**

```env
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_APP_NAME=Jejak
```

---

## 📚 Project Structure

### API Routes

- `/health` - Health check endpoint
- `/auth` - Authentication endpoints
- `/maps` - Maps and location data
- `/points` - Environmental points tracking
- `/reports` - Report management
- `/storage` - File upload/download

### Mobile Screens

- `sign-in` - User authentication
- `(secure)` - Protected routes
  - `beranda` - Home/Dashboard with route tracking
  - `analyze` - Safety analytics & insights
  - `riwayat` - Pedestrian history & journey logs
  - `location-search` - Route finder & hazard search

---

## 🧪 Testing

### Run Tests

```bash
cd apps/api
bun run test
```

### Test Coverage

```bash
cd apps/api
bun run test --coverage
```

Tests are located in `apps/api/tests/` with:

- Integration tests
- Route tests
- Service unit tests
- Mock database setup

---

## 🎨 Code Quality

### Linting

**API:**

```bash
cd apps/api
bun run lint
```

**UI:**

```bash
cd apps/ui
bun run lint
```

### Code Formatting

**UI:**

```bash
cd apps/ui
bun run format
```

---

## 📦 Build & Deployment

### Mobile App

```bash
cd apps/ui
bun run prebuild        # Generate native code
bun run android         # Build and deploy to Android
bun run ios             # Build and deploy to iOS
```

### Backend API

```bash
cd apps/api
bun run start           # Start production server
```

For Docker deployment:

```bash
docker build -t jejak .
docker run -p 3000:3000 jejak
```

---

## 🔐 Security

- ✅ Encrypted authentication with Better Auth
- ✅ Environment variables for sensitive data
- ✅ CORS middleware for API protection
- ✅ Input validation with Zod
- ✅ Secure session management

---

## 📄 License

This project is proprietary and is part of the Gemastik 18 competition. Unauthorized reproduction or distribution is prohibited.

---

## 👥 Team GajahBiru

| Name                | Github                                                | Institution                                |
| ------------------- | ----------------------------------------------------- | ------------------------------------------ |
| Satriadhikara Panji | [satriadhikara](https://github.com/satriadhikara)     | ITB - Informatics Engineering 22           |
| Mohammad Andhika    | [andhikafdh](https://github.com/andhikafdh)           | ITB - Informatics Engineering 22           |
| Yusril Fazri M.     | [YusrilMahendraa](https://github.com/YusrilMahendraa) | ITB - Information System and Technology 22 |

---

## 📞 Support

For questions or issues related to this project, please contact the development team

---

<div align="center">

**Gemastik 18 Finalist | Team GajahBiru | ITB**

_Building safer urban spaces through intelligent pedestrian tracking technology_

</div>
