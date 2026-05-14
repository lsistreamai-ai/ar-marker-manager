/**
 * AR.js Barcode Marker Generator
 * Uses official AR.js barcode marker specification (3x3 matrix)
 */

/**
 * Get URL to official AR.js barcode marker image
 */
export function getBarcodeMarkerURL(barcodeId: number): string {
  // AR.js official barcode markers (0-63)
  return `https://raw.githubusercontent.com/AR-js-org/AR.js/master/data/images/barcode-${barcodeId}.png`
}

/**
 * Generate inline SVG for preview (simplified visual)
 */
export function generateBarcodeMarkerSVG(barcodeId: number, size: number = 100): string {
  // Simple visual representation for grid display
  // Shows barcode number prominently
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <rect width="${size}" height="${size}" fill="white"/>
    <rect x="4" y="4" width="${size-8}" height="${size-8}" fill="black"/>
    <rect x="8" y="8" width="${size-16}" height="${size-16}" fill="white"/>
    <text x="${size/2}" y="${size/2 + 6}" fill="black" font-family="Arial" font-size="16" font-weight="bold" text-anchor="middle">${barcodeId}</text>
  </svg>`
}

/**
 * Download official barcode marker PNG
 */
export async function downloadMarkerAsPNG(barcodeId: number): Promise<void> {
  const url = getBarcodeMarkerURL(barcodeId)
  
  try {
    const response = await fetch(url)
    const blob = await response.blob()
    const blobUrl = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = blobUrl
    a.download = `barcode-marker-${barcodeId}.png`
    a.click()
    
    URL.revokeObjectURL(blobUrl)
  } catch (error) {
    // Fallback: open in new tab
    window.open(url, '_blank')
  }
}
