# iMedExp Backend

FastAPI clinical records backend backed by PostgreSQL and row-level security.

## Setup

Create a local `.env` from `env.example` and set real secrets. Generate values with:

```bash
cp env.example .env
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
openssl rand -hex 32
```

On Windows PowerShell:

```powershell
Copy-Item env.example .env
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
python -c "import secrets; print(secrets.token_hex(32))"
```

The application should connect to PostgreSQL as `app_api`. The database bootstrap creates that login role and applies grants/RLS policies.

## Run

```bash
docker compose -f docker-compose.yaml up --build
```

API documentation is available at:

```text
http://localhost:8000/docs
```

## Test

```bash
docker compose -f docker-compose.test.yaml up --build --abort-on-container-exit --exit-code-from tests
```

Run test nodes individually:

```bash
bash scripts/linux/run_docker_tests_individual.sh
```

On Windows PowerShell:

```powershell
.\scripts\windows\run_docker_tests_individual.ps1
```

Reload the local database:

```bash
bash scripts/linux/loadBd.sh
```

On Windows PowerShell:

```powershell
.\scripts\windows\loadBd.ps1
```

Render PlantUML diagrams:

```bash
docker run --rm -v "$PWD:/workspace" -w /workspace plantuml/plantuml -tsvg docs/es/uml/*.puml
```

On Windows PowerShell:

```powershell
.\scripts\windows\render_puml.ps1
```

Build the printable documentation PDF:

```bash
bash scripts/linux/build_docs_pdf.sh
```

On Windows PowerShell:

```powershell
.\scripts\windows\build_docs_pdf.ps1
```

## Notes

The repository uses `docker-compose.yaml`, not `docker-compose.yml`.

Any password or mail credential previously shared in local examples must be rotated before production use.
