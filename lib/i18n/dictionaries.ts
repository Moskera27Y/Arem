/**
 * AREM WORLD — centralized UI dictionary (EN default / ES secondary).
 *
 * Every interface string that is not part of the content model lives here so
 * translations stay in one place. Content (products, categories, regions,
 * stories, homepage…) is localized inside `lib/content` with the same
 * `{ en, es }` pattern, ready for Admin-managed content in a later phase.
 */

import { defaultLocale, type Locale } from "@/lib/i18n/config";

export interface Dictionary {
  nav: {
    shop: string;
    collections: string;
    about: string;
    contact: string;
  };
  a11y: {
    openMenu: string;
    closeMenu: string;
    wishlist: string;
    cart: string;
    closeCart: string;
    decreaseQty: string;
    increaseQty: string;
    remove: string;
    addToWishlist: string;
    removeFromWishlist: string;
    viewImage: string;
    language: string;
    search: string;
    prev: string;
    next: string;
    prevImage: string;
    nextImage: string;
    quickView: string;
    close: string;
    dismiss: string;
    viewCart: string;
    breadcrumbs: string;
    currency: string;
    mainNav: string;
    mobileNav: string;
    announcement: string;
    playAnnouncements: string;
    pauseAnnouncements: string;
    heroLabel: string;
    logoAlt: string;
  };
  common: {
    home: string;
    explore: string;
    viewAll: string;
    viewCollection: string;
    pieces: (count: number) => string;
    products: (count: number) => string;
  };
  shop: {
    eyebrow: string;
    allTitle: string;
    allSub: string;
    categories: string;
    all: string;
    sort: string;
    sortFeatured: string;
    sortPriceAsc: string;
    sortPriceDesc: string;
    sortName: string;
    empty: string;
    noResults: string;
    count: (count: number) => string;
  };
  product: {
    addToCart: string;
    soldOut: string;
    available: (count: number) => string;
    originalPrice: string;
    origin: string;
    artisan: string;
    collections: string;
    sku: string;
    inventoryNote: string;
    storyTitle: string;
    detailsTitle: string;
    relatedEyebrow: string;
    relatedTitle: string;
    galleryNote: string;
    newBadge: string;
    noReviews: string;
    beFirstReview: string;
    estimatedShort: string;
    shippingTitle: string;
    shippingBody: string;
    trackOrder: string;
    meetMaker: string;
    secureCheckout: string;
    trackedShipping: string;
    handmade: string;
    addedToCart: string;
  };
  cart: {
    title: string;
    empty: string;
    viewFull: string;
    checkoutLater: string;
    yourSelection: string;
    lines: (count: number) => string;
    clear: string;
    summary: string;
    subtotal: string;
    shipping: string;
    shippingNote: string;
    freeShipping: string;
    total: string;
    checkoutBtn: string;
    paymentsNote: string;
    keepShopping: string;
    emptySub: string;
    estimatedNote: string;
    finalTotal: string;
    checkoutNow: string;
    paymentNote: string;
    slideToClear: string;
  };
  wishlist: {
    title: string;
    yourFavorites: string;
    empty: string;
    saved: (count: number) => string;
    clear: string;
    emptySub: string;
  };
  forms: {
    newsletterEmail: string;
    subscribe: string;
    newsletterSuccess: string;
    newsletterNote: string;
    name: string;
    email: string;
    topic: string;
    message: string;
    namePlaceholder: string;
    emailPlaceholder: string;
    messagePlaceholder: string;
    topicOrder: string;
    topicProduct: string;
    topicArtisan: string;
    topicWholesale: string;
    topicOther: string;
    send: string;
    sending: string;
    sendError: string;
    success: string;
    consent: string;
    consentRequired: string;
    consentPrivacy: string;
    invalidEmail: string;
    subscribeError: string;
    newsletterConsent: string;
    newsletterConsentRequired: string;
  };
  contact: {
    eyebrow: string;
    title: string;
    sub: string;
    otherWays: string;
    otherWaysSub: string;
    hours: string;
    hoursValue: string;
    sendMessage: string;
    addressLabel: string;
  };
  heroStats: {
    artisans: string;
    municipalities: string;
    handmade: string;
  };
  collections: {
    eyebrow: string;
    title: string;
    sub: string;
    filling: string;
    count: (count: number) => string;
  };
  notFound: {
    code: string;
    title: string;
    sub: string;
    home: string;
    exploreShop: string;
  };
  meta: {
    notFoundProduct: string;
    notFoundCollection: string;
  };
  footer: {
    explore: string;
    brand: string;
    help: string;
    contact: string;
    bottomNote: string;
  };
  account: {
    myAccount: string;
    overview: string;
    profile: string;
    addresses: string;
    wishlist: string;
    orders: string;
    security: string;
    signIn: string;
    signUp: string;
    signOut: string;
    backToShop: string;
    signInTitle: string;
    signInSub: string;
    signUpTitle: string;
    signUpSub: string;
    forgotTitle: string;
    forgotSub: string;
    resetTitle: string;
    resetSub: string;
    resetPassword: string;
    email: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
    phone: string;
    preferredLanguage: string;
    languageEn: string;
    languageEs: string;
    save: string;
    saving: string;
    cancel: string;
    edit: string;
    delete: string;
    add: string;
    confirmDelete: string;
    profileTitle: string;
    profileSub: string;
    profileSaved: string;
    addressesTitle: string;
    addressesSub: string;
    addAddress: string;
    editAddress: string;
    recipientName: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    defaultShipping: string;
    defaultBilling: string;
    addressSaved: string;
    addressDeleted: string;
    requiredFields: string;
    wishlistTitle: string;
    wishlistSub: string;
    wishlistSaved: string;
    wishlistAccount: string;
    ordersTitle: string;
    ordersSub: string;
    noOrders: string;
    orderNumber: string;
    orderDate: string;
    paymentStatus: string;
    fulfillmentStatus: string;
    items: string;
    quantity: string;
    price: string;
    shippingAddress: string;
    trackingNumber: string;
    trackingPending: string;
    shipmentTimeline: string;
    backToOrders: string;
    statusPendingPayment: string;
    statusPaid: string;
    statusProcessing: string;
    statusShipped: string;
    statusDelivered: string;
    statusCancelled: string;
    statusRefunded: string;
    paymentPending: string;
    paymentPaid: string;
    paymentRefunded: string;
    paymentFailed: string;
    securityTitle: string;
    securitySub: string;
    currentPassword: string;
    newPassword: string;
    changePassword: string;
    passwordChanged: string;
    invalidCredentials: string;
    emailExists: string;
    passwordTooShort: string;
    emailInvalid: string;
    accountCreated: string;
    welcomeBack: string;
    loading: string;
    total: string;
    passwordMismatch: string;
    sendLink: string;
    resetSent: string;
    noToken: string;
    orderDetails: string;
    paymentUsdNote: string;
    currencyLabel: string;
    currencyNote: string;
  };
  tracking: {
    title: string;
    sub: string;
    label: string;
    track: string;
    connectionError: string;
  };
  filters: {
    title: string;
    close: string;
    search: string;
    searchPlaceholder: string;
    searchPieces: string;
    region: string;
    allRegions: string;
    showResults: string;
  };
  cookie: {
    text: string;
    preferences: string;
    policy: string;
    reject: string;
    rejectAria: string;
    accept: string;
    acceptAria: string;
  };
  recommendations: {
    similar: string;
    fromCraft: string;
    favorites: string;
    loadError: string;
  };
  spotlight: {
    title: string;
    close: string;
    kicker: string;
    viewPiece: string;
    later: string;
  };
  home: {
    bestSeller: (index: string) => string;
    viewPiece: string;
    brandKicker: string;
  };
  legal: {
    lastUpdated: string;
    questions: string;
    contactEmailAria: string;
  };
  error: {
    title: string;
    sub: string;
    reload: string;
    reloadPage: string;
  };
  checkout: {
    title: string;
    subtitle: string;
    contactInfo: string;
    email: string;
    phone: string;
    shipAddress: string;
    firstName: string;
    lastName: string;
    country: string;
    state: string;
    city: string;
    postal: string;
    address: string;
    apt: string;
    instructions: string;
    shipMethod: string;
    payMethod: string;
    manualNote: string;
    summary: string;
    subtotal: string;
    shipping: string;
    total: string;
    placeOrder: string;
    processing: string;
    empty: string;
    emptyCta: string;
    created: string;
    orderIs: (orderNumber: string) => string;
    pendingNote: string;
    trackLabel: string;
    trackBtn: string;
    searching: string;
    eventsCount: (count: number) => string;
    guideNote: (orderId: string) => string;
    createAccount: string;
    continueShopping: string;
    liveRates: (provider: string) => string;
    connectionError: string;
  };
  social: {
    followLabel: string;
    followAria: (handle: string) => string;
    openProfile: (handle: string) => string;
    emptySearch: string;
    feedNote: string;
  };
}

