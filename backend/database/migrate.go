package database

import (
	"context"
	"fmt"
	"log"
)

func MigrateDB() {
	if DB == nil {
		log.Fatal("Database connection is not initialized")
	}

	queries := []string{
		`CREATE TABLE IF NOT EXISTS users (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			email VARCHAR(255) UNIQUE NOT NULL,
			password VARCHAR(255) NOT NULL,
			role VARCHAR(50) DEFAULT 'USER',
			is_active BOOLEAN DEFAULT TRUE,
			created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
		);`,
		`CREATE TABLE IF NOT EXISTS profiles (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
			full_name VARCHAR(255) NOT NULL,
			phone VARCHAR(50),
			avatar TEXT,
			emergency_contact VARCHAR(255),
			emergency_phone VARCHAR(50),
			created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
		);`,
		`CREATE TABLE IF NOT EXISTS room_categories (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			name VARCHAR(255) UNIQUE NOT NULL,
			description TEXT
		);`,
		`CREATE TABLE IF NOT EXISTS facilities (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			name VARCHAR(255) UNIQUE NOT NULL,
			icon VARCHAR(100)
		);`,
		`CREATE TABLE IF NOT EXISTS rooms (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			number VARCHAR(50) UNIQUE NOT NULL,
			floor INTEGER NOT NULL DEFAULT 1,
			category_id UUID REFERENCES room_categories(id),
			price NUMERIC NOT NULL,
			capacity INTEGER DEFAULT 1,
			description TEXT,
			status VARCHAR(50) DEFAULT 'AVAILABLE',
			photos TEXT[],
			created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
		);`,
		`CREATE TABLE IF NOT EXISTS room_facilities (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
			facility_id UUID REFERENCES facilities(id) ON DELETE CASCADE,
			UNIQUE(room_id, facility_id)
		);`,
		`CREATE TABLE IF NOT EXISTS tenants (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
			room_id UUID REFERENCES rooms(id),
			status VARCHAR(50) DEFAULT 'ACTIVE',
			start_date TIMESTAMP WITH TIME ZONE,
			end_date TIMESTAMP WITH TIME ZONE,
			created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
		);`,
		`CREATE TABLE IF NOT EXISTS leases (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			room_id UUID REFERENCES rooms(id),
			tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
			start_date TIMESTAMP WITH TIME ZONE NOT NULL,
			end_date TIMESTAMP WITH TIME ZONE,
			monthly_price NUMERIC NOT NULL,
			created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
		);`,
		`CREATE TABLE IF NOT EXISTS payments (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
			amount NUMERIC NOT NULL,
			month INTEGER NOT NULL,
			year INTEGER NOT NULL,
			due_date TIMESTAMP WITH TIME ZONE NOT NULL,
			paid_at TIMESTAMP WITH TIME ZONE,
			status VARCHAR(50) DEFAULT 'PENDING',
			proof_image TEXT,
			late_fee NUMERIC DEFAULT 0,
			notes TEXT,
			rejected_reason TEXT,
			created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
		);`,
		`CREATE TABLE IF NOT EXISTS complaints (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			user_id UUID REFERENCES users(id) ON DELETE CASCADE,
			title VARCHAR(255) NOT NULL,
			description TEXT NOT NULL,
			category VARCHAR(50) NOT NULL,
			status VARCHAR(50) DEFAULT 'OPEN',
			priority VARCHAR(50) DEFAULT 'MEDIUM',
			photos TEXT[],
			created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
		);`,
		`CREATE TABLE IF NOT EXISTS complaint_comments (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			complaint_id UUID REFERENCES complaints(id) ON DELETE CASCADE,
			user_id UUID REFERENCES users(id) ON DELETE CASCADE,
			content TEXT NOT NULL,
			created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
		);`,
		`CREATE TABLE IF NOT EXISTS announcements (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			user_id UUID REFERENCES users(id) ON DELETE CASCADE,
			title VARCHAR(255) NOT NULL,
			content TEXT NOT NULL,
			is_published BOOLEAN DEFAULT TRUE,
			created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
		);`,
		`CREATE TABLE IF NOT EXISTS notifications (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			user_id UUID REFERENCES users(id) ON DELETE CASCADE,
			title VARCHAR(255) NOT NULL,
			message TEXT NOT NULL,
			type VARCHAR(50) DEFAULT 'info',
			is_read BOOLEAN DEFAULT FALSE,
			link TEXT,
			created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
		);`,
		`CREATE TABLE IF NOT EXISTS audit_logs (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			user_id UUID REFERENCES users(id) ON DELETE SET NULL,
			action VARCHAR(50) NOT NULL,
			entity VARCHAR(50) NOT NULL,
			entity_id VARCHAR(255),
			details TEXT,
			ip_address VARCHAR(50),
			created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
		);`,
		`CREATE TABLE IF NOT EXISTS settings (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			key VARCHAR(100) UNIQUE NOT NULL,
			value TEXT NOT NULL
		);`,
	}

	for _, query := range queries {
		_, err := DB.Exec(context.Background(), query)
		if err != nil {
			log.Fatalf("Error executing migration: %v\nQuery: %s", err, query)
		}
	}

	fmt.Println("Database migration completed successfully!")
}
