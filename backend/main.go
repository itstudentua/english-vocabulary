package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"github.com/joho/godotenv" // for local use .env (without docker)
)

//for local use .env (without docker)
func init() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file:", err)
	}
}

func main() {
	initDB()
	defer dbPool.Close()
	addr := os.Getenv("PORT")
	if addr == "" {
		addr = "8080"
	}

	fmt.Printf("✅ Server started on http://localhost:%v\n", addr)

	loadKnownWords()
	// Регистрируем обработчики из database.go
	http.HandleFunc("/process", ProcessTextHandler)
	http.HandleFunc("/download-csv", DownloadVocabularyHandler)

	if err := http.ListenAndServe(":"+addr, nil); err != nil {
		log.Fatal("Server failed:", err)
	}
}


