# API végpontok hiányos autentikációja és korlátlan hozzáférése

## Problémák
- Az API hívások nem végeznek megfelelő hitelesítési ellenőrzést, így bárki hozzáférhet az érzékeny végpontokhoz.
- Hiányzik a jogosultság-ellenőrzési mechanizmus, ami lehetővé teszi, hogy nem engedélyezett felhasználók műveleteket hajtsanak végre.
- A rendszer nem korlátozza, mely felhasználók hívhatják meg az egyes végpontokat, így a támadók kihasználhatják a sebezhetőségeket.

## Javítási javaslatok
1. Implementáljuk az API hitelesítési rétegét, például JWT tokenek vagy OAuth2 használatával, hogy minden kérés ellenőrizve legyen.
2. Hozzunk létre részletes jogosultság-kezelést (RBAC), amely meghatározza, hogy mely felhasználók hajthatnak végre mely műveleteket.
3. Vezessünk be validációs és monitorozási megoldásokat, hogy a nem engedélyezett hozzáférési kísérletek azonnal kimutathatók legyenek.
4. Dokumentáljuk a hitelesítési eljárásokat és a rendszer biztonsági irányelveit, hogy a fejlesztők és a rendszergazdák tisztában legyenek a szükséges protokollokkal.
5. Végezzen rendszeres biztonsági auditokat és penetration teszteket a sebezhetőségek feltérképezése érdekében.