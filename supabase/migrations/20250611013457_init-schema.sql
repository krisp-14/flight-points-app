-- Drop old tables first
drop table if exists flight_programs cascade;
drop table if exists flights cascade;
drop table if exists transfer_paths cascade;
drop table if exists programs cascade;

-- Programs table
create table if not exists programs (
  id serial primary key,
  name text not null
);

-- Transfer Paths table
create table if not exists transfer_paths (
  id serial primary key,
  from_program_id integer references programs(id),
  to_program_id integer references programs(id),
  ratio text not null
);

-- Flights table (with origin and destination)
create table if not exists flights (
  id serial primary key,
  airline text not null,
  flight_number text,
  origin text not null,
  destination text not null,
  departure_time timestamp,
  arrival_time timestamp,
  cabin_class text,
  points_required integer not null
);

-- Join table to link flights and programs
create table if not exists flight_programs (
  flight_id integer references flights(id),
  program_id integer references programs(id),
  primary key (flight_id, program_id)
);

-- Seed data for programs
insert into programs (name) values
  ('Amex Membership Rewards'), -- id = 1
  ('RBC Avion'),              -- id = 2
  ('CIBC Aventura'),          -- id = 3
  ('TD Rewards'),             -- id = 4
  ('Aeroplan'),               -- id = 5
  ('Marriott Bonvoy');        -- id = 6

-- Seed data for transfer_paths
insert into transfer_paths (from_program_id, to_program_id, ratio) values
  (1, 5, '1:1'), -- Amex -> Aeroplan
  (1, 6, '1:1'), -- Amex -> Marriott
  (2, 5, '1:1'), -- RBC -> Aeroplan
  (3, 5, '1:1'), -- CIBC -> Aeroplan
  (4, 5, '1:1'), -- TD -> Aeroplan
  (6, 5, '3:1'); -- Marriott -> Aeroplan

-- Seed data for flights
insert into flights (airline, flight_number, origin, destination, departure_time, arrival_time, cabin_class, points_required) values
  ('Air Canada', 'AC849', 'LHR', 'YYZ', '2024-07-01 14:00:00', '2024-07-01 16:30:00', 'Economy', 35000), -- id = 1
  ('KLM', 'KL692', 'YYZ', 'AMS', '2024-07-02 18:00:00', '2024-07-03 07:30:00', 'Business', 70000),         -- id = 2
  ('British Airways', 'BA98', 'YYZ', 'LHR', '2024-07-03 20:00:00', '2024-07-04 08:00:00', 'Economy', 40000), -- id = 3
  ('Air Canada', 'AC872', 'YUL', 'CDG', '2024-07-04 19:00:00', '2024-07-05 08:20:00', 'Economy', 37000);   -- id = 4

-- Seed data for flight_programs
insert into flight_programs (flight_id, program_id) values
  (1, 1), (1, 5), (1, 6), -- AC849 bookable by Amex, Aeroplan, Marriott
  (2, 1), (2, 5), (2, 6), -- KL692 bookable by Amex, Aeroplan, Marriott
  (3, 1), (3, 5), (3, 6), -- BA98 bookable by Amex, Aeroplan, Marriott
  (4, 1), (4, 5), (4, 6); -- AC872 bookable by Amex, Aeroplan, Marriott