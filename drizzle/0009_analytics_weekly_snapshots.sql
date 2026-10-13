-- Weekly snapshots behind the Telegram "NoteBot weekly" report (n8n workflow notebot-weekly-report,
-- built by notebot-automation/scripts/build-weekly-report.js).
--
-- Two of the numbers that report shows as growth have no history to diff against:
--   - analytics.app_users has no created_at, so "new app users this week" cannot be counted;
--   - mcp.api_keys.request_count is an all-time counter, and the daily "ai" rows the dashboard
--     plots are not being reported yet, so "requests this week" cannot be summed either.
-- Each run therefore records the current totals here and reports the difference from the previous
-- row. It lives in public rather than in the analytics/mcp schemas because those belong to other
-- services, which the CMS and n8n only read.
--
-- Idempotent like 0003-0008: applied directly, not through drizzle-kit.
CREATE TABLE IF NOT EXISTS "analytics_weekly_snapshots" (
  "taken_on"     date PRIMARY KEY NOT NULL,   -- Asia/Dhaka date of the run
  "app_users"    integer NOT NULL,
  "mcp_emails"   integer NOT NULL,
  "mcp_keys"     integer NOT NULL,
  "mcp_requests" bigint  NOT NULL,
  "created_at"   timestamptz DEFAULT now() NOT NULL
);
