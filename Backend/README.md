# PrepAce Backend

Express + MongoDB API for the PrepAce MERN app.

## Setup

```powershell
cd Backend
npm install
Copy-Item .env.example .env
```

Update `.env` if your MongoDB URL is different:

```env
MONGO_URI=mongodb://127.0.0.1:27017/prepace
JWT_SECRET=change_this_to_a_long_random_secret
CLIENT_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

## Run

```powershell
npm run dev
```

The API runs at:

```text
http://localhost:5000/api
```

Health check:

```text
GET http://localhost:5000/api/health
```

## Create First Admin

After MongoDB is running and `.env` exists:

```powershell
npm run seed:admin
```

Default admin from `.env.example`:

```text
admin@prepace.com / password123
```

## Main Routes

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/users`
- `PATCH /api/users/:id/status`
- `GET /api/company-visits`
- `POST /api/company-visits/:id/respond`
- `GET /api/dsa-problems`
- `GET /api/aptitude-questions`
- `GET /api/mock-tests`
- `GET /api/mock-attempts/mine`
- `POST /api/mock-attempts`
- `GET /api/resources`
- `POST /api/resources/upload`
- `GET /api/roadmaps`
- `GET /api/progress/roadmaps`
- `POST /api/progress/roadmaps/:roadmapId/start`
- `PATCH /api/progress/roadmaps/:roadmapId/tasks`
- `GET /api/badges`
- `GET /api/submissions`
- `POST /api/submissions`
- `POST /api/code/run`
- `POST /api/code/judge`

Create, update, and delete routes for content modules require an admin JWT.

## Code Execution

The main backend now includes the demo Docker code execution API under `/api/code`.

Supported languages:

- `c`
- `cpp` / `c++`
- `java`
- `javascript`
- `python`

Run code without login:

```http
POST /api/code/run
Content-Type: application/json

{
  "language": "python",
  "code": "print(input())",
  "input": "hello"
}
```

Judge code against test cases. This requires a student/admin JWT:

```http
POST /api/code/judge
Authorization: Bearer <token>
Content-Type: application/json

{
  "language": "python",
  "code": "print(input())",
  "testCases": [
    { "input": "hello", "expected": "hello" }
  ]
}
```

Docker Desktop must be running for `/api/code/run` and `/api/code/judge`.

## Resource Uploads

Resource uploads use Cloudinary through:

```http
POST /api/resources/upload
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "file": "data:application/pdf;base64,...",
  "folder": "prepace/resources/dsa",
  "resourceType": "raw"
}
```

Set these variables in `.env`:

```env
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
MAX_FILE_UPLOAD_MB=20
```
