# 📘 EnglishVocabulary

[engvoc.netlify.app](https://engvoc.netlify.app)

**EnglishVocabulary** is a web application for processing text and extracting new English words.  
The app compares the text with your database or google sheet, and lets you download them as a CSV file.  

---

## ✨ Features
- Paste any text and get a list of new words  
- Export vocabulary as **CSV**  
- User-friendly React frontend  

---

## 🛠 Tech Stack
- **Frontend**: React + Vite  
- **Backend**: Golang + PostgreSQL  
- **DevOps**: Docker + Docker Compose  
- **Deployment**: Netlify · Neon.tech (Postgres) · Render  

---

## 📦 Installation & Setup

### 🔹 Clone the repository

```bash
git clone https://github.com/itstudentua/english-vocabulary.git
cd english-vocabulary
```

### 🔹 Configure `.env` files

- **Backend**: set up database connection  
- **Frontend**: set backend URL and Google macros  
- ⚠️ Make sure you have a database **and/or** a Google Sheet with words you already know, containing **just one column**.

### 🔹 Run locally

For local use, uncomment the following in `main.go` to allow Go to read `.env` files:
```go
func init() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file:", err)
	}
}
```

Then run: 
```bash
cd backend
go run .

cd frontend
npm install
npm run dev
```
### 🔹 Run with Docker

`docker-compose up --build`

---
## 🚀 Deployment

- 🌐 Frontend: Netlify
- ⚙️ Backend: Render
- 🗃 Database: Neon.tech