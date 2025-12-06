import dayjs, { type Dayjs } from 'dayjs'
import duration from 'dayjs/plugin/duration'
import utc from 'dayjs/plugin/utc'
dayjs.extend(duration)
dayjs.extend(utc)

export function formatDateToHHmm(date: Date): string {
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}

export function formatDateToNumber(date: Dayjs | null): number {
  if (!date) return 0
  const year = date.year()
  const month = date.month() + 1
  const day = date.date()
  return year * 10000 + month * 100 + day
}

export function formatDate(date: number, format: string): string {
  return dayjs(date).format(format)
}

export function formatNumberToDate(number: number): Dayjs {
  const year = Math.floor(number / 10000)
  const month = Math.floor((number % 10000) / 100)
  const day = number % 100
  return dayjs(`${year}-${month}-${day}`)
}

export function formatTimestampToTime(timestamp: number): string {
  return dayjs(timestamp * 1000).format('HH:mm:ss')
}

export function formatTimestampToDate(timestamp: number, spliter = '-'): string {
  return dayjs(timestamp * 1000).format(`YYYY${spliter}MM${spliter}DD`)
}

export function formatTimestampToDatetime(timestamp: number): string {
  return dayjs(timestamp * 1000).format('YYYY-MM-DD HH:mm:ss')
}

const genderMap: Record<number, string> = {
  1: 'Male',
  2: 'Female',
}

export function genderToString(gender: number): string {
  return genderMap[gender] || 'Unknown'
}

export function calculateAge(birthday: number): number {
  const today = new Date()
  const dateString = birthday.toString()
  const year = Number(dateString.slice(0, 4))
  const month = Number(dateString.slice(4, 6))
  const day = Number(dateString.slice(6, 8))
  const birthDate = new Date(year, month - 1, day)
  let age = today.getFullYear() - birthDate.getFullYear()
  const m = today.getMonth() - birthDate.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  return age
}



