/*
# Create SMS send log and secure settings lookup

1. New Tables
- `sms_send_log`: one row per morning text attempt. Used to make sure only one text goes out per day.
  - `id` (uuid, primary key)
  - `send_date` (date, Eastern calendar date the text was for)
  - `status` (text, e.g. "sent")
  - `twilio_sid` (text, message id returned by Twilio)
  - `body` (text, the message that was sent)
  - `created_at` (timestamptz)

2. New Functions
- `get_app_secret(secret_name)`: returns a stored setting from the protected vault so server code can read it. Only the server role can call it.

3. Security
- Row level security enabled on `sms_send_log` with no policies, so browsers and signed-out users can never read or write it.
- Only the server role receives privileges on `sms_send_log`.
- `get_app_secret` is revoked from public, anonymous and signed-in roles and granted only to the server role.

4. Notes
- No secret values are stored in this migration. Values are added separately to the vault.
*/

CREATE TABLE IF NOT EXISTS sms_send_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  send_date date NOT NULL,
  status text NOT NULL,
  twilio_sid text,
  body text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE sms_send_log ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT ON sms_send_log TO service_role;

CREATE OR REPLACE FUNCTION get_app_secret(secret_name text)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = secret_name LIMIT 1;
$$;

REVOKE EXECUTE ON FUNCTION get_app_secret(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION get_app_secret(text) TO service_role;
