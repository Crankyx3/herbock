# Herbock Backend API

Backend API für die Herbock Employee & Project Management App.

## Technologie-Stack

- **Node.js** + **Express** - Web Framework
- **TypeScript** - Type Safety
- **PostgreSQL** - Datenbank
- **Prisma** - ORM für Datenbankzugriff
- **JWT** - Authentication
- **Multer** - File Upload
- **bcrypt** - Password Hashing

## Features

- ✅ User Authentication (Register, Login, JWT)
- ✅ Projekt-Management (CRUD)
- ✅ Raum-Verwaltung mit Grundrissen
- ✅ Mängel-Management mit GPS-Koordinaten
- ✅ File Upload (Bilder, PDFs, Audio)
- ✅ Mehrsprachigkeit (DE, PL, RU, EN)
- ✅ Rollen-System (Employee, Admin, Manager)

## Installation

### 1. Abhängigkeiten installieren

```bash
npm install
```

### 2. Umgebungsvariablen konfigurieren

Erstellen Sie eine `.env` Datei im Root-Verzeichnis:

```bash
cp .env.example .env
```

Passen Sie die `.env` Datei an:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/herbock?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Server
PORT=3000
NODE_ENV=development
```

### 3. PostgreSQL Datenbank einrichten

Stellen Sie sicher, dass PostgreSQL läuft und erstellen Sie eine Datenbank:

```bash
# PostgreSQL starten (macOS mit Homebrew)
brew services start postgresql

# Oder mit Docker
docker run --name herbock-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=herbock -p 5432:5432 -d postgres

# Datenbank erstellen (falls nicht vorhanden)
createdb herbock
```

### 4. Prisma Migration ausführen

```bash
# Prisma Client generieren
npm run prisma:generate

# Datenbank-Schema erstellen
npm run prisma:migrate
```

### 5. Server starten

**Entwicklungsmodus (mit Auto-Reload):**

```bash
npm run dev
```

**Produktionsmodus:**

```bash
npm run build
npm start
```

Der Server läuft standardmäßig auf `http://localhost:3000`

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Neuen User registrieren | ❌ |
| POST | `/api/auth/login` | User einloggen | ❌ |
| GET | `/api/auth/me` | Aktuellen User abrufen | ✅ |
| PUT | `/api/auth/profile` | Profil aktualisieren | ✅ |

### Projects

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/api/projects` | Alle Projekte abrufen | ✅ | - |
| GET | `/api/projects/:id` | Projekt-Details | ✅ | - |
| POST | `/api/projects` | Neues Projekt erstellen | ✅ | Admin |
| PUT | `/api/projects/:id` | Projekt aktualisieren | ✅ | Admin |
| DELETE | `/api/projects/:id` | Projekt löschen | ✅ | Admin |

### Rooms

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/api/projects/:projectId/rooms` | Räume eines Projekts | ✅ | - |
| GET | `/api/rooms/:id` | Raum-Details | ✅ | - |
| POST | `/api/rooms` | Neuen Raum erstellen | ✅ | Admin |
| PUT | `/api/rooms/:id` | Raum aktualisieren | ✅ | Admin |
| DELETE | `/api/rooms/:id` | Raum löschen | ✅ | Admin |

### Defects

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/projects/:projectId/defects` | Mängel eines Projekts | ✅ |
| GET | `/api/defects/:id` | Mangel-Details | ✅ |
| POST | `/api/defects` | Neuen Mangel erstellen | ✅ |
| PUT | `/api/defects/:id` | Mangel aktualisieren | ✅ |
| DELETE | `/api/defects/:id` | Mangel löschen | ✅ |

### File Upload

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/upload` | Einzelne Datei hochladen | ✅ |
| POST | `/api/upload/multiple` | Mehrere Dateien hochladen | ✅ |

## Beispiel-Requests

### 1. User registrieren

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "max@example.com",
    "password": "password123",
    "firstName": "Max",
    "lastName": "Mustermann",
    "language": "DE"
  }'
```

### 2. Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "max@example.com",
    "password": "password123"
  }'
```

Response:
```json
{
  "user": { ... },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 3. Projekt erstellen (als Admin)

```bash
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Bauvorhaben Müller",
    "description": "Neubau Einfamilienhaus",
    "startDate": "2024-01-01",
    "floorPlanUrl": "/uploads/grundriss.pdf"
  }'
```

### 4. Mangel erstellen

```bash
curl -X POST http://localhost:3000/api/defects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "projectId": "project-uuid",
    "roomId": "room-uuid",
    "title": "Riss in der Wand",
    "description": "Großer Riss an der Nordwand",
    "priority": "HIGH",
    "location": {
      "x": 0.45,
      "y": 0.67,
      "floor": "EG"
    }
  }'
```

### 5. Datei hochladen

```bash
curl -X POST http://localhost:3000/api/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@/path/to/image.jpg"
```

Response:
```json
{
  "url": "/uploads/file-1234567890-123456789.jpg",
  "filename": "file-1234567890-123456789.jpg"
}
```

## Datenbank-Schema

Das vollständige Schema finden Sie in `prisma/schema.prisma`.

Wichtigste Modelle:

- **User** - Benutzer mit Rollen (Employee, Admin, Manager)
- **Project** - Projekte mit Status und Grundriss
- **Room** - Räume innerhalb eines Projekts
- **Defect** - Mängel mit GPS-Koordinaten und Priorität
- **TimeEntry** - Zeiterfassung
- **VacationRequest** - Urlaubsanträge
- **ChatMessage** - Projekt-Chat
- **Measurement** - Aufmaß-Daten

## Prisma Studio

Öffnen Sie Prisma Studio zum Verwalten der Datenbank:

```bash
npm run prisma:studio
```

Öffnet ein UI auf `http://localhost:5555`

## Development

### TypeScript kompilieren

```bash
npm run build
```

### Neue Migration erstellen

```bash
npx prisma migrate dev --name your_migration_name
```

### Datenbank zurücksetzen

```bash
npx prisma migrate reset
```

## Deployment

### Umgebungsvariablen

Stellen Sie sicher, dass diese Variablen gesetzt sind:

- `DATABASE_URL` - PostgreSQL Connection String
- `JWT_SECRET` - Sicherer Secret Key
- `PORT` - Server Port (Standard: 3000)
- `NODE_ENV` - `production`

### Build und Start

```bash
npm run build
npm start
```

## Troubleshooting

### PostgreSQL Verbindungsfehler

```bash
# PostgreSQL Status prüfen
brew services list  # macOS
systemctl status postgresql  # Linux

# PostgreSQL neu starten
brew services restart postgresql  # macOS
sudo systemctl restart postgresql  # Linux
```

### Prisma Client Fehler

```bash
# Prisma Client neu generieren
npx prisma generate
```

### Port bereits in Verwendung

```bash
# Prozess auf Port 3000 finden und beenden
lsof -ti:3000 | xargs kill -9
```

## Lizenz

MIT
