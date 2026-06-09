"""
Seed de prueba: crea o actualiza una Institution demo y un institution_admin.
Se ejecuta dentro del contenedor med_api vía stdin:
  docker exec -i -e SEED_EMAIL=x -e SEED_PASSWORD=x med_api python3 - < scripts/seed_admin.py

La app se conecta como app_api (sujeto a RLS). Para poder insertar un
institution_admin se requiere que el contexto de sesión tenga role='superadmin'.
Se usa set_session_context con user_id=-1 (ficticio, solo para el contexto RLS).
"""
import asyncio
import os

from sqlalchemy import text
from app.core.database import AsyncSessionLocal
from app.core.security import hash_password, verify_password


INSTITUTION_NAME = "Clínica Demo"
EMAIL    = os.environ["SEED_EMAIL"].lower()
PASSWORD = os.environ["SEED_PASSWORD"]


async def main() -> None:
    async with AsyncSessionLocal() as session:

        # Establecer contexto de sesión con rol superadmin para pasar las políticas RLS
        await session.execute(
            text("SELECT set_session_context(-1, 'superadmin', NULL, 'seed-script')")
        )

        # 1. Institución
        result = await session.execute(
            text("SELECT id FROM institution WHERE name = :name LIMIT 1"),
            {"name": INSTITUTION_NAME},
        )
        row = result.one_or_none()

        if row is None:
            result = await session.execute(
                text("""
                    INSERT INTO institution
                        (type, name, address, phone, is_active, policies,
                         city, state, postal_code, email)
                    VALUES
                        ('private_clinic', :name, 'Av. Insurgentes Sur 1234, Col. Del Valle',
                         '5551234567', true, '{}', 'Ciudad de México', 'CDMX',
                         '03100', 'contacto@clinicademo.test')
                    RETURNING id
                """),
                {"name": INSTITUTION_NAME},
            )
            institution_id = result.scalar_one()
            print(f"  Institution creada  id={institution_id}")
        else:
            institution_id = row[0]
            print(f"  Institution existente id={institution_id}")

        # 2. Hash de contraseña (misma función que usa el backend)
        pw_hash = hash_password(PASSWORD)
        assert verify_password(PASSWORD, pw_hash), "ERROR: hash no verifica!"
        print(f"  Hash OK  prefijo={pw_hash[:7]}")

        # 3. Usuario admin
        result = await session.execute(
            text('SELECT id, password_hash FROM "user" WHERE email = :email'),
            {"email": EMAIL},
        )
        user_row = result.one_or_none()

        if user_row is None:
            await session.execute(
                text("""
                    INSERT INTO "user"
                        (institution_id, email, password_hash, role,
                         access_attributes, is_active, email_verified)
                    VALUES
                        (:iid, :email, :pw_hash, 'institution_admin',
                         '{}', true, true)
                """),
                {"iid": institution_id, "email": EMAIL, "pw_hash": pw_hash},
            )
            print(f"  Usuario creado  email={EMAIL}")
        else:
            user_id, old_hash = user_row[0], user_row[1]
            if verify_password(PASSWORD, old_hash):
                print(f"  Usuario id={user_id} ya tiene hash correcto, no se modifica")
            else:
                await session.execute(
                    text("""
                        UPDATE "user"
                        SET password_hash  = :pw_hash,
                            institution_id = :iid,
                            role           = 'institution_admin',
                            is_active      = true,
                            email_verified = true,
                            deleted_at     = NULL
                        WHERE email = :email
                    """),
                    {"pw_hash": pw_hash, "iid": institution_id, "email": EMAIL},
                )
                print(f"  Usuario id={user_id} hash actualizado")

        # 4. Verificación final (dentro de la misma transacción, antes del commit,
        #    para que set_session_context siga activo)
        result = await session.execute(
            text("""
                SELECT u.id, u.email, u.role, u.institution_id,
                       u.is_active, u.email_verified,
                       left(u.password_hash, 7) AS hash_prefix,
                       i.name AS institution_name
                FROM "user" u
                JOIN institution i ON i.id = u.institution_id
                WHERE u.email = :email
            """),
            {"email": EMAIL},
        )
        final = result.mappings().one()
        print("")
        print("  === Resultado final ===")
        for k, v in final.items():
            print(f"  {k}: {v}")

        await session.commit()


if __name__ == "__main__":
    asyncio.run(main())
