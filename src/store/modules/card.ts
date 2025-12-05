/**
 * Card Store
 * Manages card overview data, including detailed information
 * All card data is loaded and cached here for use across the app
 * 
 * Note: Permission filtering is handled by Server application layer
 * This store only manages data that has already been filtered by backend
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { CardOverviewItem } from '@/api/card-overview/model/cardOverviewModel'
import { getCardOverviewApi } from '@/api/card-overview/cardOverview'
import type { GetCardOverviewParams } from '@/api/card-overview/model/cardOverviewModel'

export const useCardStore = defineStore('card', () => {
  // Cards cache (keyed by card_id)
  const cardsCache = ref<Map<string, { data: CardOverviewItem, timestamp: Date }>>(new Map())
  const cardsListCache = ref<CardOverviewItem[]>([])
  const cardsListLastFetched = ref<Date | null>(null)
  const cardsCacheTimeout = 5 * 60 * 1000 // 5 minutes

  // Device to Card mapping cache (keyed by device_id)
  const deviceToCardCache = ref<Map<string, string>>(new Map()) // device_id -> card_id

  /**
   * Get card by ID from cache
   */
  const getCard = (cardId: string): CardOverviewItem | null => {
    const cached = cardsCache.value.get(cardId)
    if (!cached) return null
    
    const now = new Date()
    if (now.getTime() - cached.timestamp.getTime() > cardsCacheTimeout) {
      cardsCache.value.delete(cardId)
      return null
    }
    
    return cached.data
  }

  /**
   * Get card by device ID
   * A device can only belong to one card
   */
  const getCardByDeviceId = (deviceId: string): CardOverviewItem | null => {
    // Check device to card mapping cache first
    const cardId = deviceToCardCache.value.get(deviceId)
    if (cardId) {
      return getCard(cardId)
    }

    // If not in cache, search in all cached cards
    for (const [cardId, cached] of cardsCache.value.entries()) {
      const card = cached.data
      if (card.devices.some(d => d.device_id === deviceId)) {
        // Update device to card mapping cache
        deviceToCardCache.value.set(deviceId, cardId)
        return card
      }
    }

    return null
  }

  /**
   * Set card in cache
   */
  const setCard = (card: CardOverviewItem) => {
    cardsCache.value.set(card.card_id, {
      data: card,
      timestamp: new Date(),
    })

    // Update device to card mapping cache
    card.devices.forEach(device => {
      deviceToCardCache.value.set(device.device_id, card.card_id)
    })
  }

  /**
   * Load card list (with permission check - handled by backend)
   * Backend automatically filters cards based on user permissions
   */
  const loadCardsList = async (params?: GetCardOverviewParams) => {
    const result = await getCardOverviewApi(params)
    if (result?.items) {
      // Update list cache
      cardsListCache.value = result.items
      cardsListLastFetched.value = new Date()
      
      // Update individual card cache and device mapping
      result.items.forEach(card => {
        setCard(card)
      })
    }
    return result
  }

  /**
   * Load single card detail (with permission check - handled by backend)
   * Backend automatically checks if user has permission to view this card
   */
  const loadCardDetail = async (cardId: string) => {
    // Check cache first
    const cached = getCard(cardId)
    if (cached) {
      return cached
    }

    // Load from API (backend will check permission)
    const result = await getCardOverviewApi({ card_id: cardId })
    if (result?.items && result.items.length > 0) {
      const card = result.items[0]
      setCard(card)
      return card
    }
    return null
  }

  /**
   * Update card in cache
   */
  const updateCard = (cardId: string, updates: Partial<CardOverviewItem>) => {
    const cached = cardsCache.value.get(cardId)
    if (cached) {
      cached.data = { ...cached.data, ...updates }
    }
    
    // Also update in list cache
    const index = cardsListCache.value.findIndex(c => c.card_id === cardId)
    if (index !== -1) {
      cardsListCache.value[index] = { ...cardsListCache.value[index], ...updates }
    }
  }

  /**
   * Clear cache
   */
  const clearCache = () => {
    cardsCache.value.clear()
    cardsListCache.value = []
    cardsListLastFetched.value = null
    deviceToCardCache.value.clear()
  }

  // Computed: All cards
  const allCards = computed(() => cardsListCache.value)

  // Computed: Should refresh list
  const shouldRefreshList = computed(() => {
    if (!cardsListLastFetched.value) return true
    const now = new Date()
    return now.getTime() - cardsListLastFetched.value.getTime() > cardsCacheTimeout
  })

  return {
    // State
    cardsCache,
    cardsListCache,
    
    // Computed
    allCards,
    shouldRefreshList,
    
    // Actions
    getCard,
    getCardByDeviceId,
    setCard,
    loadCardsList,
    loadCardDetail,
    updateCard,
    clearCache,
  }
})

