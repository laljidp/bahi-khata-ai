BEGIN;

ALTER TABLE public."User" ENABLE ROW LEVEL SECURITY;

ALTER TABLE public."User" FORCE ROW LEVEL SECURITY;

ALTER TABLE public."Customer" ENABLE ROW LEVEL SECURITY;

ALTER TABLE public."Customer" FORCE ROW LEVEL SECURITY;

ALTER TABLE public."Entry" ENABLE ROW LEVEL SECURITY;

ALTER TABLE public."Entry" FORCE ROW LEVEL SECURITY;

ALTER TABLE public."PasswordResetCode" ENABLE ROW LEVEL SECURITY;

ALTER TABLE public."PasswordResetCode" FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_read_self_or_auth_flow" ON public."User";

CREATE POLICY "user_read_self_or_auth_flow" ON public."User"
  FOR SELECT
  USING (
    "id" = NULLIF((SELECT current_setting('app.user_id', true)), '')
    OR (
      COALESCE((SELECT current_setting('app.auth_operation', true)), '') IN (
        'login',
        'forgot_password',
        'reset_password'
      )
      AND "email" = NULLIF((SELECT current_setting('app.auth_email', true)), '')
    )
    OR (
      COALESCE((SELECT current_setting('app.auth_operation', true)), '') = 'signup'
      AND (
        "email" = NULLIF((SELECT current_setting('app.auth_email', true)), '')
        OR "phone" = NULLIF((SELECT current_setting('app.auth_phone', true)), '')
      )
    )
  );

DROP POLICY IF EXISTS "user_signup" ON public."User";

CREATE POLICY "user_signup" ON public."User"
  FOR INSERT
  WITH CHECK (
    COALESCE((SELECT current_setting('app.auth_operation', true)), '') = 'signup'
  );

DROP POLICY IF EXISTS "user_update_self_or_reset" ON public."User";

CREATE POLICY "user_update_self_or_reset" ON public."User"
  FOR UPDATE
  USING (
    "id" = NULLIF((SELECT current_setting('app.user_id', true)), '')
    OR (
      COALESCE((SELECT current_setting('app.auth_operation', true)), '') = 'reset_password'
      AND "email" = NULLIF((SELECT current_setting('app.auth_email', true)), '')
    )
  )
  WITH CHECK (
    "id" = NULLIF((SELECT current_setting('app.user_id', true)), '')
    OR (
      COALESCE((SELECT current_setting('app.auth_operation', true)), '') = 'reset_password'
      AND "email" = NULLIF((SELECT current_setting('app.auth_email', true)), '')
    )
  );

DROP POLICY IF EXISTS "customers_owned_by_user" ON public."Customer";

CREATE POLICY "customers_owned_by_user" ON public."Customer"
  FOR ALL
  USING (
    "userId" = NULLIF((SELECT current_setting('app.user_id', true)), '')
  )
  WITH CHECK (
    "userId" = NULLIF((SELECT current_setting('app.user_id', true)), '')
  );

DROP POLICY IF EXISTS "entries_owned_by_user" ON public."Entry";

CREATE POLICY "entries_owned_by_user" ON public."Entry"
  FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM public."Customer" AS customer
      WHERE customer."id" = "Entry"."customerId"
        AND customer."userId" = NULLIF((SELECT current_setting('app.user_id', true)), '')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public."Customer" AS customer
      WHERE customer."id" = "Entry"."customerId"
        AND customer."userId" = NULLIF((SELECT current_setting('app.user_id', true)), '')
    )
  );

DROP POLICY IF EXISTS "password_reset_codes_scoped" ON public."PasswordResetCode";

CREATE POLICY "password_reset_codes_scoped" ON public."PasswordResetCode"
  FOR ALL
  USING (
    "userId" = NULLIF((SELECT current_setting('app.user_id', true)), '')
    OR (
      COALESCE((SELECT current_setting('app.auth_operation', true)), '') IN (
        'forgot_password',
        'reset_password'
      )
      AND EXISTS (
        SELECT 1
        FROM public."User" AS auth_user
        WHERE auth_user."id" = "PasswordResetCode"."userId"
          AND auth_user."email" = NULLIF((SELECT current_setting('app.auth_email', true)), '')
      )
    )
  )
  WITH CHECK (
    "userId" = NULLIF((SELECT current_setting('app.user_id', true)), '')
    OR (
      COALESCE((SELECT current_setting('app.auth_operation', true)), '') IN (
        'forgot_password',
        'reset_password'
      )
      AND EXISTS (
        SELECT 1
        FROM public."User" AS auth_user
        WHERE auth_user."id" = "PasswordResetCode"."userId"
          AND auth_user."email" = NULLIF((SELECT current_setting('app.auth_email', true)), '')
      )
    )
  );

GRANT USAGE ON SCHEMA public TO bahi_app;

GRANT SELECT, INSERT, UPDATE, DELETE
  ON TABLE public."User", public."Customer", public."Entry", public."PasswordResetCode"
  TO bahi_app;

COMMIT;