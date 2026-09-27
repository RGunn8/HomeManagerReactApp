import { useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';

type CalendarDatePickerFieldProps = {
    value: Date | null;
    onChange: (date: Date) => void;
    label?: string;
};

const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getCalendarDays(month: Date) {
    const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
    const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    const days: Array<Date | null> = Array.from({ length: firstDay.getDay() }, () => null);

    for (let day = 1; day <= daysInMonth; day += 1) {
        days.push(new Date(month.getFullYear(), month.getMonth(), day));
    }

    return days;
}

function isSameDay(firstDate: Date, secondDate: Date) {
    return firstDate.toDateString() === secondDate.toDateString();
}

export function CalendarDatePickerField({ value, onChange, label = 'Due date (optional)' }: CalendarDatePickerFieldProps) {
    const [visible, setVisible] = useState(false);
    const [draftDate, setDraftDate] = useState(value ?? new Date());
    const [visibleMonth, setVisibleMonth] = useState(new Date((value ?? new Date()).getFullYear(), (value ?? new Date()).getMonth(), 1));

    const openPicker = () => {
        const initialDate = value ?? new Date();
        setDraftDate(initialDate);
        setVisibleMonth(new Date(initialDate.getFullYear(), initialDate.getMonth(), 1));
        setVisible(true);
    };

    const confirmDate = () => {
        onChange(draftDate);
        setVisible(false);
    };

    return (
        <>
            <Pressable
                accessibilityRole="button"
                accessibilityLabel={value ? `Due date ${value.toLocaleDateString()}` : label}
                className="h-[48px] justify-center rounded-input border border-hairline bg-white px-4"
                onPress={openPicker}
            >
                <Text className={`font-sans text-[15px] ${value ? 'text-ink' : 'text-ink-faint'}`}>
                    {value ? value.toLocaleDateString() : label}
                </Text>
            </Pressable>
            <Modal animationType="slide" onRequestClose={() => setVisible(false)} transparent visible={visible}>
                <View className="flex-1 justify-end bg-black/60">
                    <View className="rounded-t-[24px] bg-white px-5 pb-8 pt-5">
                        <View className="mb-5 flex-row items-center justify-between">
                            <Text className="font-serif-semibold text-[22px] text-ink">Choose due date</Text>
                            <View className="flex-row items-center gap-4">
                                <Pressable accessibilityRole="button" onPress={() => setVisible(false)}>
                                    <Text className="font-sans-semibold text-[16px] text-ink-muted">Cancel</Text>
                                </Pressable>
                                <Pressable accessibilityRole="button" onPress={confirmDate}>
                                    <Text className="font-sans-semibold text-[16px] text-forest">Done</Text>
                                </Pressable>
                            </View>
                        </View>
                        <View className="mb-4 flex-row items-center justify-between">
                            <Pressable
                                accessibilityLabel="Previous month"
                                className="h-10 w-10 items-center justify-center rounded-button bg-sage-tint"
                                onPress={() => setVisibleMonth((month) => new Date(month.getFullYear(), month.getMonth() - 1, 1))}
                            >
                                <Text className="text-[22px] text-forest">‹</Text>
                            </Pressable>
                            <Text className="font-sans-semibold text-[17px] text-ink">
                                {visibleMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                            </Text>
                            <Pressable
                                accessibilityLabel="Next month"
                                className="h-10 w-10 items-center justify-center rounded-button bg-sage-tint"
                                onPress={() => setVisibleMonth((month) => new Date(month.getFullYear(), month.getMonth() + 1, 1))}
                            >
                                <Text className="text-[22px] text-forest">›</Text>
                            </Pressable>
                        </View>
                        <View className="mb-2 flex-row">
                            {weekdayLabels.map((day) => (
                                <Text className="w-[14.28%] text-center font-sans-semibold text-[12px] text-ink-muted" key={day}>
                                    {day}
                                </Text>
                            ))}
                        </View>
                        <View className="flex-row flex-wrap">
                            {getCalendarDays(visibleMonth).map((day, index) => {
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);
                                const isPast = day ? day < today : false;
                                const isSelected = day ? isSameDay(day, draftDate) : false;

                                return day ? (
                                    <Pressable
                                        accessibilityRole="button"
                                        accessibilityState={{ disabled: isPast, selected: isSelected }}
                                        className={`mb-2 h-11 w-[14.28%] items-center justify-center ${isSelected ? 'rounded-button bg-forest' : ''}`}
                                        disabled={isPast}
                                        key={day.toISOString()}
                                        onPress={() => setDraftDate(day)}
                                    >
                                        <Text className={`font-sans text-[15px] ${isPast ? 'text-ink-faint' : isSelected ? 'text-white' : 'text-ink'}`}>
                                            {day.getDate()}
                                        </Text>
                                    </Pressable>
                                ) : <View className="mb-2 h-11 w-[14.28%]" key={`empty-${index}`} />;
                            })}
                        </View>
                    </View>
                </View>
            </Modal>
        </>
    );
}
