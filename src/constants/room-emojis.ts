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

export const COMMON_ROOM_EMOJIS = ['🛋️', '🍳', '🛏️', '🛁', '🚗', '🌱', '🧺'];

const defaultRoomEmoji = '🏠';
const emojiOnlyPattern = /^(?:\p{Extended_Pictographic}|\p{Emoji_Component}|\uFE0F|\u200D)+$/u;

export function getRoomEmoji(roomName: string): string {
  return roomEmojiMap.get(roomName.trim().toLowerCase()) ?? defaultRoomEmoji;
}

export function isRoomEmoji(value: string) {
  return emojiOnlyPattern.test(value.trim());
}