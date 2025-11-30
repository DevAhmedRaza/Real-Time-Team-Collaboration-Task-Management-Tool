# TeamCollab — Real-Time Team Collaboration & Task Management Tool

This project is a full-stack MERN app (MongoDB, Express, React, Node.js) that demonstrates real-time collaboration features for task management and chat using Socket.IO.

Quick start:

1. Install Node.js (v16+) and MongoDB
2. From the project root, run the following commands in PowerShell (or equivalent):

```powershell
cd "e:\VS CODES\mern\teamcollab"
# Install root dependencies (concurrently)
npm install

# Install server dependencies & seed demo data
cd server
npm install
copy .env.example .env # Windows (adjust MONGO_URI and JWT_SECRET if needed)
npm run seed

# Install client dependencies
cd ..\client
npm install

# From the project root, start both processes concurrently:
cd ..
npm run dev

```

Endpoints:
- API: http://localhost:5000
- Client: http://localhost:3000

If you open the client in the browser, you can log in using seeded demo users:
- alice@example.com / password
- bob@example.com / password
- charlie@example.com / password

Troubleshooting:
- Ensure MongoDB is running locally or change `MONGO_URI` in `server/.env` to a valid connection string.
- If ports are used, change PORT in `server/.env` and the `CLIENT_URL` accordingly.

Notes:
- This project is scaffolded for demonstration purposes. The frontend uses React via CDN and a lightweight static server; you can replace it with a modern build chain (Vite / CRA) for production-grade apps.
- Socket.IO manages real-time updates and chat; messages are transient (not persisted) unless you add storage support via a `Message` model.

Features:
- JWT authentication
- Projects/Teams
- Tasks Kanban board (To Do / In Progress / Done)
- Real-time updates via Socket.IO
- Chat per team
- Basic ownership and assignee support

This repo is a scaffold designed for local testing and demonstration; don't use the default JWT secret or seed data in production.
