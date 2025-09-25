package main

import (
	"context"
	"encoding/csv"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

var dbPool *pgxpool.Pool
var knownWords map[string]bool
var newWordsFinal []string
var mu sync.Mutex
var lastLoaded time.Time
const cacheDuration = 30 * time.Second

// Инициализация пула соединений
func initDB() {
	dbHost := os.Getenv("DB_HOST")
    dbPort := os.Getenv("DB_PORT")
    dbUser := os.Getenv("DB_USER")
    dbPassword := os.Getenv("DB_PASSWORD")
    dbName := os.Getenv("DB_NAME")
    dbSSLMode := os.Getenv("DB_SSLMODE")

    dbURL := fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=%s",
        dbUser, dbPassword, dbHost, dbPort, dbName, dbSSLMode)
    if dbURL == "" {
        log.Fatal("❌ DATABASE_URL is not set")
    }

    dbPool = waitForDB(dbURL, 10, 2)
    fmt.Println("✅ Connected to DB")
}

// Ожидание запуска БД
func waitForDB(dbURL string, retries int, delaySeconds int) *pgxpool.Pool {
	var pool *pgxpool.Pool
	var err error
	for i := 0; i < retries; i++ {
		pool, err = pgxpool.New(context.Background(), dbURL)
		if err == nil {
			err = pool.Ping(context.Background())
			if err == nil {
				return pool
			}
		}
		fmt.Printf("Waiting for DB... (%d/%d)\n", i+1, retries)
		time.Sleep(time.Duration(delaySeconds) * time.Second)
	}
	log.Fatal("❌ Cannot connect to DB:", err)
	return nil
}

func refreshKnownWordsIfNeeded() {
    mu.Lock()
    defer mu.Unlock()
    if time.Since(lastLoaded) > cacheDuration {
        loadKnownWords()
    }
}

// Загружаем уже известные слова из базы
func loadKnownWords() {
	knownWords = make(map[string]bool)

	createTableQuery := `CREATE TABLE IF NOT EXISTS english_vocabulary (
		word TEXT PRIMARY KEY
	);`
	_, err := dbPool.Exec(context.Background(), createTableQuery)
	if err != nil {
		log.Fatal("❌ Failed to create table:", err)
	}

	rows, err := dbPool.Query(context.Background(), "SELECT word FROM english_vocabulary")
	if err != nil {
		log.Fatal("❌ Failed to query words:", err)
	}
	defer rows.Close()

	for rows.Next() {
		var word string
		if err := rows.Scan(&word); err != nil {
			log.Fatal(err)
		}
		knownWords[strings.ToLower(word)] = true
	}
	log.Printf("✅ Loaded %d known words\n", len(knownWords))
}

// ==================== HTTP handlers ====================

// Обработчик /process
func ProcessTextHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	var req struct {
		Text string `json:"text"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	// loadKnownWords()
	refreshKnownWordsIfNeeded() // Проверяем и обновляем кэш, если нужно
	allWords, uniqWords, newWords := extractNewWords(req.Text)
	
	mu.Lock()
    newWordsFinal = newWords
    mu.Unlock()

	json.NewEncoder(w).Encode(map[string][]string{
		"new_words":  newWords,
		"uniq_words": uniqWords,
		"all_words":  allWords,
	})
}

// Обработчик /download-csv
func DownloadVocabularyHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/csv")
	w.Header().Set("Content-Disposition", `attachment; filename="new_vocabulary.csv"`)

	writer := csv.NewWriter(w)
	defer writer.Flush()

	for _, word := range newWordsFinal {
		_ = writer.Write([]string{word})
	}
}

// Insert words from google sheet to DB
func insertWordsHandler(w http.ResponseWriter, r *http.Request) {

	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method != http.MethodPost {
		http.Error(w, "Only POST", http.StatusMethodNotAllowed)
		return
	}



	var words []string
	if err := json.NewDecoder(r.Body).Decode(&words); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	_, err := dbPool.Exec(context.Background(), "TRUNCATE english_vocabulary RESTART IDENTITY")
	if err != nil {
		return
	}


	values := make([]interface{}, 0, len(words))
	placeholders := make([]string, 0, len(words))

	for i, word := range words {
		placeholders = append(placeholders, fmt.Sprintf("($%d)", i+1))
		values = append(values, word)
	}

	query := fmt.Sprintf("INSERT INTO english_vocabulary (word) VALUES %s", strings.Join(placeholders, ","))
	_, err = dbPool.Exec(context.Background(), query, values...)
	if err != nil {
		http.Error(w, "Error writing to DB", http.StatusInternalServerError)
		return
	}

	log.Printf("✅ Successfully inserted %d words", len(words))

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("✅ Words added"))
}