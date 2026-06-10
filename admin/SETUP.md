# Panel de administración — Guía (versión simple, sin servidor)

El panel vive en **`https://frankzk.github.io/catalgo-drop-miranova/admin/`** y
permite agregar/editar/eliminar productos y subir fotos con formularios. Al
guardar, el catálogo se actualiza solo en ~1 minuto.

No usa Cloudflare ni OAuth. Solo hace falta **una “clave de acceso”** (un token
de GitHub) que se pega **una sola vez** en el navegador y queda guardada en ese
dispositivo. Después, tu socia solo abre la página y entra directo.

---

## Paso 1 — Generar la clave de acceso (una vez, lo hace el administrador)

1. Entra (con la cuenta dueña del repositorio) a:
   **https://github.com/settings/personal-access-tokens/new**
   *(Settings → Developer settings → Personal access tokens → Fine-grained tokens).*
2. Llena:
   - **Token name:** `Panel Catálogo Miranova`
   - **Expiration:** lo que prefieras (ej. 1 año, o “No expiration”).
   - **Resource owner:** tu usuario (frankzk).
   - **Repository access:** *Only select repositories* → elige
     **`catalgo-drop-miranova`**.
   - **Permissions → Repository permissions → Contents:** ponlo en
     **Read and write**. *(Solo ese permiso; nada más.)*
3. **Generate token** y **copia** la clave (empieza con `github_pat_…`).
   ⚠️ Guárdala como una contraseña: no la compartas en público.

---

## Paso 2 — Dejar el panel listo en el teléfono/compu de tu socia

1. En el dispositivo de tu socia, abre
   **`https://frankzk.github.io/catalgo-drop-miranova/admin/`**
2. Pega la clave del Paso 1 en **“Clave de acceso”** y pulsa **Entrar**.
3. ¡Listo! Queda guardada en ese navegador. **Ya no la tendrá que escribir** —
   cada vez que abra esa página entra directo.

> Recomendación: que tu socia le ponga **acceso directo** a esa página en la
> pantalla de inicio de su teléfono (menú del navegador → “Agregar a inicio”).
> Así la abre como si fuera una app.

---

## Cómo se usa (tu socia)

1. Elige el país arriba (🇭🇳 / 🇨🇷 / 🇬🇹).
2. **+ Agregar producto** → escribe título, precios y categoría, **sube la foto**,
   y **Guardar**. (Para editar o borrar, usa los botones de cada producto.)
3. En ~1 minuto el catálogo público queda actualizado.

---

## Seguridad y mantenimiento

- La clave es como una contraseña con permiso de **solo este repositorio** y
  **solo contenido** (no puede tocar otras cosas de tu GitHub).
- Vive únicamente en el navegador de tu socia (no se sube al sitio).
- **Si se filtra o quieres cortar el acceso:** entra a
  https://github.com/settings/personal-access-tokens , **revoca** el token y
  genera uno nuevo (repite el Paso 2). El anterior deja de funcionar al instante.
- El panel **no necesita Claude** para nada: funciona solo.

---

## Notas

- **Fotos:** sube fotos limpias del producto (idealmente cuadradas). Se guardan
  en `miranova/data/images/`.
- **Rama de publicación:** el panel guarda en `claude/new-session-pm108s`
  (la rama que publica el sitio). Si algún día cambias a `main`, actualiza la
  constante `BRANCH` al inicio del `<script>` en `admin/index.html`.
