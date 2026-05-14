'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function SetupPage() {
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function setupDatabase() {
    setStatus('Creating table...')
    setError('')
    
    // Create the table using raw SQL
    const { error: createError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS ar_markers (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          barcode_id INTEGER UNIQUE NOT NULL CHECK (barcode_id >= 0 AND barcode_id <= 63),
          name TEXT NOT NULL,
          glb_url TEXT NOT NULL,
          scale DECIMAL DEFAULT 1.0,
          position_x DECIMAL DEFAULT 0,
          position_y DECIMAL DEFAULT 0,
          position_z DECIMAL DEFAULT 0,
          rotation_x DECIMAL DEFAULT 0,
          rotation_y DECIMAL DEFAULT 0,
          rotation_z DECIMAL DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })

    // RPC might not exist, so let's try a different approach
    // We'll use Supabase's table API to check if table exists
    
    setStatus('Checking if table exists...')
    
    const { data, error: checkError } = await supabase
      .from('ar_markers')
      .select('id')
      .limit(1)
    
    if (checkError) {
      if (checkError.message.includes('does not exist') || checkError.code === 'PGRST116') {
        setError(
          'Table does not exist. Please create it manually in Supabase:\n\n' +
          '1. Go to https://supabase.com/dashboard/project/zywgdjbuttwyingoldgb/sql\n' +
          '2. Paste the SQL from below\n' +
          '3. Click Run'
        )
        setStatus('')
        return
      }
    }
    
    setStatus('Table ready!')
    setSuccess(true)
  }

  const sqlToRun = `-- Run this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/zywgdjbuttwyingoldgb/sql

CREATE TABLE IF NOT EXISTS ar_markers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  barcode_id INTEGER UNIQUE NOT NULL CHECK (barcode_id >= 0 AND barcode_id <= 63),
  name TEXT NOT NULL,
  glb_url TEXT NOT NULL,
  scale DECIMAL DEFAULT 1.0,
  position_x DECIMAL DEFAULT 0,
  position_y DECIMAL DEFAULT 0,
  position_z DECIMAL DEFAULT 0,
  rotation_x DECIMAL DEFAULT 0,
  rotation_y DECIMAL DEFAULT 0,
  rotation_z DECIMAL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE ar_markers ENABLE ROW LEVEL SECURITY;

-- Allow public read access (for AR viewer)
CREATE POLICY "Public read access" ON ar_markers
  FOR SELECT USING (true);

-- Allow all operations (add auth later if needed)
CREATE POLICY "Public write access" ON ar_markers
  FOR ALL USING (true);`

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">⚙️ Database Setup</h1>
        
        {!success && (
          <div className="bg-gray-800 rounded-lg p-6 mb-4">
            <button
              onClick={setupDatabase}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded font-medium"
            >
              Check Database
            </button>
            
            {status && (
              <p className="mt-4 text-blue-400">{status}</p>
            )}
            
            {error && (
              <div className="mt-4 p-4 bg-red-900/50 rounded border border-red-500">
                <p className="whitespace-pre-wrap text-sm">{error}</p>
              </div>
            )}
          </div>
        )}

        {success && (
          <div className="bg-green-900/50 border border-green-500 rounded-lg p-6 mb-4">
            <div className="text-xl font-bold text-green-400">✓ Database Ready!</div>
            <p className="mt-2">The ar_markers table exists and is ready to use.</p>
            <a 
              href="/"
              className="inline-block mt-4 px-6 py-2 bg-green-600 hover:bg-green-700 rounded font-medium"
            >
              Go to Dashboard
            </a>
          </div>
        )}

        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">SQL Schema</h2>
          <p className="text-gray-400 mb-4">
            If the table doesn't exist, copy this SQL and run it in your Supabase SQL Editor:
          </p>
          <pre className="bg-gray-900 p-4 rounded overflow-x-auto text-xs font-mono">
            {sqlToRun}
          </pre>
          
          <button
            onClick={() => navigator.clipboard.writeText(sqlToRun)}
            className="mt-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm"
          >
            📋 Copy SQL
          </button>
        </div>
      </div>
    </div>
  )
}
