# Stage 1 — compila el motor a .so DENTRO del mismo entorno del runtime
# (python:3.14-slim). Asi los binarios son 100% compatibles en cualquier
# maquina que levante el contenedor (Linux, o Windows/macOS via Docker).
FROM python:3.14 AS builder
RUN pip install --no-cache-dir Cython setuptools fastapi uvicorn pydantic asyncpg neo4j httpx python-docx pyyaml
WORKDIR /build
COPY gumi ./gumi
RUN find gumi -name "*.py" ! -name "__init__.py" > /tmp/mods.txt; \
    while IFS= read -r f; do \
      if cythonize -3 -X annotation_typing=False -i "$f" >/dev/null 2>&1; then rm -f "$f" "${f%.py}.c"; fi; \
    done < /tmp/mods.txt; \
    find gumi -name "*.c" -delete; rm -f /tmp/mods.txt; \
    echo "modulos .so: $(find gumi -name '*.so' | wc -l) | .py de logica restantes: $(find gumi -name '*.py' ! -name '__init__.py' | wc -l)"

# Stage 2 — runtime autocontenido: solo los .so del motor (sin codigo fuente)
FROM python:3.14-slim
RUN apt-get update && apt-get install -y --no-install-recommends poppler-utils && rm -rf /var/lib/apt/lists/*
WORKDIR /opt/gumi
COPY --from=builder /build/gumi ./gumi
COPY entrypoint.py ./entrypoint.py
RUN pip install --no-cache-dir fastapi uvicorn pydantic asyncpg neo4j httpx python-docx pyyaml
COPY agent /agent
RUN printf '#!/bin/sh\nexec python /opt/gumi/entrypoint.py "$@"\n' > /usr/local/bin/gumi-runtime && chmod +x /usr/local/bin/gumi-runtime
ENV PYTHONPATH=/opt/gumi GUMI_AGENT_BUNDLE=/agent GUMI_HOST=0.0.0.0 GUMI_PORT=8100
EXPOSE 8100
ENTRYPOINT ["gumi-runtime"]
CMD ["serve", "/agent"]
