package api

import (
	"net/http"

	backendAPI "kosthub/backend/api"
)

// Handler is the entrypoint for Vercel Serverless Functions
func Handler(w http.ResponseWriter, r *http.Request) {
	backendAPI.Handler(w, r)
}
