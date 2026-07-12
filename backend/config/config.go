package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	DatabaseURL string
	JWTSecret   string
	Port        string
}

func LoadConfig() Config {
	err := godotenv.Load()
	if err != nil {
		log.Println("No .env file found, relying on environment variables")
	}

	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		// Use the provided Supabase URI as fallback
		dbURL = "postgresql://postgres:,bZ!.K.HP2CkR%Y@db.zmnuvzmexbnmbyxvvheq.supabase.co:5432/postgres"
	}

	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		jwtSecret = "kosthub-secret-key-2025-very-secure"
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "7860" // Default for HF Spaces
	}

	return Config{
		DatabaseURL: dbURL,
		JWTSecret:   jwtSecret,
		Port:        port,
	}
}
