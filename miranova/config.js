/* ==========================================================================
   config.js — Tienda: MIRANOVA
   Edita SOLO este archivo para esta tienda. No toques app.js ni styles.css.
   --------------------------------------------------------------------------
   Pasos:
   1) Pon tu dominio .myshopify.com y un token público de la Storefront API.
      (Cómo obtener el token: ver README → "Obtener el token Storefront".)
   2) Elige cómo se arma el link de Boxville (boxvilleSource): metafield | pattern | list.
   3) Sube el número ?v=N en index.html cuando cambies este archivo (cache-busting).
   ========================================================================== */
window.CATALOG_CONFIG = {
  /* ---- Marca / cabecera ---- */
  storeName: "MIRANOVA",
  brandAvatar: "",                 // URL de logo redondo (opcional). Vacío = inicial.
  headline: "Salud y bienestar natural",
  tagline: "Catálogo proveedor para revendedores",
  subtitle: "Vitrina de dropshipping",

  /* ---- Shopify Storefront API (token PÚBLICO de solo lectura) ---- */
  shopifyDomain: "TU-TIENDA.myshopify.com",
  storefrontToken: "TU_STOREFRONT_TOKEN_PUBLICO",
  shopifyApiVersion: "2025-10",

  /* ---- Precio (opcional) ---- */
  showPrice: false,                // true para mostrar precio en tarjeta y detalle.

  /* ---- Link de Boxville (lo central del catálogo) ---- */
  // "metafield" (recomendado): lee custom.boxville_url en cada producto.
  // "pattern":  arma la URL con {sku} / {handle} / {id}.
  // "list":     usa data/boxville.json como { sku|handle|id: url }.
  boxvilleSource: "metafield",
  boxvilleMetafield: { namespace: "custom", key: "boxville_url" },
  boxvilleUrlPattern: "https://boxville.com/p/{sku}",
  boxvilleListPath: "data/boxville.json",

  /* ---- Texto del botón ---- */
  ctaText: "Conectar en Boxville"
};
