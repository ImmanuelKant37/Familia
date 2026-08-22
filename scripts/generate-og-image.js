import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <defs>
    <!-- Background Gradient -->
    <radialGradient id="bgParchment" cx="50%" cy="40%" r="80%">
      <stop offset="0%" stop-color="#FCFAF6"/>
      <stop offset="55%" stop-color="#F5F1E8"/>
      <stop offset="100%" stop-color="#E7E1D2"/>
    </radialGradient>
    
    <!-- Olive Forest Gradient -->
    <linearGradient id="forestGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#6B6B4C"/>
      <stop offset="100%" stop-color="#3D3D2C"/>
    </linearGradient>

    <!-- Warm Terracotta Gradient -->
    <linearGradient id="terracottaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#D97A5E"/>
      <stop offset="100%" stop-color="#9C4C36"/>
    </linearGradient>

    <!-- Soft Gold Gradient -->
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#D4AF37"/>
      <stop offset="100%" stop-color="#A68018"/>
    </linearGradient>

    <!-- Card Shadow -->
    <filter id="shadowHeavy" x="-15%" y="-15%" width="130%" height="130%">
      <feDropShadow dx="0" dy="10" stdDeviation="14" flood-color="#2C2C1E" flood-opacity="0.16"/>
    </filter>

    <filter id="badgeShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#2C2C1E" flood-opacity="0.08"/>
    </filter>
  </defs>

  <!-- Background Canvas -->
  <rect width="1200" height="630" fill="url(#bgParchment)"/>
  
  <!-- Outer Double Vintage Border -->
  <rect x="28" y="28" width="1144" height="574" rx="28" fill="none" stroke="#CFC9BA" stroke-width="2.5"/>
  <rect x="40" y="40" width="1120" height="550" rx="20" fill="none" stroke="#5A5A40" stroke-width="1.2" stroke-opacity="0.35" stroke-dasharray="8 6"/>

  <!-- Left Side: Illustrated Oak Family Tree Emblem -->
  <g transform="translate(90, 75)">
    <!-- Tree Circular Frame Shield with Shadow -->
    <g filter="url(#shadowHeavy)">
      <circle cx="240" cy="240" r="215" fill="#434331"/>
      <circle cx="240" cy="240" r="202" fill="none" stroke="#D4AF37" stroke-width="2.5" stroke-opacity="0.6"/>
      <circle cx="240" cy="240" r="194" fill="#FBF9F5"/>
    </g>

    <!-- Tree Canopy Background Glow -->
    <circle cx="240" cy="180" r="125" fill="#5A5A40" fill-opacity="0.08"/>

    <!-- Tree Roots -->
    <path d="M240 355 C210 375 165 390 120 395" stroke="#706D5E" stroke-width="11" stroke-linecap="round"/>
    <path d="M240 355 C270 375 315 390 360 395" stroke="#706D5E" stroke-width="11" stroke-linecap="round"/>
    <path d="M240 355 C230 380 220 400 205 410" stroke="#706D5E" stroke-width="7" stroke-linecap="round"/>
    <path d="M240 355 C250 380 260 400 275 410" stroke="#706D5E" stroke-width="7" stroke-linecap="round"/>

    <!-- Tree Trunk -->
    <path d="M240 365 L240 250" stroke="#434331" stroke-width="26" stroke-linecap="round"/>
    <path d="M240 280 C215 250 160 215 145 155" stroke="#434331" stroke-width="16" stroke-linecap="round"/>
    <path d="M240 280 C265 250 320 215 335 155" stroke="#434331" stroke-width="16" stroke-linecap="round"/>
    <path d="M240 250 L240 125" stroke="#434331" stroke-width="18" stroke-linecap="round"/>

    <!-- Secondary Branches -->
    <path d="M190 205 C150 185 110 180 95 135" stroke="#5A5A40" stroke-width="10" stroke-linecap="round"/>
    <path d="M290 205 C330 185 370 180 385 135" stroke="#5A5A40" stroke-width="10" stroke-linecap="round"/>
    <path d="M240 170 C210 145 180 135 160 95" stroke="#5A5A40" stroke-width="9" stroke-linecap="round"/>
    <path d="M240 170 C270 145 300 135 320 95" stroke="#5A5A40" stroke-width="9" stroke-linecap="round"/>

    <!-- Generational Member Nodes (Family Avatars / Medallions) -->
    <!-- Apex Ancestor Node (Gold/Terracotta) -->
    <circle cx="240" cy="95" r="26" fill="url(#terracottaGrad)" stroke="#FFFFFF" stroke-width="5"/>
    <circle cx="240" cy="95" r="10" fill="#FFFFFF" fill-opacity="0.3"/>

    <!-- Generation 1 Nodes -->
    <circle cx="150" cy="115" r="21" fill="url(#forestGrad)" stroke="#FFFFFF" stroke-width="4.5"/>
    <circle cx="330" cy="115" r="21" fill="url(#forestGrad)" stroke="#FFFFFF" stroke-width="4.5"/>

    <!-- Generation 2 Outer Nodes -->
    <circle cx="95" cy="140" r="18" fill="url(#terracottaGrad)" stroke="#FFFFFF" stroke-width="4"/>
    <circle cx="385" cy="140" r="18" fill="url(#terracottaGrad)" stroke="#FFFFFF" stroke-width="4"/>

    <!-- Generation 2 Inner Nodes -->
    <circle cx="195" cy="165" r="17" fill="url(#forestGrad)" stroke="#FFFFFF" stroke-width="3.5"/>
    <circle cx="285" cy="165" r="17" fill="url(#forestGrad)" stroke="#FFFFFF" stroke-width="3.5"/>

    <!-- Generation 3 / Descendants -->
    <circle cx="135" cy="225" r="15" fill="url(#terracottaGrad)" stroke="#FFFFFF" stroke-width="3"/>
    <circle cx="345" cy="225" r="15" fill="url(#terracottaGrad)" stroke="#FFFFFF" stroke-width="3"/>

    <!-- Base Crest Ribbon -->
    <g transform="translate(140, 415)">
      <rect x="0" y="0" width="200" height="36" rx="18" fill="#434331"/>
      <text x="100" y="23" font-family="sans-serif" font-size="13" font-weight="700" fill="#FDFBF7" text-anchor="middle" letter-spacing="2">LINAJE &amp; RAÍCES</text>
    </g>
  </g>

  <!-- Right Side: Clean, High-Contrast Typography & Information -->
  <g transform="translate(580, 110)">
    <!-- Small Top Eyebrow Tag -->
    <g filter="url(#badgeShadow)">
      <rect x="0" y="0" width="250" height="36" rx="18" fill="#5A5A40"/>
      <text x="125" y="23" font-family="sans-serif" font-size="13" font-weight="700" fill="#FDFBF7" text-anchor="middle" letter-spacing="2.5">HISTORIA FAMILIAR</text>
    </g>

    <!-- Main Prominent Heading: Árbol Genealógico Familiar -->
    <text x="0" y="115" font-family="serif" font-size="52" font-weight="800" fill="#2C2C1E" letter-spacing="0.5">Árbol Genealógico</text>
    <text x="0" y="175" font-family="serif" font-size="52" font-weight="800" fill="#5A5A40" letter-spacing="0.5">Familiar</text>

    <!-- Subtitle / Descriptive Tagline -->
    <text x="0" y="230" font-family="serif" font-style="italic" font-size="22" fill="#6B675A">
      Explora antepasados, linajes, biografías y archivos históricos
    </text>

    <!-- Elegant Separator Line -->
    <line x1="0" y1="265" x2="520" y2="265" stroke="#CFC9BA" stroke-width="2.5"/>

    <!-- Key Feature Badges -->
    <g transform="translate(0, 295)">
      <!-- Badge 1 -->
      <g filter="url(#badgeShadow)" transform="translate(0, 0)">
        <rect x="0" y="0" width="160" height="46" rx="23" fill="#FFFFFF" stroke="#D8D4C9" stroke-width="1.5"/>
        <text x="80" y="29" font-family="sans-serif" font-size="14" font-weight="700" fill="#434331" text-anchor="middle">🌳 Visualizador 2D/3D</text>
      </g>

      <!-- Badge 2 -->
      <g filter="url(#badgeShadow)" transform="translate(175, 0)">
        <rect x="0" y="0" width="155" height="46" rx="23" fill="#FFFFFF" stroke="#D8D4C9" stroke-width="1.5"/>
        <text x="77" y="29" font-family="sans-serif" font-size="14" font-weight="700" fill="#434331" text-anchor="middle">📜 Archivo &amp; Fotos</text>
      </g>

      <!-- Badge 3 -->
      <g filter="url(#badgeShadow)" transform="translate(345, 0)">
        <rect x="0" y="0" width="165" height="46" rx="23" fill="#FFFFFF" stroke="#D8D4C9" stroke-width="1.5"/>
        <text x="82" y="29" font-family="sans-serif" font-size="14" font-weight="700" fill="#434331" text-anchor="middle">📖 Libro Familiar</text>
      </g>
    </g>

    <!-- Bottom Security / Sync Footnote -->
    <text x="0" y="390" font-family="sans-serif" font-size="13" font-weight="500" fill="#8C887B">
      ✦ Sincronización en la nube &amp; Acceso privado para toda la familia
    </text>
  </g>
</svg>`;

async function generateImages() {
  const publicDir = path.resolve('public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // Save SVG
  fs.writeFileSync(path.join(publicDir, 'family-tree-og.svg'), svgContent, 'utf8');

  // Convert to PNG 1200x630
  await sharp(Buffer.from(svgContent))
    .resize(1200, 630)
    .png({ quality: 95, compressionLevel: 8 })
    .toFile(path.join(publicDir, 'og-preview.png'));

  // Also create a JPG version for WhatsApp compatibility (under 250kb)
  await sharp(Buffer.from(svgContent))
    .resize(1200, 630)
    .jpeg({ quality: 90, mozjpeg: true })
    .toFile(path.join(publicDir, 'og-preview.jpg'));

  // Also create square 600x600 avatar for WhatsApp thumbnail fallback
  await sharp(Buffer.from(svgContent))
    .resize(600, 600, { fit: 'cover' })
    .jpeg({ quality: 90, mozjpeg: true })
    .toFile(path.join(publicDir, 'og-thumb.jpg'));

  console.log('Successfully generated OG preview images in /public!');
}

generateImages().catch(console.error);
