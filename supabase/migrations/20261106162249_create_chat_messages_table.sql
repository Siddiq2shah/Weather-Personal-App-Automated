/*
# Create chat_messages table for the weather assistant

1. New Tables
- `chat_messages`
  - `id` (uuid, primary key)
  - `session_id` (uuid, identifies one chat conversation in the browser)
  - `role` (text, either 'user' or 'assistant')
  - `content` (text, the message body, up to 4000 characters)
  - `created_at` (timestamp, defaults to now)

2. Security
- Enable RLS on `chat_messages` so nothing is readable or writable by public API keys.
- Grant SELECT, INSERT, DELETE only to `service_role`, which is used by the chat edge function.
- No policies for `anon` or `authenticated`, so browsers can never read chat history directly.

3. Indexes
- Composite index on (session_id, created_at) for fast history lookups.
*/

CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL CHECK (char_length(content) BETWEEN 1 AND 4000),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS chat_messages_session_created_idx
  ON chat_messages (session_id, created_at);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, DELETE ON chat_messages TO service_role;
