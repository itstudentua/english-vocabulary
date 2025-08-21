package main

import (
	"regexp"
	"strings"
	"unicode"	
	"fmt"
)

// исключения (map для быстрого поиска)
var exclusionList = map[string]bool{
	"us": true, "as": true, "thus": true, "yes": true,
	"is": true, "was": true, "does": true, "has": true,
	"his": true, "this": true, "news": true, "means": true,
	"series": true, "analysis": true, "lens": true, "famous": true,
	"serious": true, "focus": true, "james": true, "charles": true,
	"wales": true, "thesis": true, "crisis": true, "achilles": true,
	"venus": true, "sirius": true, "moses": true, "jesus": true,
	"thomas": true, "lewis": true, "harris": true, "curious": true,
	"obvious": true, "photosynthesis": true, "bus": true, "goes": true,
}

var vowels = "aeiou"

// очистка слова от лишних символов
func cleanWord(word string) string {
	var cleaned []rune
	runes := []rune(word)
	for i, r := range runes {
		if unicode.IsLetter(r) {
			cleaned = append(cleaned, r)
		} else if (r == '\'' || r == '’' || r == '-') && i > 0 && i < len(runes)-1 {
			cleaned = append(cleaned, r)
		}
	}
	return string(cleaned)
}

// морфология
func morphWord(word string) string {
	orig := word
	lower := strings.ToLower(word)
	runes := []rune(word)

	ap := "'"
	if strings.Contains(word, "’") {
		ap = "’"
	}

	// апострофные сокращения
	switch {
	case strings.HasSuffix(word, ap+"s"),
		strings.HasSuffix(word, ap+"m"),
		strings.HasSuffix(word, ap+"d"):
		return string(runes[:len(runes)-2])

	case strings.HasSuffix(word, "s"+ap):
		return string(runes[:len(runes)-1])

	case strings.HasSuffix(word, ap+"ve"),
		strings.HasSuffix(word, ap+"re"),
		strings.HasSuffix(word, ap+"ll"):
		return string(runes[:len(runes)-3])

	case strings.HasSuffix(word, ap+"t") &&
		(lower == "can"+ap+"t" || lower == "won"+ap+"t"):
		return strings.ReplaceAll(word, ap+"t", "")

	case strings.HasSuffix(word, "n"+ap+"t"):
		return strings.ReplaceAll(word, "n"+ap+"t", "")
	}

	l := len(runes)
	base := orig

	// проверка на исключения
	if exclusionList[strings.ToLower(base)] {
		return orig
	}

	// ies → y
	if strings.HasSuffix(word, "ies") && l > 3 {
		base = string(runes[:l-3]) + "y"
		return base
	}

	// ves → f/fe
	if strings.HasSuffix(word, "ves") && l > 3 {
		if l >= 4 && !strings.ContainsRune(vowels, runes[l-4]) {
			base = string(runes[:l-3]) + "f"
		} else {
			base = string(runes[:l-3]) + "fe"
		}
		return base
	}

	if strings.HasSuffix(word, "ses") || strings.HasSuffix(word, "hes") {
		base = string(runes[:l-2])
		return base
	}
	

	// s → (только если длина > 2 и не исключение)
	if strings.HasSuffix(word, "s") && l > 2 {
		base = string(runes[:l-1])
		return base
	}
	return base
}


// извлечение слов
func extractNewWords(text string) ([]string, []string, []string) {
	newWordsFinal = []string{} // сбрасываем перед обработкой
	
	re := regexp.MustCompile(`[a-zA-Z'’-]+`)
	allWords := re.FindAllString(text, -1)

	uniqSet := make(map[string]struct{})
	newSet := make(map[string]struct{})

	for _, w := range allWords {
		cleaned := cleanWord(w)
		if cleaned == "" {
			continue
		}
		morphed := morphWord(cleaned)
		lower := strings.ToLower(morphed)

		uniqSet[lower] = struct{}{}
		if !knownWords[lower] {
			newSet[lower] = struct{}{}
		}
	}

	uniqWords := make([]string, 0, len(uniqSet))
	for w := range uniqSet {
		uniqWords = append(uniqWords, w)
	}

	newWords := make([]string, 0, len(newSet))
	for w := range newSet {
		newWords = append(newWords, w)
		newWordsFinal = append(newWordsFinal, w)
	}

	fmt.Println("All words: ", len(allWords))
	fmt.Println("Unique words: ", len(uniqWords))
	fmt.Println("New words: ", len(newWords))

	return allWords, uniqWords, newWords
}
