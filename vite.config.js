import { defineConfig, loadEnv } from "vite";
export default defineConfig(({mode})=>{
  const e=loadEnv(mode,process.cwd(),"");
  return {define:{
    "import.meta.env.VITE_SUPABASE_URL":JSON.stringify(e.VITE_SUPABASE_URL||e.NEXT_PUBLIC_SUPABASE_URL||""),
    "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY":JSON.stringify(e.VITE_SUPABASE_PUBLISHABLE_KEY||e.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||e.NEXT_PUBLIC_SUPABASE_ANON_KEY||"")
  }};
});