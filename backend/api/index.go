package api

import (
	"net/http"

	"kosthub/backend/config"
	"kosthub/backend/database"
	"kosthub/backend/handlers"
	"kosthub/backend/middleware"

	"github.com/rs/cors"
)

var handler http.Handler

func init() {
	cfg := config.LoadConfig()

	// Initialize Database
	database.ConnectDB(cfg.DatabaseURL)

	// Auto migrate & seed
	database.MigrateDB()
	database.SeedDB()

	mux := http.NewServeMux()

	// Public routes
	mux.HandleFunc("/api/auth/login", handlers.LoginHandler)
	mux.HandleFunc("/api/auth/register", handlers.RegisterHandler)

	// Protected routes
	mux.HandleFunc("/api/auth/me", middleware.AuthMiddleware(handlers.MeHandler))
	mux.HandleFunc("/api/dashboard", middleware.AuthMiddleware(handlers.DashboardHandler))
	mux.HandleFunc("/api/profile", middleware.AuthMiddleware(handlers.ProfileHandler))

	// Stub routes for frontend compatibility
	mux.HandleFunc("/api/rooms", middleware.AuthMiddleware(handlers.RoomsHandler))
	mux.HandleFunc("/api/rooms/", middleware.AuthMiddleware(handlers.RoomsHandler))
	mux.HandleFunc("/api/tenants", middleware.AdminMiddleware(handlers.GenericListHandler("tenants")))
	mux.HandleFunc("/api/tenants/", middleware.AdminMiddleware(handlers.GenericListHandler("tenants")))
	mux.HandleFunc("/api/payments", middleware.AuthMiddleware(handlers.GenericListHandler("payments")))
	mux.HandleFunc("/api/payments/", middleware.AuthMiddleware(handlers.GenericListHandler("payments")))
	mux.HandleFunc("/api/complaints", middleware.AuthMiddleware(handlers.GenericListHandler("complaints")))
	mux.HandleFunc("/api/complaints/", middleware.AuthMiddleware(handlers.GenericListHandler("complaints")))
	mux.HandleFunc("/api/announcements", middleware.AuthMiddleware(handlers.GenericListHandler("announcements")))
	mux.HandleFunc("/api/announcements/", middleware.AuthMiddleware(handlers.GenericListHandler("announcements")))
	mux.HandleFunc("/api/users", middleware.AdminMiddleware(handlers.GenericListHandler("users")))
	mux.HandleFunc("/api/users/", middleware.AdminMiddleware(handlers.GenericListHandler("users")))
	mux.HandleFunc("/api/notifications", middleware.AuthMiddleware(handlers.GenericListHandler("notifications")))
	mux.HandleFunc("/api/notifications/read", middleware.AuthMiddleware(handlers.GenericListHandler("notifications")))
	mux.HandleFunc("/api/reports", middleware.AdminMiddleware(handlers.GenericListHandler("reports")))
	mux.HandleFunc("/api/audit-logs", middleware.AdminMiddleware(handlers.GenericListHandler("audit_logs")))
	mux.HandleFunc("/api/settings", middleware.AuthMiddleware(handlers.SettingsHandler))

	// CORS Setup
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000"}, // Allow localhost for dev
		AllowedMethods:   []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type", "Authorization"},
		AllowCredentials: true,
	})

	handler = c.Handler(mux)
}

// Handler is the entrypoint for Vercel Serverless Functions
func Handler(w http.ResponseWriter, r *http.Request) {
	handler.ServeHTTP(w, r)
}
