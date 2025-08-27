-- Create indexes for better query performance

-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Hubs indexes
CREATE INDEX idx_hubs_owner_id ON hubs(owner_id);
CREATE INDEX idx_hubs_city_state ON hubs(city, state);
CREATE INDEX idx_hubs_sports ON hubs USING GIN(sports);
CREATE INDEX idx_hubs_is_active ON hubs(is_active);

-- Events indexes
CREATE INDEX idx_events_hub_id ON events(hub_id);
CREATE INDEX idx_events_organizer_id ON events(organizer_id);
CREATE INDEX idx_events_start_time ON events(start_time);
CREATE INDEX idx_events_event_type ON events(event_type);
CREATE INDEX idx_events_is_active ON events(is_active);

-- User hub schedules indexes
CREATE INDEX idx_user_hub_schedules_user_id ON user_hub_schedules(user_id);
CREATE INDEX idx_user_hub_schedules_hub_id ON user_hub_schedules(hub_id);
CREATE INDEX idx_user_hub_schedules_day ON user_hub_schedules(day_of_week);

-- Event participants indexes
CREATE INDEX idx_event_participants_event_id ON event_participants(event_id);
CREATE INDEX idx_event_participants_user_id ON event_participants(user_id);

-- Hub followers indexes
CREATE INDEX idx_hub_followers_hub_id ON hub_followers(hub_id);
CREATE INDEX idx_hub_followers_user_id ON hub_followers(user_id);
