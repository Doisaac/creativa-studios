const DEFAULT_TIME_ZONE = 'America/El_Salvador'

export const formatDateTime = (
  date?: string | null,
  timeZone: string = DEFAULT_TIME_ZONE,
) => {
  if (!date) {
    return 'Fecha no disponible'
  }

  const parsedDate = new Date(date)

  if (Number.isNaN(parsedDate.getTime())) {
    return 'Fecha no disponible'
  }

  try {
    return parsedDate.toLocaleString('es-SV', {
      timeZone,
      dateStyle: 'medium',
      timeStyle: 'short',
      hour12: true,
    })
  } catch {
    return 'Fecha no disponible'
  }
}
