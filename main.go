package main

import (
	"log"
	"net/http"
	"os"

	"kosthub/backend/api"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "4000"
	}

	log.Printf("Starting KostHub backend on http://localhost:%s\n", port)
	
	http.HandleFunc("/", api.Handler)
	
	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatal(err)
	}
}
