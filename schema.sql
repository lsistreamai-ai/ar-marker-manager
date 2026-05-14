-- AR Markers table
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

-- Allow all operations for now (add auth later)
CREATE POLICY "Public write access" ON ar_markers
  FOR ALL USING (true);

-- Unique index on barcode_id
CREATE UNIQUE INDEX IF NOT EXISTS ar_markers_barcode_id_idx ON ar_markers(barcode_id);
