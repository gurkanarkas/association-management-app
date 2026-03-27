-- Members table
CREATE TABLE IF NOT EXISTS members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  join_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Events table
CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  location TEXT,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Finances table
CREATE TABLE IF NOT EXISTS finances (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  description TEXT NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category TEXT,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE finances ENABLE ROW LEVEL SECURITY;

-- RLS Policies: allow authenticated users full access
-- Members
CREATE POLICY "Allow authenticated read members" ON members FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert members" ON members FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update members" ON members FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated delete members" ON members FOR DELETE TO authenticated USING (true);

-- Events
CREATE POLICY "Allow authenticated read events" ON events FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert events" ON events FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update events" ON events FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated delete events" ON events FOR DELETE TO authenticated USING (true);

-- Finances
CREATE POLICY "Allow authenticated read finances" ON finances FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert finances" ON finances FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update finances" ON finances FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated delete finances" ON finances FOR DELETE TO authenticated USING (true);
