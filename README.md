# Digital Library Backend

Este proyecto es un backend desarrollado con [NestJS](https://nestjs.com/) que utiliza una base de datos MongoDB local.

## Requisitos previos

- [Node.js](https://nodejs.org/) (recomendado v18 o superior)
- [npm](https://www.npmjs.com/) (se instala junto con Node.js)
- [MongoDB](https://www.mongodb.com/try/download/community) (instancia local corriendo en el puerto 27017)

## Pasos para ejecutar el proyecto en local

1. **Clona el repositorio y accede a la carpeta del backend:**

   ```bash
   git clone <url-del-repositorio>
   cd digital-library-backend
   ```

2. **Instala las dependencias:**

   ```bash
   npm install
   ```

3. **Configura las variables de entorno:**
   - Copia el archivo `.env` de ejemplo (si existe) o crea uno nuevo en la raíz del proyecto.
   - Asegúrate de definir correctamente las variables necesarias, especialmente la conexión a MongoDB (`MONGODB_URI`).
   - **Importante:** No compartas el contenido de tu `.env` en repositorios públicos ni lo subas a control de versiones.

   Ejemplo de variables mínimas necesarias:

   ```env
   MONGODB_URI=mongodb://localhost:27017/digital-library-dev
   JWT_SECRET=tu_secreto_jwt
   SESSION_SECRET=tu_secreto_sesion
   PORT=3000
   NODE_ENV=dev
   FRONTEND_URL=http://localhost:4200
   ```

4. **Arranca el servidor en modo desarrollo:**

   ```bash
   npm run dev
   ```

   El backend estará disponible en `http://localhost:3000`.

## Scripts útiles

- `npm run dev`: Inicia el servidor en modo desarrollo con recarga automática.
- `npm run build`: Compila el proyecto.
- `npm run test`: Ejecuta los tests.

## Notas de seguridad

- **Nunca subas tu archivo `.env` a un repositorio público.**
- Cambia los valores de los secretos por otros personalizados en tu entorno local.

## Contacto

Para dudas o problemas, contacta con el responsable del proyecto jerogassan@gmail.com
