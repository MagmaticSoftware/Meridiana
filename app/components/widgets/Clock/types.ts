export type ClockStyle =
  'minimal' | 'bold' | 'stacked' | 'condensed' | 'flip' | 'analog'

export type DigitalClockStyle = Exclude<ClockStyle, 'flip' | 'analog'>

export interface ClockStyleProps {
  hour12: boolean
  showSeconds: boolean
  showDate: boolean
}
