-- Insert sample data for development

-- Sample users
INSERT INTO users (id, email, password_hash, role, first_name, last_name, bio) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'jd@example.com', '$2a$10$example', 'user', 'JD', 'Smith', 'Parkour enthusiast and tricking athlete'),
  ('550e8400-e29b-41d4-a716-446655440002', 'sarah@example.com', '$2a$10$example', 'user', 'Sarah', 'Johnson', 'Trampoline coach and freestyle athlete'),
  ('550e8400-e29b-41d4-a716-446655440003', 'owner@lowesair.com', '$2a$10$example', 'business', 'Mike', 'Wilson', 'Owner of Lowes Air Extreme Sports');

-- Sample hubs
INSERT INTO hubs (id, name, description, address, city, state, zip_code, owner_id, sports, amenities) VALUES
  ('660e8400-e29b-41d4-a716-446655440001', 'Lowes Air Extreme Sports', 'Premier action sports facility with trampolines, foam pits, and parkour equipment', '123 Action St', 'Los Angeles', 'CA', '90210', '550e8400-e29b-41d4-a716-446655440003', ARRAY['trampoline', 'parkour', 'tricking'], ARRAY['foam_pit', 'spring_floor', 'parking', 'lockers']),
  ('660e8400-e29b-41d4-a716-446655440002', 'Urban Movement Gym', 'Parkour and freerunning training facility', '456 Parkour Ave', 'San Francisco', 'CA', '94102', '550e8400-e29b-41d4-a716-446655440003', ARRAY['parkour', 'freerunning'], ARRAY['outdoor_area', 'beginner_section', 'parking']);

-- Sample events
INSERT INTO events (hub_id, organizer_id, title, description, event_type, start_time, end_time, max_participants, skill_level, sports) VALUES
  ('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', 'Wednesday Night Tricking Session', 'Open session for tricking and flips', 'open_session', '2024-01-10 19:00:00-08', '2024-01-10 21:00:00-08', 20, 'all', ARRAY['tricking', 'trampoline']),
  ('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', 'Beginner Parkour Class', 'Learn the basics of parkour movement', 'class', '2024-01-12 18:00:00-08', '2024-01-12 19:30:00-08', 12, 'beginner', ARRAY['parkour']);

-- Sample user schedules
INSERT INTO user_hub_schedules (user_id, hub_id, day_of_week, start_time, end_time, notes) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 'wednesday', '19:00:00', '21:00:00', 'Regular tricking session with the crew'),
  ('550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', 'friday', '17:00:00', '19:00:00', 'Trampoline training');
