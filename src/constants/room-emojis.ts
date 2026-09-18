export const roomEmojiMap = new Map<string, string>([
  ['bathroom', '🛁'],
  ['bedroom', '🛏️'],
  ['dining room', '🍽️'],
  ['garage', '🚗'],
  ['garden', '🌱'],
  ['kitchen', '🍳'],
  ['laundry room', '🧺'],
  ['living room', '🛋️'],
  ['office', '💻'],
    ['playroom', '🧸'],
    ['storage room', '📦'],
    ['basement', '🏚️'],
    ['kids room', '🧒'],
    ['guest room', '🛌'],
    ['attic', '🏠'],
    ['home gym', '🏋️‍♂️'],
    ['library', '📚'],
    ['pantry', '🥫'],
    ['sunroom', '☀️'],
    ['home theater', '🎬'],
    ['mudroom', '🧹'],
    ['nursery', '👶'],
    ['wine cellar', '🍷'], 
    ['main bathroom', '🛁'],
    ['master bedroom', '🛏️'],
    ['guest bathroom', '🚿'],
    ['home office', '💼'],
]);

const defaultRoomEmoji = '🏠';

export function getRoomEmoji(roomName: string): string {
  return roomEmojiMap.get(roomName.trim().toLowerCase()) ?? defaultRoomEmoji;
}