/* ==========================================================================
   Catálogo Proveedor / Vitrina de Dropshipping — Motor compartido (app.js)
   HTML + CSS + JS puro. Carga productos EN VIVO desde la Storefront API de
   Shopify y muestra, por producto, un botón "Conectar en Boxville".
   No hay carrito, ni pedidos, ni pagos: es una vitrina para revendedores.
   ========================================================================== */
(function () {
  "use strict";

  var CFG = window.CATALOG_CONFIG;
  if (!CFG) {
    document.getElementById("status").textContent =
      "Falta config.js (window.CATALOG_CONFIG).";
    return;
  }

  /* ----------------------------- Constantes ------------------------------ */
  var API_VERSION = CFG.shopifyApiVersion || "2025-10";
  var ENDPOINT =
    "https://" + CFG.shopifyDomain + "/api/" + API_VERSION + "/graphql.json";

  // Set fijo y ordenado de categorías. Solo se muestran las que tengan productos.
  // Reglas por palabras clave sobre título + descripción + productType.
  var CATEGORY_RULES = [
    {
      id: "suplementos",
      label: "Suplementos",
      kw: [
        "suplement", "capsul", "cápsul", "gomita", "vitamin", "shilajit",
        "colageno", "colágeno", "omega", "magnesi", "zinc", "probiot",
        "proteina", "proteína", "creatin", "nad", "resveratrol", "oxido",
        "óxido", "nitrico", "nítrico", "turkesterone", "ginseng", "maca",
        "ashwagandha", "nattokinase", "saw palmetto", "oregano", "orégano",
        "clorofila", "metabolism", "burn", "quema grasa", "energia",
        "energía", "nutritiv", "minerales", "ayurv", "cleanse", "detox",
        "testosterona", "hormonal", "balance"
      ]
    },
    {
      id: "belleza",
      label: "Belleza",
      kw: [
        "serum", "sérum", "crema", "shampoo", "champ", "champú", "cabello",
        "capilar", "aceite", "batana", "romero", "piel", "skin", "facial",
        "antiedad", "antiage", "antiarrugas", "antimanchas", "niacinamida",
        "labial", "maquillaje", "belleza", "rebrota", "fortalecimiento"
      ]
    },
    {
      id: "hogar",
      label: "Hogar y cocina",
      kw: [
        "cocina", "taza", "sarten", "sartén", "bandeja", "tijera", "olla",
        "utensilio", "hogar", "casa", "limpieza", "organizador", "set de",
        "agitador", "vaso", "termo", "botella"
      ]
    }
  ];

  /* ----------------------------- Utilidades ------------------------------ */
  function escapeHtml(s) {
    if (s == null) return "";
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function stripHtml(s) {
    if (!s) return "";
    var d = document.createElement("div");
    d.innerHTML = s;
    return (d.textContent || d.innerText || "").replace(/\s+/g, " ").trim();
  }

  function truncate(s, n) {
    s = (s || "").trim();
    if (s.length <= n) return s;
    return s.slice(0, n).replace(/\s+\S*$/, "") + "…";
  }

  // Formato de precio: entero, miles con punto, símbolo según currencyCode.
  var CURRENCY_SYMBOL = {
    PEN: "S/ ", USD: "$", HNL: "L ", CRC: "₡", MXN: "$", COP: "$",
    EUR: "€", GTQ: "Q", CLP: "$", ARS: "$", BOB: "Bs ", PYG: "₲",
    DOP: "RD$", UYU: "$U", BRL: "R$"
  };
  function formatPrice(amount, currency) {
    var n = Math.round(parseFloat(amount) || 0);
    var withDots = String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    var sym = CURRENCY_SYMBOL[currency] != null ? CURRENCY_SYMBOL[currency]
      : (currency ? currency + " " : "");
    return sym + withDots;
  }

  /* --------------------------- Estado global ----------------------------- */
  var ALL = [];          // todos los productos normalizados y visibles
  var activeCategory = "todos";
  var searchTerm = "";

  /* --------------------------- Query Shopify ----------------------------- */
  // Construye la query. `withQty` controla si incluimos quantityAvailable
  // (requiere unauthenticated_read_product_inventory). Si la API devuelve
  // errors, reintentamos sin ese campo.
  function buildQuery(withQty, cursor) {
    var qtyField = withQty ? "quantityAvailable" : "";
    var metafieldField = "";
    if (CFG.boxvilleSource === "metafield" && CFG.boxvilleMetafield) {
      metafieldField =
        'metafield(namespace:"' + CFG.boxvilleMetafield.namespace +
        '", key:"' + CFG.boxvilleMetafield.key + '"){ value }';
    }
    var after = cursor ? ', after: "' + cursor + '"' : "";
    return [
      "query {",
      "  products(first: 100, sortKey: BEST_SELLING" + after + ") {",
      "    pageInfo { hasNextPage endCursor }",
      "    edges { node {",
      "      id handle title productType description",
      "      " + metafieldField,
      "      images(first: 4) { edges { node { url altText } } }",
      "      variants(first: 25) { edges { node {",
      "        id title sku availableForSale " + qtyField,
      "        price { amount currencyCode }",
      "      } } }",
      "    } }",
      "  }",
      "}"
    ].join("\n");
  }

  function gqlFetch(query) {
    return fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": CFG.storefrontToken
      },
      body: JSON.stringify({ query: query })
    }).then(function (r) {
      return r.json().then(function (json) {
        return { ok: r.ok, status: r.status, json: json };
      });
    });
  }

  // Carga una página. Si withQty falla por errors, reintenta sin qty.
  function fetchPage(cursor, withQty) {
    return gqlFetch(buildQuery(withQty, cursor)).then(function (res) {
      var hasErrors = res.json && res.json.errors && res.json.errors.length;
      if (hasErrors && withQty) {
        // Reintento resiliente SIN quantityAvailable.
        return fetchPage(cursor, false);
      }
      if (hasErrors) {
        throw new Error(res.json.errors[0].message || "Error de Storefront API");
      }
      if (!res.json || !res.json.data || !res.json.data.products) {
        throw new Error("Respuesta inesperada de la Storefront API.");
      }
      return { data: res.json.data.products, withQty: withQty };
    });
  }

  // Carga TODAS las páginas (paginación por cursor).
  function fetchAll() {
    var collected = [];
    function loop(cursor, withQty) {
      return fetchPage(cursor, withQty).then(function (r) {
        var edges = r.data.edges || [];
        edges.forEach(function (e) { collected.push(e.node); });
        if (r.data.pageInfo && r.data.pageInfo.hasNextPage) {
          return loop(r.data.pageInfo.endCursor, r.withQty);
        }
        return collected;
      });
    }
    return loop(null, true);
  }

  /* ------------------------- Normalización ------------------------------- */
  function pickVariant(node) {
    var edges = (node.variants && node.variants.edges) || [];
    // Preferimos una variante disponible; si no, la primera.
    for (var i = 0; i < edges.length; i++) {
      if (edges[i].node && edges[i].node.availableForSale) return edges[i].node;
    }
    return edges.length ? edges[0].node : null;
  }

  // Inventario total: suma de quantityAvailable de variantes.
  // Devuelve { qty: number|null }. null = inventario no rastreado.
  function totalQty(node) {
    var edges = (node.variants && node.variants.edges) || [];
    var sum = 0;
    var anyNumber = false;
    for (var i = 0; i < edges.length; i++) {
      var q = edges[i].node ? edges[i].node.quantityAvailable : undefined;
      if (typeof q === "number") { sum += q; anyNumber = true; }
    }
    return { qty: anyNumber ? sum : null };
  }

  function categorize(node) {
    var hay = (
      (node.title || "") + " " +
      (node.productType || "") + " " +
      (node.description || "")
    ).toLowerCase();
    for (var i = 0; i < CATEGORY_RULES.length; i++) {
      var rule = CATEGORY_RULES[i];
      for (var j = 0; j < rule.kw.length; j++) {
        if (hay.indexOf(rule.kw[j]) !== -1) return rule.id;
      }
    }
    return "otros";
  }

  function boxvilleUrl(node, variant) {
    var sku = variant && variant.sku ? variant.sku : "";
    var idNum = (node.id || "").split("/").pop();

    // 1) Metacampo de Shopify
    if (CFG.boxvilleSource === "metafield") {
      if (node.metafield && node.metafield.value) return node.metafield.value;
      return ""; // sin link → botón oculto
    }
    // 2) Patrón de URL
    if (CFG.boxvilleSource === "pattern" && CFG.boxvilleUrlPattern) {
      if (!sku && CFG.boxvilleUrlPattern.indexOf("{sku}") !== -1) return "";
      return CFG.boxvilleUrlPattern
        .replace(/\{sku\}/g, encodeURIComponent(sku))
        .replace(/\{handle\}/g, encodeURIComponent(node.handle || ""))
        .replace(/\{id\}/g, encodeURIComponent(idNum));
    }
    // 3) Lista/CSV (data/boxville.json) — resuelto desde BOXVILLE_LIST.
    if (CFG.boxvilleSource === "list") {
      var map = window.BOXVILLE_LIST || {};
      return map[sku] || map[node.handle] || map[idNum] || "";
    }
    return "";
  }

  function normalize(node) {
    var images = ((node.images && node.images.edges) || [])
      .map(function (e) { return e.node; })
      .filter(function (n) { return n && n.url; });
    var variant = pickVariant(node);
    var tq = totalQty(node);
    return {
      id: node.id,
      handle: node.handle,
      title: node.title || "",
      description: stripHtml(node.description),
      productType: node.productType || "",
      images: images,
      variant: variant,
      qty: tq.qty,
      category: categorize(node),
      boxville: boxvilleUrl(node, variant),
      price: variant && variant.price ? variant.price : null
    };
  }

  // Filtro de inventario: mostrar qty > 0; ocultar 0 y negativos.
  // Si qty === null (no rastreado), mostrar igual.
  function hasStock(p) {
    return p.qty === null || p.qty > 0;
  }

  /* ------------------------------ Render --------------------------------- */
  var elGrid = document.getElementById("grid");
  var elStatus = document.getElementById("status");
  var elChips = document.getElementById("chips");

  var ICON_LINK =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>';

  function ctaHtml(p, big) {
    var cls = big ? "sheet-cta" : "cta";
    var label = escapeHtml(CFG.ctaText || "Conectar en Boxville");
    if (!p.boxville) {
      // Sin link → botón deshabilitado (oculto en tarjeta, visible-disabled en sheet).
      if (big) {
        return '<span class="' + cls + ' disabled">' + ICON_LINK + label + "</span>";
      }
      return '<button class="' + cls + ' disabled" hidden>' + label + "</button>";
    }
    return '<a class="' + cls + '" href="' + escapeHtml(p.boxville) +
      '" target="_blank" rel="noopener noreferrer">' + ICON_LINK + label + "</a>";
  }

  function priceHtml(p, big) {
    if (!CFG.showPrice || !p.price) return "";
    var txt = formatPrice(p.price.amount, p.price.currencyCode);
    return '<div class="' + (big ? "sheet-price" : "card-price") + '">' +
      escapeHtml(txt) + "</div>";
  }

  function cardHtml(p, idx) {
    var img = p.images.length
      ? '<img loading="lazy" src="' + escapeHtml(p.images[0].url) + '" alt="' +
        escapeHtml(p.images[0].altText || p.title) + '">'
      : '<div class="no-img">Sin imagen</div>';
    return (
      '<article class="card" data-idx="' + idx + '">' +
      '  <div class="card-media" data-open="' + idx + '">' + img + "</div>" +
      '  <div class="card-body">' +
      '    <div class="card-title" data-open="' + idx + '">' + escapeHtml(p.title) + "</div>" +
      (CFG.storeName ? '    <div class="card-brand">' + escapeHtml(CFG.storeName) + "</div>" : "") +
      priceHtml(p, false) +
      ctaHtml(p, false) +
      "  </div>" +
      "</article>"
    );
  }

  function currentList() {
    return ALL.filter(function (p) {
      if (activeCategory !== "todos" && p.category !== activeCategory) return false;
      if (searchTerm) {
        var hay = (p.title + " " + p.description).toLowerCase();
        if (hay.indexOf(searchTerm) === -1) return false;
      }
      return true;
    });
  }

  function renderGrid() {
    var list = currentList();
    if (!list.length) {
      elGrid.innerHTML = "";
      elStatus.hidden = false;
      elStatus.className = "status";
      elStatus.textContent = "No hay productos para esta búsqueda.";
      return;
    }
    elStatus.hidden = true;
    elGrid.innerHTML = list.map(function (p) {
      return cardHtml(p, ALL.indexOf(p));
    }).join("");
  }

  function renderChips() {
    var counts = {};
    ALL.forEach(function (p) { counts[p.category] = (counts[p.category] || 0) + 1; });

    var chips = [{ id: "todos", label: "Todos" }];
    CATEGORY_RULES.forEach(function (r) {
      if (counts[r.id]) chips.push({ id: r.id, label: r.label });
    });
    if (counts["otros"]) chips.push({ id: "otros", label: "Otros" });

    elChips.innerHTML = chips.map(function (c) {
      return '<button class="chip" data-cat="' + c.id + '" aria-pressed="' +
        (c.id === activeCategory ? "true" : "false") + '">' +
        escapeHtml(c.label) + "</button>";
    }).join("");
  }

  /* ----------------------- Hoja de detalle (sheet) ----------------------- */
  var backdrop = document.getElementById("sheet-backdrop");
  var sheet = document.getElementById("sheet");
  var sheetBody = document.getElementById("sheet-body");

  function carouselHtml(p) {
    var imgs = p.images.slice(0, 4);
    if (!imgs.length) {
      imgs = [{ url: "", altText: "" }];
    }
    var slides = imgs.map(function (im) {
      return '<div class="carousel-slide">' +
        (im.url
          ? '<img src="' + escapeHtml(im.url) + '" alt="' + escapeHtml(im.altText || p.title) + '">'
          : '<div class="no-img">Sin imagen</div>') +
        "</div>";
    }).join("");
    var dots = imgs.length > 1
      ? '<div class="dots">' + imgs.map(function (_, i) {
          return '<span class="dot' + (i === 0 ? " active" : "") + '"></span>';
        }).join("") + "</div>"
      : "";
    return '<div class="carousel"><div class="carousel-track" id="carousel-track">' +
      slides + "</div>" + dots + "</div>";
  }

  function openSheet(p) {
    sheetBody.innerHTML =
      carouselHtml(p) +
      '<div class="sheet-info">' +
      (CFG.storeName ? '<div class="sheet-brand">' + escapeHtml(CFG.storeName) + "</div>" : "") +
      '<h2 class="sheet-title">' + escapeHtml(p.title) + "</h2>" +
      priceHtml(p, true) +
      (p.description
        ? '<p class="sheet-desc">' + escapeHtml(truncate(p.description, 220)) + "</p>"
        : "") +
      ctaHtml(p, true) +
      "</div>";

    backdrop.hidden = false;
    sheet.hidden = false;
    // Forzar reflow para activar la transición.
    void sheet.offsetWidth;
    backdrop.classList.add("open");
    sheet.classList.add("open");
    document.body.style.overflow = "hidden";

    wireCarouselDots();
  }

  function closeSheet() {
    backdrop.classList.remove("open");
    sheet.classList.remove("open");
    document.body.style.overflow = "";
    setTimeout(function () {
      backdrop.hidden = true;
      sheet.hidden = true;
      sheetBody.innerHTML = "";
    }, 300);
  }

  function wireCarouselDots() {
    var track = document.getElementById("carousel-track");
    if (!track) return;
    var dots = sheet.querySelectorAll(".dot");
    if (!dots.length) return;
    track.addEventListener("scroll", function () {
      var i = Math.round(track.scrollLeft / track.clientWidth);
      dots.forEach(function (d, k) { d.classList.toggle("active", k === i); });
    }, { passive: true });
  }

  /* Gesto de deslizar hacia abajo para cerrar */
  function wireSwipeToClose() {
    var startY = 0, curY = 0, dragging = false;
    var scroll = document.getElementById("sheet-scroll");

    function start(e) {
      // Solo iniciamos el arrastre si el contenido está arriba del todo.
      if (scroll && scroll.scrollTop > 0) return;
      dragging = true;
      startY = e.touches ? e.touches[0].clientY : e.clientY;
      curY = startY;
      sheet.classList.add("dragging");
    }
    function move(e) {
      if (!dragging) return;
      curY = e.touches ? e.touches[0].clientY : e.clientY;
      var dy = Math.max(0, curY - startY);
      if (dy > 0) {
        sheet.style.transform = "translateY(" + dy + "px)";
        if (e.cancelable) e.preventDefault();
      }
    }
    function end() {
      if (!dragging) return;
      dragging = false;
      sheet.classList.remove("dragging");
      var dy = Math.max(0, curY - startY);
      sheet.style.transform = "";
      if (dy > 110) closeSheet();
    }

    var grabber = sheet.querySelector(".sheet-grabber");
    [grabber, sheet].forEach(function (el) {
      if (!el) return;
      el.addEventListener("touchstart", start, { passive: true });
      el.addEventListener("touchmove", move, { passive: false });
      el.addEventListener("touchend", end);
    });
    if (grabber) {
      grabber.addEventListener("mousedown", function (e) {
        start(e);
        function mm(ev) { move(ev); }
        function mu(ev) { end(ev); document.removeEventListener("mousemove", mm); document.removeEventListener("mouseup", mu); }
        document.addEventListener("mousemove", mm);
        document.addEventListener("mouseup", mu);
      });
    }
  }

  /* ------------------------------ Eventos -------------------------------- */
  function wireEvents() {
    // Abrir detalle al tocar imagen o título.
    elGrid.addEventListener("click", function (e) {
      var t = e.target.closest("[data-open]");
      if (!t) return;
      var idx = parseInt(t.getAttribute("data-open"), 10);
      if (ALL[idx]) openSheet(ALL[idx]);
    });

    // Chips de categoría.
    elChips.addEventListener("click", function (e) {
      var c = e.target.closest(".chip");
      if (!c) return;
      activeCategory = c.getAttribute("data-cat");
      Array.prototype.forEach.call(elChips.querySelectorAll(".chip"), function (x) {
        x.setAttribute("aria-pressed", x === c ? "true" : "false");
      });
      renderGrid();
    });

    // Buscador.
    var search = document.getElementById("search");
    var t;
    search.addEventListener("input", function () {
      clearTimeout(t);
      t = setTimeout(function () {
        searchTerm = search.value.trim().toLowerCase();
        renderGrid();
      }, 120);
    });

    // Cerrar sheet.
    document.getElementById("sheet-close").addEventListener("click", closeSheet);
    backdrop.addEventListener("click", closeSheet);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !sheet.hidden) closeSheet();
    });

    wireSwipeToClose();
  }

  /* ------------------------------- Cabecera ------------------------------ */
  function renderHeader() {
    if (CFG.storeName) document.title = CFG.storeName + " — Catálogo proveedor";

    var nameEl = document.getElementById("brand-name");
    var subEl = document.getElementById("brand-sub");
    var avatarEl = document.getElementById("brand-avatar");

    nameEl.textContent = CFG.storeName || "Catálogo";
    subEl.textContent = CFG.subtitle || "Vitrina de dropshipping";

    if (CFG.brandAvatar) {
      avatarEl.innerHTML = '<img src="' + escapeHtml(CFG.brandAvatar) +
        '" alt="' + escapeHtml(CFG.storeName || "") + '">';
    } else {
      avatarEl.textContent = (CFG.storeName || "C").trim().charAt(0).toUpperCase();
    }

    var footerNote = document.getElementById("footer-note");
    if (footerNote) {
      var year = new Date().getFullYear();
      footerNote.textContent = (CFG.storeName || "Catálogo") + " · " + year +
        " · Catálogo proveedor para revendedores";
    }

    var head = document.getElementById("headline");
    if (CFG.headline) {
      head.innerHTML = escapeHtml(CFG.headline) +
        (CFG.tagline ? '<span class="subtitle">' + escapeHtml(CFG.tagline) + "</span>" : "");
      head.hidden = false;
    } else {
      head.hidden = true;
    }
  }

  /* ---------------- Lista de Boxville (opcional, fuente "list") ----------- */
  function loadBoxvilleList() {
    if (CFG.boxvilleSource !== "list") return Promise.resolve();
    var path = CFG.boxvilleListPath || "data/boxville.json";
    return fetch(path)
      .then(function (r) { return r.ok ? r.json() : {}; })
      .then(function (map) { window.BOXVILLE_LIST = map || {}; })
      .catch(function () { window.BOXVILLE_LIST = {}; });
  }

  /* -------------------------------- Init --------------------------------- */
  function start() {
    renderHeader();
    wireEvents();

    if (!CFG.shopifyDomain || !CFG.storefrontToken ||
        /TU_|REEMPLAZA|XXXX/i.test(CFG.storefrontToken + CFG.shopifyDomain)) {
      elStatus.className = "status error";
      elStatus.innerHTML =
        "Configura <code>shopifyDomain</code> y <code>storefrontToken</code> en config.js.";
      return;
    }

    Promise.all([loadBoxvilleList(), fetchAll()])
      .then(function (results) {
        var nodes = results[1] || [];
        var normalized = nodes.map(normalize).filter(hasStock);

        // Empujar al final los productos SIN imagen (orden estable).
        var withImg = normalized.filter(function (p) { return p.images.length; });
        var noImg = normalized.filter(function (p) { return !p.images.length; });
        ALL = withImg.concat(noImg);

        if (!ALL.length) {
          elStatus.className = "status";
          elStatus.textContent = "No hay productos disponibles por ahora.";
          return;
        }
        renderChips();
        renderGrid();
      })
      .catch(function (err) {
        elStatus.className = "status error";
        elStatus.innerHTML = "No se pudieron cargar los productos.<br><small>" +
          escapeHtml(err.message || String(err)) + "</small>";
        // eslint-disable-next-line no-console
        console.error(err);
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
