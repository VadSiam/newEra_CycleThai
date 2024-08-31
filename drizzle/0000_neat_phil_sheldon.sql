CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text,
	`email` text,
	`strava_id` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_strava_id_unique` ON `users` (`strava_id`);