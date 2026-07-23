export function resolveImageUrl(imageUrl?: string | null): string | undefined {
  const normalizedImageUrl = imageUrl?.trim()
  if (!normalizedImageUrl) return undefined

  if (/^https?:\/\//i.test(normalizedImageUrl)) {
    return normalizedImageUrl
  }

  const apiBaseUrl = String(import.meta.env.VITE_API_BASE_URL ?? '')
    .trim()
    .replace(/\/+$/, '')
  const imagePath = normalizedImageUrl.replace(/^\/+/, '')

  if (!apiBaseUrl) {
    return `/${imagePath}`
  }

  return `${apiBaseUrl}/${imagePath}`
}