const en: Dictionary = {
  nav: {
    shop: "Shop",
    collections: "Collections",
    about: "About",
    contact: "Contact",
  },
  a11y: {
    openMenu: "Open menu",
    closeMenu: "Close menu",
    wishlist: "Wishlist",
    cart: "Cart",
    closeCart: "Close cart",
    decreaseQty: "Decrease quantity",
    increaseQty: "Increase quantity",
    remove: "Remove",
    addToWishlist: "Add to wishlist",
    removeFromWishlist: "Remove from wishlist",
    viewImage: "View image",
    language: "Language",
    search: "Search",
    prev: "Previous",
    next: "Next",
    prevImage: "Previous image",
    nextImage: "Next image",
    quickView: "Quick view",
    close: "Close",
    dismiss: "Dismiss",
    viewCart: "View cart",
    breadcrumbs: "Breadcrumbs",
    currency: "Currency",
    mainNav: "Main navigation",
    mobileNav: "Mobile menu",
    announcement: "Announcement",
    playAnnouncements: "Play announcements",
    pauseAnnouncements: "Pause announcements",
    heroLabel: "Colombian craft from workshop to world",
    logoAlt: "AREM WORLD — Colombian craftsmanship",
  },
  common: {
    home: "Home",
    explore: "Explore",
    viewAll: "View all",
    viewCollection: "View collection",
    pieces: (count) => `${count} ${count === 1 ? "piece" : "pieces"}`,
    products: (count) => `${count} ${count === 1 ? "product" : "products"}`,
  },
  shop: {
    eyebrow: "The shop",
    allTitle: "All products",
    allSub: "Every piece is handmade by Colombian artisans and ships with its story.",
    categories: "Categories",
    all: "All",
    sort: "Sort",
    sortFeatured: "Featured",
    sortPriceAsc: "Price: low to high",
    sortPriceDesc: "Price: high to low",
    sortName: "Name: A–Z",
    empty: "There are no products in this category yet. Check back soon.",
    noResults: "Try another word or category.",
    count: (count) => `${count} ${count === 1 ? "piece" : "pieces"}`,
  },
  product: {
    addToCart: "Add to cart",
    soldOut: "Sold out",
    available: (count) => `${count} available`,
    originalPrice: "Original price:",
    origin: "Origin",
    artisan: "Artisan",
    collections: "Collections",
    sku: "SKU",
    inventoryNote: "Inventory managed per variant",
    storyTitle: "The story of this piece",
    detailsTitle: "Details & care",
    relatedEyebrow: "You may also like",
    relatedTitle: "Related pieces",
    galleryNote: "Placeholder artwork — real photography arrives at launch.",
    newBadge: "New",
    noReviews: "No reviews yet",
    beFirstReview: "New · Be the first to review",
    estimatedShort: "Estimated conversion.",
    shippingTitle: "Shipping & returns",
    shippingBody: "We ship worldwide from the US with tracking. 30-day returns.",
    trackOrder: "Track your order",
    meetMaker: "Meet the maker",
    secureCheckout: "Secure checkout",
    trackedShipping: "Tracked shipping",
    handmade: "Handmade",
    addedToCart: "Added to cart",
  },
  cart: {
    title: "Your cart",
    empty: "Your cart is empty for now.",
    viewFull: "View full cart",
    checkoutLater: "Checkout and payments arrive in a later phase.",
    yourSelection: "Your selection",
    lines: (count) => `${count} ${count === 1 ? "line" : "lines"}`,
    clear: "Clear cart",
    summary: "Summary",
    subtotal: "Subtotal",
    shipping: "Shipping",
    shippingNote: "Calculated at checkout",
    freeShipping: "Free",
    total: "Estimated total",
    checkoutBtn: "Checkout — coming soon",
    paymentsNote: "Payments, shipping and orders arrive in a later phase.",
    keepShopping: "Continue shopping",
    emptySub: "Handmade pieces are waiting for you.",
    estimatedNote: "Estimated conversion. Final payment is charged in USD.",
    finalTotal: "Final total (USD)",
    checkoutNow: "Checkout",
    paymentNote: "Payment is charged in USD.",
    slideToClear: "Slide to clear",
  },
  wishlist: {
    title: "Wishlist",
    yourFavorites: "Your favorites",
    empty: "No favorites yet. Tap the heart on any piece to save it here.",
    saved: (count) => `${count} ${count === 1 ? "piece saved" : "pieces saved"}`,
    clear: "Clear wishlist",
    emptySub: "Tap the heart on what you love.",
  },
  forms: {
    newsletterEmail: "Your email address",
    subscribe: "Subscribe",
    newsletterSuccess: "Thank you! We'll write when there is something beautiful to tell you.",
    newsletterNote: "No spam, ever. Unsubscribe anytime.",
    name: "Name",
    email: "Email address",
    topic: "Topic",
    message: "Message",
    namePlaceholder: "Your name",
    emailPlaceholder: "you@example.com",
    messagePlaceholder: "Tell us how we can help…",
    topicOrder: "Question about an order",
    topicProduct: "Question about a product",
    topicArtisan: "I want to work with AREM",
    topicWholesale: "Wholesale inquiries",
    topicOther: "Other",
    send: "Send message",
    sending: "Sending…",
    sendError: "We couldn't send your message. Please try again.",
    success: "Message sent. We'll reply within 24 business hours.",
    consent: "I agree to the processing of my data to respond to this inquiry.",
    consentRequired: "You must accept the privacy policy to send this message.",
    consentPrivacy: "Privacy Policy",
    invalidEmail: "Invalid email",
    subscribeError: "Could not subscribe. Try again later.",
    newsletterConsent: "I accept the privacy policy and marketing emails.",
    newsletterConsentRequired: "You must accept the privacy policy.",
  },
  contact: {
    eyebrow: "Let's talk",
    title: "Contact",
    sub: "Questions about a piece, an order or a partnership with artisans? Write to us — we reply within 24 business hours.",
    otherWays: "Other channels",
    otherWaysSub: "Prefer to write directly? You can also reach us or visit us in Bogotá.",
    hours: "Hours",
    hoursValue: "Mon – Fri · 9:00 – 18:00",
    sendMessage: "Send us a message",
    addressLabel: "Address",
  },
  heroStats: {
    artisans: "artisans",
    municipalities: "municipalities",
    handmade: "handmade",
  },
  collections: {
    eyebrow: "Stories worth sharing",
    title: "Collections",
    sub: "Groups of pieces that tell a story: heritage, craft and place.",
    filling: "This collection is filling up. Check back soon.",
    count: (count) => `${count} ${count === 1 ? "collection" : "collections"}`,
  },
  notFound: {
    code: "Error 404",
    title: "This page doesn't exist",
    sub: "Maybe the piece sold out, the story moved, or you simply wandered off. Let's go back to the beginning.",
    home: "Go home",
    exploreShop: "Explore the shop",
  },
  meta: {
    notFoundProduct: "Product not found",
    notFoundCollection: "Collection not found",
  },
  footer: {
    explore: "Shop",
    brand: "Our craft",
    help: "Help",
    contact: "Contact",
    bottomNote: "Handmade · Built with care",
  },
  account: {
    myAccount: "My account",
    overview: "Overview",
    profile: "Profile",
    addresses: "Addresses",
    wishlist: "Wishlist",
    orders: "Orders",
    security: "Security",
    signIn: "Sign in",
    signUp: "Sign up",
    signOut: "Sign out",
    backToShop: "Back to the shop",
    signInTitle: "Welcome back",
    signInSub: "Sign in to manage your profile, addresses and orders.",
    signUpTitle: "Create your account",
    signUpSub: "Save your favorites and order history in one place.",
    forgotTitle: "Reset your password",
    forgotSub: "Enter your email and we'll send you a reset link.",
    resetTitle: "Choose a new password",
    resetSub: "Your old password is no longer valid.",
    resetPassword: "Update password",
    email: "Email",
    password: "Password",
    confirmPassword: "Confirm password",
    firstName: "First name",
    lastName: "Last name",
    phone: "Phone",
    preferredLanguage: "Preferred language",
    languageEn: "English",
    languageEs: "Español",
    save: "Save",
    saving: "Saving…",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    add: "Add",
    confirmDelete: "Confirm deletion",
    profileTitle: "Profile",
    profileSub: "Your personal details and preferences.",
    profileSaved: "Profile updated.",
    addressesTitle: "Address book",
    addressesSub: "Manage your shipping and billing addresses.",
    addAddress: "Add address",
    editAddress: "Edit address",
    recipientName: "Recipient name",
    addressLine1: "Address line 1",
    addressLine2: "Address line 2",
    city: "City",
    state: "State / region",
    postalCode: "Postal code",
    country: "Country",
    defaultShipping: "Default shipping",
    defaultBilling: "Default billing",
    addressSaved: "Address saved.",
    addressDeleted: "Address deleted.",
    requiredFields: "Please complete the required fields.",
    wishlistTitle: "Your wishlist",
    wishlistSub: "Favorites saved to your account.",
    wishlistSaved: "Saved to your account.",
    wishlistAccount: "This wishlist is stored securely in your account.",
    ordersTitle: "Your orders",
    ordersSub: "Track and review your orders.",
    noOrders: "You have no orders yet.",
    orderNumber: "Order",
    orderDate: "Date",
    paymentStatus: "Payment",
    fulfillmentStatus: "Fulfillment",
    items: "Items",
    quantity: "Qty",
    price: "Price",
    shippingAddress: "Shipping address",
    trackingNumber: "Tracking number",
    trackingPending: "Tracking will appear once your order ships.",
    shipmentTimeline: "Shipment status",
    backToOrders: "Back to orders",
    statusPendingPayment: "Pending payment",
    statusPaid: "Paid",
    statusProcessing: "Processing",
    statusShipped: "Shipped",
    statusDelivered: "Delivered",
    statusCancelled: "Cancelled",
    statusRefunded: "Refunded",
    paymentPending: "Pending",
    paymentPaid: "Paid",
    paymentRefunded: "Refunded",
    paymentFailed: "Failed",
    securityTitle: "Security",
    securitySub: "Update your password.",
    currentPassword: "Current password",
    newPassword: "New password",
    changePassword: "Change password",
    passwordChanged: "Password updated.",
    invalidCredentials: "Invalid email or password.",
    emailExists: "An account with this email already exists.",
    passwordTooShort: "Password must be at least 8 characters.",
    emailInvalid: "Enter a valid email address.",
    accountCreated: "Account created.",
    welcomeBack: "Signed in. Welcome back.",
    loading: "Loading…",
    total: "Total",
    passwordMismatch: "Passwords don't match",
    sendLink: "Send link",
    resetSent: "If an account exists, you'll receive a password reset email.",
    noToken: "No token found.",
    orderDetails: "Order details",
    paymentUsdNote: "Final payment is charged in USD.",
    currencyLabel: "Currency",
    currencyNote: "Display only. Payment is always charged in USD.",
  },
  tracking: {
    title: "Track your order",
    sub: "Enter your tracking number (e.g. AREM-XXXXXXXX).",
    label: "Tracking number",
    track: "Track",
    connectionError: "Connection error",
  },
  filters: {
    title: "Filters",
    close: "Close filters",
    search: "Search",
    searchPlaceholder: "coffee, mochila, clay…",
    searchPieces: "Search pieces…",
    region: "Region / Territory",
    allRegions: "All regions",
    showResults: "Show results",
  },
  cookie: {
    text: "We use essential cookies to make the site work and optional analytics cookies to improve your experience. ",
    preferences: "Cookie preferences",
    policy: "Cookie policy",
    reject: "Reject",
    rejectAria: "Reject non-essential cookies",
    accept: "Accept all",
    acceptAria: "Accept all cookies",
  },
  recommendations: {
    similar: "Similar pieces",
    fromCraft: "From this craft",
    favorites: "Favourites",
    loadError: "Could not load recommendations. Try again later.",
  },
  spotlight: {
    title: "Star product of the week",
    close: "Close",
    kicker: "Star of the week",
    viewPiece: "View piece",
    later: "No thanks",
  },
  home: {
    bestSeller: (index) => `Nº ${index} best seller`,
    viewPiece: "View piece",
    brandKicker: "Handmade · Colombia",
  },
  legal: {
    lastUpdated: "Last updated:",
    questions: "Questions? Email ",
    contactEmailAria: "Contact email",
  },
  error: {
    title: "Something went wrong",
    sub: "We couldn't load this page. Give it another shot or head back home.",
    reload: "Reload",
    reloadPage: "Reload page",
  },
  checkout: {
    title: "Checkout",
    subtitle: "No account needed to buy.",
    contactInfo: "Contact information",
    email: "Email",
    phone: "Phone",
    shipAddress: "Shipping address",
    firstName: "First name",
    lastName: "Last name",
    country: "Country",
    state: "State / Province",
    city: "City",
    postal: "Postal code",
    address: "Address",
    apt: "Apartment / Suite",
    instructions: "Instructions",
    shipMethod: "Shipping method",
    payMethod: "Payment method",
    manualNote: "Payments are confirmed manually for now; the provider architecture (Stripe, PayPal, Wompi, Mercado Pago) is ready.",
    summary: "Order summary",
    subtotal: "Subtotal",
    shipping: "Shipping",
    total: "Total",
    placeOrder: "Place order",
    processing: "Processing…",
    empty: "Your cart is empty.",
    emptyCta: "Go to shop",
    created: "Order created!",
    orderIs: (orderNumber) => `Your order number is ${orderNumber}.`,
    pendingNote: "Payment is pending confirmation. Once confirmed, we auto-generate your shipping guide for tracking.",
    trackLabel: "Track your shipment",
    trackBtn: "Track",
    searching: "Searching…",
    eventsCount: (count) => `${count} events`,
    guideNote: (orderId) => `Order ID: ${orderId}. Guide is generated on payment confirmation.`,
    createAccount: "Create an account to track your order",
    continueShopping: "Continue shopping",
    liveRates: (provider) => `Live rates via ${provider}.`,
    connectionError: "Connection error",
  },
  social: {
    followLabel: "Follow on Instagram",
    followAria: (handle) => `Follow ${handle} on Instagram`,
    openProfile: (handle) => `Open ${handle} on Instagram`,
    emptySearch: "Find us on Instagram as @arem.world.",
    feedNote: "The craft process behind each piece lives on our Instagram.",
  },
};

