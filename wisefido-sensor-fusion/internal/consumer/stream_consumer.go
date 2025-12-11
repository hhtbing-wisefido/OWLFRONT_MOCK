package consumer

import (
	"context"
	"encoding/json"
	"fmt"
	"time"
	"wisefido-sensor-fusion/internal/config"
	"wisefido-sensor-fusion/internal/fusion"
	"wisefido-sensor-fusion/internal/models"
	"wisefido-sensor-fusion/internal/repository"
	
	"go.uber.org/zap"
	"github.com/go-redis/redis/v8"
	rediscommon "owl-common/redis"
)

// StreamConsumer Redis Streams 消费者
type StreamConsumer struct {
	config       *config.Config
	redisClient  *redis.Client
	cardRepo     *repository.CardRepository
	iotRepo      *repository.IoTTimeSeriesRepository
	fusion       *fusion.SensorFusion
	cache        *CacheManager
	logger       *zap.Logger
}

// NewStreamConsumer 创建 Streams 消费者
func NewStreamConsumer(
	cfg *config.Config,
	redisClient *redis.Client,
	cardRepo *repository.CardRepository,
	iotRepo *repository.IoTTimeSeriesRepository,
	fusion *fusion.SensorFusion,
	cache *CacheManager,
	logger *zap.Logger,
) *StreamConsumer {
	return &StreamConsumer{
		config:      cfg,
		redisClient: redisClient,
		cardRepo:    cardRepo,
		iotRepo:     iotRepo,
		fusion:      fusion,
		cache:       cache,
		logger:      logger,
	}
}

// Start 启动消费者
func (c *StreamConsumer) Start(ctx context.Context) error {
	// 创建消费者组
	stream := c.config.Fusion.Stream.Input
	if err := rediscommon.CreateConsumerGroup(ctx, c.redisClient, stream, c.config.Fusion.ConsumerGroup); err != nil {
		return fmt.Errorf("failed to create consumer group for %s: %w", stream, err)
	}
	
	c.logger.Info("Stream consumer started",
		zap.String("consumer_group", c.config.Fusion.ConsumerGroup),
		zap.String("consumer_name", c.config.Fusion.ConsumerName),
		zap.String("stream", stream),
	)
	
	// 启动消费循环（带指数退避）
	backoffDuration := time.Second // 初始退避时间
	maxBackoff := 30 * time.Second // 最大退避时间
	
	for {
		select {
		case <-ctx.Done():
			return nil
		default:
			if err := c.consumeStream(ctx, stream); err != nil {
				c.logger.Error("Failed to consume stream",
					zap.Error(err),
					zap.Duration("backoff", backoffDuration),
				)
				
				// 指数退避：等待后重试
				select {
				case <-ctx.Done():
					return nil
				case <-time.After(backoffDuration):
					backoffDuration *= 2
					if backoffDuration > maxBackoff {
						backoffDuration = maxBackoff
					}
				}
			} else {
				// 成功时重置退避时间
				backoffDuration = time.Second
			}
		}
	}
}

// consumeStream 消费单个 Stream
func (c *StreamConsumer) consumeStream(ctx context.Context, stream string) error {
	// 从 Stream 读取消息
	messages, err := rediscommon.ReadFromStream(
		ctx,
		c.redisClient,
		stream,
		c.config.Fusion.ConsumerGroup,
		c.config.Fusion.ConsumerName,
		c.config.Fusion.BatchSize,
	)
	if err != nil {
		return fmt.Errorf("failed to read from stream: %w", err)
	}
	
	// 处理消息
	for _, msg := range messages {
		if err := c.processMessage(ctx, msg); err != nil {
			c.logger.Error("Failed to process message",
				zap.String("stream_id", msg.ID),
				zap.Error(err),
			)
			// 继续处理下一条消息，不中断
		}
	}
	
	return nil
}

// processMessage 处理单条消息
func (c *StreamConsumer) processMessage(ctx context.Context, msg rediscommon.StreamMessage) error {
	// 解析消息数据
	var dataStr string
	if val, ok := msg.Values["data"]; ok {
		if str, ok := val.(string); ok {
			dataStr = str
		} else {
			return fmt.Errorf("invalid data format in message")
		}
	} else {
		return fmt.Errorf("missing data field in message")
	}
	
	// 解析 JSON
	var iotData models.IoTDataMessage
	if err := json.Unmarshal([]byte(dataStr), &iotData); err != nil {
		return fmt.Errorf("failed to unmarshal message data: %w", err)
	}
	
	c.logger.Debug("Processing IoT data",
		zap.String("device_id", iotData.DeviceID),
		zap.String("device_type", iotData.DeviceType),
	)
	
	// 1. 根据 device_id + tenant_id 查询关联的卡片（多租户隔离）
	cardInfo, err := c.cardRepo.GetCardByDeviceID(iotData.TenantID, iotData.DeviceID)
	if err != nil {
		c.logger.Warn("Card not found for device",
			zap.String("device_id", iotData.DeviceID),
			zap.String("tenant_id", iotData.TenantID),
			zap.Error(err),
		)
		return nil // 设备可能未绑定到卡片，忽略
	}
	
	// 2. 融合卡片的所有设备数据
	realtimeData, err := c.fusion.FuseCardData(cardInfo.CardID)
	if err != nil {
		return fmt.Errorf("failed to fuse card data: %w", err)
	}
	
	// 3. 更新 Redis 缓存
	if err := c.cache.UpdateRealtimeData(cardInfo.CardID, realtimeData); err != nil {
		return fmt.Errorf("failed to update cache: %w", err)
	}
	
	c.logger.Info("Fused and cached card data",
		zap.String("card_id", cardInfo.CardID),
		zap.String("device_id", iotData.DeviceID),
	)
	
	return nil
}

