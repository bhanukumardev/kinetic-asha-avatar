/**
 * End-to-End Connection Test
 * Usage: node test-connections.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

function loadEnv() {
  try {
    const content = readFileSync('.env.local', 'utf8');
    for (const line of content.split('\n')) {
      const [k, ...v] = line.split('=');
      if (k && v.length && !k.startsWith('#')) process.env[k.trim()] = v.join('=').trim();
    }
  } catch {}
}
loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const GROQ_API_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY;

async function testSupabase() {
  console.log('1. Testing Supabase connection...');
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { data, error } = await supabase.from('profiles').select('count').limit(1);
  if (error && error.code !== 'PGRST116') {
    console.log('   ❌ Supabase error:', error.message);
  } else {
    console.log('   ✅ Supabase reachable');
  }
}

async function testGroq() {
  console.log('2. Testing Groq API...');
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-20b',
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 5,
      }),
    });
    console.log('   Status:', res.status, res.status === 200 ? '✅ OK' : '❌ Failed');
  } catch (e) {
    console.log('   ❌ Groq error:', e.message);
  }
}

(async () => {
  await testSupabase();
  await testGroq();
})();
