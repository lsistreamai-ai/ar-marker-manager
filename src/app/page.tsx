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
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  
  const [name, setName] = useState('')
  const [glbUrl, setGlbUrl] = useState('')
  const [scale, setScale] = useState('1')
  const [posY, setPosY] = useState('0')

  useEffect(() => {
    loadMarkers()
  }, [])

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [message])

  async function loadMarkers() {
    const { data } = await supabase.from('ar_markers').select('*').order('barcode_id')
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
      setPosY(String(existing.position_y || 0))
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
    const { error } = existing
      ? await supabase.from('ar_markers').update(markerData).eq('barcode_id', selectedId)
      : await supabase.from('ar_markers').insert(markerData)

    if (!error) {
      await loadMarkers()
      setMessage({ type: 'success', text: 'Marker saved!' })
      setSelectedId(null)
    } else {
      setMessage({ type: 'error', text: error.message })
    }
    
    setSaving(false)
  }

  async function deleteMarker(barcodeId: number) {
    if (!confirm('Delete this marker?')) return
    await supabase.from('ar_markers').delete().eq('barcode_id', barcodeId)
    await loadMarkers()
    if (selectedId === barcodeId) setSelectedId(null)
    setMessage({ type: 'success', text: 'Deleted' })
  }

  function isAssigned(barcodeId: number) {
    return markers.some(m => m.barcode_id === barcodeId)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-gray-900/95 backdrop-blur border-b border-gray-800 px-4 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">AR Marker Manager</h1>
            <p className="text-sm text-gray-400">
              {markers.length}/64 markers configured
            </p>
          </div>
          <a
            href="/viewer"
            target="_blank"
            className="btn btn-success text-sm px-4 py-2"
          >
            View AR
          </a>
        </div>
      </header>

      {/* Toast Message */}
      {message && (
        <div className={`fixed top-20 left-4 right-4 z-50 p-4 rounded-xl text-center font-medium animate-pulse ${
          message.type === 'success' ? 'bg-green-600' : 'bg-red-600'
        }`}>
          {message.text}
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-4">
        {/* Marker Grid */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3 text-gray-300">Select Marker</h2>
          <div className="marker-grid">
            {Array.from({ length: 64 }, (_, i) => (
              <button
                key={i}
                onClick={() => selectMarker(i)}
                className={`marker-card ${isAssigned(i) ? 'assigned' : ''} ${selectedId === i ? 'selected' : ''}`}
              >
                <div 
                  className="marker-svg aspect-square"
                  dangerouslySetInnerHTML={{ __html: generateBarcodeMarkerSVG(i, 60) }}
                />
                <div className="text-center mt-2">
                  <span className="text-xs font-bold">#{i}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </main>

      {/* Editor Modal (Mobile Bottom Sheet) */}
      {selectedId !== null && (
        <div className="fixed inset-0 z-50 lg:static lg:z-auto">
          {/* Backdrop (mobile only) */}
          <div 
            className="fixed inset-0 bg-black/60 lg:hidden"
            onClick={() => setSelectedId(null)}
          />
          
          {/* Panel */}
          <div className="fixed bottom-0 left-0 right-0 lg:static lg:w-96 bg-gray-900 lg:bg-transparent rounded-t-3xl lg:rounded-none border-t border-gray-700 lg:border-0 max-h-[80vh] overflow-y-auto">
            <div className="panel m-0 lg:m-0 rounded-t-3xl lg:rounded-2xl">
              {/* Header */}
              <div className="flex items-center gap-4 mb-5">
                <div 
                  className="marker-svg w-16 h-16 flex-shrink-0"
                  dangerouslySetInnerHTML={{ __html: generateBarcodeMarkerSVG(selectedId, 64) }}
                />
                <div className="flex-1">
                  <h2 className="text-xl font-bold">Marker #{selectedId}</h2>
                  <p className="text-sm text-gray-400">
                    {isAssigned(selectedId) ? 'Already configured' : 'Not configured yet'}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedId(null)}
                  className="btn btn-secondary text-sm px-3 py-2"
                >
                  Close
                </button>
              </div>

              {/* Form */}
              <form onSubmit={saveMarker} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g., Car Model"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    GLB URL <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="url"
                    value={glbUrl}
                    onChange={e => setGlbUrl(e.target.value)}
                    placeholder="https://example.com/model.glb"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Direct link to .glb file
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Scale</label>
                    <input
                      type="number"
                      step="0.1"
                      value={scale}
                      onChange={e => setScale(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Y Position</label>
                    <input
                      type="number"
                      step="0.1"
                      value={posY}
                      onChange={e => setPosY(e.target.value)}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2 pt-2">
                  <button
                    type="submit"
                    disabled={saving || !glbUrl}
                    className="btn btn-primary w-full"
                  >
                    {saving ? 'Saving...' : 'Save Marker'}
                  </button>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => downloadMarkerAsPNG(selectedId)}
                      className="btn btn-secondary"
                    >
                      Download PNG
                    </button>
                    {isAssigned(selectedId) && (
                      <button
                        type="button"
                        onClick={() => deleteMarker(selectedId)}
                        className="btn btn-danger"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
