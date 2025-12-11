package repository

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"go.uber.org/zap"
)

// CardRepository 卡片仓库
type CardRepository struct {
	db     *sql.DB
	logger *zap.Logger
}

// NewCardRepository 创建卡片仓库
func NewCardRepository(db *sql.DB, logger *zap.Logger) *CardRepository {
	return &CardRepository{
		db:     db,
		logger: logger,
	}
}

// GetCardByDeviceID 根据设备ID获取关联的卡片（含租户过滤）
//
// 查询逻辑：
// 1. 根据 device_id + tenant_id 查询设备信息，获取 bound_bed_id 或 bound_room_id
// 2. 如果设备绑定到 bed（bound_bed_id IS NOT NULL）：
//    - 查询 ActiveBed 类型的卡片（cards.bed_id = bound_bed_id 且 tenant_id 相同）
// 3. 如果设备绑定到 room（bound_room_id IS NOT NULL）：
//    - 查询 Location 类型的卡片（cards.unit_id = room.unit_id 且 tenant_id 相同）
//
// 参数:
//   - tenantID: 租户 ID
//   - deviceID: 设备 ID（UUID 格式）
func (r *CardRepository) GetCardByDeviceID(tenantID, deviceID string) (*CardInfo, error) {
	query := `
		WITH device_info AS (
			SELECT 
				d.device_id,
				d.tenant_id,
				d.bound_bed_id,
				d.bound_room_id
			FROM devices d
			WHERE d.device_id = $1 AND d.tenant_id = $2
		),
		bed_card AS (
			SELECT 
				c.card_id,
				c.tenant_id,
				c.card_type,
				c.bed_id,
				c.unit_id
			FROM cards c
			INNER JOIN device_info di ON c.bed_id = di.bound_bed_id
			WHERE di.bound_bed_id IS NOT NULL AND c.tenant_id = di.tenant_id
			LIMIT 1
		),
		room_card AS (
			SELECT 
				c.card_id,
				c.tenant_id,
				c.card_type,
				c.bed_id,
				c.unit_id
			FROM cards c
			INNER JOIN device_info di ON c.unit_id = (
				SELECT r.unit_id FROM rooms r WHERE r.room_id = di.bound_room_id
			)
			WHERE di.bound_room_id IS NOT NULL AND c.tenant_id = di.tenant_id
			LIMIT 1
		)
		SELECT card_id, tenant_id, card_type, bed_id, unit_id
		FROM bed_card
		UNION ALL
		SELECT card_id, tenant_id, card_type, bed_id, unit_id
		FROM room_card
		LIMIT 1
	`

	card := &CardInfo{}
	var bedID, unitID sql.NullString

	err := r.db.QueryRow(query, deviceID, tenantID).Scan(
		&card.CardID,
		&card.TenantID,
		&card.CardType,
		&bedID,
		&unitID,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("card not found for device: %s", deviceID)
		}
		return nil, fmt.Errorf("failed to query card: %w", err)
	}

	if bedID.Valid {
		card.BedID = &bedID.String
	}
	if unitID.Valid {
		card.UnitID = &unitID.String
	}

	return card, nil
}

// GetCardByID 根据卡片ID获取卡片信息
func (r *CardRepository) GetCardByID(cardID string) (*CardInfo, error) {
	query := `
		SELECT card_id, tenant_id, card_type, bed_id, unit_id
		FROM cards
		WHERE card_id = $1
	`

	card := &CardInfo{}
	var bedID, unitID sql.NullString

	err := r.db.QueryRow(query, cardID).Scan(
		&card.CardID,
		&card.TenantID,
		&card.CardType,
		&bedID,
		&unitID,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("card not found: %s", cardID)
		}
		return nil, fmt.Errorf("failed to query card: %w", err)
	}

	if bedID.Valid {
		card.BedID = &bedID.String
	}
	if unitID.Valid {
		card.UnitID = &unitID.String
	}

	return card, nil
}

// GetCardDevices 获取卡片关联的所有设备信息
func (r *CardRepository) GetCardDevices(cardID string) ([]DeviceInfo, error) {
	query := `
		SELECT devices
		FROM cards
		WHERE card_id = $1
	`

	var devicesJSON []byte
	err := r.db.QueryRow(query, cardID).Scan(&devicesJSON)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("card not found: %s", cardID)
		}
		return nil, fmt.Errorf("failed to query card devices: %w", err)
	}

	var devices []DeviceInfo
	if err := json.Unmarshal(devicesJSON, &devices); err != nil {
		return nil, fmt.Errorf("failed to unmarshal devices JSON: %w", err)
	}

	return devices, nil
}

// CardInfo 卡片信息
type CardInfo struct {
	CardID   string
	TenantID string
	CardType string // "ActiveBed" 或 "Location"
	BedID    *string
	UnitID   *string
}

// DeviceInfo 设备信息（从 cards.devices JSONB 解析）
type DeviceInfo struct {
	DeviceID    string `json:"device_id"`
	DeviceName  string `json:"device_name"`
	DeviceType  string `json:"device_type"` // "Radar" 或 "Sleepace"
	DeviceModel string `json:"device_model"`
	BindingType string `json:"binding_type"` // "direct" 或 "indirect"
}

