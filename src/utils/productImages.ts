// Rich SVG data URIs for accessories: high-fidelity, responsive, commercial luxury visuals
// Zero-broken-image policy: resilient, instantaneous, and never blocked by external CORS or sandboxes.

export function getProductPlaceholder(category: string, title: string, seed: string = '1'): string {
  const hash = title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  // Theme palettes based on accessory type
  let bgGradient = ['#1C1917', '#292524']; // Dark slate
  let accentColor = '#D97706'; // Amber gold
  let iconSvg = '';

  const cleanCat = category.toLowerCase();

  if (cleanCat.includes('watch')) {
    bgGradient = ['#18181B', '#27272A'];
    accentColor = '#F59E0B';
    iconSvg = `
      <!-- Watch Dial and Bezel -->
      <circle cx="200" cy="180" r="105" fill="#09090B" stroke="#3F3F46" stroke-width="6"/>
      <circle cx="200" cy="180" r="95" fill="#18181B" stroke="#27272A" stroke-width="2"/>
      <!-- Hour Indices -->
      <line x1="200" y1="95" x2="200" y2="108" stroke="#D4D4D8" stroke-width="4" stroke-linecap="round"/>
      <line x1="200" y1="252" x2="200" y2="265" stroke="#D4D4D8" stroke-width="4" stroke-linecap="round"/>
      <line x1="115" y1="180" x2="128" y2="180" stroke="#D4D4D8" stroke-width="4" stroke-linecap="round"/>
      <line x1="272" y1="180" x2="285" y2="180" stroke="#D4D4D8" stroke-width="4" stroke-linecap="round"/>
      <!-- Subdials -->
      <circle cx="200" cy="145" r="18" fill="none" stroke="#52525B" stroke-width="1.5"/>
      <circle cx="165" cy="195" r="18" fill="none" stroke="#52525B" stroke-width="1.5"/>
      <!-- Watch Hands -->
      <line x1="200" y1="180" x2="200" y2="125" stroke="#F4F4F5" stroke-width="3.5" stroke-linecap="round"/>
      <line x1="200" y1="180" x2="242" y2="180" stroke="#F4F4F5" stroke-width="3" stroke-linecap="round"/>
      <line x1="200" y1="180" x2="182" y2="215" stroke="${accentColor}" stroke-width="1.5" stroke-linecap="round"/>
      <circle cx="200" cy="180" r="5" fill="${accentColor}"/>
      <!-- Straps -->
      <path d="M165 75 L235 75 L230 15 L170 15 Z" fill="#292524" stroke="#44403C" stroke-width="2"/>
      <path d="M165 285 L235 285 L230 345 L170 345 Z" fill="#292524" stroke="#44403C" stroke-width="2"/>
    `;
  } else if (cleanCat.includes('sunglass')) {
    bgGradient = ['#262626', '#171717'];
    accentColor = '#FBBF24';
    iconSvg = `
      <!-- Sunglasses Frame -->
      <path d="M100 160 C120 145, 175 145, 185 175 C190 190, 180 220, 140 220 C105 220, 95 190, 100 160 Z" fill="#0A0A0A" stroke="#78716C" stroke-width="4"/>
      <path d="M215 175 C225 145, 280 145, 300 160 C305 190, 295 220, 260 220 C220 220, 210 190, 215 175 Z" fill="#0A0A0A" stroke="#78716C" stroke-width="4"/>
      <!-- Bridge -->
      <path d="M185 168 Q200 162 215 168" fill="none" stroke="#D97706" stroke-width="4" stroke-linecap="round"/>
      <!-- Brow Bar -->
      <line x1="130" y1="150" x2="270" y2="150" stroke="#B45309" stroke-width="3" stroke-linecap="round"/>
      <!-- Polarized Tint Gradients -->
      <path d="M108 165 C122 153, 168 153, 177 177 C181 189, 173 212, 141 212 C113 212, 104 189, 108 165 Z" fill="url(#lensGrad)"/>
      <path d="M223 177 C232 153, 278 153, 292 165 C296 189, 287 212, 259 212 C227 212, 219 189, 223 177 Z" fill="url(#lensGrad)"/>
      <!-- Temples -->
      <path d="M96 160 L50 148" stroke="#78716C" stroke-width="4" stroke-linecap="round"/>
      <path d="M304 160 L350 148" stroke="#78716C" stroke-width="4" stroke-linecap="round"/>
    `;
  } else if (cleanCat.includes('wallet')) {
    bgGradient = ['#3E2723', '#271711'];
    accentColor = '#D97706';
    iconSvg = `
      <!-- Leather Bifold Wallet -->
      <rect x="90" y="115" width="220" height="150" rx="14" fill="#5D4037" stroke="#3E2723" stroke-width="4"/>
      <!-- Edge Stitching -->
      <rect x="98" y="123" width="204" height="134" rx="8" fill="none" stroke="#D7CCC8" stroke-width="1.5" stroke-dasharray="5 4"/>
      <!-- Wallet Fold & Slots -->
      <path d="M110 160 L290 160" stroke="#3E2723" stroke-width="3"/>
      <path d="M110 195 L290 195" stroke="#3E2723" stroke-width="3"/>
      <!-- Brass Logo Badge -->
      <rect x="250" y="225" width="28" height="16" rx="3" fill="#D97706" stroke="#92400E" stroke-width="1"/>
      <circle cx="264" cy="233" r="3" fill="#78350F"/>
      <!-- Embossed Texture -->
      <path d="M90 115 C140 135, 140 245, 90 265" fill="#4E342E" opacity="0.6"/>
    `;
  } else if (cleanCat.includes('bag')) {
    bgGradient = ['#1E293B', '#0F172A'];
    accentColor = '#E2E8F0';
    iconSvg = `
      <!-- Structured Tote / Weekend Bag -->
      <path d="M110 140 L290 140 L310 270 L90 270 Z" fill="#334155" stroke="#1E293B" stroke-width="4"/>
      <!-- Straps & Handles -->
      <path d="M150 140 C150 70, 250 70, 250 140" fill="none" stroke="#78350F" stroke-width="7" stroke-linecap="round"/>
      <path d="M150 140 L150 240" stroke="#78350F" stroke-width="6"/>
      <path d="M250 140 L250 240" stroke="#78350F" stroke-width="6"/>
      <!-- Hardware / Buckles -->
      <rect x="144" y="150" width="12" height="14" rx="2" fill="#F59E0B"/>
      <rect x="244" y="150" width="12" height="14" rx="2" fill="#F59E0B"/>
      <!-- Front Zipper Pocket -->
      <rect x="170" y="180" width="60" height="2" fill="#64748B"/>
    `;
  } else if (cleanCat.includes('bracelet')) {
    bgGradient = ['#1C1917', '#18181B'];
    accentColor = '#E0E7FF';
    iconSvg = `
      <!-- Minimalist Cuff & Bead Bracelet -->
      <!-- Metal Cuff -->
      <path d="M110 180 C110 110, 290 110, 290 180 C290 240, 240 260, 220 260" fill="none" stroke="#CBD5E1" stroke-width="12" stroke-linecap="round"/>
      <!-- Onyx Beads -->
      <circle cx="100" cy="180" r="11" fill="#09090B" stroke="#27272A" stroke-width="1.5"/>
      <circle cx="115" cy="150" r="11" fill="#09090B" stroke="#27272A" stroke-width="1.5"/>
      <circle cx="140" cy="125" r="11" fill="#09090B" stroke="#27272A" stroke-width="1.5"/>
      <circle cx="175" cy="115" r="11" fill="#D97706" stroke="#92400E" stroke-width="1.5"/>
      <circle cx="210" cy="115" r="11" fill="#09090B" stroke="#27272A" stroke-width="1.5"/>
      <circle cx="245" cy="125" r="11" fill="#09090B" stroke="#27272A" stroke-width="1.5"/>
      <circle cx="270" cy="150" r="11" fill="#09090B" stroke="#27272A" stroke-width="1.5"/>
      <circle cx="285" cy="180" r="11" fill="#09090B" stroke="#27272A" stroke-width="1.5"/>
    `;
  } else {
    // Tech / Mobile accessory
    bgGradient = ['#1E1B4B', '#0F172A'];
    accentColor = '#818CF8';
    iconSvg = `
      <!-- Tech Sleeve / MagSafe Accessories -->
      <rect x="130" y="90" width="140" height="210" rx="20" fill="#312E81" stroke="#4338CA" stroke-width="4"/>
      <!-- Magnetic Circle -->
      <circle cx="200" cy="180" r="45" fill="none" stroke="#A5B4FC" stroke-width="4" stroke-dasharray="10 6"/>
      <line x1="200" y1="225" x2="200" y2="245" stroke="#A5B4FC" stroke-width="4" stroke-linecap="round"/>
      <!-- Camera cutout outline -->
      <rect x="145" y="105" width="40" height="40" rx="8" fill="none" stroke="#6366F1" stroke-width="2"/>
    `;
  }

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 360" width="100%" height="100%">
      <defs>
        <linearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${bgGradient[0]}"/>
          <stop offset="100%" stop-color="${bgGradient[1]}"/>
        </linearGradient>
        <linearGradient id="lensGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#451A03" stop-opacity="0.9"/>
          <stop offset="100%" stop-color="#78350F" stop-opacity="0.3"/>
        </linearGradient>
        <radialGradient id="pedestalGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.08"/>
          <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <!-- Background canvas -->
      <rect width="400" height="360" fill="url(#bgGrad)"/>
      <!-- Subtle Pedestal Shadow & Spotlight -->
      <ellipse cx="200" cy="270" rx="140" ry="40" fill="url(#pedestalGrad)"/>
      <ellipse cx="200" cy="280" rx="110" ry="18" fill="#000000" opacity="0.35"/>
      <!-- Product Artwork -->
      ${iconSvg}
      <!-- Subtle Brand Seal -->
      <text x="200" y="332" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="600" letter-spacing="3" fill="#A8A29E" text-anchor="middle" opacity="0.8">LUXELANE · ESSENTIALS</text>
    </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg.trim())}`;
}
