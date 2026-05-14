'use client'

import { useEffect } from 'react'

export default function ARViewerRedirect() {
  useEffect(() => {
    // Redirect to standalone HTML viewer
    window.location.href = '/ar-viewer.html'
  }, [])
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-center text-white">
        <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p>Opening AR Viewer...</p>
      </div>
    </div>
  )
}
