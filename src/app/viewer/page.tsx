'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { ARMarker } from '@/types'

export default function ARViewer() {
  const [markers, setMarkers] = useState<ARMarker[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadMarkers()
  }, [])

  async function loadMarkers() {
    try {
      const { data, error } = await supabase.from('ar_markers').select('*')
      if (error) throw error
      if (data) setMarkers(data)
    } catch (e: any) {
      setError(e.message)
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center text-white p-8">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black p-4">
        <div className="text-center text-white max-w-md">
          <div className="text-5xl mb-4">⚠️</div>
          <h1 className="text-xl font-bold mb-2">Error</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <a href="/" className="btn btn-primary">Back</a>
        </div>
      </div>
    )
  }

  if (markers.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black p-4">
        <div className="text-center text-white max-w-md">
          <div className="text-6xl mb-4">🎯</div>
          <h1 className="text-2xl font-bold mb-2">No Markers</h1>
          <p className="text-gray-400 mb-6">Add markers in dashboard first</p>
          <a href="/" className="btn btn-primary">Dashboard</a>
        </div>
      </div>
    )
  }

  // Generate the full HTML for A-Frame (works better for mobile)
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
  <title>AR Viewer</title>
  <script src="https://aframe.io/releases/1.4.0/aframe.min.js"></script>
  <script src="https://raw.githack.com/AR-js-org/AR.js/master/aframe/build/aframe-ar.js"></script>
  <style>
    body { margin: 0; overflow: hidden; }
    .info { position: fixed; top: 10px; left: 10px; z-index: 999; color: white; background: rgba(0,0,0,0.6); padding: 10px; border-radius: 8px; font-family: sans-serif; font-size: 12px; }
    .back { position: fixed; top: 10px; right: 10px; z-index: 999; background: rgba(255,255,255,0.2); color: white; padding: 8px 16px; border-radius: 8px; text-decoration: none; font-family: sans-serif; font-size: 14px; }
  </style>
</head>
<body>
  <div class="info">${markers.length} markers ready</div>
  <a href="/" class="back">← Back</a>
  
  <a-scene embedded vr-mode-ui="enabled: false" arjs="sourceType: webcam; debugUIEnabled: false; detectionMode: mono_and_matrix; matrixCodeType: 3x3;">
    ${markers.map(m => `
      <a-marker type="barcode" value="${m.barcode_id}">
        <a-entity
          gltf-model="${m.glb_url}"
          scale="${m.scale} ${m.scale} ${m.scale}"
          position="${m.position_x || 0} ${m.position_y || 0} ${m.position_z || 0}"
        ></a-entity>
      </a-marker>
    `).join('')}
    <a-entity camera></a-entity>
  </a-scene>
</body>
</html>
  `

  return (
    <iframe 
      srcDoc={html}
      className="w-full h-screen border-0"
      allow="camera; microphone; fullscreen"
    />
  )
}
