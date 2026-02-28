# 🚌 BusApp | Real-Time Transit & Driver Dashboard

A high-performance, real-time bus tracking application built with **React Native** and **Expo**. This platform provides drivers with a professional dashboard to broadcast their location and commuters with a live map to track transit progress.

---

## 📱 Features

### 👨‍✈️ Driver Experience

- **Live Tracking Dashboard:** Real-time speed (km/h) and trip duration monitoring.
- **Safety Navigation Guard:** Prevents accidental app closing or back-navigation during active trips via a confirmation alert.
- **Visual Identity:** Instant access to bus registration details, capacity, and route strings.
- **Haptic Intelligence:** Physical vibration feedback for critical actions like starting/stopping a trip.

### 🗺️ Technical Highlights

- **Real-Time Sync:** Uses Firebase Realtime Database for sub-second GPS updates and live streaming.
- **Vector Maps:** Powered by Mapbox GL with smooth 60fps rendering and 3D terrain support.
- **Theming:** Full Light/Dark mode support with a custom design system (Spacing, Shadows, BorderRadius).
- **Localization:** Multi-language support using `i18next`.

---

## 🏗️ System Architecture

The application uses a hybrid architecture to balance security and performance:

1. **REST API (Laravel/Node.js)**  
   Handles authentication, bus assignments, and persistent profile data.

2. **Firebase Realtime Database**  
   Handles high-frequency GPS data (coordinates, speed, heading).

---

## 🛠️ Tech Stack

- **Framework:** React Native (Expo)
- **Language:** TypeScript
- **State Management:** React Context API + Hooks
- **Real-Time Database:** Firebase Realtime Database
- **Map Engine:** @rnmapbox/maps
- **Animations:** React Native Reanimated
- **Icons:** Expo Vector Icons (Feather)

---

## 🚀 Getting Started

### 1️⃣ Prerequisites

- Node.js (v18+)
- Expo Go app (Android/iOS) or emulator
- Mapbox Access Token
- Firebase project configured

---

### 2️⃣ Installation

```bash
# Clone the repository
git clone https://github.com/abdullahnizamani/Bus-Tracking-App.git

# Navigate to the project
cd Bus-Tracking-App
# Install dependencies
npm install
```

---

### 3️⃣ Environment Setup

Create a `.env` file in the root directory:

```env
EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_token_here
EXPO_PUBLIC_FIREBASE_API_KEY=your_key
EXPO_PUBLIC_API_URL=https://your-api-endpoint.com
```

---

### 4️⃣ Running the App

```bash
# Start Expo development server
npx expo start
```

---

## 🗂️ Project Structure

```text
├── assets/             # Images, fonts, branding
├── client/
│   ├── components/     # Reusable UI components
│   ├── constants/      # Theme configuration
│   ├── contexts/       # Global state (Auth, Theme)
│   ├── hooks/          # Custom hooks
│   ├── lib/            # API & Firebase config
│   ├── navigation/     # Navigation setup
│   └── screens/        # Main application screens
└── types/              # TypeScript types/interfaces
```

---

## 🔒 Permissions

The app requires:

- **Location (Foreground):** Required for active trip tracking.
- **Location (Background):** Optional — continues tracking when switching apps.
- **Haptics:** For vibration feedback during key actions.

---


## 📄 License

Distributed under the MIT License. See the `LICENSE` file for more information.