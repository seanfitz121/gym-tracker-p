-- Create a function to get email from user_id
-- This is needed because auth.users is not directly accessible
CREATE OR REPLACE FUNCTION get_email_by_user_id(user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_email TEXT;
BEGIN
  SELECT email INTO user_email
  FROM auth.users
  WHERE id = user_id;
  
  RETURN user_email;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_email_by_user_id(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_email_by_user_id(UUID) TO anon;

COMMENT ON FUNCTION get_email_by_user_id IS 'Returns the email address for a given user ID';

