package database

import (
	"context"
	"fmt"
	"log"

	"golang.org/x/crypto/bcrypt"
)

func SeedDB() {
	var count int
	err := DB.QueryRow(context.Background(), "SELECT count(*) FROM users").Scan(&count)
	if err != nil {
		log.Fatalf("Error checking users count: %v", err)
	}

	if count > 0 {
		fmt.Println("Database already seeded, skipping seed process.")
		return
	}

	fmt.Println("🌱 Seeding database...")

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte("123"), bcrypt.DefaultCost)
	if err != nil {
		log.Fatalf("Failed to hash password: %v", err)
	}

	// Insert Admin
	var adminID string
	err = DB.QueryRow(context.Background(), `
		INSERT INTO users (email, password, role, is_active) 
		VALUES ('admin@kosthub.com', $1, 'ADMIN', true) RETURNING id`, string(hashedPassword)).Scan(&adminID)
	if err != nil {
		log.Fatalf("Failed to insert admin: %v", err)
	}

	_, err = DB.Exec(context.Background(), `
		INSERT INTO profiles (user_id, full_name, phone) 
		VALUES ($1, 'Pak Mun', '081234567890')`, adminID)
	if err != nil {
		log.Fatalf("Failed to insert admin profile: %v", err)
	}

	// Insert User 1
	var user1ID string
	err = DB.QueryRow(context.Background(), `
		INSERT INTO users (email, password, role, is_active) 
		VALUES ('user@kosthub.com', $1, 'USER', true) RETURNING id`, string(hashedPassword)).Scan(&user1ID)
	if err != nil {
		log.Fatalf("Failed to insert user 1: %v", err)
	}

	_, err = DB.Exec(context.Background(), `
		INSERT INTO profiles (user_id, full_name, phone, emergency_contact, emergency_phone) 
		VALUES ($1, 'Dany Doisin', '081234567891', 'Budi (Ayah)', '081234567800')`, user1ID)
	if err != nil {
		log.Fatalf("Failed to insert user 1 profile: %v", err)
	}

	// Insert Room Categories
	var standardCatID, deluxeCatID string
	DB.QueryRow(context.Background(), `INSERT INTO room_categories (name, description) VALUES ('Standard', 'Kamar standar dengan fasilitas dasar') RETURNING id`).Scan(&standardCatID)
	DB.QueryRow(context.Background(), `INSERT INTO room_categories (name, description) VALUES ('Deluxe', 'Kamar mewah dengan fasilitas lengkap') RETURNING id`).Scan(&deluxeCatID)

	// Insert Facilities
	facilityNames := []string{"AC", "WiFi", "Kamar Mandi Dalam", "Lemari", "Meja Belajar", "Kasur", "TV", "Kulkas"}
	facilityIDs := make([]string, len(facilityNames))
	for i, name := range facilityNames {
		DB.QueryRow(context.Background(), `INSERT INTO facilities (name) VALUES ($1) RETURNING id`, name).Scan(&facilityIDs[i])
	}

	// Insert Rooms
	var room1ID, room2ID, room3ID, room4ID, room5ID string
	DB.QueryRow(context.Background(), `INSERT INTO rooms (number, floor, category_id, price, capacity, status, description) VALUES ('101', 1, $1, 800000, 1, 'OCCUPIED', 'Kamar standar lantai 1') RETURNING id`, standardCatID).Scan(&room1ID)
	DB.QueryRow(context.Background(), `INSERT INTO rooms (number, floor, category_id, price, capacity, status, description) VALUES ('102', 1, $1, 800000, 1, 'AVAILABLE', 'Kamar standar lantai 1') RETURNING id`, standardCatID).Scan(&room2ID)
	DB.QueryRow(context.Background(), `INSERT INTO rooms (number, floor, category_id, price, capacity, status, description) VALUES ('201', 2, $1, 1200000, 2, 'AVAILABLE', 'Kamar deluxe lantai 2') RETURNING id`, deluxeCatID).Scan(&room3ID)
	DB.QueryRow(context.Background(), `INSERT INTO rooms (number, floor, category_id, price, capacity, status, description) VALUES ('202', 2, $1, 1200000, 2, 'AVAILABLE', 'Kamar deluxe lantai 2') RETURNING id`, deluxeCatID).Scan(&room4ID)
	DB.QueryRow(context.Background(), `INSERT INTO rooms (number, floor, category_id, price, capacity, status, description) VALUES ('103', 1, $1, 850000, 1, 'MAINTENANCE', 'Sedang renovasi') RETURNING id`, standardCatID).Scan(&room5ID)

	// Room Facilities (simplified)
	DB.Exec(context.Background(), `INSERT INTO room_facilities (room_id, facility_id) VALUES ($1, $2)`, room1ID, facilityIDs[1]) // WiFi
	DB.Exec(context.Background(), `INSERT INTO room_facilities (room_id, facility_id) VALUES ($1, $2)`, room1ID, facilityIDs[2]) // Kamar Mandi Dalam
	DB.Exec(context.Background(), `INSERT INTO room_facilities (room_id, facility_id) VALUES ($1, $2)`, room3ID, facilityIDs[0]) // AC
	DB.Exec(context.Background(), `INSERT INTO room_facilities (room_id, facility_id) VALUES ($1, $2)`, room3ID, facilityIDs[1]) // WiFi

	// Insert Tenants
	var tenant1ID string
	DB.QueryRow(context.Background(), `INSERT INTO tenants (user_id, room_id, status, start_date) VALUES ($1, $2, 'ACTIVE', '2025-01-15') RETURNING id`, user1ID, room1ID).Scan(&tenant1ID)

	// Insert Leases
	DB.Exec(context.Background(), `INSERT INTO leases (room_id, tenant_id, start_date, end_date, monthly_price) VALUES ($1, $2, '2025-01-15', '2026-01-15', 800000)`, room1ID, tenant1ID)

	// Insert Payments
	for month := 1; month <= 6; month++ {
		status := "PENDING"
		var paidAt interface{}
		if month <= 5 {
			status = "PAID"
			paidAt = fmt.Sprintf("2025-%02d-10", month)
		} else {
			paidAt = nil
		}
		
		dueDate := fmt.Sprintf("2025-%02d-15", month)
		if paidAt != nil {
			DB.Exec(context.Background(), `INSERT INTO payments (tenant_id, amount, month, year, due_date, status, paid_at) VALUES ($1, 800000, $2, 2025, $3, $4, $5)`, tenant1ID, month, dueDate, status, paidAt)
		} else {
			DB.Exec(context.Background(), `INSERT INTO payments (tenant_id, amount, month, year, due_date, status) VALUES ($1, 800000, $2, 2025, $3, $4)`, tenant1ID, month, dueDate, status)
		}
	}

	// Insert Complaints
	DB.Exec(context.Background(), `INSERT INTO complaints (user_id, title, description, category, priority, status) VALUES ($1, 'AC tidak dingin', 'AC di kamar 101 sudah tidak dingin', 'FACILITY', 'HIGH', 'IN_PROGRESS')`, user1ID)

	// Insert Announcements
	DB.Exec(context.Background(), `INSERT INTO announcements (user_id, title, content, is_published) VALUES ($1, 'Jadwal Pemadaman Listrik', 'Akan ada pemadaman listrik', true)`, adminID)

	// Insert Settings
	settings := map[string]string{
		"kost_name":        "KostHub Residence",
		"kost_address":     "Jl. Merdeka No. 123",
		"kost_phone":       "021-12345678",
		"bank_name":        "BCA",
		"bank_account":     "1234567890",
		"bank_holder":      "Pak Mun",
		"late_fee_per_day": "25000",
	}
	for k, v := range settings {
		DB.Exec(context.Background(), `INSERT INTO settings (key, value) VALUES ($1, $2)`, k, v)
	}

	fmt.Println("✅ Database seeded successfully!")
}
