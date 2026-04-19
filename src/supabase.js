import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://irgzwosnyqwyjhisvxxs.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlyZ3p3b3NueXF3eWpoaXN2eHhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1NDIzOTksImV4cCI6MjA5MjExODM5OX0.Gs-AxHg4uPKLsmAyCNQF0quINyTQSs1jkaHlPENBsVE';

export const supabase = createClient(supabaseUrl, supabaseKey);