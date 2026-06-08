FROM python:3.14-slim
RUN apt-get update && apt-get install -y --no-install-recommends poppler-utils && rm -rf /var/lib/apt/lists/*
WORKDIR /opt/gumi
COPY gumi ./gumi
COPY entrypoint.py ./entrypoint.py
RUN pip install --no-cache-dir fastapi uvicorn pydantic asyncpg neo4j httpx python-docx pyyaml
COPY agent /agent
RUN printf '#!/bin/sh\nexec python /opt/gumi/entrypoint.py "$@"\n' > /usr/local/bin/gumi-runtime && chmod +x /usr/local/bin/gumi-runtime
ENV PYTHONPATH=/opt/gumi GUMI_AGENT_BUNDLE=/agent GUMI_HOST=0.0.0.0 GUMI_PORT=8100
EXPOSE 8100
ENTRYPOINT ["gumi-runtime"]
CMD ["serve", "/agent"]
