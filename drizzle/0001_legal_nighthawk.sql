CREATE TABLE `climbing_efforts` (
	`id` integer PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`strava_id` text NOT NULL,
	`effort_data` text NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
