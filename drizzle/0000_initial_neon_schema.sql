CREATE TYPE "public"."application_status" AS ENUM('submitted', 'reviewing', 'shortlisted', 'declined', 'withdrawn');--> statement-breakpoint
CREATE TYPE "public"."employment_type" AS ENUM('full_time', 'part_time', 'contract', 'casual');--> statement-breakpoint
CREATE TYPE "public"."job_status" AS ENUM('draft', 'pending_review', 'approved', 'published', 'rejected', 'expired');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('candidate', 'employer', 'admin');--> statement-breakpoint
CREATE TYPE "public"."work_arrangement" AS ENUM('on_site', 'hybrid', 'remote');--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"access_token_expires_at" timestamp with time zone,
	"refresh_token_expires_at" timestamp with time zone,
	"scope" text,
	"id_token" text,
	"password" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" uuid NOT NULL,
	"candidate_id" text NOT NULL,
	"passport_id" uuid NOT NULL,
	"application_note" text,
	"status" "application_status" DEFAULT 'submitted' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employer_id" text NOT NULL,
	"title" text NOT NULL,
	"company" text NOT NULL,
	"location" text NOT NULL,
	"work_arrangement" "work_arrangement" NOT NULL,
	"employment_type" "employment_type" NOT NULL,
	"salary_min" integer,
	"salary_max" integer,
	"salary_text" text,
	"description" text NOT NULL,
	"application_details" text NOT NULL,
	"listing_type" text DEFAULT 'exclusive' NOT NULL,
	"price_cents" integer DEFAULT 3000 NOT NULL,
	"status" "job_status" DEFAULT 'draft' NOT NULL,
	"review_notes" text,
	"submitted_at" timestamp with time zone,
	"reviewed_at" timestamp with time zone,
	"published_at" timestamp with time zone,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "jobs_price_check" CHECK ("jobs"."price_cents" = 3000),
	CONSTRAINT "jobs_listing_type_check" CHECK ("jobs"."listing_type" = 'exclusive'),
	CONSTRAINT "jobs_salary_check" CHECK ("jobs"."salary_min" is null or "jobs"."salary_max" is null or "jobs"."salary_min" <= "jobs"."salary_max")
);
--> statement-breakpoint
CREATE TABLE "passports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"candidate_id" text NOT NULL,
	"public_slug" text NOT NULL,
	"headline" text NOT NULL,
	"location" text NOT NULL,
	"biography" text NOT NULL,
	"skills" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"portfolio_links" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"availability" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "passports_slug_check" CHECK ("passports"."public_slug" ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"display_name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"role" "user_role" DEFAULT 'candidate' NOT NULL,
	"account_type" text DEFAULT 'candidate' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_account_type_check" CHECK ("users"."account_type" in ('candidate', 'employer'))
);
--> statement-breakpoint
CREATE TABLE "verifications" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_candidate_id_users_id_fk" FOREIGN KEY ("candidate_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_passport_id_passports_id_fk" FOREIGN KEY ("passport_id") REFERENCES "public"."passports"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_employer_id_users_id_fk" FOREIGN KEY ("employer_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "passports" ADD CONSTRAINT "passports_candidate_id_users_id_fk" FOREIGN KEY ("candidate_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "accounts_provider_account_idx" ON "accounts" USING btree ("provider_id","account_id");--> statement-breakpoint
CREATE UNIQUE INDEX "accounts_user_provider_idx" ON "accounts" USING btree ("user_id","provider_id");--> statement-breakpoint
CREATE UNIQUE INDEX "applications_candidate_job_idx" ON "applications" USING btree ("candidate_id","job_id");--> statement-breakpoint
CREATE UNIQUE INDEX "passports_candidate_idx" ON "passports" USING btree ("candidate_id");--> statement-breakpoint
CREATE UNIQUE INDEX "passports_slug_idx" ON "passports" USING btree ("public_slug");--> statement-breakpoint
CREATE INDEX "sessions_user_id_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verifications_identifier_idx" ON "verifications" USING btree ("identifier");--> statement-breakpoint
CREATE OR REPLACE FUNCTION enforce_passport_owner() RETURNS trigger AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM users WHERE id = NEW.candidate_id AND role = 'candidate'
  ) THEN
    RAISE EXCEPTION 'passport owner must be a candidate' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;--> statement-breakpoint
CREATE OR REPLACE FUNCTION enforce_job_owner() RETURNS trigger AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM users WHERE id = NEW.employer_id AND role = 'employer'
  ) THEN
    RAISE EXCEPTION 'job owner must be an employer' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;--> statement-breakpoint
CREATE OR REPLACE FUNCTION enforce_application_owner() RETURNS trigger AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE id = NEW.candidate_id AND role = 'candidate') THEN
    RAISE EXCEPTION 'application owner must be a candidate' USING ERRCODE = '23514';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM passports WHERE id = NEW.passport_id AND candidate_id = NEW.candidate_id
  ) THEN
    RAISE EXCEPTION 'application passport must belong to candidate' USING ERRCODE = '23514';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM jobs WHERE id = NEW.job_id AND status = 'published') THEN
    RAISE EXCEPTION 'applications require a published job' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;--> statement-breakpoint
CREATE TRIGGER passports_owner_role BEFORE INSERT OR UPDATE ON passports
FOR EACH ROW EXECUTE FUNCTION enforce_passport_owner();--> statement-breakpoint
CREATE TRIGGER jobs_owner_role BEFORE INSERT OR UPDATE ON jobs
FOR EACH ROW EXECUTE FUNCTION enforce_job_owner();--> statement-breakpoint
CREATE TRIGGER applications_owner_role BEFORE INSERT OR UPDATE ON applications
FOR EACH ROW EXECUTE FUNCTION enforce_application_owner();--> statement-breakpoint
CREATE OR REPLACE FUNCTION enforce_job_status_transition() RETURNS trigger AS $$
BEGIN
  IF NEW.status = OLD.status THEN
    RETURN NEW;
  END IF;

  IF NOT (
    (OLD.status = 'draft' AND NEW.status = 'pending_review') OR
    (OLD.status = 'pending_review' AND NEW.status IN ('approved', 'rejected')) OR
    (OLD.status = 'approved' AND NEW.status = 'published') OR
    (OLD.status = 'published' AND NEW.status = 'expired')
  ) THEN
    RAISE EXCEPTION 'invalid job lifecycle transition' USING ERRCODE = '23514';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;--> statement-breakpoint
CREATE TRIGGER jobs_status_transition BEFORE UPDATE OF status ON jobs
FOR EACH ROW EXECUTE FUNCTION enforce_job_status_transition();
