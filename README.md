# Herbock - Mitarbeiter & Projekt App

Eine umfassende mobile Anwendung für Mitarbeiterverwaltung und Projektmanagement im Baugewerbe.

## 📱 Projektübersicht

Diese App besteht aus drei Hauptmodulen:

### Modul 1: Mitarbeiter-App (Frontend)
- **Login & Profil**: Authentifizierung und Spracheinstellungen
- **Dashboard**: Zentrale Übersicht mit Live-Widgets
  - Persönliche Begrüßung
  - Live-Zeiterfassung
  - Benachrichtigungs-Center
  - Wochenstunden-Übersicht
  - Schnellzugriff-Menü
- **Zeiterfassung**: Live-Timer und manuelle Nacherfassung
- **HR-Bereich**: Urlaubsanträge und Lohnabrechnungen

### Modul 2: Projekt-App (Operativ)
- **Projekt-Liste**: Übersicht aller zugewiesenen Projekte
- **Projekt-Chat**: Kommunikation mit Push-Benachrichtigungen
- **Dynamisches Aufmaß**: Excel-basierte Datenerfassung
- **Mängel & Restarbeiten**: KI-gestützte Dokumentation
  - Plan-View mit zoombarem PDF-Grundriss
  - Sprachaufnahme in Muttersprache
  - Automatische Übersetzung (GPT-4)
- **Dokumentation**: Foto-Galerie und Brandschutz

### Modul 3: Backend (Verwaltung)
- Projekt-Administration
- Daten & Export
- Personal & HR Management

## 🛠️ Tech Stack

- **Framework**: Expo SDK 54
- **UI Library**: React Native Paper
- **Navigation**: Expo Router (File-based)
- **State Management**: Zustand
- **Language**: TypeScript
- **HTTP Client**: Axios
- **Storage**: AsyncStorage
- **Icons**: MaterialCommunityIcons

## 📁 Projektstruktur

```
herbock/
├── app/                          # Expo Router Screens
│   ├── _layout.tsx              # Root Layout
│   ├── index.tsx                # Entry Point
│   ├── auth/                    # Authentifizierung
│   │   └── login.tsx
│   ├── employee/                # Modul 1: Mitarbeiter-App
│   │   ├── _layout.tsx          # Tab Navigation
│   │   ├── dashboard/
│   │   ├── timetracking/
│   │   └── hr/
│   └── project/                 # Modul 2: Projekt-App
│       ├── _layout.tsx          # Stack Navigation
│       ├── list/
│       ├── chat/
│       ├── measurement/
│       ├── defects/
│       └── documentation/
├── components/                  # Wiederverwendbare Komponenten
│   ├── employee/
│   │   ├── DashboardHeader.tsx
│   │   ├── LiveTimeTracking.tsx
│   │   ├── NotificationCenter.tsx
│   │   ├── WeeklyStats.tsx
│   │   └── QuickAccessMenu.tsx
│   ├── project/
│   └── shared/
├── store/                       # Zustand State Management
│   ├── authStore.ts
│   └── timeTrackingStore.ts
├── types/                       # TypeScript Definitionen
│   └── index.ts
├── constants/                   # Konstanten
│   ├── colors.ts
│   ├── sizes.ts
│   └── index.ts
├── services/                    # API Services
│   ├── api/
│   └── auth/
└── utils/                       # Hilfsfunktionen
```

## 🚀 Installation & Setup

### Voraussetzungen

- Node.js (v18 oder höher)
- npm oder yarn
- Expo Go App auf dem Smartphone (für Testing)

### Installation

```bash
# Dependencies installieren
npm install

# Expo Development Server starten
npm start
```

### App auf dem Gerät testen

1. Installiere die **Expo Go** App aus dem App Store (iOS) oder Play Store (Android)
2. Starte den Development Server mit `npm start`
3. Scanne den QR-Code mit der Expo Go App

### Plattform-spezifische Entwicklung

```bash
# Android
npm run android

# iOS (nur auf macOS)
npm run ios

# Web
npm run web
```

## 🔐 Login-Credentials (Mock)

Für die Entwicklungsphase kannst du dich mit beliebigen Credentials anmelden:

- **E-Mail**: beliebig@example.com
- **Passwort**: beliebig

## 🎨 Design System

### Farben

- **Primary**: `#2563eb` (Blau)
- **Secondary**: `#7c3aed` (Lila)
- **Success**: `#10b981` (Grün)
- **Warning**: `#f59e0b` (Orange)
- **Error**: `#ef4444` (Rot)

### Abstände & Größen

Definiert in `constants/sizes.ts`:
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px
- xxl: 48px

## 📝 Nächste Schritte

### Priorität 1: Kernfunktionalitäten
- [ ] Backend-API Integration
- [ ] Echte Authentifizierung implementieren
- [ ] Zeiterfassung vervollständigen
- [ ] Projekt-Details View

### Priorität 2: Erweiterte Features
- [ ] KI-Integration für Mängel-Modul (Whisper + GPT-4)
- [ ] Projekt-Chat mit Echtzeit-Updates
- [ ] Dynamisches Aufmaß mit Excel-Engine
- [ ] PDF-Grundriss Viewer mit Pin-Markierungen

### Priorität 3: Polish
- [ ] Offline-Modus
- [ ] Push-Benachrichtigungen
- [ ] Biometrische Authentifizierung
- [ ] Dark Mode
- [ ] Multi-Language Support (DE, PL, RU, EN)

## 🧪 Testing

```bash
# Unit Tests (wenn konfiguriert)
npm test

# Type Check
npx tsc --noEmit
```

## 📦 Build für Produktion

```bash
# Build für Android
npx eas build --platform android

# Build für iOS
npx eas build --platform ios

# Build für beide Plattformen
npx eas build --platform all
```

## 🤝 Beitragen

1. Feature Branch erstellen (`git checkout -b feature/AmazingFeature`)
2. Änderungen committen (`git commit -m 'Add some AmazingFeature'`)
3. Branch pushen (`git push origin feature/AmazingFeature`)
4. Pull Request erstellen

## 📄 Lizenz

Proprietary - Alle Rechte vorbehalten

## 📞 Kontakt

Bei Fragen oder Problemen wenden Sie sich bitte an das Entwicklungsteam.

---

**Erstellt mit ❤️ für Herbock**
