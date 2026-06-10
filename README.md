# Catálogo proveedor · Vitrina de dropshipping

Web **100% estática** (HTML + CSS + JS puro, sin frameworks ni backend) donde tus
**revendedores** ven tus productos y, por cada uno, pulsan **"Conectar en Boxville"**
para importarlo a su tienda.

> No es una tienda para el cliente final: **no hay carrito, ni pedidos por WhatsApp,
> ni descuentos, ni pago contra entrega.** Es una vitrina/catálogo.

Los productos se cargan **en vivo** desde la **Storefront API de Shopify** usando un
token público de solo lectura. Todo se configura por tienda en un único `config.js`.

---

## Estructura (multi-tienda)

```
/
├─ app.js                 ← motor compartido (NO se edita por tienda)
├─ styles.css             ← estilos compartidos (NO se edita por tienda)
├─ index.html             ← raíz: redirige a la tienda principal (miranova)
├─ .nojekyll              ← evita el procesado Jekyll en GitHub Pages
├─ .github/workflows/
│   └─ deploy-pages.yml   ← auto-deploy a GitHub Pages en cada push a main
│
├─ miranova/              ← TIENDA 1 (principal)
│   ├─ index.html         ← referencia ../app.js y ../styles.css
│   ├─ config.js          ← TODO lo de esta tienda se edita aquí
│   └─ data/boxville.json ← respaldo opcional (boxvilleSource:"list")
│
└─ kenku/                 ← TIENDA 2 (segundo ejemplo)
    ├─ index.html
    ├─ config.js
    └─ data/boxville.json
```

Cada tienda vive en `.../<repo>/<tienda>/`. Para **agregar una tienda** ver más abajo.

---

## Puesta en marcha rápida

1. Edita `miranova/config.js`:
   - `shopifyDomain`: tu dominio `algo.myshopify.com`.
   - `storefrontToken`: token **público** de la Storefront API (ver abajo).
   - `boxvilleSource`: cómo se arma el link de Boxville (`metafield` | `pattern` | `list`).
2. Haz `commit` + `push` a `main`. El workflow publica solo en GitHub Pages.
3. Abre la URL de Pages (p. ej. `https://USUARIO.github.io/REPO/`).

---

## Obtener el token Storefront (público, solo lectura)

1. En el admin de Shopify: **Configuración → Apps y canales de venta →
   Desarrollar apps** (Develop apps).
2. **Crear una app** (Create an app) → ponle un nombre (ej. "Catálogo proveedor").
3. Pestaña **Configuration → Storefront API** → **Configure** y marca los permisos:
   - `unauthenticated_read_product_listings` (obligatorio: leer productos).
   - `unauthenticated_read_product_inventory` (recomendado: para `quantityAvailable`).
4. **Install app** y copia el **Storefront API access token** (campo público).
   Pégalo en `storefrontToken` dentro de `config.js`.

> El token Storefront es **público y de solo lectura**: es seguro publicarlo en el
> JS del sitio (es justo lo que hace cualquier storefront headless de Shopify).
> Aun así, NO uses nunca el token de **Admin API** aquí.

### Resiliencia con `quantityAvailable`

`quantityAvailable` requiere el permiso `unauthenticated_read_product_inventory`.
Si tu token **no** lo tiene, la query fallaría entera. El motor lo resuelve solo:
intenta la query **con** `quantityAvailable` y, si la API devuelve `errors`,
**reintenta la misma query sin ese campo**, para que el catálogo igual cargue.

- Se muestran solo productos con **inventario positivo** (`quantityAvailable > 0`).
- Se ocultan los de `0` o negativos.
- Si `quantityAvailable` viene `null` (inventario no rastreado), **se muestra igual**.
- Orden por **más vendidos** (`sortKey: BEST_SELLING`).
- Los productos **sin imagen** se empujan al final (orden estable).

---

## El link de Boxville (lo central)

Cada producto tiene un botón **"Conectar en Boxville"** hacia su página exacta.
Elige **una** de estas 3 fuentes en `config.js` (`boxvilleSource`):

### 1) `metafield` (recomendado)
Lee un metacampo del producto en Shopify y usa su valor como URL:

```js
boxvilleSource: "metafield",
boxvilleMetafield: { namespace: "custom", key: "boxville_url" },
```

