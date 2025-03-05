# Hibás adatkezelés

## Problémák
- Hibás adatbinding miatt a komponensek nem jelenítik meg az aktuális adatokat.
- Az adatvalidáció logikája hiányos, így érvénytelen adatok kerülnek feldolgozásra.
- A komponensek nem reagálnak megfelelően az adatok megváltozására.

## Javítási javaslatok
1. Ellenőrizzük a Vue template-ekben és a computed properties-ben lévő adatbinding-ot.
2. Implementáljunk szigorúbb adatvalidációs szabályokat minden form input esetében.
3. Vizsgáljuk meg, hogy a Vue reaktív rendszer megfelelően működik-e minden komponensben.
4. Adjuk hozzá a szükséges egységteszteket annak érdekében, hogy az adatkezelési hibákat korábban észrevegyük.

# Várt működés:
- Az adatok frontendnek és backendnek elvárhatóan működnek