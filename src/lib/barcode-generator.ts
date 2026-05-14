/**
 * Generate AR.js compatible barcode marker SVG
 * Barcode IDs: 0-63 (6-bit patterns encoded as 5x5 matrix)
 */

// Pre-defined barcode patterns for AR.js (3x3 data matrix)
// Each number maps to a specific pattern
const BARCODE_PATTERNS: Record<number, number[][]> = {}

// Initialize all 64 barcode patterns
// These follow AR.js barcode marker specification
for (let id = 0; id < 64; id++) {
  // Convert 6-bit ID to 3x3 matrix (center is always black)
  const bits = [
    (id >> 5) & 1,
    (id >> 4) & 1,
    (id >> 3) & 1,
    (id >> 2) & 1,
    1, // center always 1
    (id >> 1) & 1,
    (id >> 0) & 1,
    0,
    0
  ]
  
  BARCODE_PATTERNS[id] = [
    [bits[0], bits[1], bits[2]],
    [bits[3], bits[4], bits[5]],
    [bits[6], bits[7], bits[8]]
  ]
}

/**
 * Generate SVG for AR.js barcode marker
 * @param barcodeId - ID 0-63
 * @param size - SVG width/height in pixels
 */
export function generateBarcodeMarkerSVG(barcodeId: number, size: number = 300): string {
  if (barcodeId < 0 || barcodeId > 63) {
    throw new Error('Barcode ID must be 0-63')
  }

  const pattern = BARCODE_PATTERNS[barcodeId]
  const borderWidth = size * 0.15 // 15% border
  const cellSize = (size - borderWidth * 2) / 3

  let cells = ''
  
  // Generate cells
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const x = borderWidth + col * cellSize
      const y = borderWidth + row * cellSize
      const isBlack = pattern[row][col] === 1
      
      // Only draw white cells (black is default background)
      if (!isBlack) {
        cells += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="white" stroke="white" stroke-width="1"/>`
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <!-- Barcode Marker ID: ${barcodeId} -->
  <!-- White background -->
  <rect width="${size}" height="${size}" fill="white"/>
  
  <!-- Black marker area -->
  <rect x="1" y="1" width="${size-2}" height="${size-2}" fill="black"/>
  
  <!-- White inner border -->
  <rect x="${borderWidth/2}" y="${borderWidth/2}" width="${size-borderWidth}" height="${size-borderWidth}" fill="white"/>
  
  <!-- Black inner marker -->
  <rect x="${borderWidth}" y="${borderWidth}" width="${size-borderWidth*2}" height="${size-borderWidth*2}" fill="black"/>
  
  <!-- Data cells (white squares where bit = 0) -->
  <g>
    ${cells.split('\n').map(line => '    ' + line.trim()).join('\n')}
  </g>
  
  <!-- Marker ID label -->
  <text x="${size/2}" y="${size-5}" fill="white" font-family="Arial" font-size="12" text-anchor="middle">${barcodeId}</text>
</svg>`
}

/**
 * Download marker as PNG
 */
export function downloadMarkerAsPNG(barcodeId: number, filename?: string): void {
  const svg = generateBarcodeMarkerSVG(barcodeId, 600)
  const blob = new Blob([svg], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(blob)
  
  const img = new Image()
  img.onload = () => {
    const canvas = document.createElement('canvas')
    canvas.width = 600
    canvas.height = 600
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.drawImage(img, 0, 0)
      canvas.toBlob((pngBlob) => {
        if (pngBlob) {
          const pngUrl = URL.createObjectURL(pngBlob)
          const a = document.createElement('a')
          a.href = pngUrl
          a.download = filename || `barcode-marker-${barcodeId}.png`
          a.click()
          URL.revokeObjectURL(pngUrl)
        }
      }, 'image/png')
    }
    URL.revokeObjectURL(url)
  }
  img.src = url
}

/**
 * Get list of all 64 barcode IDs
 */
export function getAllBarcodeIds(): number[] {
  return Array.from({ length: 64 }, (_, i) => i)
}
