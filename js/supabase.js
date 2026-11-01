const SUPABASE_URL = "https://zwdnpqsygkosrdnpnfet.supabase.co";

const SUPABASE_KEY = "sb_publishable_GzMMVVlD80W125Lp9VGiyw_-wcyrsBq";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

console.log("Supabase Connected");