/* ==========================================================================
   config.js — Tienda: Kenku Perú  (segundo ejemplo, multi-tienda)
   Demuestra: dominio .myshopify.com real, precios en S/ (PEN) y el link de
   Boxville por PATRÓN de URL. Solo falta pegar el token Storefront público.
   ========================================================================== */
window.CATALOG_CONFIG = {
  storeName: "Kenku Perú",
  brandAvatar: "",
  headline: "Productos ganadores para tu tienda",
  tagline: "Catálogo proveedor para revendedores",
  subtitle: "Vitrina de dropshipping",

  shopifyDomain: "kenkuperu.myshopify.com",
  storefrontToken: "TU_STOREFRONT_TOKEN_PUBLICO",
  shopifyApiVersion: "2025-10",

  showPrice: true,                 // PEN → se mostrará como "S/ 79"

  boxvilleSource: "pattern",
  boxvilleMetafield: { namespace: "custom", key: "boxville_url" },
  boxvilleUrlPattern: "https://boxville.com/p/{sku}",
  boxvilleListPath: "data/boxville.json",

  ctaText: "Conectar en Boxville"
};
