# Nem megengedett karakterek regisztrálásnál

# A következők a problémák:
- Hossz nincs ellenőrizve sehol
- Jelszóba akármilyen karakter belekerülhet, space-ek is
- Email csak frontenden van leellenőrözve
- Nincsenek tisztítva a bemenetek esetleges támadások ellen, vagy kellemetlenségek ellen

# Teendők:
- server.js-ben a regisztrációt ellenőzizni minden ponton

# Várt működés:
- A felhasználó visszajelzést kap minden nem megengedett művelet után

# Esetleges kép:
[Demonstráló kép](/path/to/image)