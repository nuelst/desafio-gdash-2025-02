FROM python:3.11-slim

WORKDIR /app

# Copiar requirements - funciona com ou sem root directory
COPY collector/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar código fonte
COPY collector/ .

CMD ["python", "main.py"]

