EnglishVocabulary
EnglishVocabulary is a web application for processing text and extracting new English words, storing them in a PostgreSQL database, and allowing users to download them as a CSV file. The backend is built with Go, and the frontend can be implemented using modern JavaScript frameworks like React or Vue. The application uses Neon (cloud PostgreSQL) for data storage.
Project Structure
EnglishVocabulary/
├── backend/
│   ├── main.go
│   ├── go.mod
│   ├── go.sum
│   └── .env
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── .env
│   └── build/ (or dist/)
├── docker-compose.yml
├── Dockerfile
├── .gitignore
└── README.md


backend/: Contains the Go backend with HTTP endpoints /process (to extract new words from text) and /download-csv (to download new words as a CSV file).
frontend/: Contains the frontend (e.g., React or Vue) that interacts with the backend.
.env: Environment variables for local development.
docker-compose.yml: Configuration for running the backend with Docker.
Dockerfile: Instructions for building the backend Docker image.

Prerequisites

Go: Version 1.18 or higher for the backend.
Node.js: Version 16 or higher for the frontend (if using React, Vue, etc.).
Docker: For containerized deployment.
Neon Account: For the PostgreSQL database (already set up at ep-raspy-bar-a21gedasgfm-pooler.eu-central-1.aws.neon.tech).
Git: For version control.

Setup for Local Development
Backend

Clone the repository:
git clone https://github.com/your-username/EnglishVocabulary.git
cd EnglishVocabulary/backend


Install dependencies:
go mod tidy


Create a .env file in the backend/ directory:
DB_HOST=ep-raspy-bar-a21gedasgfm-pooler.eu-central-1.aws.neon.tech
DB_PORT=5432
DB_USER=neondb_owner
DB_PASSWORD=npg_1Lt7sKfdduHZCw
DB_NAME=neondb
DB_SSLMODE=require
PORT=8080


Ensure the init() function is called in main.go:The backend uses the init() function in main.go to load the .env file using godotenv. This is required for local development to read environment variables. Example:
func init() {
    err := godotenv.Load()
    if err != nil {
        log.Fatal("Error loading .env file:", err)
    }
    initDB()
    loadKnownWords()
}


Run the backend:
go run .

The server will start on http://localhost:8080.


Frontend

Navigate to the frontend directory:
cd frontend


Install dependencies:
npm install


Create a .env file in the frontend/ directory:
REACT_APP_API_URL=http://localhost:8080


Run the frontend:
npm start

The frontend will start on http://localhost:3000 (for React) or another port depending on your framework.

Test the application:

Open http://localhost:3000 in your browser.
Send a POST request to http://localhost:8080/process with text to extract new words.
Download the CSV file via http://localhost:8080/download-csv.



Setup for Docker
For Docker deployment, the .env file is not required, as environment variables are passed directly to the container.

Create a Dockerfile in the root directory:
FROM golang:1.21

WORKDIR /app
COPY backend/ .
RUN go mod download
RUN go build -o backend

EXPOSE 8080
CMD ["./backend"]


Create a docker-compose.yml in the root directory:
version: '3.8'
services:
  backend:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "8080:8080"
    environment:
      - DB_HOST=ep-raspy-bar-a21gedasgfm-pooler.eu-central-1.aws.neon.tech
      - DB_PORT=5432
      - DB_USER=neondb_owner
      - DB_PASSWORD=npg_1Lt7sKfdduHZCw
      - DB_NAME=neondb
      - DB_SSLMODE=require
    restart: unless-stopped


Run with Docker Compose:
docker-compose up -d


Note on init() for Docker:

For Docker, you do not need to call godotenv.Load() in the init() function in main.go, as environment variables are injected directly via docker-compose.yml. You can keep init() for compatibility with local development, as godotenv.Load() безопасно игнорирует отсутствие .env файла в Docker.


Test the backend:
curl -X POST -H "Content-Type: application/json" -d '{"text":"hello world"}' http://localhost:8080/process



Deployment
The project is designed to deploy the backend on Render, the frontend on Netlify or Vercel, and uses Neon for the database.
Backend (Render)

Push the repository to GitHub:
git push origin main


Create a Web Service on Render:

Go to render.com and select New > Web Service.
Connect your EnglishVocabulary repository.
Set:
Root Directory: backend/
Environment: Go
Build Command: go build -o backend
Start Command: ./backend
Instance Type: Free


Add environment variables:DB_HOST=ep-raspy-bar-a21gedasgfm-pooler.eu-central-1.aws.neon.tech
DB_PORT=5432
DB_USER=neondb_owner
DB_PASSWORD=npg_1Lt7sKfdduHZCw
DB_NAME=neondb
DB_SSLMODE=require




Deploy:

Deploy the service to get a URL like https://my-go-backend.onrender.com.



Frontend (Netlify or Vercel)
Netlify

Push the repository to GitHub (if not already done).

Create a site on Netlify:

Go to netlify.com and select New site from Git.
Connect the EnglishVocabulary repository.
Set:
Base Directory: frontend/
Build Command: npm run build
Publish Directory: frontend/build (React) or frontend/dist (Vue)
Environment Variables:REACT_APP_API_URL=https://my-go-backend.onrender.com






Deploy:

Deploy to get a URL like https://my-app.netlify.app.



Vercel

Create a project on Vercel:

Go to vercel.com and select New Project.
Connect the EnglishVocabulary repository.
Set:
Root Directory: frontend/
Build Command: npm run build
Output Directory: build (React) or dist (Vue)
Environment Variables:REACT_APP_API_URL=https://my-go-backend.onrender.com






Deploy:

Deploy to get a URL like https://my-app.vercel.app.



Database (Neon)
The database is hosted on Neon at:
postgresql://neondb_owner:npg_1Lt7sKfdduHZCw@ep-raspy-bar-a21gedasgfm-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require


Ensure Neon allows connections from Render (check IP allowlist in Neon Dashboard).
The backend connects to Neon using the environment variables set on Render.

CORS
Update the backend to allow requests from the frontend domain:
w.Header().Set("Access-Control-Allow-Origin", "https://my-app.netlify.app") // or https://my-app.vercel.app

Testing

Backend:
curl -X POST -H "Content-Type: application/json" -d '{"text":"hello world"}' https://my-go-backend.onrender.com/process


Frontend:

Open https://my-app.netlify.app or https://my-app.vercel.app.
Test text processing and CSV download.


Database:
psql "postgresql://neondb_owner:npg_1Lt7sKfdduHZCw@ep-raspy-bar-a21gedasgfm-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require"
SELECT * FROM english_vocabulary;



Troubleshooting

Backend fails on Render: Check logs in Render Dashboard and verify environment variables.
Frontend CORS issues: Ensure Access-Control-Allow-Origin matches the frontend URL.
Database connection: Test with psql and check Neon IP allowlist.
Data not updating: Verify that saveNewWords and refreshKnownWordsIfNeeded are called in the backend.

Contributing
Feel free to submit issues or pull requests to the repository.
License
MIT License