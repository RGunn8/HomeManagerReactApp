import { getRoomEmoji } from '@/constants/room-emojis';
import type { ApiRoom } from '@/lib/api-types';

export type HomeRoom = {
    id: string;
    name: string;
    icon: string;
    numOfTask: number;
    numOfItems: number;
    numOfLowItems: number;
};

export function getRoomIcon(room: Pick<ApiRoom, 'name' | 'roomEmoji'>) {
    return room.roomEmoji || getRoomEmoji(room.name);
}
