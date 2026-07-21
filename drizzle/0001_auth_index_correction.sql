DROP INDEX "sessions_user_id_idx";--> statement-breakpoint
DROP INDEX "verifications_identifier_idx";--> statement-breakpoint
CREATE INDEX "sessions_user_id_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verifications_identifier_idx" ON "verifications" USING btree ("identifier");