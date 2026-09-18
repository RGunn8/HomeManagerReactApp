export const suggestedRooms = ['Living Room', 'Kitchen', 'Bedroom', 'Bathroom'];

const defaultTasksByRoom = {
  'Living Room': [
    { name: 'Tidy the living room', interval: 'day' },
    { name: 'Vacuum the floors', interval: 'week' },
    { name: 'Water the plants', interval: 'week' },
  ],
  Kitchen: [
    { name: 'Wipe the counters', interval: 'day' },
    { name: 'Load the dishwasher', interval: 'day' },
    { name: 'Clean the fridge', interval: 'month' },
  ],
  Bedroom: [
    { name: 'Make the bed', interval: 'day' },
    { name: 'Change the sheets', interval: 'week' },
    { name: 'Put away laundry', interval: 'week' },
  ],
  Bathroom: [
    { name: 'Clean the toilet', interval: 'week' },
    { name: 'Clean the mirror', interval: 'week' },
    { name: 'Restock toiletries', interval: 'month' },
  ],
} as const;

export type DefaultRoomTask = { name: string; interval: string; checked: boolean };

export function getDefaultTasks(roomName: string): DefaultRoomTask[] {
  return (defaultTasksByRoom[roomName as keyof typeof defaultTasksByRoom] ?? []).map((task) => ({
    ...task,
    checked: false,
  }));
}