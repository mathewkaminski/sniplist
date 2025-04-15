
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

// Configure CORS headers for browser access
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get the search term from the request body
    const { searchTerm } = await req.json()
    
    if (!searchTerm || typeof searchTerm !== 'string' || searchTerm.trim().length < 3) {
      return new Response(
        JSON.stringify({ data: [], error: "Search term must be at least 3 characters" }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400 
        }
      )
    }

    // Create a Supabase client with the service role key
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || ""
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    
    // Create a Supabase client with the Admin API key which bypasses RLS
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // The sanitized search term
    const sanitizedTerm = searchTerm.trim()
    
    console.log(`Edge function executing search for term: "${sanitizedTerm}"`)
    
    // Run the parameterized query to prevent SQL injection
    const { data, error } = await supabase.rpc('search_profiles_and_sniplists', {
      search_term: `%${sanitizedTerm}%`
    })
    
    if (error) {
      console.error("Database query error:", error)
      return new Response(
        JSON.stringify({ data: [], error: `Database query error: ${error.message}` }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500 
        }
      )
    }
    
    console.log(`Search found ${data?.length || 0} results`)
    
    return new Response(
      JSON.stringify({ data }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  } catch (error) {
    console.error("Unexpected error:", error)
    return new Response(
      JSON.stringify({ data: [], error: `Unexpected error: ${error.message}` }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    )
  }
})
