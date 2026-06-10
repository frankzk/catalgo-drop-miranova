# Panel de administración — Guía de instalación (una sola vez)

El panel vive en **`https://frankzk.github.io/catalgo-drop-miranova/admin/`** y
permite agregar/editar productos y subir fotos con formularios. Los cambios se
guardan en el repositorio y el catálogo se actualiza solo (~1 minuto).

Como el sitio es estático (sin servidor), para que el panel pueda **guardar en
GitHub de forma segura** hace falta un pequeño “servicio de acceso” (OAuth)
gratuito. Se configura **una sola vez**. Sigue estos 3 pasos.

---

## Paso 1 — Crear la app de acceso en GitHub (OAuth App)

1. Entra a: **https://github.com/settings/developers** → pestaña **OAuth Apps**
   → **New OAuth App**.
2. Llena:
   - **Application name:** `Catálogo Drop Miranova Admin`
   - **Homepage URL:** `https://frankzk.github.io/catalgo-drop-miranova/`
   - **Authorization callback URL:** `https://TU-AUTH.workers.dev/callback`
     *(esta URL la tendrás en el Paso 2; puedes volver a editarla después).*
3. **Register application.**
4. Copia el **Client ID** y genera un **Client secret** (botón *Generate a new
   client secret*). Guárdalos: los usarás en el Paso 2.

---

## Paso 2 — Servicio de acceso (Cloudflare Worker, gratis)

Usamos el proyecto oficial **`sveltia-cms-auth`** (un mini servicio que conecta
el panel con GitHub). Es gratis y no requiere mantenimiento.

1. Crea una cuenta gratis en **https://dash.cloudflare.com** (si no tienes).
2. Abre **https://github.com/sveltia/sveltia-cms-auth** y usa el botón
   **“Deploy to Cloudflare Workers”** (o despliégalo con Wrangler siguiendo su
   README).
3. En el Worker, configura las **variables de entorno**:
   - `GITHUB_CLIENT_ID` = el Client ID del Paso 1
   - `GITHUB_CLIENT_SECRET` = el Client secret del Paso 1
   - `ALLOWED_DOMAINS` = `frankzk.github.io`
4. Cuando termine, Cloudflare te da una URL tipo
   `https://sveltia-cms-auth.TU-USUARIO.workers.dev`.
   - Vuelve al Paso 1 y pon como **callback**:
     `https://sveltia-cms-auth.TU-USUARIO.workers.dev/callback`
   - Copia esa URL base (sin `/callback`).

5. Edita el archivo **`admin/config.yml`** de este repositorio y reemplaza la
   línea `base_url:` con tu URL del Worker:
   ```yml
   base_url: https://sveltia-cms-auth.TU-USUARIO.workers.dev
   ```
   *(Lo puedes editar desde la web de GitHub: abre el archivo → lápiz → Commit.)*

---

## Paso 3 — Dar acceso a tu socia

1. En el repositorio: **Settings → Collaborators → Add people** → agrega a tu
   socia por su usuario o correo de GitHub. Ella acepta la invitación que le
   llega por correo.
2. Listo. Tu socia entra a **`https://frankzk.github.io/catalgo-drop-miranova/admin/`**,
   pulsa **“Sign in with GitHub”**, autoriza una vez, y ya puede:
   - Elegir país (Honduras / Costa Rica / Guatemala).
   - **Agregar producto**, escribir título, precios y categoría, **subir la foto**.
   - Guardar (**Publish**) → el catálogo se actualiza solo en ~1 minuto.

---

## Notas

- **Fotos:** sube fotos limpias del producto (idealmente cuadradas). Se guardan
  en `miranova/data/images/`.
- **Si reemplazas una foto** por otra con el **mismo nombre**, puede tardar en
  verse por la caché; usa un nombre distinto o sube el número `imageVersion` en
  `miranova/config.js`.
- **Rama de publicación:** el panel guarda en la rama `claude/new-session-pm108s`
  (la que publica el sitio). Si algún día cambias a `main`, actualiza `branch:`
  en `admin/config.yml`.
- El panel **no necesita Claude** para nada: una vez configurado, funciona solo.
