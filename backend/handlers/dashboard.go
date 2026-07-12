package handlers

import (
	"context"
	"net/http"
	"time"

	"kosthub/backend/database"
	"kosthub/backend/helpers"
	"kosthub/backend/middleware"
)

func DashboardHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusNoContent)
		return
	}
	
	claims, ok := r.Context().Value(middleware.UserContextKey).(*helpers.JWTPayload)
	if !ok {
		helpers.ErrorResponse(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	if claims.Role == "ADMIN" {
		var totalRooms, occupiedRooms, availableRooms, maintenanceRooms int
		var totalTenants, activeTenants, totalUsers, openComplaints int
		var totalRevenue float64
		var pendingPayments int

		database.DB.QueryRow(context.Background(), "SELECT COUNT(*) FROM rooms").Scan(&totalRooms)
		database.DB.QueryRow(context.Background(), "SELECT COUNT(*) FROM rooms WHERE status = 'OCCUPIED'").Scan(&occupiedRooms)
		database.DB.QueryRow(context.Background(), "SELECT COUNT(*) FROM rooms WHERE status = 'AVAILABLE'").Scan(&availableRooms)
		database.DB.QueryRow(context.Background(), "SELECT COUNT(*) FROM rooms WHERE status = 'MAINTENANCE'").Scan(&maintenanceRooms)
		
		database.DB.QueryRow(context.Background(), "SELECT COUNT(*) FROM tenants").Scan(&totalTenants)
		database.DB.QueryRow(context.Background(), "SELECT COUNT(*) FROM tenants WHERE status = 'ACTIVE'").Scan(&activeTenants)
		
		database.DB.QueryRow(context.Background(), "SELECT COUNT(*) FROM users").Scan(&totalUsers)
		database.DB.QueryRow(context.Background(), "SELECT COUNT(*) FROM complaints WHERE status IN ('OPEN', 'IN_PROGRESS')").Scan(&openComplaints)
		
		database.DB.QueryRow(context.Background(), "SELECT COALESCE(SUM(amount), 0) FROM payments WHERE status = 'PAID'").Scan(&totalRevenue)
		database.DB.QueryRow(context.Background(), "SELECT COUNT(*) FROM payments WHERE status IN ('PENDING', 'WAITING_VERIFICATION')").Scan(&pendingPayments)

		// Revenue by month
		year := time.Now().Year()
		rows, _ := database.DB.Query(context.Background(), "SELECT month, amount FROM payments WHERE status = 'PAID' AND year = $1", year)
		
		revenueMap := make(map[int]float64)
		for rows.Next() {
			var m int
			var a float64
			rows.Scan(&m, &a)
			revenueMap[m] += a
		}
		
		var revenueChart []map[string]interface{}
		for i := 1; i <= 12; i++ {
			revenueChart = append(revenueChart, map[string]interface{}{
				"month":   i,
				"revenue": revenueMap[i],
			})
		}

		helpers.SuccessResponse(w, map[string]interface{}{
			"rooms": map[string]interface{}{
				"total": totalRooms, "occupied": occupiedRooms, "available": availableRooms, "maintenance": maintenanceRooms,
			},
			"tenants": map[string]interface{}{
				"total": totalTenants, "active": activeTenants,
			},
			"payments": map[string]interface{}{
				"totalRevenue": totalRevenue, "pending": pendingPayments,
			},
			"complaints": map[string]interface{}{
				"open": openComplaints,
			},
			"users": map[string]interface{}{
				"total": totalUsers,
			},
			"revenueChart": revenueChart,
		}, http.StatusOK)
		return
	}

	// USER DASHBOARD
	var roomNumber, categoryName *string
	var floor *int
	var price *float64
	var status *string
	var startDate *time.Time

	err := database.DB.QueryRow(context.Background(), `
		SELECT r.number, r.floor, r.price, c.name, t.status, t.start_date
		FROM tenants t
		JOIN rooms r ON t.room_id = r.id
		LEFT JOIN room_categories c ON r.category_id = c.id
		WHERE t.user_id = $1 AND t.status = 'ACTIVE'`, claims.UserID).
		Scan(&roomNumber, &floor, &price, &categoryName, &status, &startDate)

	var unreadNotifications int
	database.DB.QueryRow(context.Background(), "SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = false", claims.UserID).Scan(&unreadNotifications)

	var activeComplaints int
	database.DB.QueryRow(context.Background(), "SELECT COUNT(*) FROM complaints WHERE user_id = $1 AND status IN ('OPEN', 'IN_PROGRESS')", claims.UserID).Scan(&activeComplaints)

	var tenantData interface{} = nil
	if err == nil {
		tenantData = map[string]interface{}{
			"room": map[string]interface{}{
				"number": roomNumber,
				"floor": floor,
				"category": categoryName,
				"price": price,
			},
			"startDate": startDate,
			"status": status,
		}
	}

	helpers.SuccessResponse(w, map[string]interface{}{
		"tenant": tenantData,
		"notifications": map[string]interface{}{
			"unread": unreadNotifications,
		},
		"complaints": map[string]interface{}{
			"active": activeComplaints,
		},
	}, http.StatusOK)
}
