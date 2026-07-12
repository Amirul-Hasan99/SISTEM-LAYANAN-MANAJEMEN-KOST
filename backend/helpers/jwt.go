package helpers

import (
	"time"
	"errors"

	"github.com/golang-jwt/jwt/v5"
	"kosthub/backend/config"
)

type JWTPayload struct {
	UserID string `json:"userId"`
	Email  string `json:"email"`
	Role   string `json:"role"`
	jwt.RegisteredClaims
}

func CreateToken(userID, email, role string) (string, error) {
	cfg := config.LoadConfig()
	
	claims := JWTPayload{
		UserID: userID,
		Email:  email,
		Role:   role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(7 * 24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(cfg.JWTSecret))
}

func VerifyToken(tokenString string) (*JWTPayload, error) {
	cfg := config.LoadConfig()

	token, err := jwt.ParseWithClaims(tokenString, &JWTPayload{}, func(token *jwt.Token) (interface{}, error) {
		return []byte(cfg.JWTSecret), nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(*JWTPayload); ok && token.Valid {
		return claims, nil
	}

	return nil, errors.New("invalid token")
}
