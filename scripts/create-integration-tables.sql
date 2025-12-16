-- Database schema for API integrations

-- User integrations (OAuth tokens, etc.)
CREATE TABLE IF NOT EXISTS user_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  provider TEXT NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, provider)
);

-- Registry of equids (SIRE/UELN database)
CREATE TABLE IF NOT EXISTS registry_equids (
  ueln TEXT PRIMARY KEY,
  sire TEXT UNIQUE,
  name TEXT,
  birth_year INTEGER,
  sex TEXT,
  breed TEXT,
  color TEXT,
  breeder TEXT,
  country TEXT,
  pedigree JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_registry_sire ON registry_equids(sire);
CREATE INDEX IF NOT EXISTS idx_registry_name ON registry_equids(name);

-- Health share tokens
CREATE TABLE IF NOT EXISTS health_share_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  horse_id UUID NOT NULL,
  owner_id UUID NOT NULL,
  scope TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked BOOLEAN DEFAULT FALSE,
  access_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_health_share_horse ON health_share_tokens(horse_id);
CREATE INDEX IF NOT EXISTS idx_health_share_expires ON health_share_tokens(expires_at);

-- Training sessions with GPS tracking
CREATE TABLE IF NOT EXISTS training_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  horse_id UUID NOT NULL,
  user_id UUID NOT NULL,
  type TEXT,
  notes TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  status TEXT DEFAULT 'live',
  points JSONB DEFAULT '[]',
  distance NUMERIC,
  duration NUMERIC,
  avg_speed NUMERIC,
  gait_breakdown JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_training_horse ON training_sessions(horse_id);
CREATE INDEX IF NOT EXISTS idx_training_user ON training_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_training_start ON training_sessions(start_time);

-- Enable Row Level Security
ALTER TABLE user_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_share_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their own integrations"
  ON user_integrations FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own share tokens"
  ON health_share_tokens FOR ALL
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can manage their own training sessions"
  ON training_sessions FOR ALL
  USING (auth.uid() = user_id);

-- Registry is public read
ALTER TABLE registry_equids ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Registry is publicly readable"
  ON registry_equids FOR SELECT
  USING (true);
