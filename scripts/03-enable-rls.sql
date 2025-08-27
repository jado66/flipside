-- Enable Row Level Security (RLS) for all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE hubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_hub_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE hub_followers ENABLE ROW LEVEL SECURITY;

-- Users can read their own data and public profile info
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Public profiles viewable" ON users
  FOR SELECT USING (true);

-- Hubs are publicly readable, but only owners can modify
CREATE POLICY "Hubs are publicly viewable" ON hubs
  FOR SELECT USING (is_active = true);

CREATE POLICY "Hub owners can update their hubs" ON hubs
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Business users can create hubs" ON hubs
  FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT id FROM users WHERE role = 'business')
  );

-- Events are publicly readable, organizers and hub owners can modify
CREATE POLICY "Events are publicly viewable" ON events
  FOR SELECT USING (is_active = true);

CREATE POLICY "Event organizers can manage their events" ON events
  FOR ALL USING (auth.uid() = organizer_id);

CREATE POLICY "Hub owners can manage hub events" ON events
  FOR ALL USING (
    auth.uid() IN (SELECT owner_id FROM hubs WHERE id = hub_id)
  );

-- User schedules are private to the user
CREATE POLICY "Users can manage own schedules" ON user_hub_schedules
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Hub owners can view schedules for their hubs" ON user_hub_schedules
  FOR SELECT USING (
    auth.uid() IN (SELECT owner_id FROM hubs WHERE id = hub_id)
  );

-- Event participants
CREATE POLICY "Users can manage own event participation" ON event_participants
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Event organizers can view participants" ON event_participants
  FOR SELECT USING (
    auth.uid() IN (SELECT organizer_id FROM events WHERE id = event_id)
  );

-- Hub followers
CREATE POLICY "Users can manage own hub follows" ON hub_followers
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Hub owners can view their followers" ON hub_followers
  FOR SELECT USING (
    auth.uid() IN (SELECT owner_id FROM hubs WHERE id = hub_id)
  );
