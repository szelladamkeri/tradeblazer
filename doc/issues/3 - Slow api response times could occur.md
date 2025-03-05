# Lassú API hívások problémája

## Problémák
- Az API hívások túl hosszú ideig futhatnak, így a felhasználói élmény csökken.
- Hiányzik a megfelelő hiba- és timeout kezelési logika, ami miatt a felhasználói interfész lefagyhat.
- Nem alkalmazott cache mechanizmus miatt ismétlődő kérés esetén feleslegesen terheljük a szervert.

## Javítási javaslatok
1. Implementáljunk időkorlátot és retry mechanizmust az API hívásokhoz.
2. Vizsgáljuk meg a backend teljesítményét és szükség szerint optimalizáljuk annak válaszidejét.
3. Használjunk caching megoldást, például Vuex vagy más kliens oldali cache réteget, hogy csökkentsük a hálózati kérések számát.
4. Frissítsük a felhasználói értesítéseket, hogy a lassú válaszidő esetén megfelelő visszajelzést kapjanak.
