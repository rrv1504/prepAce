# PrepAce

PrepAce is a MERN placement preparation platform with student and admin modules for DSA practice, aptitude, mock tests, AI quizzes, AI roadmaps, company visits, resources, badges, notifications, progress tracking, and code execution.

## Project Structure

```text
PrepAce Final/
  Backend/    Express, MongoDB, JWT auth, AI, Cloudinary, code execution APIs
  Frontend/   React, Vite, student app, admin app
```

## Requirements

- Node.js `20.19+` or `22.12+`
- npm
- MongoDB Atlas or local MongoDB
- Docker Desktop for code execution APIs
- Cloudinary account for resource uploads
- OpenAI API key for AI roadmap/quiz generation

## Backend Setup

```powershell
cd Backend
npm install
Copy-Item .env.example .env
```

Update `Backend/.env`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=use_a_long_random_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:8443
OPENAI_API_KEY=your_openai_key
OPENAI_MODEL=gpt-4o-mini
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
MAX_FILE_UPLOAD_MB=20
```

Seed data:

```powershell
npm run seed:all
```

Run backend:

```powershell
npm run dev
```

API health check:

```text
GET http://localhost:5000/api/health
```

## Frontend Setup

```powershell
cd Frontend
npm install
```

Create or update `Frontend/.env.local`:

```env
VITE_API_URL=http://localhost:5000/api
```

Run frontend:

```powershell
npm run dev
```

Open the shown Vite URL. If your app is running on port `8443`, use:

```text
http://localhost:8443
```

## Cloudinary Resource Uploads

Admin resource upload uses:

```text
POST /api/resources/upload
```

Required:

- Admin JWT token
- `file` as a base64 data URL
- Cloudinary env variables in `Backend/.env`

The frontend admin resources page uploads the file to Cloudinary, stores the secure URL, and saves the resource document in MongoDB with:

- `url`
- `cloudinaryPublicId`
- `cloudinaryResourceType`
- `uploadedAt`

## Common Commands

Backend:

```powershell
cd Backend
npm run dev
npm run seed:all
npm run seed:admin
```

Frontend:

```powershell
cd Frontend
npm run dev
npm run build
```

## Upload To GitHub

From the project root:

```powershell
git init
git add .
git commit -m "Initial PrepAce MERN project"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

Before pushing:

- Do not commit `Backend/.env`
- Do not commit `Frontend/.env.local` if it contains production secrets or private URLs
- Keep `.env.example` files committed
- Rotate any secrets that were ever pasted into chat, logs, or Git history

## Deploy On DigitalOcean App Platform

1. Push the project to GitHub.
2. Create a MongoDB Atlas cluster and allow DigitalOcean outbound access, or temporarily allow `0.0.0.0/0` for testing.
3. In DigitalOcean, create a new App from your GitHub repo.
4. Add the backend as a Web Service:
   - Source directory: `Backend`
   - Build command: `npm install`
   - Run command: `npm start`
   - HTTP port: `5000`
5. Add backend environment variables:
   - `NODE_ENV=production`
   - `PORT=5000`
   - `MONGO_URI`
   - `JWT_SECRET`
   - `JWT_EXPIRES_IN`
   - `CLIENT_URL`
   - `OPENAI_API_KEY`
   - `OPENAI_MODEL`
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
   - `MAX_FILE_UPLOAD_MB`
6. Add the frontend as a Static Site:
   - Source directory: `Frontend`
   - Build command: `npm install && npm run build`
   - Output directory: `dist`
7. Add frontend environment variable:
   - `VITE_API_URL=https://YOUR_BACKEND_APP_URL/api`
8. Update backend `CLIENT_URL` to the deployed frontend URL.
9. Redeploy both services.

## Deploy On A DigitalOcean Droplet

1. Create an Ubuntu Droplet.
2. Install Node.js, npm, Nginx, Git, Docker, and PM2.
3. Clone the repo:

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO
```

4. Install and run backend:

```bash
cd Backend
npm install
npm run seed:all
pm2 start src/server.js --name prepace-api
```

5. Build frontend:

```bash
cd ../Frontend
npm install
npm run build
```

6. Serve `Frontend/dist` with Nginx and reverse proxy `/api` to `http://localhost:5000`.
7. Enable HTTPS with Certbot.

## Notes

- Code execution requires Docker. On App Platform, Docker-in-Docker may not be available; use a Droplet or external judge service for production code execution.
- Keep OpenAI and Cloudinary secrets only in deployment environment variables.
- Use MongoDB Atlas backups before running destructive seed scripts in production.
