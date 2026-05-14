'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { ARMarker } from '@/types'

export default function ARViewer() {
  const [markers, setMarkers] = useState<ARMarker[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedMarker, setSelectedMarker] = useState<ARMarker | null>(null)

  useEffect(() => {
    loadMarkers()
  }, [])

  useEffect(() => {
    if (!loading && markers.length > 0 && typeof window !== 'undefined') {
      // Load A-Frame dynamically
      const loadAFrame = async () => {
        if (!(window as any).AFRAME) {
          const aframe = document.createElement('script')
          aframe.src = 'https://aframe.io/releases/1.4.0/aframe.min.js'
          document.head.appendChild(aframe)
          
          await new Promise(resolve => aframe.onload = resolve)
        }
        
        if (!(window as any).ARjs) {
          const arjs = document.createElement('script')
          arjs.src = 'https://raw.githack.com/AR-js-org/AR.js/master/aframe/build/aframe-ar.js'
          document.head.appendChild(arjs)
        }
      }
      loadAFrame()
    }
  }, [loading, markers.length])

  async function loadMarkers() {
    try {
      const { data, error: err } = await supabase.from('ar_markers').select('*')
      if (err) throw err
      if (data) setMarkers(data)
    } catch (e: any) {
      setError(e.message)
    }
    setLoading(false)
  }

  const aframeHTML = !loading && markers.length > 0 ? `
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
  ` : ''

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center text-white p-8">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading markers...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black p-4">
        <div className="text-center text-white max-w-md">
          <div className="text-5xl mb-4">⚠️</div>
          <h1 className="text-xl font-bold mb-2">Error Loading Markers</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <a href="/" className="btn btn-primary">Back to Dashboard</a>
        </div>
      </div>
    )
  }

  if (markers.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black p-4">
        <div className="text-center text-white max-w-md">
          <div className="text-6xl mb-4">🎯</div>
          <h1 className="text-2xl font-bold mb-2">No Markers Yet</h1>
          <p className="text-gray-400 mb-6">Add markers in the dashboard first</p>
          <a href="/" className="btn btn-primary">Open Dashboard</a>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-screen overflow-hidden bg-black">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/80 to-transparent p-4">
        <div className="flex items-center justify-between text-white">
          <div>
            <h1 className="text-lg font-bold">AR Viewer</h1>
            <p className="text-xs text-gray-400">{markers.length} markers ready</p>
          </div>
          <a href="/" className="btn btn-secondary text-sm px-3 py-2">
            ← Back
          </a>
        </div>
      </div>

      {/* A-Frame */}
      <div 
        dangerouslySetInnerHTML={{ __html: aframeHTML }}
        className="w-full h-full"
      />

      {/* Marker List */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
        <div className="bg-gray-900/90 backdrop-blur rounded-2xl p-4">
          <div className="flex gap-3 overflow-x-auto pb-2 -mb-2">
            {markers.map(m => (
              <button
                key={m.id}
                onClick={() => setSelectedMarker(m)}
                className="flex-shrink-0 bg-gray-800 hover:bg-gray-700 rounded-xl px-4 py-2 text-sm font-medium text-white transition"
              >
                #{m.barcode_id} {m.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Info Modal */}
      {selectedMarker && (
        <div 
          className="fixed inset-0 z-50 flex items-end justify-center"
          onClick={() => setSelectedMarker(null)}
        >
          <div className="fixed inset-0 bg-black/60" />
          <div 
            className="relative bg-gray-900 rounded-t-3xl p-6 w-full max-w-lg"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-2">{selectedMarker.name}</h2>
            <p className="text-sm text-gray-400 mb-4">Marker #{selectedMarker.barcode_id}</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Scale:</span>
                <span>{selectedMarker.scale}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Y Position:</span>
                <span>{selectedMarker.position_y}</span>
              </div>
            </div>
            <button
              onClick={() => setSelectedMarker(null)}
              className="btn btn-secondary w-full mt-6"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
