# Mihrab

<!-- markdownlint-disable MD033 -->
<img src="assets/icon.png" alt="Mihrab logo" width="72" />
<!-- markdownlint-enable MD033 -->

> A calm, privacy-first Islamic companion for prayer, Quran reading, Qibla direction and daily reflection.

[![MIT License](https://img.shields.io/badge/license-MIT-7C8A50.svg)](LICENSE) [![Expo SDK 57](https://img.shields.io/badge/Expo-57-4630EB.svg)](https://docs.expo.dev/versions/v57.0.0/) ![Platforms](https://img.shields.io/badge/platforms-Android%20%7C%20iOS%20%7C%20Web-E8A33D.svg)

Mihrab is an Expo and React Native application that brings essential Islamic tools into one focused experience: prayer times, Qibla guidance, Quran reading, recitation, monthly planning, reminders and daily reflection.

## Features

### 🕌 Prayer Times

- Location-aware daily prayer times
- Calculation method and Asr madhab selection
- Current and next prayer countdown
- Sunrise and sunset timings
- 12-hour and 24-hour time formats
- Pull-to-refresh and cached prayer data

### 📖 Quran

- Complete Surah directory with Siparah numbers
- 30 Siparah directory
- Arabic Quran text with English and Urdu translations
- Mushaf-only and translation reading modes
- Arabic, Urdu and English Quran search
- Direct navigation from search result to Ayah
- Ayah bookmarks with folder management and personal notes
- Arabic and translation font size controls
- Screen-reader labels and RTL-friendly Urdu/Arabic rendering
- Multiple reciters: Mishary Alafasy, Abdul Basit, Abdul Samad and Saad Al-Ghamdi
- Surah audio playback with progress and background playback support
- Local cache for Quran responses

### 🧭 Qibla

- Qibla bearing calculated from the current location
- Live compass support on compatible devices
- Browser orientation fallback where supported
- Compass accuracy indicator and calibration guidance
- Magnetic interference warning
- Distance to the Kaaba
- Route visualization from the selected location to Makkah

### 📅 Prayer Calendar

- Monthly prayer calendar with month navigation
- Gregorian and Hijri dates
- Fajr, Dhuhr, Maghrib and Isha timings
- Sunrise and sunset
- Islamic holidays/events when supplied by the calendar service

### 🤲 Islamic Tools

- Daily Ayah
- Daily Hadith
- Daily Dua with Arabic display
- Persistent Tasbih counter and session history
- Ramadan mode foundation

### 📦 Backup & Restore

- Export all app data (locations, settings, bookmarks) as JSON
- Import from shared JSON backup
- Reset all data with confirmation

### 📍 Location and Reminders

- GPS location support and manual city search
- Browser geolocation fallback
- Saved locations and quick switching
- Automatic device timezone detection
- Travel mode preference
- Prayer reminders for the five daily prayers
- Notification tap routing back to Prayer Times
- Android notification channel configuration

### ♿ Accessibility and Privacy

- English, Urdu, Arabic and Roman Urdu preferences
- Large text mode
- High contrast preference
- Screen-reader labels for interactive Quran controls
- Local-first settings, bookmarks and reading progress
- No analytics or advertising trackers configured
- Clear privacy and permissions explanation in Settings
- Global error boundary catches all crashes gracefully

## 🧭 Navigation

```
RootNavigator (Stack)
├── Welcome (onboarding, dismissed after first launch)
├── Main (TabNavigator)
│   ├── Times       Prayer times + countdown
│   ├── Quran       Surah directory + reader + search + bookmarks
│   ├── Calendar    Monthly prayer calendar
│   ├── Tools       Ayah, Hadith, Dua, Tasbih, Ramadan
│   ├── Qibla       Compass + direction + route
│   ├── Reminders   Prayer notification settings
│   └── Settings    All preferences
├── ChangeLocation (modal)
├── Backup      (modal)
└── About       (modal)
```

### Screens

| Screen | Purpose |
|--------|---------|
| Welcome | First-time onboarding |
| Times | Prayer times with live countdown |
| Quran | Surah browser, search, continue reading |
| QuranReader | Arabic + translations, bookmarks, audio |
| QuranSearch | Search by edition (EN/UR/AR) |
| JuzDirectory | 30 Siparah browser |
| Bookmarks | Folder management + Ayah notes |
| Qibla | Compass, bearing, distance, route |
| Calendar | Monthly prayer + Hijri calendar |
| Tools | Ayah, Hadith, Dua, Tasbih, Ramadan |
| Reminders | Per-prayer notifications + lead time |
| Settings | All preferences + backup + about |
| ChangeLocation | GPS or city search |
| Backup | Export/import/reset data |
| About | Version, license, credits |

## 🛠️ Tech Stack

- Expo SDK 57
- React Native 0.86 and React 19
- React Navigation
- Zustand with AsyncStorage persistence
- Expo Location, Notifications and Audio
- React Native SVG and Poppins typography
- Aladhan API for prayer timings
- Al Quran Cloud API for Quran text, translations and search
- Islamic Network CDN for Quran recitation audio
- OpenStreetMap Nominatim fallback for city search and reverse geocoding

## 📋 Requirements

- Node.js 22.13 or newer for Expo SDK 57
- npm
- Android Studio for Android development
- Xcode 26.4 or newer for iOS development on macOS

## 🚀 Installation

```bash
npm install
```

## ▶️ Run the App

```bash
npm start
```

```bash
npm run android
```

```bash
npm run ios
```

```bash
npm run web
```

The web target is useful for UI testing. Physical compass, native GPS permissions, notifications and sustained background audio should be tested on an Android or iOS development build.

## Project Structure

```text
.
├── App.js
├── app.json
├── jest.config.js
├── assets/
├── tests/
│   └── utils.test.js
└── src/
    ├── components/       Reusable UI components (ErrorBoundary added)
    ├── hooks/            Location, heading and clock hooks
    ├── navigation/       Root, tab and Quran navigation (Backup, About routed here)
    ├── screens/          App screens and feature workspaces (Bookmarks, Backup, About added)
    ├── services/         Prayer, Quran, location and notification APIs
    ├── store/            Persisted Zustand application state
    ├── theme/            Colors, spacing, shadows and typography
    └── utils/            Prayer, Quran, time and Qibla calculations
```

## 🔐 Permissions

Mihrab may request permissions only when the related feature needs them:

- Location for GPS prayer times, Qibla calculation and timezone-aware location data
- Notifications for prayer reminders
- Compass/orientation for live Qibla direction
- Audio playback for Quran recitation and background playback

Manual city search remains available when location permission is denied.

## 🛡️ Data and Privacy

Mihrab is designed around local-first behavior:

- App preferences are stored locally with AsyncStorage
- Quran API responses are cached locally for resilient reading
- Bookmarks and reading progress stay on the device
- Location data is used for prayer and Qibla calculations
- No authentication or cloud account is required for core use
- No analytics or advertising SDK is configured

External services are used for live data when required. Review their terms and rate limits before production distribution.

## ⚠️ Current Limitations

- A physical compass is not available in most desktop browsers
- Browser GPS requires permission and a secure context or localhost
- Custom Azan audio is not bundled; notification playback currently uses the system sound
- Full app-wide translation of every label is not complete yet
- Cloud account sign-in, bookmark sync and remote device backup require a backend/auth provider
- Full offline audio download management is planned; Surah audio currently streams with background playback support
- Ramadan Sehri/Iftar scheduling needs a dedicated fasting calendar integration for production accuracy

## 🗺️ Roadmap

- Complete app-wide localization (English, Urdu, Arabic, Roman Urdu UI)
- Add offline Quran and audio download manager
- Add custom licensed Azan audio options
- Add full Ramadan calendar, Sehri and Iftar countdowns
- Add optional authentication and encrypted cloud sync
- Prepare Android and iOS production builds

## 🧪 Testing

```bash
npm test
```

Unit tests cover prayer calculations, Qibla math, time formatting, and Quran utilities.

## 🧑‍💻 Development Notes

This project follows the versioned Expo SDK 57 documentation. Read [AGENTS.md](AGENTS.md) before changing Expo-specific code.

Keep feature logic inside the existing ownership boundaries:

- UI belongs in `src/screens` and `src/components`
- Network calls belong in `src/services`
- Persisted state belongs in `src/store`
- Calculations and pure helpers belong in `src/utils`
- Shared visual tokens belong in `src/theme`
- Error handling is wrapped in `src/components/ErrorBoundary`

## License

Mihrab is released under the [MIT License](LICENSE).

---

Built with care for quieter, more focused daily worship. 🌙
