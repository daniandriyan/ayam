-- Ayam Petelur - Supabase Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends Supabase auth)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  farm_name TEXT,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Coops table (kandang)
CREATE TABLE IF NOT EXISTS coops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chickens table (ayam)
CREATE TABLE IF NOT EXISTS chickens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coop_id UUID REFERENCES coops(id) ON DELETE SET NULL,
  batch_number TEXT NOT NULL,
  breed TEXT NOT NULL,
  initial_count INTEGER NOT NULL DEFAULT 0,
  current_count INTEGER NOT NULL DEFAULT 0,
  birth_date DATE NOT NULL,
  status TEXT CHECK (status IN ('active', 'sold', 'dead')) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Egg production table
CREATE TABLE IF NOT EXISTS egg_production (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chicken_id UUID REFERENCES chickens(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  weight DECIMAL(10,2),
  quality TEXT CHECK (quality IN ('A', 'B', 'C')) DEFAULT 'A',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Feed table (pakan)
CREATE TABLE IF NOT EXISTS feed (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coop_id UUID REFERENCES coops(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  type TEXT NOT NULL,
  quantity_kg DECIMAL(10,2) NOT NULL DEFAULT 0,
  cost DECIMAL(12,2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Health records table
CREATE TABLE IF NOT EXISTS health_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chicken_id UUID REFERENCES chickens(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  type TEXT CHECK (type IN ('vaccination', 'treatment', 'checkup')) NOT NULL,
  description TEXT NOT NULL,
  cost DECIMAL(12,2) NOT NULL DEFAULT 0,
  vet_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sales table (penjualan)
CREATE TABLE IF NOT EXISTS sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  egg_count INTEGER NOT NULL DEFAULT 0,
  price_per_unit DECIMAL(12,2) NOT NULL DEFAULT 0,
  total DECIMAL(12,2) NOT NULL DEFAULT 0,
  customer TEXT,
  status TEXT CHECK (status IN ('pending', 'completed')) DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_coops_user_id ON coops(user_id);
CREATE INDEX IF NOT EXISTS idx_chickens_coop_id ON chickens(coop_id);
CREATE INDEX IF NOT EXISTS idx_chickens_status ON chickens(status);
CREATE INDEX IF NOT EXISTS idx_egg_production_chicken_id ON egg_production(chicken_id);
CREATE INDEX IF NOT EXISTS idx_egg_production_date ON egg_production(date);
CREATE INDEX IF NOT EXISTS idx_feed_coop_id ON feed(coop_id);
CREATE INDEX IF NOT EXISTS idx_feed_date ON feed(date);
CREATE INDEX IF NOT EXISTS idx_health_records_chicken_id ON health_records(chicken_id);
CREATE INDEX IF NOT EXISTS idx_health_records_date ON health_records(date);
CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(date);
CREATE INDEX IF NOT EXISTS idx_sales_status ON sales(status);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_coops_updated_at BEFORE UPDATE ON coops
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chickens_updated_at BEFORE UPDATE ON chickens
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, farm_name, location)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'farm_name',
    NEW.raw_user_meta_data->>'location'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE coops ENABLE ROW LEVEL SECURITY;
ALTER TABLE chickens ENABLE ROW LEVEL SECURITY;
ALTER TABLE egg_production ENABLE ROW LEVEL SECURITY;
ALTER TABLE feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Coops policies
CREATE POLICY "Users can view own coops" ON coops
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own coops" ON coops
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own coops" ON coops
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own coops" ON coops
  FOR DELETE USING (auth.uid() = user_id);

-- Chickens policies
CREATE POLICY "Users can view all chickens" ON chickens
  FOR SELECT USING (true);

CREATE POLICY "Users can insert chickens" ON chickens
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update chickens" ON chickens
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete chickens" ON chickens
  FOR DELETE USING (true);

-- Egg production policies
CREATE POLICY "Users can view all egg production" ON egg_production
  FOR SELECT USING (true);

CREATE POLICY "Users can insert egg production" ON egg_production
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update egg production" ON egg_production
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete egg production" ON egg_production
  FOR DELETE USING (true);

-- Feed policies
CREATE POLICY "Users can view all feed" ON feed
  FOR SELECT USING (true);

CREATE POLICY "Users can insert feed" ON feed
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update feed" ON feed
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete feed" ON feed
  FOR DELETE USING (true);

-- Health records policies
CREATE POLICY "Users can view all health records" ON health_records
  FOR SELECT USING (true);

CREATE POLICY "Users can insert health records" ON health_records
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update health records" ON health_records
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete health records" ON health_records
  FOR DELETE USING (true);

-- Sales policies
CREATE POLICY "Users can view all sales" ON sales
  FOR SELECT USING (true);

CREATE POLICY "Users can insert sales" ON sales
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update sales" ON sales
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete sales" ON sales
  FOR DELETE USING (true);
