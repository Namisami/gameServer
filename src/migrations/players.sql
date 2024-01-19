CREATE TABLE IF NOT EXISTS players (
	id serial PRIMARY KEY NOT NULL,
	username varchar(50) NOT NULL,
	hp int,
	posX int,
	posY int
);