En Shopify creas el metacampo de producto **`custom.boxville_url`** (tipo URL/Texto)
y pones ahí el enlace de cada producto en Boxville.

### 2) `pattern`
Arma la URL con datos del producto. Comodines: `{sku}`, `{handle}`, `{id}`.

```js
boxvilleSource: "pattern",
boxvilleUrlPattern: "https://boxville.com/p/{sku}",
```

### 3) `list`
Usa un JSON de respaldo `data/boxville.json` con `{ sku|handle|id: url }`:

```js
boxvilleSource: "list",
boxvilleListPath: "data/boxville.json",
```

```json
{ "81243739": "https://boxville.com/p/antiage-serum" }
```

> Si un producto **no** tiene link de Boxville, el botón se **oculta** en la tarjeta
> y se muestra **deshabilitado** en el detalle.

---

## Opciones de `config.js`

```js
window.CATALOG_CONFIG = {
  storeName:  "MIRANOVA",                 // nombre de marca (cabecera + tarjetas)
  brandAvatar: "",                         // URL de logo redondo (opcional)
  headline:   "Salud y bienestar natural", // titular (opcional)
  tagline:    "Catálogo proveedor para revendedores",
  subtitle:   "Vitrina de dropshipping",

  shopifyDomain:     "algo.myshopify.com",
  storefrontToken:   "TOKEN_PUBLICO",
  shopifyApiVersion: "2025-10",

  showPrice: false,                        // true = muestra precio (entero, miles con punto)

  boxvilleSource:     "metafield",         // "metafield" | "pattern" | "list"
  boxvilleMetafield:  { namespace: "custom", key: "boxville_url" },
  boxvilleUrlPattern: "https://boxville.com/p/{sku}",
  boxvilleListPath:   "data/boxville.json",

  ctaText: "Conectar en Boxville"
};
```

### Precio (opcional)
Con `showPrice: true` se muestra el precio como **entero con separador de miles con
punto** y símbolo según el `currencyCode` de Shopify
(ej. `₡16.900`, `S/ 59`, `$19`, `L 915`).

---

## Categorías y buscador

- Cada producto se clasifica por **palabras clave** (título + descripción + tipo) en
  un set fijo y ordenado: **Todos, Suplementos, Belleza, Hogar y cocina, Otros**.
  Solo aparecen los chips que **tengan productos**.
- El **buscador** filtra por título y descripción.
- Toca una tarjeta para abrir el **detalle** (hoja inferior): carrusel de hasta 4
  imágenes con puntitos, reseña corta (~220 caracteres de la descripción) y el botón
  de Boxville. Se cierra con la **X**, tocando fuera o **deslizando hacia abajo**.

Para ajustar las reglas de categorías, edita `CATEGORY_RULES` al inicio de `app.js`.

---

## Agregar una tienda nueva

1. Copia la carpeta `miranova/` con un nombre nuevo, p. ej. `mitienda/`.
2. Edita `mitienda/config.js` (dominio, token, marca, fuente de Boxville).
3. (Opcional) Cambia el destino del redirect en el `index.html` de la raíz.
4. `commit` + `push` a `main`. Quedará en `.../REPO/mitienda/`.

> `mitienda/index.html` referencia `../app.js` y `../styles.css` (motor compartido):
> no dupliques esos archivos.

---

## Detalles técnicos ya resueltos

- **`[hidden]` global**: en `styles.css` está `[hidden]{display:none!important;}` para
  que el atributo `hidden` siempre oculte (aunque una clase use `display:flex`).
- **Cache-busting**: los assets se referencian con `?v=N`
  (`styles.css?v=1`, `app.js?v=1`, `config.js?v=1`). **Sube el número en cada cambio**
  o el navegador servirá versiones viejas.
- **Sanitización**: títulos y descripciones se escapan con `escapeHtml` antes de
  inyectarlos en el HTML.

---

## GitHub Pages — configuración

1. El repo debe tener `main` como **rama por defecto**.
2. **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. **Settings → Environments → `github-pages` → Deployment branches**: permite `main`
   (si no, el deploy falla por *environment protection rules*).
4. Cada `push` a `main` ejecuta `.github/workflows/deploy-pages.yml` y publica el sitio.

---

## Desarrollo local

Sírvelo con cualquier servidor estático (no abras `file://`, la API necesita `http`):

```bash
python3 -m http.server 8080
# luego abre http://localhost:8080/miranova/
```
