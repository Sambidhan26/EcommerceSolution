export function normalizeRoles(value: unknown): string[] {
  if (typeof value === 'string') {
    const role = value.trim()
    return role ? [role] : []
  }

  if (Array.isArray(value)) {
    return value
      .filter((role): role is string => typeof role === 'string')
      .map((role) => role.trim())
      .filter(Boolean)
  }

  return []
}

export function hasRole(value: unknown, expectedRole: string) {
  const expected = expectedRole.trim().toLowerCase()
  return normalizeRoles(value).some((role) => role.toLowerCase() === expected)
}
