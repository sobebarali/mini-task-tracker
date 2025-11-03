# 📝 Mini Task Tracker

A simple to-do list app where you can create tasks, mark them as done, and keep track of everything you need to do!

## 🎯 What Does This App Do?

Think of this like a digital notebook where you can:
- ✍️ Write down tasks (like "Buy milk" or "Finish homework")
- ✅ Mark tasks as completed when you're done
- 📅 Set due dates so you don't forget
- 🗑️ Delete tasks you don't need anymore
- 🔐 Keep your tasks private (only you can see your tasks)

## 🛠️ What's Inside?

This app is built with:
- **Node.js** - Like the brain that runs everything
- **MongoDB** - Like a filing cabinet that stores all your tasks
- **Redis** - Like a notepad that remembers things quickly
- **Docker** - Like a magic box that contains everything you need

## 🚀 How to Run This App

### Option 1: Super Easy Way (Using Docker) ⭐ Recommended

Think of Docker like a lunch box - everything you need is already packed inside!

**Step 1: Get Docker**
- Download Docker Desktop from [docker.com](https://www.docker.com/products/docker-desktop/)
- Install it and make sure it's running (you'll see a little whale icon)

**Step 2: Download This Project**
```bash
# Copy this project to your computer
git clone git@github.com:sobebarali/mini-task-tracker.git
cd mini-task-tracker
```

**Step 3: Set Up Your Secret Password**
```bash
# Copy the example file
cp .env.example .env

# Open .env file and change JWT_SECRET to any random text (at least 32 characters)
# Example: JWT_SECRET=my-super-secret-password-12345678
```

**Step 4: Start Everything!**
```bash
docker-compose up -d
```

That's it! Your app is now running! 🎉

Visit http://localhost:3000 in your web browser

**Step 5: When You're Done**
```bash
# Stop the app
docker-compose down

# Stop and delete all data (clean start next time)
docker-compose down -v
```

### Option 2: The Developer Way (Without Docker)

If you want to run things on your own computer:

**Step 1: Install Node.js**
- Download from [nodejs.org](https://nodejs.org/) (get version 18 or newer)

**Step 2: Start the Database**
```bash
# This starts MongoDB and Redis
npm run db:start
```

**Step 3: Install Everything**
```bash
npm install
```

**Step 4: Set Up Environment**
Create a file `apps/server/.env` with:
```
NODE_ENV=development
PORT=3000
DATABASE_URL=mongodb://root:password@localhost:27017/mini-task-tracker?authSource=admin
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your-super-secret-password-min-32-chars
```

**Step 5: Start the App**
```bash
npm run dev
```

Visit http://localhost:3000 in your web browser

## 🎮 How to Use the App

### 1. Create an Account
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Your Name",
    "email": "you@example.com",
    "password": "password123"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "you@example.com",
    "password": "password123"
  }'
```

You'll get back a **token** - this is like your key to access your tasks. Copy it!

### 3. Create a Task
```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "Buy groceries",
    "description": "Milk, eggs, bread",
    "dueDate": "2025-12-31"
  }'
```

### 4. See All Your Tasks
```bash
curl -X GET http://localhost:3000/api/tasks \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 5. Mark a Task as Done
```bash
curl -X PUT http://localhost:3000/api/tasks/TASK_ID_HERE \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "status": "completed"
  }'
```

### 6. Delete a Task
```bash
curl -X DELETE http://localhost:3000/api/tasks/TASK_ID_HERE \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 📚 Useful Commands

### Docker Commands (if you used Docker)
```bash
# See what's running
docker-compose ps

# See logs (what's happening)
docker-compose logs -f

# Stop everything
docker-compose down

# Start fresh (delete all data)
docker-compose down -v
docker-compose up -d
```

### Development Commands
```bash
# Run the app
npm run dev

# Check if code is good
npm run check-types
npm run check

# Run tests (uses mongodb-memory-server, super fast!)
npm test

# Run tests with coverage
npm run test:coverage

# Start database (MongoDB + Redis)
npm run db:start

# Stop database
npm run db:stop
```

## 🔧 Troubleshooting

### "Port 3000 is already in use"
Something else is using port 3000. Either stop that program or change the port in `.env` file:
```
PORT=4000
```

### "Cannot connect to MongoDB"
Make sure Docker is running and MongoDB is started:
```bash
docker-compose ps
```

### "Invalid or expired token"
Your login key expired. Login again to get a new token.

### Need to Start Fresh?
Delete everything and start over:
```bash
docker-compose down -v
docker-compose up -d
```

## 📁 Project Structure (Where Everything Lives)

```
mini-task-tracker/
├── apps/server/           # The main app code
│   ├── src/              # Where all the code lives
│   │   ├── apis/         # Different features
│   │   │   ├── auth/     # Login and signup
│   │   │   └── tasks/    # Task management
│   │   └── middleware/   # Security guards
│   └── tests/            # Tests to make sure it works
└── packages/db/          # Database stuff
    └── src/models/       # How we store data
```

## 🎓 For Developers

### Tech Stack
- **Node.js** + **Express** - Web server
- **TypeScript** - JavaScript with types
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB helper
- **Redis** - Fast cache
- **JWT** - Secure tokens
- **Jest** - Testing (78 tests, 92% coverage)
- **Zod** - Data validation
- **Docker** - Containerization

### Architecture
The app follows a clean layered pattern:
```
Request → Controller → Service → Repository → Database
                ↓
           Validators (Zod)
```

Each layer has a job:
- **Controller**: Handles web requests
- **Service**: Business logic
- **Repository**: Talks to database and cache
- **Validators**: Makes sure data is correct

### Running Tests
```bash
# Run all tests
npm test

# See coverage report
npm run test:coverage

# Watch mode (tests run automatically when you change code)
npm run test:watch
```

### Code Quality
```bash
# Check types
npm run check-types

# Lint and format
npm run check
```

### Environment Variables
| Variable | What It Does | Required? |
|----------|--------------|-----------|
| `JWT_SECRET` | Password for tokens (min 32 characters) | ✅ Yes |
| `PORT` | Which port to run on | No (default: 3000) |
| `DATABASE_URL` | Where MongoDB lives | No (auto-set in Docker) |
| `REDIS_HOST` | Where Redis lives | No (auto-set in Docker) |
| `REDIS_PORT` | Redis port | No (default: 6379) |

## 🔒 Security Features

- ✅ Passwords are encrypted (bcrypt)
- ✅ JWT tokens expire after 7 days
- ✅ Users can only see their own tasks
- ✅ All inputs are validated
- ✅ No sensitive data in responses

## 📝 License

MIT - Feel free to use this however you want!

## 🆘 Need Help?

1. Make sure Docker is running
2. Make sure you set `JWT_SECRET` in `.env` file
3. Try starting fresh: `docker-compose down -v && docker-compose up -d`
4. Check logs: `docker-compose logs -f`

Still stuck? Check the error messages - they usually tell you what's wrong!
