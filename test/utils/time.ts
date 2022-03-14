import type { Dayjs } from 'dayjs'

export const wait = (ms: number) => {
  return new Promise<void>(resolve => {
    setTimeout(resolve, ms)
  })
}

export const toUTC = (dayjs: Dayjs): Dayjs => {
  const utcMinutesOffset = dayjs.utcOffset()
  return dayjs.add(utcMinutesOffset, 'minutes')
}
