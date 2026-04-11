# GuardianKids Privacy Demo

Prototipo interactivo de una plataforma de privacidad infantil con datos de prueba.

## Funcionalidades

- Búsqueda de publicaciones por nombre del niño.
- Simulación de reconocimiento facial AI sobre dataset sintético.
- Escaneo simulado en redes públicas (Instagram, TikTok y Facebook).
- Mapa geográfico de hallazgos con enlaces de solicitud de borrado.
- Dashboard para padres con métricas y alertas de nuevos posts.

## Ejecutar localmente

Como es un sitio estático, puedes abrir `index.html` directamente o usar un servidor simple:

```bash
python3 -m http.server 8000
```

Luego visita: `http://localhost:8000`

## Despliegue público (demo)

Este repo está preparado para desplegarse como demo pública en hosting estático:

### Opción A: GitHub Pages

1. Sube este repo a GitHub.
2. Ve a **Settings → Pages**.
3. En **Build and deployment**, selecciona **Deploy from a branch**.
4. Elige la rama `main` y carpeta `/root`.
5. Tu demo quedará pública en una URL como:
   `https://<tu-usuario>.github.io/<tu-repo>/`

### Opción B: Netlify / Vercel

- Importa el repositorio y configura el directorio raíz en `/`.
- No requiere build command.

## Aviso

⚠️ Esta demo no consume APIs reales ni procesa biometría real. Todos los perfiles y publicaciones son datos sintéticos de prueba.


## Roadmap MVP real

- Ver diseño funcional/técnico en `docs/MVP_ARCHITECTURE.md`.

- Documento backend detallado: `docs/BACKEND_MVP_ARCHITECTURE_ES.md`.


## Backend MVP foundation

El backend NestJS base está en `apps/api` con Prisma, BullMQ, políticas RBAC+ABAC y migraciones iniciales con RLS.

Comandos rápidos:

```bash
cp apps/api/.env.example apps/api/.env
docker compose -f docker-compose.backend.yml up -d
cd apps/api
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run start:dev
npm run test:e2e
```
