# Bun Storage Server ⚡️

An ultrafast, secure, and production-ready file storage API built with the modern JavaScript toolkit: **Bun**, **TypeScript**, and **Prisma** with a PostgreSQL backend.

This project is designed from the ground up for performance, leveraging Bun's native APIs for file I/O, streaming, and serving HTTP requests. It's structured with a clean, scalable architecture and comes with a complete testing and benchmarking suite.

![Demo](https://github.com/kmoshax/storage-server/raw/refs/heads/main/.assets/benchmark.mp4) 
---

## Core Features

-   🚀 **Ultrafast Performance**: Utilizes `Bun.file()` for zero-copy file streaming and Bun's native HTTP server for minimal overhead.
-   🔒 **Secure by Default**: Endpoints for uploading and deleting are protected by API key authentication.
-   📦 **Robust Validation**: Enforces server-side validation for maximum file size and allowed MIME types.
-   ⚙️ **Production-Ready**: Features a detailed `/health` endpoint, structured JSON logging with emojis, graceful error handling, and a scalable MVC-like architecture.
-   💾 **Persistent Metadata**: Uses Prisma and PostgreSQL to reliably store file metadata.
-   🧪 **Fully Tested**: Includes a comprehensive test suite with unit/integration tests and performance benchmarks using `bun:test`.
-   🧠 **Efficient Caching**: Implements an in-memory LRU cache for frequently accessed file metadata to reduce database lookups.

## Tech Stack

-   **Runtime**: [Bun](https://bun.sh/)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **ORM**: [Prisma](https://www.prisma.io/)
-   **Database**: [PostgreSQL](https://www.postgresql.org/)
-   **Testing**: `bun:test`

---

## Getting Started

Follow these instructions to get a local copy up and running.

### Prerequisites

-   [Bun](https://bun.sh/docs/installation) (v1.0 or later)
-   A running [PostgreSQL](https://www.postgresql.org/download/) instance. (You can also run one easily with Docker).

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/bun-storage-server.git
    cd bun-storage-server
    ```

2.  **Install dependencies:**
    ```bash
    bun install
    ```

3.  **Configure environment variables:**
    Copy the example `.env` file and update it with your own settings.
    ```bash
    cp .env.example .env
    ```
    -   Update `DATABASE_URL` with your PostgreSQL connection string.
    -   Generate a secure `API_KEY` using: `bun -e "console.log(crypto.randomUUID())"`

4.  **Run the database migration:**
    This will set up the `File` table in your PostgreSQL database.
    ```bash
    bunx prisma migrate dev
    ```

5.  **Run the server:**
    ```bash
    # For development with hot-reloading
    bun dev
    
    # For production
    bun start
    ```
    The server will be running at `http://localhost:3000` (or your configured port).

---

## API Usage

All requests requiring authentication must include the `x-api-key` header.

### 1. Upload a File

-   **Endpoint**: `POST /upload`
-   **Auth**: Required
-   **Body**: `multipart/form-data` with a field named `file`.

**Example `curl` request:**
```bash
curl -X POST http://localhost:3000/upload \
  -H "x-api-key: YOUR_API_KEY" \
  -F "file=@/path/to/your/image.png"
```

**Success Response (201 Created):**
```json
{
  "message": "File uploaded successfully",
  "filename": "a1b2c3d4-e5f6-....-g7h8i9j0.png",
  "url": "http://localhost:3000/files/a1b2c3d4-e5f6-....-g7h8i9j0.png",
  "size": 123456
}
```

### 2. Retrieve a File

-   **Endpoint**: `GET /files/:filename`
-   **Auth**: Not Required

**Example `curl` request:**
```bash
curl http://localhost:3000/files/a1b2c3d4-e5f6-....-g7h8i9j0.png -o downloaded_image.png
```

### 3. Delete a File

-   **Endpoint**: `DELETE /files/:filename`
-   **Auth**: Required

**Example `curl` request:**
```bash
curl -X DELETE http://localhost:3000/files/a1b2c3d4-e5f6-....-g7h8i9j0.png \
  -H "x-api-key: YOUR_API_KEY"
```

**Success Response (200 OK):**
```json
{
  "message": "File deleted successfully"
}
```

### 4. Health Check

-   **Endpoint**: `GET /health`
-   **Auth**: Not Required

Provides server status, database connectivity, uptime, and memory usage.

---

## Running Tests and Benchmarks

We use Bun's built-in, high-performance test runner. Tests run against a separate `test.db` SQLite database for isolation.

-   **Run unit/integration tests:**
    ```bash
    bun test
    ```

-   **Run performance benchmarks:**
    ```bash
    bun bench
    ```

## Project Structure

```
bun-storage-server/
├── prisma/               # Prisma schema and migrations
├── src/                  # Source code
│   ├── controllers/      # Request/response logic
│   ├── middlewares/      # Authentication middleware
│   ├── services/         # Business logic & DB interaction
│   ├── utils/            # Helpers (logger, errors, cache)
│   ├── config.ts         # Environment variable handling
│   └── index.ts          # Server entry point
├── tests/                # Unit tests and benchmarks
├── .env.example          # Environment variable template
├── package.json
└── tsconfig.json
```

## License

Distributed under the MIT License. See `LICENSE` for more information.
