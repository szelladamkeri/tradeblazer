# SQL Injection elleni védekezés

## Problémák
- A backend kód sebezhető az SQL injection támadásokkal szemben, mivel a felhasználói bemenetek nincsenek megfelelően szűrve.
- Dinamikus SQL lekérdezések készülnek előkészített utasítások nélkül, ami lehetővé teszi a rosszindulatú kód bejuttatását.
- A bemenet validáció hiányosságai miatt a támadó képes manipulálni az adatbázist.

## Javítási javaslatok
1. Módosítsuk a dinamikus SQL lekérdezéseket úgy, hogy előkészített (paraméterezett) utasításokat használjunk.
2. Implementáljunk szigorú bemeneti validációt minden olyan felhasználói adat esetében, amely SQL lekérdezésbe kerül.
3. Használjunk ORM keretrendszereket, amelyek alapból védelmet nyújtanak az SQL injection ellen.
4. Végezzen rendszeres biztonsági auditokat és penetrációs teszteket a sebezhetőségek azonosítására és elhárítására.