-- ============================================
-- JALANKAN SQL INI DI SUPABASE SQL EDITOR
-- ============================================

-- 1. Buat tabel links
CREATE TABLE IF NOT EXISTS links (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Buat tabel visits
CREATE TABLE IF NOT EXISTS visits (
  id SERIAL PRIMARY KEY,
  link_id TEXT REFERENCES links(id) ON DELETE CASCADE,
  visitor_name TEXT DEFAULT 'Anonymous',
  visitor_email TEXT DEFAULT '',
  ip_address TEXT DEFAULT 'Unknown',
  user_agent TEXT DEFAULT '',
  device_type TEXT DEFAULT 'Unknown',
  browser TEXT DEFAULT 'Unknown',
  os TEXT DEFAULT 'Unknown',
  screen_width INTEGER DEFAULT 0,
  screen_height INTEGER DEFAULT 0,
  language TEXT DEFAULT 'Unknown',
  referrer TEXT DEFAULT 'Direct',
  city TEXT DEFAULT 'Unknown',
  country TEXT DEFAULT 'Unknown',
  isp TEXT DEFAULT 'Unknown',
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  visited_at TIMESTAMPTZ DEFAULT NOW(),
  duration_seconds INTEGER DEFAULT 0
);

-- 3. Buat index untuk performa query
CREATE INDEX IF NOT EXISTS idx_visits_link_id ON visits(link_id);
CREATE INDEX IF NOT EXISTS idx_visits_visited_at ON visits(visited_at DESC);

-- 4. Enable Realtime untuk tabel visits (PENTING untuk realtime logs!)
ALTER PUBLICATION supabase_realtime ADD TABLE visits;

-- 5. Enable Realtime untuk tabel links
ALTER PUBLICATION supabase_realtime ADD TABLE links;

-- 6. RLS (Row Level Security) - Disable untuk development, enable untuk production
-- Untuk sekarang kita disable dulu supaya bisa CRUD tanpa auth
ALTER TABLE links ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;

-- Policy untuk allow semua operasi (development mode)
CREATE POLICY "Allow all for links" ON links FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for visits" ON visits FOR ALL USING (true) WITH CHECK (true);
