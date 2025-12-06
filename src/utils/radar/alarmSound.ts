// src/utils/alarmSound.ts
// 报警声管理

// 使用 new URL() 方式导入音频文件（Vite 推荐方式，使用相对路径）
const L1_alarm = new URL('../../assets/alarms/L1_alarm.mp3', import.meta.url).href;
const L2_alarm = new URL('../../assets/alarms/L2_alarm.mp3', import.meta.url).href;

class AlarmSound {
  private l1Audio: HTMLAudioElement;
  private l2Audio: HTMLAudioElement;
  private isPlaying: boolean = false;
  private currentLevel: number = 1;

  constructor() {
    // 预加载音频文件
    this.l1Audio = new Audio(L1_alarm);
    this.l2Audio = new Audio(L2_alarm);
    
    this.l1Audio.volume = 0.7;
    this.l2Audio.volume = 0.7;
    
    this.l1Audio.preload = 'auto';
    this.l2Audio.preload = 'auto';
  }

  // 播放报警声
  playAlarm(level: number = 1) {
    if (this.isPlaying) return;
    
    this.isPlaying = true;
    this.currentLevel = level;
    
    const audio = level === 2 ? this.l2Audio : this.l1Audio;
    
    // 重置播放位置
    audio.currentTime = 0;
    
    // 播放音频
    audio.play().catch(err => {
      console.warn('Alarm sound playback failed:', err);
      this.isPlaying = false;
    });
    
    // 播放结束后重置状态
    audio.onended = () => {
      this.isPlaying = false;
    };
  }

  // 播放L1报警（一级报警）
  playL1() {
    this.playAlarm(1);
  }

  // 播放L2报警（二级报警）
  playL2() {
    this.playAlarm(2);
  }

  // 停止报警声
  stopAlarm() {
    this.l1Audio.pause();
    this.l2Audio.pause();
    this.l1Audio.currentTime = 0;
    this.l2Audio.currentTime = 0;
    this.isPlaying = false;
  }
  
  // 设置音量（0.0 - 1.0）
  setVolume(volume: number) {
    this.l1Audio.volume = Math.max(0, Math.min(1, volume));
    this.l2Audio.volume = Math.max(0, Math.min(1, volume));
  }
}

export const alarmSound = new AlarmSound();

