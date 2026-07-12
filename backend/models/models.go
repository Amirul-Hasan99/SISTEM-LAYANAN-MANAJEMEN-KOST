package models

import (
	"time"
)

type User struct {
	ID        string    `json:"id"`
	Email     string    `json:"email"`
	Password  string    `json:"-"`
	Role      string    `json:"role"`
	Active    bool      `json:"active"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`

	// Optional relations for nested responses
	Profile *Profile `json:"profile,omitempty"`
	Tenant  *Tenant  `json:"tenant,omitempty"`
}

type Profile struct {
	ID             string    `json:"id"`
	UserID         string    `json:"userId"`
	Name           string    `json:"name"`
	Phone          *string   `json:"phone"`
	Avatar         *string   `json:"avatar"`
	Address        *string   `json:"address"`
	EmergencyName  *string   `json:"emergencyName"`
	EmergencyPhone *string   `json:"emergencyPhone"`
	Gender         *string   `json:"gender"`
	BirthDate      *string   `json:"birthDate"`
	IDNumber       *string   `json:"idNumber"`
	CreatedAt      time.Time `json:"createdAt"`
	UpdatedAt      time.Time `json:"updatedAt"`
}

type RoomCategory struct {
	ID          string  `json:"id"`
	Name        string  `json:"name"`
	Description *string `json:"description"`
}

type Facility struct {
	ID   string  `json:"id"`
	Name string  `json:"name"`
	Icon *string `json:"icon"`
}

type Room struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	Number      string    `json:"number"`
	Floor       int       `json:"floor"`
	CategoryID  *string   `json:"categoryId"`
	Price       float64   `json:"price"`
	Capacity    int       `json:"capacity"`
	Description *string   `json:"description"`
	Status      string    `json:"status"`
	ImageURL    *string   `json:"imageUrl"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`

	Category   *RoomCategory `json:"category,omitempty"`
	Facilities []Facility    `json:"facilities,omitempty"`
}

type Tenant struct {
	ID          string     `json:"id"`
	UserID      string     `json:"userId"`
	RoomID      *string    `json:"roomId"`
	Status      string     `json:"status"`
	MoveInDate  *time.Time `json:"moveInDate"`
	MoveOutDate *time.Time `json:"moveOutDate"`
	CreatedAt   time.Time  `json:"createdAt"`
	UpdatedAt   time.Time  `json:"updatedAt"`

	User *User `json:"user,omitempty"`
	Room *Room `json:"room,omitempty"`
}

type Lease struct {
	ID          string     `json:"id"`
	TenantID    string     `json:"tenantId"`
	StartDate   time.Time  `json:"startDate"`
	EndDate     *time.Time `json:"endDate"`
	MonthlyRent float64    `json:"monthlyRent"`
	Status      string     `json:"status"`
	CreatedAt   time.Time  `json:"createdAt"`
	UpdatedAt   time.Time  `json:"updatedAt"`
}

type Payment struct {
	ID        string     `json:"id"`
	TenantID  string     `json:"tenantId"`
	LeaseID   *string    `json:"leaseId"`
	RoomID    *string    `json:"roomId"`
	Amount    float64    `json:"amount"`
	Month     int        `json:"month"`
	Year      int        `json:"year"`
	DueDate   time.Time  `json:"dueDate"`
	PaidDate  *time.Time `json:"paidDate"`
	Status    string     `json:"status"`
	ProofURL  *string    `json:"proofUrl"`
	Notes     *string    `json:"notes"`
	CreatedAt time.Time  `json:"createdAt"`
	UpdatedAt time.Time  `json:"updatedAt"`

	Tenant *Tenant `json:"tenant,omitempty"`
	Room   *Room   `json:"room,omitempty"`
}

type Complaint struct {
	ID          string     `json:"id"`
	TenantID    string     `json:"tenantId"`
	RoomID      *string    `json:"roomId"`
	Title       string     `json:"title"`
	Description string     `json:"description"`
	Category    string     `json:"category"`
	Status      string     `json:"status"`
	Priority    string     `json:"priority"`
	ImageURL    *string    `json:"imageUrl"`
	ResolvedAt  *time.Time `json:"resolvedAt"`
	CreatedAt   time.Time  `json:"createdAt"`
	UpdatedAt   time.Time  `json:"updatedAt"`

	Tenant   *Tenant            `json:"tenant,omitempty"`
	Room     *Room              `json:"room,omitempty"`
	Comments []ComplaintComment `json:"comments,omitempty"`
}

type ComplaintComment struct {
	ID          string    `json:"id"`
	ComplaintID string    `json:"complaintId"`
	UserID      string    `json:"userId"`
	Content     string    `json:"content"`
	IsInternal  bool      `json:"isInternal"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`

	User *User `json:"user,omitempty"`
}

type Announcement struct {
	ID          string     `json:"id"`
	Title       string     `json:"title"`
	Content     string     `json:"content"`
	Category    string     `json:"category"`
	Priority    string     `json:"priority"`
	IsPublished bool       `json:"isPublished"`
	PublishedAt *time.Time `json:"publishedAt"`
	CreatedAt   time.Time  `json:"createdAt"`
	UpdatedAt   time.Time  `json:"updatedAt"`
}

type Notification struct {
	ID        string    `json:"id"`
	UserID    string    `json:"userId"`
	Title     string    `json:"title"`
	Message   string    `json:"message"`
	Type      string    `json:"type"`
	IsRead    bool      `json:"isRead"`
	RelatedID *string   `json:"relatedId"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

type AuditLog struct {
	ID        string    `json:"id"`
	UserID    *string   `json:"userId"`
	Action    string    `json:"action"`
	Entity    *string   `json:"entity"`
	EntityID  *string   `json:"entityId"`
	Details   *string   `json:"details"`
	IPAddress *string   `json:"ipAddress"`
	CreatedAt time.Time `json:"createdAt"`

	User *User `json:"user,omitempty"`
}

type Setting struct {
	ID    string `json:"id"`
	Key   string `json:"key"`
	Value string `json:"value"`
}
