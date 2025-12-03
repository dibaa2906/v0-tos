// Constants for intern attendance system
export const DEPARTMENTS = [
  "Pentadbiran",
  "Kewangan",
  "Teknikal dan Penyelenggaraan",
  "Keselamatan dan Kesihatan",
  "Unit Teknologi Maklumat"
] as const

export type Department = typeof DEPARTMENTS[number]

