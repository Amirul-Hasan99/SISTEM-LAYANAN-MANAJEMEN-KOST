package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"

	"kosthub/backend/database"
	"kosthub/backend/helpers"
	"kosthub/backend/middleware"
	"kosthub/backend/models"

	"golang.org/x/crypto/bcrypt"
)

func frontendRole(role string) string {
	return strings.ToLower(role)
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func LoginHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusNoContent)
		return
	}
	if r.Method != "POST" {
		helpers.ErrorResponse(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		helpers.ErrorResponse(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	var user models.User
	var profile models.Profile
	err := database.DB.QueryRow(context.Background(), `
		SELECT u.id, u.email, u.password, u.role, u.is_active, 
		       p.full_name, p.avatar 
		FROM users u 
		LEFT JOIN profiles p ON u.id = p.user_id 
		WHERE u.email = $1`, req.Email).
		Scan(&user.ID, &user.Email, &user.Password, &user.Role, &user.Active, &profile.Name, &profile.Avatar)

	if err != nil || !user.Active {
		helpers.ErrorResponse(w, "Email atau password salah", http.StatusUnauthorized)
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		helpers.ErrorResponse(w, "Email atau password salah", http.StatusUnauthorized)
		return
	}

	token, err := helpers.CreateToken(user.ID, user.Email, user.Role)
	if err != nil {
		helpers.ErrorResponse(w, "Failed to create token", http.StatusInternalServerError)
		return
	}

	helpers.SuccessResponse(w, map[string]interface{}{
		"token": token,
		"user": map[string]interface{}{
			"id":       user.ID,
			"userId":   user.ID,
			"email":    user.Email,
			"role":     frontendRole(user.Role),
			"fullName": profile.Name,
			"name":     profile.Name,
			"avatar":   profile.Avatar,
		},
	}, http.StatusOK)
}

type RegisterRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
	FullName string `json:"fullName"`
	Phone    string `json:"phone"`
}

func RegisterHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusNoContent)
		return
	}
	if r.Method != "POST" {
		helpers.ErrorResponse(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		helpers.ErrorResponse(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	var count int
	database.DB.QueryRow(context.Background(), "SELECT count(*) FROM users WHERE email = $1", req.Email).Scan(&count)
	if count > 0 {
		helpers.ErrorResponse(w, "Email sudah terdaftar", http.StatusConflict)
		return
	}

	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)

	var userID string
	err := database.DB.QueryRow(context.Background(), `
		INSERT INTO users (email, password, role) 
		VALUES ($1, $2, 'USER') RETURNING id`, req.Email, string(hashedPassword)).Scan(&userID)

	if err != nil {
		helpers.ErrorResponse(w, "Failed to create user", http.StatusInternalServerError)
		return
	}

	database.DB.Exec(context.Background(), `
		INSERT INTO profiles (user_id, full_name, phone) 
		VALUES ($1, $2, $3)`, userID, req.FullName, req.Phone)

	token, _ := helpers.CreateToken(userID, req.Email, "USER")

	helpers.SuccessResponse(w, map[string]interface{}{
		"token": token,
		"user": map[string]interface{}{
			"id":       userID,
			"userId":   userID,
			"email":    req.Email,
			"role":     "user",
			"fullName": req.FullName,
			"name":     req.FullName,
		},
	}, http.StatusCreated)
}

func MeHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusNoContent)
		return
	}

	claims, ok := r.Context().Value(middleware.UserContextKey).(*helpers.JWTPayload)
	if !ok {
		helpers.ErrorResponse(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var user models.User
	var profile models.Profile
	var roomID, roomNumber *string
	var floor *int

	err := database.DB.QueryRow(context.Background(), `
		SELECT u.id, u.email, u.role, u.is_active, 
		       p.full_name, p.phone, p.avatar, p.emergency_contact, p.emergency_phone,
			   t.room_id, r.number, r.floor
		FROM users u 
		LEFT JOIN profiles p ON u.id = p.user_id 
		LEFT JOIN tenants t ON u.id = t.user_id AND t.status = 'ACTIVE'
		LEFT JOIN rooms r ON t.room_id = r.id
		WHERE u.id = $1`, claims.UserID).
		Scan(&user.ID, &user.Email, &user.Role, &user.Active,
			&profile.Name, &profile.Phone, &profile.Avatar, &profile.EmergencyName, &profile.EmergencyPhone,
			&roomID, &roomNumber, &floor)

	if err != nil {
		helpers.ErrorResponse(w, "User tidak ditemukan", http.StatusNotFound)
		return
	}

	res := map[string]interface{}{
		"userId":           user.ID,
		"id":               user.ID,
		"email":            user.Email,
		"role":             frontendRole(user.Role),
		"isActive":         user.Active,
		"fullName":         profile.Name,
		"name":             profile.Name,
		"phone":            profile.Phone,
		"avatar":           profile.Avatar,
		"emergencyContact": profile.EmergencyName,
		"emergencyPhone":   profile.EmergencyPhone,
	}

	if roomID != nil {
		res["room"] = map[string]interface{}{
			"id":     roomID,
			"number": roomNumber,
			"floor":  floor,
		}
	} else {
		res["room"] = nil
	}

	helpers.SuccessResponse(w, res, http.StatusOK)
}
