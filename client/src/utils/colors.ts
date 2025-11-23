// Predefined colors for user cursors
const CURSOR_COLORS = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#45B7D1', // Blue
  '#FFA07A', // Light Salmon
  '#98D8C8', // Mint
  '#F7DC6F', // Yellow
  '#BB8FCE', // Purple
  '#85C1E2', // Sky Blue
  '#F8B739', // Orange
  '#52B788', // Green
];

const userColors = new Map<string, string>();
let colorIndex = 0;

export function getUserColor(userId: string): string {
  if (userColors.has(userId)) {
    return userColors.get(userId)!;
  }

  const color = CURSOR_COLORS[colorIndex % CURSOR_COLORS.length];
  colorIndex++;
  userColors.set(userId, color);

  return color;
}

export function removeUserColor(userId: string): void {
  userColors.delete(userId);
}
