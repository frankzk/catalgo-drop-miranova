/* ==========================================================================
   config.js — Tienda: MIRANOVA  (vitrina de proveedor dropshipping)
   Edita SOLO este archivo para esta tienda. No toques app.js ni styles.css.
   --------------------------------------------------------------------------
   MODO ACTUAL: "static" → muestra los productos de data/products.json
   (vista previa sin necesitar la tienda Shopify todavía).

   Para pasar a Shopify EN VIVO más adelante:
     1) productsSource: "shopify"
     2) shopifyDomain + storefrontToken (ver README → "Obtener el token Storefront")
     3) boxvilleSource: "metafield" | "pattern" | "list"
   Sube el número ?v=N en index.html cuando cambies este archivo (cache-busting).
   ========================================================================== */
window.CATALOG_CONFIG = {
  /* ---- Marca / cabecera ---- */
  storeName: "MIRANOVA",
  brandAvatar: "",                 // URL de logo redondo (opcional). Vacío = inicial.
  headline: "Catálogo de proveedor — Salud y bienestar natural",
  tagline: "Productos para revender en tu tienda",
  subtitle: "Proveedor dropshipping",

  /* ---- Fuente de productos ---- */
  productsSource: "static",        // "static" (data/products.json) | "shopify"
  productsPath: "data/products.json",
  placeholderImages: true,         // genera miniaturas mientras no haya fotos reales
  currency: "HNL",                 // moneda por defecto en modo estático (L Lempira)

  /* ---- Precio (vitrina de proveedor) ---- */
  showPrice: true,                 // muestra "Precio proveedor" y "Precio sugerido"

  /* ---- Shopify Storefront API (cuando productsSource: "shopify") ---- */
  shopifyDomain: "TU-TIENDA.myshopify.com",
  storefrontToken: "TU_STOREFRONT_TOKEN_PUBLICO",
  shopifyApiVersion: "2025-10",

  /* ---- Link de Boxville (lo central del catálogo) ---- */
  // "metafield" (recomendado): lee custom.boxville_url en cada producto.
  // "pattern":  arma la URL con {sku} / {handle} / {id}.
  // "list":     usa data/boxville.json como { sku|handle|id: url }.
  boxvilleSource: "metafield",
  boxvilleMetafield: { namespace: "custom", key: "boxville_url" },
  boxvilleUrlPattern: "https://boxville.com/p/{sku}",
  boxvilleListPath: "data/boxville.json",
  // Mientras cada producto no tenga su link propio, el botón usa este destino:
  boxvilleFallbackUrl: "https://boxville.com",

  /* ---- Texto del botón ---- */
  ctaText: "Conectar en Boxville"
};
