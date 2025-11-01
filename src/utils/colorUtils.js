// Utility to generate a consistent color based on a string (like model name)
export function stringToColor(str) {
  if (!str) return '#6b7280' // default gray if no string

  // Simple hash function to convert string to number
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
    hash = hash & hash // Convert to 32bit integer
  }

  // Generate HSL color with fixed saturation and lightness for pleasant colors
  const hue = Math.abs(hash % 360)
  const saturation = 65 // 65% saturation for vibrant but not overwhelming colors
  const lightness = 55 // 55% lightness for good contrast with white text

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`
}

// Generate a very light background color for the panel that matches the header theme
export function stringToPanelBackground(str) {
  if (!str) return '#fafafa' // default light gray if no string

  // Simple hash function to convert string to number
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
    hash = hash & hash // Convert to 32bit integer
  }

  // Generate HSL color with same hue as header but very light
  const hue = Math.abs(hash % 360)
  const saturation = 20 // Lower saturation for subtle background
  const lightness = 97 // Very light for background

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`
}

// Get contrasting text color (white or black) based on background
export function getContrastColor(backgroundColor) {
  // For HSL colors, we can use a simple rule: if lightness < 60%, use white, else black
  const lightnessMatch = backgroundColor.match(/(\d+)%\)$/)
  if (lightnessMatch) {
    const lightness = parseInt(lightnessMatch[1])
    return lightness < 60 ? '#ffffff' : '#000000'
  }
  return '#ffffff' // default to white
}

