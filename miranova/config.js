/* ==========================================================================
   config.js — Catálogo Drop Miranova · Honduras
   Vitrina de proveedor dropshipping (100% estática). Edita SOLO este archivo.
   --------------------------------------------------------------------------
   - Los productos viven en data/products.json (modo "static"). No usa Shopify.
   - El botón "Conectar en Boxville" usa, por ahora, boxvilleFallbackUrl.
     Cuando tengas los links reales de cada producto, ponlos en cada item de
     products.json (campo "boxville") y listo.
   - Botón flotante de WhatsApp: pon tu número en whatsappNumber (formato
     internacional, con código de país; Honduras = 504). Ej.: "50499998888".
   Sube el número ?v=N en index.html cuando cambies este archivo (cache-busting).
   ========================================================================== */
window.CATALOG_CONFIG = {
  /* ---- Marca / cabecera ---- */
  storeName: "MIRANOVA",
  pageTitle: "Catálogo Drop Miranova · Honduras",
  brandAvatar: "",                 // URL de logo redondo (opcional). Vacío = inicial.
  headline: "",                    // vacío = cabecera más compacta (sin titular extra)
  tagline: "",
  subtitle: "Proveedor dropshipping · Honduras",

  /* ---- Fuente de productos (estático, sin Shopify) ---- */
  productsSource: "static",
  placeholderImages: true,         // miniaturas generadas mientras no haya fotos reales
  currency: "HNL",                 // moneda por defecto

  /* ---- Catálogo por país (taps en la cabecera) ----
     Cada país tiene su propia lista (productsPath), su moneda y, si quieres,
     su propio WhatsApp (whatsappNumber/whatsappMessage). Al tocar un tap se
     cambia el catálogo en la misma página. Quita este bloque para un solo país. */
  countries: [
    { id: "honduras",   label: "Honduras",   flag: "🇭🇳", currency: "HNL", productsPath: "data/honduras.json" },
    { id: "costa-rica", label: "Costa Rica", flag: "🇨🇷", currency: "CRC", productsPath: "data/costa-rica.json" },
    { id: "guatemala",  label: "Guatemala",  flag: "🇬🇹", currency: "GTQ", productsPath: "data/guatemala.json" }
  ],

  /* ---- Precio (vitrina de proveedor) ---- */
  showPrice: true,                 // muestra "Precio proveedor" y "Precio sugerido"

  /* ---- Link de Boxville ---- */
  // Cada producto puede traer su propio "boxville" en products.json.
  // Mientras tanto, el botón apunta a este destino general:
  boxvilleSource: "metafield",     // se ignora en modo estático (se usa item.boxville)
  boxvilleFallbackUrl: "https://boxville.com",
  ctaText: "Conectar en Boxville",
  showCta: false,                  // OCULTO por ahora (aún no hay links de Boxville)

  /* ---- Botón flotante de WhatsApp (consultas del catálogo) ---- */
  // Pon tu número con código de país, sin signos. Honduras = 504.
  // Mientras tenga "X", el botón queda oculto.
  whatsappNumber: "51987713640",
  whatsappLabel: "Consultas",
  whatsappMessage: "¡Hola! Vi el Catálogo Drop Miranova y quiero más información sobre los productos."
};
