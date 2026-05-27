DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum
    WHERE enumlabel = 'VENDEDOR'
      AND enumtypid = '"RolUsuario"'::regtype
  ) THEN
    ALTER TYPE "RolUsuario" ADD VALUE 'VENDEDOR';
  END IF;
END $$;
