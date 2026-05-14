'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { ARMarker } from '@/types'

export default function ARViewer() {
  const [markers, setMarkers] = useState<ARMarker[]>([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('Loading markers...')

  useEffect(() => {
    loadMarkers()
  }, [])

  useEffect(() => {
    // Load A-Frame scripts dynamically
    if (markers.length > 0 && typeof window !== 'undefined') {
      const aframe = document.createElement('script')
      aframe.src = 'https://aframe.io/releases/1.4.0/aframe.min.js'
      aframe.async = true
      
      const arjs = document.createElement('script')
      arjs.src = 'https://raw.githack.com/AR-js-org/AR.js/master/aframe/build/aframe-ar.js'
      arjs.async = true
      
      document.head.appendChild(aframe)
      aframe.onload = () => {
        document.head.appendChild(arjs)
      }
      
      return () => {
        aframe.remove()
        arjs.remove()
      }
    }
  }, [markers.length])

  async function loadMarkers() {
    const { data, error } = await supabase
      .from('ar_markers')
      .select('*')
    
    if (data && data.length > 0) {
      setMarkers(data)
      setStatus(`${data.length} markers loaded. Point camera at barcode markers!`)
    } else if (data) {
      setStatus('No markers configured. Go to dashboard first!')
    } else {
      setStatus('Error loading markers: ' + error?.message)
    }
    setLoading(false)
  }

  // Generate A-Frame HTML
  const aframeHTML = !loading && markers.length > 0 ? `
    <a-scene embedded vr-mode-ui="enabled: false" arjs="sourceType: webcam; debugUIEnabled: false; detectionMode: mono_and_matrix; matrixCodeType: 3x3;">
      ${markers.map(marker => `
        <a-marker type="barcode" value="${marker.barcode_id}">
          <a-entity
            gltf-model="${marker.glb_url}"
            scale="${marker.scale} ${marker.scale} ${marker.scale}"
            position="${marker.position_x || 0} ${marker.position_y || 0} ${marker.position_z || 0}"
            rotation="${marker.rotation_x || 0} ${marker.rotation_y || 0} ${marker.rotation_z || 0}"
          ></a-entity>
        </a-marker>
      `).join('')}
      <a-entity camera></a-entity>
    </a-scene>
  ` : ''

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <div className="text-2xl mb-2">Loading...</div>
          <div className="text-gray-400">{status}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-screen overflow-hidden bg-black">
      {/* Status bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/70 backdrop-blur p-3">
        <div className="flex items-center justify-between text-white">
          <div>
            <div className="text-sm font-bold">🎯 AR Viewer</div>
            <div className="text-xs text-gray-400">{status}</div>
          </div>
          <div className="text-xs text-gray-500">
            {markers.length} models Ready
          </div>
        </div>
      </div>

      {/* A-Frame Container */}
      {markers.length > 0 && (
        <div 
          dangerouslySetInnerHTML={{ __html: aframeHTML }}
          className="w-full h-full"
        />
      )}

      {/* Marker reference */}
      {markers.length > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-50">
          <div className="bg-black/70 backdrop-blur rounded-lg p-3 overflow-x-auto">
            <div className="flex gap-3 whitespace-nowrap text-white">
              {markers.map(marker => (
                <div key={marker.id} className="text-center">
                  <div className="text-xs text-gray-400">#{marker.barcode_id}</div>
                  <div className="text-sm font-medium">{marker.name}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* No markers message */}
      {markers.length === 0 && (
        <div className="flex items-center justify-center h-full text-white">
          <div className="text-center">
            <div className="text-6xl mb-4">📭</div>
            <div className="text-xl font-bold">No Markers Configured</div>
            <div className="text-gray-400 mt-2">
              Add markers in the <a href="/" className="text-blue-400 underline">dashboard</a> first
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
