FROM denoland/deno:latest

WORKDIR /app

# Cache dependencies
COPY deno.json .
RUN deno cache --reload --lock=deno.lock mod.ts

# Copy source code
COPY . .

# Compile the app
RUN deno cache mod.ts

# Port for Gun server
EXPOSE 8765

# Set environment variables
ENV PORT=8765
ENV GUN_DB_FILE=data/gundb

# Create data directory
RUN mkdir -p data

# Run with appropriate permissions
CMD ["run", "--allow-net", "--allow-read", "--allow-write", "--allow-env", "mod.ts"]
