import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zywgdjbuttwyingoldgb.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp5d2dkamJ1dHR3eWluZ29sZGdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQyMDczMjUsImV4cCI6MjA1OTc4MzMyNX0.vKz_Ft3sC_4Oe_UbF2fM8vCJLbY0uMx3qXhqhJ8pF-Y'

export const supabase = createClient(supabaseUrl, supabaseKey)
