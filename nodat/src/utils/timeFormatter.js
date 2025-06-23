export const formatRelativeTime = (isoString) => {
  if (!isoString) return "N/A"

  const date = new Date(isoString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSeconds = Math.round(diffMs / 1000)
  const diffMinutes = Math.round(diffSeconds / 60)
  const diffHours = Math.round(diffMinutes / 60)
  const diffDays = Math.round(diffHours / 24)

  if (diffSeconds < 60) {
    return "Just now"
  } else if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes === 1 ? "" : "s"} ago`
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`
  } else if (diffDays < 30) {
    const weeks = Math.round(diffDays / 7)
    return `${weeks} week${weeks === 1 ? "" : "s"} ago`
  } else if (diffDays < 365) {
    const months = Math.round(diffDays / 30)
    return `${months} month${months === 1 ? "" : "s"} ago`
  } else {
    return date.toLocaleDateString() // Fallback to standard date for older entries
  }
}
