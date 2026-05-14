'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { generateBarcodeMarkerSVG, downloadMarkerAsPNG } from '@/lib/barcode-generator'
import type { ARMarker } from '@/types'

export default function Dashboard() {
  const [markers, setMarkers] = useState<ARMarker[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // Form state
  const [name, setName] = useState('')
  const [glbUrl, setGlbUrl] = useState('')
  const [scale, setScale] = useState('1')
  const [posY, setPosY] = useState('0')

  useEffect(() => {
    loadMarkers()
  }, [])

  async function loadMarkers() {
    const { data, error } = await supabase
      .from('ar_markers')
      .select('*')
      .order('barcode_id')
    
    if (data) setMarkers(data)
    setLoading(false)
  }

  function selectMarker(barcodeId: number) {
    const existing = markers.find(m => m.barcode_id === barcodeId)
    
    setSelectedId(barcodeId)
    if (existing) {
      setName(existing.name)
      setGlbUrl(existing.glb_url)
      setScale(String(existing.scale))
      setPosY(String(existing.position.y))
    } else {
      setName('')
      setGlbUrl('')
      setScale('1')
      setPosY('0')
    }
  }

  async function saveMarker(e: React.FormEvent) {
    e.preventDefault()
    if (selectedId === null || !glbUrl) return

    setSaving(true)
    
    const markerData = {
      barcode_id: selectedId,
      name: name || `Marker ${selectedId}`,
      glb_url: glbUrl,
      scale: parseFloat(scale) || 1,
      position_x: 0,
      position_y: parseFloat(posY) || 0,
      position_z: 0,
      rotation_x: 0,
      rotation_y: 0,
      rotation_z: 0
    }

    const existing = markers.find(m => m.barcode_id === selectedId)
    
    let error
    if (existing) {
      const result = await supabase
        .from('ar_markers')
        .update(markerData)
        .eq('barcode_id', selectedId)
      error = result.error
    } else {
      const result = await supabase
        .from('ar_markers')
        .insert(markerData)
      error = result.error
    }

    if (!error) {
      await loadMarkers()
      setSelectedId(null)
    } else {
      alert('Error saving: ' + error.message)
    }
    
    setSaving(false)
  }

  async function deleteMarker(barcodeId: number) {
    if (!confirm('Delete this marker?')) return
    
    await supabase
      .from('ar_markers')
      .delete()
      .eq('barcode_id', barcodeId)
    
    await loadMarkers()
    if (selectedId === barcodeId) setSelectedId(null)
  }

  function downloadMarker(barcodeId: number) {
    downloadMarkerAsPNG(barcodeId)
  }

  function isAssigned(barcodeId: number) {
    return markers.some(m => m.barcode_id === barcodeId)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">🎯 AR Marker Manager</h1>
        <p className="text-gray-400 mt-1">Create barcode markers (0-63) and assign GLB models</p>
        <div className="mt-2 text-sm">
          <span className="text-green-500">{markers.length}</span>
          <span className="text-gray-500"> / 64 markers assigned</span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Marker Grid */}
        <div className="lg:col-span-2">
          <div className="marker-grid">
            {Array.from({ length: 64 }, (_, i) => (
              <div 
                key={i}
                className={`marker-card cursor-pointer ${
                  isAssigned(i) ? 'assigned' : ''
                } ${selectedId === i ? 'ring-2 ring-blue-500' : ''}`}
                onClick={() => selectMarker(i)}
              >
                <div 
                  className="marker-svg w-full aspect-square"
                  dangerouslySetInnerHTML={{ 
                    __html: generateBarcodeMarkerSVG(i, 100) 
                  }}
                />
                <div className="text-center mt-1">
                  <span className="text-xs font-mono">#{i}</span>
                  {isAssigned(i) && (
                    <span className="ml-1 text-green-500">✓</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Editor Panel */}
        <div className="lg:col-span-1">
          {selectedId !== null ? (
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Marker #{selectedId}</h2>
                <div 
                  className="marker-svg w-20 h-20"
                  dangerouslySetInnerHTML={{ 
                    __html: generateBarcodeMarkerSVG(selectedId, 80) 
                  }}
                />
              </div>

              <form onSubmit={saveMarker} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g., Car Model"
                    className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">GLB URL *</label>
                  <input
                    type="url"
                    value={glbUrl}
                    onChange={e => setGlbUrl(e.target.value)}
                    placeholder="https://example.com/model.glb"
                    required
                    className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Direct link to .glb file (Google Drive, Dropbox, etc.)
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Scale</label>
                    <input
                      type="number"
                      step="0.1"
                      value={scale}
                      onChange={e => setScale(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Y Position</label>
                    <input
                      type="number"
                      step="0.1"
                      value={posY}
                      onChange={e => setPosY(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={saving || !glbUrl}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded font-medium transition"
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    type="button"
                    onClick={() => downloadMarker(selectedId)}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded font-medium"
                  >
                    📥 PNG
                  </button>
                </div>

                {isAssigned(selectedId) && (
                  <button
                    type="button"
                    onClick={() => deleteMarker(selectedId)}
                    className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded font-medium"
                  >
                    Delete
                  </button>
                )}
              </form>

              {/* Preview */}
              {glbUrl && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <a 
                    href={glbUrl} 
                    target="_blank" 
                    rel="noopener"
                    className="text-blue-400 text-sm hover:underline break-all"
                  >
                    🔗 Open GLB →
                  </a>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-800 rounded-lg p-8 text-center text-gray-500 border border-gray-700">
              <div className="text-4xl mb-2">👆</div>
              <p>Select a marker to edit</p>
            </div>
          )}

          {/* Quick Actions */}
          <div className="mt-4 space-y-2">
            <a
              href="/viewer"
              target="_blank"
              className="block w-full px-4 py-2 bg-green-600 hover:bg-green-700 rounded font-medium text-center"
            >
              🔓 Open AR Viewer
            </a>
            <a
              href="/setup"
              className="block w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded font-medium text-center"
            >
              ⚙️ Database Setup
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
