# Live DJ Room

Live DJ Room es una aplicación web en tiempo real que permite a varios usuarios colaborar como si estuvieran en un DJ virtual compartido.

Los usuarios pueden agregar canciones mediante enlaces de YouTube y reproducirlas sincronizadamente en una sola sala.

------------------------------------------------------------

¿Qué hace esta aplicación?

Live DJ Room permite:

- Agregar canciones mediante links de YouTube
- Votar canciones (modo votación)
- Agregar canciones directamente sin votar (modo libre)
- Reproducción sincronizada en tiempo real
- Admin automático (primer usuario en entrar)
- Controles de administrador:
  - Reiniciar canción
  - Saltar canción
  - Pausar
  - Reanudar
  - Limpiar playlist
  - Cambiar modo (Libre / Votación)
- Visualización de usuarios conectados
- Persistencia de canciones en JSON

------------------------------------------------------------

Modos disponibles

Modo Votación (por defecto)

- Las canciones agregadas deben alcanzar ≥ 50% de votos de los usuarios conectados.
- Cuando alcanzan el porcentaje requerido, se agregan automáticamente a la cola de reproducción.

Ejemplo:
- 4 usuarios conectados
- Se necesitan mínimo 2 votos para que la canción pase a la cola

Modo Libre

- Las canciones se agregan directamente a la cola.
- No necesitan votos.
- Ideal para sesiones rápidas o pruebas.

------------------------------------------------------------

Tecnologías utilizadas

- Node.js
- Express
- Socket.IO
- YouTube IFrame API
- HTML / CSS / JavaScript
- Almacenamiento local en JSON

------------------------------------------------------------

Estructura del proyecto

live-dj-room/

- index.js
- package.json
- data/
    - songs.json
    - state.json

- client/
    - index.html
    - style.css
    - script.js

------------------------------------------------------------

Instrucciones de ejecución (Local)

1️.-Instalar dependencias

Desde la raíz del proyecto:

npm install

2️.-Ejecutar servidor

npm start

o si no tienes script configurado:

node index.js

3️.-Abrir en navegador

http://localhost:3000

4.-Tambien puedes usar el siguiente link: https://live-dj-room.onrender.com/

------------------------------------------------------------


Ejemplos de uso

Agregar una canción

Pegar un enlace válido de YouTube como:

https://www.youtube.com/watch?v=L1Ta38LNcUE&list=RDMML1Ta38LNcUE&start_radio=1

o

https://www.youtube.com/watch?v=VlVhUbGa2pg&list=RDMML1Ta38LNcUE&index=2&pp=8AUB

La aplicación:

- Extrae automáticamente el ID
- Obtiene el título desde YouTube
- La agrega según el modo activo

Votar una canción

En modo votación:

1. Presionar el botón Vote
2. Solo se puede votar una vez por canción
3. Si alcanza ≥50%, pasa a la cola automáticamente

Cambiar el modo

Solo el admin puede:

- Presionar Switch Mode
- Alternar entre:
  - VOTING
  - FREE

⏯ Controles del Admin

Si eres el primer usuario en entrar:

- ⏮ Restart
- ⏭ Skip
- ⏸ Pause
- ▶ Play
- 🗑 Clear playlist
- 🎛 Switch Mode

------------------------------------------------------------

Posibles limitaciones

- Algunos videos pueden no reproducirse debido a:
  - Restricciones de YouTube (copyright)
  - Bloqueo por país
  - Restricción de reproducción embebida

En caso de error, la app salta automáticamente al siguiente video.

------------------------------------------------------------

Notas técnicas importantes

- Solo existe una sala global
- El admin es el primer usuario en entrar
- Si el admin se desconecta, el rol pasa automáticamente al siguiente usuario conectado
- El estado se guarda en:
  - songs.json
  - state.json

------------------------------------------------------------

Resultado Final

Live DJ Room es una aplicación colaborativa en tiempo real que simula una experiencia de DJ compartido donde los usuarios pueden decidir qué se reproduce mediante votación o agregar música libremente.

Perfecta para:

- Reuniones virtuales
- Fiestas online
- Pruebas técnicas de WebSockets
- Proyectos escolares
- Portafolio fullstack

------------------------------------------------------------

## Autor
**Donovan Yanci Díaz González**  
Estudiante de programación