const es: Dictionary = {
  nav: {
    shop: "Tienda",
    collections: "Colecciones",
    about: "Nosotros",
    contact: "Contacto",
  },
  a11y: {
    openMenu: "Abrir menú",
    closeMenu: "Cerrar menú",
    wishlist: "Favoritos",
    cart: "Carrito",
    closeCart: "Cerrar carrito",
    decreaseQty: "Disminuir cantidad",
    increaseQty: "Aumentar cantidad",
    remove: "Quitar",
    addToWishlist: "Agregar a favoritos",
    removeFromWishlist: "Quitar de favoritos",
    viewImage: "Ver imagen",
    language: "Idioma",
    search: "Buscar",
    prev: "Anterior",
    next: "Siguiente",
    prevImage: "Imagen anterior",
    nextImage: "Imagen siguiente",
    quickView: "Vista rápida",
    close: "Cerrar",
    dismiss: "Descartar",
    viewCart: "Ver carrito",
    breadcrumbs: "Ruta de navegación",
    currency: "Moneda",
    mainNav: "Navegación principal",
    mobileNav: "Menú móvil",
    announcement: "Anuncios",
    playAnnouncements: "Reanudar anuncios",
    pauseAnnouncements: "Pausar anuncios",
    heroLabel: "Artesanía colombiana del taller al mundo",
    logoAlt: "AREM WORLD — Artesanía colombiana",
  },
  common: {
    home: "Inicio",
    explore: "Explorar",
    viewAll: "Ver todo",
    viewCollection: "Ver colección",
    pieces: (count) => `${count} ${count === 1 ? "pieza" : "piezas"}`,
    products: (count) => `${count} ${count === 1 ? "producto" : "productos"}`,
  },
  shop: {
    eyebrow: "La tienda",
    allTitle: "Toda la tienda",
    allSub: "Cada pieza está hecha a mano por artesanos colombianos y se envía con su historia.",
    categories: "Categorías",
    all: "Todo",
    sort: "Ordenar",
    sortFeatured: "Destacados",
    sortPriceAsc: "Precio: menor a mayor",
    sortPriceDesc: "Precio: mayor a menor",
    sortName: "Nombre: A–Z",
    empty: "No hay productos en esta categoría todavía. Vuelve pronto.",
    noResults: "Prueba con otra palabra o categoría.",
    count: (count) => `${count} ${count === 1 ? "pieza" : "piezas"}`,
  },
  product: {
    addToCart: "Agregar al carrito",
    soldOut: "Agotado",
    available: (count) => `${count} disponibles`,
    originalPrice: "Precio original:",
    origin: "Origen",
    artisan: "Artesano",
    collections: "Colecciones",
    sku: "SKU",
    inventoryNote: "Inventario gestionado por variante",
    storyTitle: "La historia de esta pieza",
    detailsTitle: "Detalles y cuidados",
    relatedEyebrow: "Te puede gustar",
    relatedTitle: "Piezas relacionadas",
    galleryNote: "Arte placeholder — la fotografía real llega en el lanzamiento.",
    newBadge: "Nuevo",
    noReviews: "Sin reseñas todavía",
    beFirstReview: "Nuevo · Sé la primera reseña",
    estimatedShort: "Conversión estimada.",
    shippingTitle: "Envíos y devoluciones",
    shippingBody: "Enviamos a todo el mundo desde EE. UU. con guía rastreable. Tienes 30 días para devoluciones.",
    trackOrder: "Rastrear pedido",
    meetMaker: "Conoce al creador",
    secureCheckout: "Compra segura",
    trackedShipping: "Envío con rastreo",
    handmade: "Hecho a mano",
    addedToCart: "Agregado al carrito",
  },
  cart: {
    title: "Tu carrito",
    empty: "Tu carrito está vacío por ahora.",
    viewFull: "Ver carrito completo",
    checkoutLater: "El checkout y los pagos llegarán en una fase posterior.",
    yourSelection: "Tu selección",
    lines: (count) => `${count} ${count === 1 ? "línea" : "líneas"}`,
    clear: "Vaciar carrito",
    summary: "Resumen",
    subtotal: "Subtotal",
    shipping: "Envío",
    shippingNote: "Se calcula al finalizar",
    freeShipping: "Gratis",
    total: "Total estimado",
    checkoutBtn: "Finalizar compra — próximamente",
    paymentsNote: "Pagos, envío y órdenes llegan en una fase posterior.",
    keepShopping: "Seguir explorando",
    emptySub: "Las piezas hechas a mano te están esperando.",
    estimatedNote: "Conversión estimada. El pago final se cobra en USD.",
    finalTotal: "Total final (USD)",
    checkoutNow: "Finalizar compra",
    paymentNote: "El pago se cobra en USD.",
    slideToClear: "Desliza para vaciar",
  },
  wishlist: {
    title: "Favoritos",
    yourFavorites: "Tus favoritas",
    empty: "Aún no tienes favoritos. Toca el corazón de cualquier pieza para guardarla aquí.",
    saved: (count) => `${count} ${count === 1 ? "pieza guardada" : "piezas guardadas"}`,
    clear: "Limpiar favoritos",
    emptySub: "Toca el corazón en lo que ames.",
  },
  forms: {
    newsletterEmail: "Tu correo electrónico",
    subscribe: "Suscribirme",
    newsletterSuccess: "¡Gracias! Te avisaremos cuando haya algo hermoso que contarte.",
    newsletterNote: "Sin spam, nunca. Puedes darte de baja cuando quieras.",
    name: "Nombre",
    email: "Correo electrónico",
    topic: "Motivo",
    message: "Mensaje",
    namePlaceholder: "Tu nombre",
    emailPlaceholder: "tucorreo@ejemplo.com",
    messagePlaceholder: "Cuéntanos en qué podemos ayudarte…",
    topicOrder: "Información de un pedido",
    topicProduct: "Pregunta sobre un producto",
    topicArtisan: "Quiero trabajar con AREM",
    topicWholesale: "Compras al por mayor",
    topicOther: "Otro",
    send: "Enviar mensaje",
    sending: "Enviando…",
    sendError: "No pudimos enviar tu mensaje. Inténtalo de nuevo.",
    success: "Mensaje enviado. Te responderemos en menos de 24 horas hábiles.",
    consent: "Acepto el tratamiento de mis datos para responder esta consulta.",
    consentRequired: "Debes aceptar la política de privacidad para enviar este mensaje.",
    consentPrivacy: "Política de privacidad",
    invalidEmail: "Email inválido",
    subscribeError: "Error al suscribirte. Intenta más tarde.",
    newsletterConsent: "Acepto la política de privacidad y recibir emails.",
    newsletterConsentRequired: "Debes aceptar la política de privacidad.",
  },
  contact: {
    eyebrow: "Hablemos",
    title: "Contacto",
    sub: "¿Preguntas sobre una pieza, un pedido o una alianza con artesanos? Escríbenos — respondemos en menos de 24 horas hábiles.",
    otherWays: "Otras vías",
    otherWaysSub: "Si prefieres, también puedes escribirnos directamente o visitarnos en Bogotá.",
    hours: "Horario",
    hoursValue: "Lun – Vie · 9:00 – 18:00",
    sendMessage: "Envíanos un mensaje",
    addressLabel: "Dirección",
  },
  heroStats: {
    artisans: "artesanos",
    municipalities: "municipios",
    handmade: "hecho a mano",
  },
  collections: {
    eyebrow: "Historias que valen la pena",
    title: "Colecciones",
    sub: "Grupos de piezas que cuentan una historia: herencia, oficio y lugar.",
    filling: "Esta colección se está llenando. Vuelve pronto.",
    count: (count) => `${count} ${count === 1 ? "colección" : "colecciones"}`,
  },
  notFound: {
    code: "Error 404",
    title: "Esta página no existe",
    sub: "Quizá la pieza se vendió, la historia cambió de lugar, o simplemente te perdiste. Volvamos al inicio.",
    home: "Ir al inicio",
    exploreShop: "Explorar la tienda",
  },
  meta: {
    notFoundProduct: "Producto no encontrado",
    notFoundCollection: "Colección no encontrada",
  },
  footer: {
    explore: "Tienda",
    brand: "Nuestro oficio",
    help: "Ayuda",
    contact: "Contacto",
    bottomNote: "Hecho a mano · Con cuidado",
  },
  account: {
    myAccount: "Mi cuenta",
    overview: "Resumen",
    profile: "Perfil",
    addresses: "Direcciones",
    wishlist: "Favoritos",
    orders: "Pedidos",
    security: "Seguridad",
    signIn: "Iniciar sesión",
    signUp: "Crear cuenta",
    signOut: "Cerrar sesión",
    backToShop: "Volver a la tienda",
    signInTitle: "Bienvenido de nuevo",
    signInSub: "Inicia sesión para gestionar tu perfil, direcciones y pedidos.",
    signUpTitle: "Crea tu cuenta",
    signUpSub: "Guarda tus favoritos y tu historial de pedidos en un solo lugar.",
    forgotTitle: "Restablece tu contraseña",
    forgotSub: "Ingresa tu correo y te enviaremos un enlace de restablecimiento.",
    resetTitle: "Elige una nueva contraseña",
    resetSub: "Tu contraseña anterior ya no es válida.",
    resetPassword: "Actualizar contraseña",
    email: "Correo electrónico",
    password: "Contraseña",
    confirmPassword: "Confirmar contraseña",
    firstName: "Nombre",
    lastName: "Apellido",
    phone: "Teléfono",
    preferredLanguage: "Idioma preferido",
    languageEn: "English",
    languageEs: "Español",
    save: "Guardar",
    saving: "Guardando…",
    cancel: "Cancelar",
    edit: "Editar",
    delete: "Eliminar",
    add: "Añadir",
    confirmDelete: "Confirmar eliminación",
    profileTitle: "Perfil",
    profileSub: "Tus datos personales y preferencias.",
    profileSaved: "Perfil actualizado.",
    addressesTitle: "Libreta de direcciones",
    addressesSub: "Administra tus direcciones de envío y facturación.",
    addAddress: "Añadir dirección",
    editAddress: "Editar dirección",
    recipientName: "Nombre del destinatario",
    addressLine1: "Dirección línea 1",
    addressLine2: "Dirección línea 2",
    city: "Ciudad",
    state: "Departamento / región",
    postalCode: "Código postal",
    country: "País",
    defaultShipping: "Envío por defecto",
    defaultBilling: "Facturación por defecto",
    addressSaved: "Dirección guardada.",
    addressDeleted: "Dirección eliminada.",
    requiredFields: "Completa los campos obligatorios.",
    wishlistTitle: "Tus favoritos",
    wishlistSub: "Piezas guardadas en tu cuenta.",
    wishlistSaved: "Guardado en tu cuenta.",
    wishlistAccount: "Esta lista se guarda de forma segura en tu cuenta.",
    ordersTitle: "Tus pedidos",
    ordersSub: "Consulta y sigue tus pedidos.",
    noOrders: "Aún no tienes pedidos.",
    orderNumber: "Pedido",
    orderDate: "Fecha",
    paymentStatus: "Pago",
    fulfillmentStatus: "Cumplimiento",
    items: "Artículos",
    quantity: "Cant.",
    price: "Precio",
    shippingAddress: "Dirección de envío",
    trackingNumber: "Número de seguimiento",
    trackingPending: "El seguimiento aparecerá cuando tu pedido sea enviado.",
    shipmentTimeline: "Estado del envío",
    backToOrders: "Volver a pedidos",
    statusPendingPayment: "Pago pendiente",
    statusPaid: "Pagado",
    statusProcessing: "En preparación",
    statusShipped: "Enviado",
    statusDelivered: "Entregado",
    statusCancelled: "Cancelado",
    statusRefunded: "Reembolsado",
    paymentPending: "Pendiente",
    paymentPaid: "Pagado",
    paymentRefunded: "Reembolsado",
    paymentFailed: "Fallido",
    securityTitle: "Seguridad",
    securitySub: "Actualiza tu contraseña.",
    currentPassword: "Contraseña actual",
    newPassword: "Nueva contraseña",
    changePassword: "Cambiar contraseña",
    passwordChanged: "Contraseña actualizada.",
    invalidCredentials: "Correo o contraseña inválidos.",
    emailExists: "Ya existe una cuenta con este correo.",
    passwordTooShort: "La contraseña debe tener al menos 8 caracteres.",
    emailInvalid: "Ingresa un correo válido.",
    accountCreated: "Cuenta creada.",
    welcomeBack: "Sesión iniciada. Bienvenido de nuevo.",
    loading: "Cargando…",
    total: "Total",
    passwordMismatch: "Las contraseñas no coinciden",
    sendLink: "Enviar enlace",
    resetSent: "Si existe una cuenta, recibirás un correo para restablecer la contraseña.",
    noToken: "No se encontró el token.",
    orderDetails: "Detalle del pedido",
    paymentUsdNote: "El pago final se cobra en USD.",
    currencyLabel: "Moneda",
    currencyNote: "Solo cambia la visualización. El pago siempre se cobra en USD.",
  },
  tracking: {
    title: "Rastrea tu pedido",
    sub: "Ingresa tu número de guía (ej. AREM-XXXXXXXX).",
    label: "Número de guía",
    track: "Rastrear",
    connectionError: "Error de conexión",
  },
  filters: {
    title: "Filtros",
    close: "Cerrar filtros",
    search: "Buscar",
    searchPlaceholder: "café, mochila, barro…",
    searchPieces: "Buscar piezas…",
    region: "Región / Territorio",
    allRegions: "Todas las regiones",
    showResults: "Ver resultados",
  },
  cookie: {
    text: "Usamos cookies esenciales para que el sitio funcione y cookies analíticas opcionales para mejorar tu experiencia. ",
    preferences: "Preferencias de cookies",
    policy: "Política de cookies",
    reject: "Rechazar",
    rejectAria: "Rechazar cookies no esenciales",
    accept: "Aceptar todo",
    acceptAria: "Aceptar todas las cookies",
  },
  recommendations: {
    similar: "Piezas similares",
    fromCraft: "Más de este oficio",
    favorites: "Piezas favoritas",
    loadError: "No se pudieron cargar las recomendaciones. Inténtalo más tarde.",
  },
  spotlight: {
    title: "Producto estrella de la semana",
    close: "Cerrar",
    kicker: "Estrella de la semana",
    viewPiece: "Conoce la pieza",
    later: "No, gracias",
  },
  home: {
    bestSeller: (index) => `Nº ${index} más vendida`,
    viewPiece: "Conoce la pieza",
    brandKicker: "Hecho a mano · Colombia",
  },
  legal: {
    lastUpdated: "Última actualización:",
    questions: "¿Preguntas? Escríbenos a ",
    contactEmailAria: "Correo electrónico de contacto",
  },
  error: {
    title: "Algo salió mal",
    sub: "No pudimos cargar esta página. Inténtalo de nuevo o vuelve al inicio.",
    reload: "Recargar",
    reloadPage: "Recargar página",
  },
  checkout: {
    title: "Finalizar compra",
    subtitle: "No necesitas una cuenta para comprar.",
    contactInfo: "Información de contacto",
    email: "Correo electrónico",
    phone: "Teléfono",
    shipAddress: "Dirección de envío",
    firstName: "Nombre",
    lastName: "Apellido",
    country: "País",
    state: "Departamento / Estado",
    city: "Ciudad",
    postal: "Código postal",
    address: "Dirección",
    apt: "Apartamento / Suite",
    instructions: "Instrucciones",
    shipMethod: "Método de envío",
    payMethod: "Método de pago",
    manualNote: "Los pagos se confirman manualmente por ahora; la arquitectura de proveedores (Stripe, PayPal, Wompi, Mercado Pago) está preparada.",
    summary: "Resumen",
    subtotal: "Subtotal",
    shipping: "Envío",
    total: "Total",
    placeOrder: "Realizar pedido",
    processing: "Procesando…",
    empty: "Tu carrito está vacío.",
    emptyCta: "Ir a la tienda",
    created: "¡Pedido creado!",
    orderIs: (orderNumber) => `Tu número de pedido es ${orderNumber}.`,
    pendingNote: "El pago quedó pendiente de confirmación. Cuando se confirme, generamos tu guía de envío automáticamente y podrás rastrearla.",
    trackLabel: "Rastrea tu guía",
    trackBtn: "Rastrear",
    searching: "Buscando…",
    eventsCount: (count) => `${count} eventos`,
    guideNote: (orderId) => `ID de pedido: ${orderId}. La guía se genera al confirmarse el pago.`,
    createAccount: "Crea una cuenta para seguir tu pedido",
    continueShopping: "Seguir explorando",
    liveRates: (provider) => `Tarifas en vivo vía ${provider}.`,
    connectionError: "Error de conexión",
  },
  social: {
    followLabel: "Seguir en Instagram",
    followAria: (handle) => `Seguir a ${handle} en Instagram`,
    openProfile: (handle) => `Abrir Instagram de ${handle}`,
    emptySearch: "Encuéntranos en Instagram como @arem.world.",
    feedNote: "El proceso artesanal detrás de cada pieza vive en nuestro Instagram.",
  },
};

export const dictionaries: Record<Locale, Dictionary> = { en, es };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries[defaultLocale];
}
