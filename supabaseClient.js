const { createClient } = require('@supabase/supabase-js');

let supabase;

function initSupabase() {
  const URL = process.env.SUPABASE_URL;
  const KEY = process.env.SUPABASE_SERVICE_KEY;

  if (!URL || !KEY) {
    throw new Error("Supabase keys missing. Did you set env variables?");
  }

  supabase = createClient(URL, KEY, {
    auth: { persistSession: false }
  });
}

function getSupabase() {
  if (!supabase) throw new Error("Supabase not initialized.");
  return supabase;
}

module.exports = { initSupabase, getSupabase };
