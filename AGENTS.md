# Pertencer Mobile - Agent Guidelines

## Project Overview

Pertencer is a Christian devotional mobile application built with Expo (React Native). It allows users to read Bible chapters, answer devotional questions, track progress, and search through their responses.

## Tech Stack

- **Framework**: Expo SDK 54 with expo-router
- **Language**: TypeScript (strict mode)
- **Styling**: NativeWind (Tailwind CSS)
- **State/Data**: React Query (@tanstack/react-query)
- **Backend**: Firebase (Auth + Firestore)
- **Testing**: Jest + @testing-library/react-native
- **Notifications**: expo-notifications

## Project Structure

```
/
├── app/                    # expo-router pages
│   ├── (auth)/            # Authentication routes (login)
│   ├── (tabs)/            # Main tab navigation
│   └── [planId]/          # Dynamic plan routes
├── src/
│   ├── components/        # Reusable UI components
│   ├── context/           # React contexts (Auth, Notifications)
│   ├── hooks/             # Custom hooks
│   ├── services/          # API/Firebase services
│   └── types/             # TypeScript interfaces
├── assets/bible/          # Bible content (NVI/ARC)
└── __tests__/             # Jest tests
```

## Commands

```bash
# Development
npm start                   # Start Expo
npm run android            # Build/run Android
npm run ios                # Build/run iOS
npm run web                # Web preview

# Quality
npm run lint               # Run ESLint
npm run typecheck          # TypeScript validation
npm test                   # Run Jest tests
npm run test:watch         # Watch mode for tests
```

## Code Conventions

### TypeScript
- Strict mode enabled (no implicit any)
- Use interfaces for type definitions
- Export types from `src/types/index.ts`
- Use explicit return types for service functions

### Components
- Use functional components with TypeScript
- Leverage NativeWind for styling (no inline styles)
- Components go in `src/components/`
- Page components in `app/` directory

### Services
- Firebase services in `src/services/`
- Dynamic imports for Firebase modules
- Check for `db` initialization before operations
- Return empty arrays/objects on error (graceful degradation)

### State Management
- React Query for server state
- Context providers for global state (auth, notifications)
- Local state with useState/useReducer

## Testing

- Tests in `src/__tests__/`
- Use `@testing-library/react-native`
- Mock Firebase modules in tests
- Follow existing test patterns

## Firebase Schema

### Collections
- `users` - User profiles (uid, name, email, createdAt)
- `plan` - Reading plans
- `books` - Books within plans
- `chapters` - Chapters with devotional content
- `userDevotionals` - User answers and progress
- `banners` - App banners (future)

## Environment Variables

- Copy `.env` template for Firebase config
- Never commit secrets to version control
- Use expo-secure-store for sensitive data

## Best Practices

1. **Imports**: Group imports (React, external libs, internal modules)
2. **Error Handling**: Always wrap async operations in try/catch
3. **Performance**: Use React Query for caching and deduplication
4. **Accessibility**: Use proper ARIA labels and semantic elements
5. **Notifications**: Handle permission states gracefully
6. **Type Safety**: Avoid `any` types; use proper generics

## Navigation

- Use expo-router file-based routing
- `(auth)` route group for authentication screens
- `(tabs)` route group for main app navigation
- Dynamic routes with `[param]` for plan/book IDs

## Build & Release

- Android: `com.pertencer.app` package
- iOS: `com.pertencer.app` bundle ID
- Uses Expo EAS for builds (configure in `app.json`)
