import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zywgdjbuttwyingoldgb.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp5d2dkamJ1dHR3eWluZ29sZGdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyMjk2NzIsImV4cCI6MjA5MzgwNTY3Mn0.OQhE8u8JdmDLi-eBcguq7B81rFfOXPJ43vRpG_7aMdw'

export const supabase = createClient(supabaseUrl, supabaseKey)
