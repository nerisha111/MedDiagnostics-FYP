// src/supabaseClient.ts

import { createClient } from '@supabase/supabase-js';


const supabaseUrl = 'https://oqgvbmsrhnrwsxwfnfbw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xZ3ZibXNyaG5yd3N4d2ZuZmJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyMzA3NzUsImV4cCI6MjA3NjgwNjc3NX0.Ft0vDSHHpiio-4c1xmesblJei4OUGK37ZJz6rDrUEmY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);