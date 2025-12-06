// src/utils/autoQuery.ts
// 自动查询历史数据（通过URL参数）

import { useCanvasStore } from '@/stores/radar/canvas';
import { useRadarDataStore } from '@/stores/radar/radarData';

/**
 * 从URL参数自动查询并播放历史数据
 * URL格式：?radarId=RADAR_001&start=1699000000000&end=1699003600000
 */
export async function autoQueryFromURL(): Promise<boolean> {
  const urlParams = new URLSearchParams(window.location.search);
  
  const radarId = urlParams.get('radarId');
  const start = urlParams.get('start');
  const end = urlParams.get('end');
  
  if (!radarId || !start || !end) {
    return false;  // 没有URL参数，跳过
  }
  
  console.log('🔍 URL parameters detected, starting auto-query...', {
    radarId,
    startTime: new Date(parseInt(start)).toLocaleString(),
    endTime: new Date(parseInt(end)).toLocaleString()
  });
  
  try {
    const startTime = parseInt(start);
    const endTime = parseInt(end);
    
    // 调用后端API（简化版：只需RadarID+时间）
    const response = await fetch('/api/radar/playback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        radarId,
        startTime,
        endTime,
      }),
    });
    
    if (!response.ok) {
      throw new Error('Query failed');
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Query failed');
    }
    
    const data = result.data;
    
    // 应用布局
    const canvasStore = useCanvasStore();
    canvasStore.setLayout(data.layout);
    
    // 加载历史数据
    const radarDataStore = useRadarDataStore();
    radarDataStore.setMode('fromserver');
    radarDataStore.loadHistoricalData(data.data);
    
    console.log('✅ Auto-query successful, config applied', {
      radarId: data.radarId,
      dataLength: data.data.length
    });
    
    return true;
  } catch (error: any) {
    console.error('❌ Auto-query failed:', error);
    alert(`Query failed: ${error.message}`);
    return false;
  }
}

/**
 * 构建查询URL（简化版）
 */
export function buildQueryURL(
  radarId: string,
  startTime: number,
  endTime: number
): string {
  const baseURL = window.location.origin + window.location.pathname;
  const params = new URLSearchParams({
    radarId,
    start: startTime.toString(),
    end: endTime.toString(),
  });
  
  return `${baseURL}?${params.toString()}`;
}

