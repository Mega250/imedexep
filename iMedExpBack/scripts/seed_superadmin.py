"""
Seed: crea o actualiza el usuario superadmin via fn_bootstrap_superadmin.
Se ejecuta dentro del contenedor med_api vía stdin:
  docker exec -i -e SEED_EMAIL=x -e SEED_PASSWORD=x med_api python3 - < scripts/seed_superadmin.py

fn_bootstrap_superadmin es SECURITY DEFINER, por lo que bypasea las políticas RLS.
  - Si no existe ningún superadmin, lo crea con el email y password indicados.
  - Si ya existe un superadmin con el email indicado y hash correcto, no hace nada.
  - Si ya existe un superadmin con el email indicado pero distinta contraseña, actualiza el hash
    usando set_session_context con su propio user_id (activa rls_user_self_update).
  - Si existe un superadmin con distinto email, lo reporta sin modificarlo.
"""
import asyncio
import os

from sqlalchemy import text
from app.core.database import AsyncSessionLocal
from app.core.security import hash_password, verify_password


EMAIL    = os.environ["SEED_EMAIL"].lower()
PASSWORD = os.environ["SEED_PASSWORD"]


async def main() -> None:
    async with AsyncSessionLocal() as session:

        # 1. Establecer contexto de sesión (necesario para que las políticas RLS
        #    permitan los SELECT posteriores; role='superadmin' activa rls_user_select).
        await session.execute(
            text("SELECT set_session_context(-1, 'superadmin', NULL, 'seed-script')")
        )

        # 2. Hash de contraseña
        pw_hash = hash_password(PASSWORD)
        assert verify_password(PASSWORD, pw_hash), "ERROR: hash no verifica!"
        print(f"  Hash OK  prefijo={pw_hash[:7]}")

        # 3. Crear via fn_bootstrap_superadmin (SECURITY DEFINER, bypasea RLS).
        #    Si ya existe un superadmin, devuelve su id sin crear uno nuevo.
        result = await session.execute(
            text("SELECT fn_bootstrap_superadmin(:email, :hash)"),
            {"email": EMAIL, "hash": pw_hash},
        )
        returned_id = result.scalar_one()

        # 4. Verificar qué pasó: ¿se creó o ya existía?
        result = await session.execute(
            text('SELECT id, email, password_hash FROM "user" WHERE id = :uid'),
            {"uid": returned_id},
        )
        user_row = result.one()
        user_id, existing_email, existing_hash = user_row

        if existing_email != EMAIL:
            print(f"  AVISO: ya existe un superadmin con email={existing_email} (id={user_id}).")
            print(f"         El email solicitado ({EMAIL}) no fue creado.")
        elif verify_password(PASSWORD, existing_hash):
            print(f"  Superadmin id={user_id} ya existe con hash correcto, no se modifica")
        else:
            # Actualizar password: usar el id real del superadmin como contexto de sesión
            # para que la política rls_user_self_update lo permita.
            await session.execute(
                text("SELECT set_session_context(:uid, 'superadmin', NULL, 'seed-script')"),
                {"uid": user_id},
            )
            await session.execute(
                text("""
                    UPDATE "user"
                    SET password_hash  = :pw_hash,
                        is_active      = true,
                        email_verified = true,
                        deleted_at     = NULL
                    WHERE id = :uid
                """),
                {"pw_hash": pw_hash, "uid": user_id},
            )
            print(f"  Superadmin id={user_id} hash actualizado")

        # 5. Verificación final
        result = await session.execute(
            text("""
                SELECT id, email, role, institution_id,
                       is_active, email_verified,
                       left(password_hash, 7) AS hash_prefix
                FROM "user"
                WHERE role = 'superadmin' AND deleted_at IS NULL
            """),
        )
        rows = result.mappings().all()
        print("")
        print("  === Superadmins en la BD ===")
        for row in rows:
            for k, v in row.items():
                print(f"  {k}: {v}")
            print("")

        await session.commit()


if __name__ == "__main__":
    asyncio.run(main())
