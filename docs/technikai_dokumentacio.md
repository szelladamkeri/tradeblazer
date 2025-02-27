# TradeBlazer Technikai Dokumentáció

## Technológiák

### Frontend

- Vue.js 3 (Composition API)
- TypeScript
- Tailwind CSS
- FontAwesome ikonok
- Pinia (állapotkezelés)

### Backend

- Node.js
- Express

## Oldalak

### Főoldal (/)

Kezdőoldal dashboard jelleggel, ahol a felhasználó láthatja:

- Aktuális portfólió értékét (terv)
- Aktív kereskedéseket (terv)
- Teljesítmény grafikonokat (példa megvan)

### Kereskedések (/trades)

Kereskedések kezelése és áttekintése:

- Új kereskedés létrehozása
- Aktív kereskedések listája
- Kereskedési előzmények
- Szűrési és rendezési lehetőségek

### Portfólió (/portfolio)

Részletes portfólió áttekintés:

- Eszközök megoszlása
- Teljesítmény mutatók
- PnL (Profit és Veszteség) kimutatás

## API Végpontok

### Autentikáció

```
POST /api/auth/login
POST /api/auth/register
POST /api/auth/logout
```

### Kereskedések

```
GET /api/trades
POST /api/trades
PUT /api/trades/:id
DELETE /api/trades/:id
```

### Portfólió

```
GET /api/portfolio
GET /api/portfolio/performance
GET /api/portfolio/statistics
```

## Felhasználói szerepkörök

### Alap felhasználó

- Kereskedések létrehozása és kezelése
- Portfólió megtekintése
- Saját profil kezelése

### Admin

- Felhasználók kezelése
- Rendszerbeállítások módosítása
- Teljes hozzáférés minden funkcióhoz

## Biztonság

- JWT alapú autentikáció
- Bcrypt jelszó titkosítás
- Rate limiting a API végpontokon
- Input validáció és sanitizáció

## Tesztelés

Unit és integrációs tesztek:

- Vitest (Unit tesztek)
- Cypress (E2E tesztek)

## Következő fejlesztések

- Valós idejű árfolyam adatok integrálása
- Mobilbarát felület optimalizálása
- Automatizált kereskedési stratégiák implementálása
- Közösségi funkciók bevezetése
