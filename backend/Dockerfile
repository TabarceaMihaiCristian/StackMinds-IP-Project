# Backend Dockerfile
FROM python:3.11-slim

WORKDIR /app

# system deps for psycopg/pg8000 if needed
RUN apt-get update && apt-get install -y build-essential libpq-dev gcc postgresql-client && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .

ENV PYTHONPATH=/app

# copy wait script and make executable
COPY backend/wait-for-postgres.sh /wait-for-postgres.sh
RUN chmod +x /wait-for-postgres.sh

# Run with uvicorn
ENTRYPOINT ["/wait-for-postgres.sh", "db"]
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
