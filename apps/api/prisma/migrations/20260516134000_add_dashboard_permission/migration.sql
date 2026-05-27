INSERT INTO "Permiso" ("codigo", "modulo", "descripcion")
VALUES ('dashboard.ver', 'dashboard', 'Ver dashboard operativo')
ON CONFLICT ("codigo") DO UPDATE
SET "modulo" = EXCLUDED."modulo",
    "descripcion" = EXCLUDED."descripcion",
    "updatedAt" = CURRENT_TIMESTAMP;

INSERT INTO "RolPermiso" ("rolId", "permisoId")
SELECT r."id", p."id"
FROM "Rol" r
JOIN "Permiso" p ON p."codigo" = 'dashboard.ver'
WHERE r."codigo" IN ('SUPER_ADMIN', 'VENDEDOR')
ON CONFLICT DO NOTHING;
