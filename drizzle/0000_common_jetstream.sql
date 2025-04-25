CREATE TABLE "tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"primary_key" text NOT NULL,
	"name" text NOT NULL,
	"status" text,
	"task_status" text,
	"active" boolean,
	"added" timestamp with time zone,
	"modified" timestamp with time zone,
	"completed" timestamp with time zone,
	"completion_date" timestamp with time zone,
	"due_date" timestamp with time zone,
	"note" text,
	"tags" jsonb,
	"raw_data" jsonb NOT NULL,
	"imported_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tasks_primary_key_unique" UNIQUE("primary_key")
);
