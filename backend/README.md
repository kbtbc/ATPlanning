# AT Thru-Hike Planner - Backend

Backend API server for the AT Thru-Hike Planner application.

## Tech Stack

- **Runtime**: Bun
- **Framework**: Hono (lightweight web framework)
- **Validation**: Zod schemas
- **Deployment**: Vibecode platform

## Project Structure

```
backend/
├── src/
│   ├── index.ts          # App entry, middleware, route mounting
│   ├── routes/           # Route modules (create as needed)
│   └── types.ts          # Shared API contracts (Zod schemas)
├── data/
│   └── extracted/        # Extracted data files (archived)
├── scripts/
│   ├── start             # Vibecode-compatible startup script
│   └── env.sh            # Environment configuration
├── .env                  # Environment variables (not committed)
├── package.json          # Dependencies
└── tsconfig.json         # TypeScript configuration
```

## Development

### Prerequisites

- Bun runtime
- Node.js 22.12+ (or 20.19+)

### Running Locally

```bash
cd backend
bun install
bun run src/index.ts
```

The backend runs on port 3000 by default (configurable via `PORT` environment variable).

### Environment Variables

Create a `.env` file in the `backend/` directory:

```env
PORT=3000
OPENAI_API_KEY=your-key-here-if-needed
```

> **Note:** The `.env` file is gitignored. Never commit API keys or secrets.

## API Development

### Creating Routes

1. Create a route file in `src/routes/` (e.g., `todos.ts`)
2. Define routes using Hono router
3. Use Zod validators for request validation
4. Mount the route in `src/index.ts`

Example route (`src/routes/todos.ts`):

```typescript
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

const todosRouter = new Hono();

todosRouter.get("/", (c) => {
  return c.json({ todos: [] });
});

todosRouter.post(
  "/",
  zValidator("json", z.object({ title: z.string() })),
  (c) => {
    const { title } = c.req.valid("json");
    return c.json({ todo: { id: "1", title } });
  }
);

export { todosRouter };
```

Mount in `src/index.ts`:

```typescript
import { todosRouter } from "./routes/todos";
app.route("/api/todos", todosRouter);
```

**Important:** All endpoints must be prefixed with `/api/`

### Shared Types

API contracts are defined in `src/types.ts` as Zod schemas. This file is the single source of truth—both backend and frontend import from here.

### Testing APIs

Always test APIs with cURL after implementing:

```bash
curl $BACKEND_URL/api/your-endpoint
```

Use `$BACKEND_URL` environment variable, never hardcode localhost.

## Database

No database is configured by default. The current application uses static data files in the frontend.

If you need to persist data or add user accounts, configure a database using the database-auth skill and update this README accordingly.

## Deployment

This backend is configured for the Vibecode platform. The platform handles:

- Building and starting the backend
- Environment variable management
- CORS configuration (allows Vibecode domains and localhost)
- SSL certificates

### Vibecode-Specific Files

**Do not remove these files:**

- `backend/src/index.ts` line 1: `import "@vibecodeapp/proxy"` (required for Vibecode)
- `backend/scripts/start` - Vibecode-compatible startup script
- `backend/scripts/env.sh` - Environment configuration

### CORS Configuration

The backend CORS is configured to allow:
- `http://localhost:*` and `http://127.0.0.1:*` (local development)
- `https://*.dev.vibecode.run` (Vibecode preview)
- `https://*.vibecode.run` (Vibecode production)

## Current Status

The backend is set up but currently not used by the frontend application. All trail data (shelters, resupply points, contacts) is served as static data from the frontend.

Future enhancements could include:
- User accounts and authentication
- Saved hike plans
- Personal notes on locations
- Community contributions
- Real-time data updates

## Additional Documentation

- See `CLAUDE.md` for AI-specific development guidelines
- See main `README.md` in project root for overall project information
