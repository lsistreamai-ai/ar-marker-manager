'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { ARMarker } from '@/types'

export default function Dashboard() {
  const [markers, setMarkers] =useState<ARMarker[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  
  const [name, setName] = useState('')
  const [glbUrl, setGlbUrl] = useState('')
  const [scale, setScale] = useState('1')
  const [posY, setPosY] = useState('0.5')

  useEffect(() => { loadMarkers() }, [])

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
      setPosY(String(existing.position_y || 0.5))
    } else {
      setName('')
      setGlbUrl('')
      setScale('1')
      setPosY('0.5')
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
      position_y: parseFloat(posY) || 0.5,
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
      setMessage({ type: 'success', text: 'Saved!' })
      setSelectedId(null)
    } else {
      setMessage({ type: 'error', text: error.message })
    }
    setSaving(false)
  }

  async function deleteMarker(barcodeId: number) {
    if (!confirm('Delete?')) return
    await supabase.from('ar_markers').delete().eq('barcode_id', barcodeId)
    await loadMarkers()
    if (selectedId === barcodeId) setSelectedId(null)
    setMessage({ type: 'success', text: 'Deleted' })
  }

  function isAssigned(barcodeId: number) {
    return markers.some(m => m.barcode_id === barcodeId)
  }

  function getMarkerType(id: number) {
    if (id === 0) return 'Hiro'
    if (id === 1) return 'Kanji'
    return 'Pattern'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 bg-gray-900/95 backdrop-blur border-b border-gray-800 px-4 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">AR Marker Manager</h1>
            <p className="text-sm text-gray-400">{markers.length} models configured</p>
          </div>
          <div className="flex gap-2">
            <a href="/markers.html" className="btn btn-secondary text-sm px-3 py-2">📋 Markers</a>
            <a href="/viewer" target="_blank" className="btn btn-success text-sm px-4 py-2">View AR</a>
          </div>
        </div>
      </header>

      {message && (
        <div className={`fixed top-20 left-4 right-4 z-50 p-4 rounded-xl text-center ${message.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {message.text}
        </div>
      )}

      <main className="max-w-6xl mx-auto p-4">
        <div className="bg-blue-900/30 border border-blue-500/30 rounded-xl p-4 mb-6">
          <h2 className="font-bold text-blue-400 mb-2">📌 Getting Started</h2>
          <ol className="text-sm text-gray-300 space-y-1">
            <li>1. Click <strong>Marker #0 (Hiro)</strong> below</li>
            <li>2. Enter your GLB URL from GitHub</li>
            <li>3. Save, then print the Hiro marker from <a href="/markers.html" className="text-blue-400 underline">Markers page</a></li>
            <li>4. Open <strong>View AR</strong> on mobile and scan</li>
          </ol>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {[0, 1].map(i => (
            <button key={i} onClick={() => selectMarker(i)} className={`marker-card ${isAssigned(i) ? 'assigned' : ''}`}>
              <div className="bg-white rounded-lg p-3 mb-2">
                <div className="text-2xl font-bold text-gray-800">{i === 0 ? 'Hi' : '漢'}</div>
              </div>
              <div className="text-center">
                <div className="text-xs font-bold">#{i}</div>
                <div className="text-xs text-gray-400">{getMarkerType(i)}</div>
                {isAssigned(i) && <span className="text-green-500 text-xs">✓</span>}
              </div>
            </button>
          ))}
        </div>
      </main>

      {selectedId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setSelectedId(null)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div className="relative bg-gray-900 rounded-2xl border border-gray-700 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-800 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">Marker #{selectedId}</h2>
                <p className="text-xs text-gray-400">Pattern: {getMarkerType(selectedId)}</p>
              </div>
              <button onClick={() => setSelectedId(null)} className="text-gray-400 hover:text-white text-2xl">×</button>
            </div>

            <form onSubmit={saveMarker} className="p-4 space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Car Model" />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">GLB URL <span className="text-red-400">*</span></label>
                <input type="url" value={glbUrl} onChange={e => setGlbUrl(e.target.value)} placeholder="https://raw.githubusercontent.com/.../model.glb" required />
                <p className="text-xs text-gray-500 mt-1">Use GitHub raw URL for your .glb file</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Scale</label>
                  <input type="number" step="0.1" value={scale} onChange={e => setScale(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Y Position</label>
                  <input type="number" step="0.1" value={posY} onChange={e => setPosY(e.target.value)} />
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <button type="submit" disabled={saving || !glbUrl} className="btn btn-primary w-full">{saving ? 'Saving...' : 'Save'}</button>
                {isAssigned(selectedId) && <button type="button" onClick={() => deleteMarker(selectedId)} className="btn btn-danger w-full">Delete</button>}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
