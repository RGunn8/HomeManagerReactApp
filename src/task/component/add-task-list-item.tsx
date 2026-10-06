import { useState } from 'react';
import { InputAccessoryView, Keyboard, Modal, Platform, Pressable, Text, TextInput, View } from 'react-native';

type IntervalUnit = 'day' | 'week' | 'month' | 'year';

type AddTaskListItemProps = {
    taskTitle: string;
    intervalCount: string;
    intervalUnit: IntervalUnit;
    repeats: boolean;
    scheduledDate: Date | null;
    onTaskTitleChange: (value: string) => void;
    onIntervalCountChange: (value: string) => void;
    onIntervalUnitChange: (value: IntervalUnit) => void;
    onRepeatsChange: (value: boolean) => void;
    onScheduledDateChange: (value: Date | null) => void;
    onSubmitEditing: () => void;
};

const intervalUnits: IntervalUnit[] = ['day', 'week', 'month', 'year'];
const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function isSameDay(firstDate: Date, secondDate: Date) {
    return firstDate.toDateString() === secondDate.toDateString();
}

function getCalendarDays(month: Date) {
    const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
    const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    const days: Array<Date | null> = Array.from({ length: firstDay.getDay() }, () => null);

    for (let day = 1; day <= daysInMonth; day += 1) {
        days.push(new Date(month.getFullYear(), month.getMonth(), day));
    }

    return days;
}

export function AddTaskListItem({
    taskTitle,
    intervalCount,
    intervalUnit,
    repeats,
    scheduledDate,
    onTaskTitleChange,
    onIntervalCountChange,
    onIntervalUnitChange,
    onRepeatsChange,
    onScheduledDateChange,
    onSubmitEditing,
}: AddTaskListItemProps) {
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [draftDate, setDraftDate] = useState(scheduledDate ?? new Date());
    const [visibleMonth, setVisibleMonth] = useState(new Date());

    const openDatePicker = () => {
        const date = scheduledDate ?? new Date();
        setDraftDate(date);
        setVisibleMonth(new Date(date.getFullYear(), date.getMonth(), 1));
        setShowDatePicker(true);
    };

    const confirmDate = () => {
        onScheduledDateChange(draftDate);
        setShowDatePicker(false);
    };

    return (
        <View className="gap-3 rounded-lg border border-dashed border-hairline bg-transparent p-3">
            <TextInput
                accessibilityLabel="Task title"
                className="h-[48px] rounded-input border border-hairline bg-white px-4 font-sans text-[16px] text-ink placeholder:text-ink-faint"
                onChangeText={onTaskTitleChange}
                onSubmitEditing={onSubmitEditing}
                placeholder="Task title"
                returnKeyType="next"
                value={taskTitle}
            />
            <View className="gap-2">
                <Text className="font-sans-semibold text-[14px] text-ink">Repeat task</Text>
                <View className="flex-row gap-2">
                    <Pressable
                        accessibilityRole="button"
                        accessibilityState={{ selected: !repeats }}
                        className={`flex-1 items-center rounded-button px-3 py-2 ${!repeats ? 'bg-forest' : 'bg-sage-tint'}`}
                        onPress={() => onRepeatsChange(false)}
                    >
                        <Text className={`font-sans-semibold text-[14px] ${!repeats ? 'text-white' : 'text-ink-muted'}`}>
                            Never
                        </Text>
                    </Pressable>
                    <Pressable
                        accessibilityRole="button"
                        accessibilityState={{ selected: repeats }}
                        className={`flex-1 items-center rounded-button px-3 py-2 ${repeats ? 'bg-forest' : 'bg-sage-tint'}`}
                        onPress={() => onRepeatsChange(true)}
                    >
                        <Text className={`font-sans-semibold text-[14px] ${repeats ? 'text-white' : 'text-ink-muted'}`}>
                            Every
                        </Text>
                    </Pressable>
                </View>
            </View>
            {repeats && (
                <View className="flex-row items-center gap-2">
                    <Text className="font-sans text-[15px] text-ink-muted">Every</Text>
                    <TextInput
                        accessibilityLabel="Interval count"
                        className="h-10 w-16 rounded-input border border-hairline bg-white px-2 text-center font-sans text-[15px] text-ink placeholder:text-ink-faint"
                        inputAccessoryViewID="repeat-interval-accessory"
                        keyboardType="number-pad"
                        onChangeText={onIntervalCountChange}
                        onSubmitEditing={() => Keyboard.dismiss()}
                        placeholder="1"
                        returnKeyType="done"
                        value={intervalCount}
                    />
                    <View className="flex-1 flex-row gap-1">
                        {intervalUnits.map((unit) => (
                            <Pressable
                                accessibilityRole="button"
                                accessibilityState={{ selected: intervalUnit === unit }}
                                className={`flex-1 items-center rounded-button px-1 py-2 ${intervalUnit === unit ? 'bg-forest' : 'bg-sage-tint'}`}
                                key={unit}
                                onPress={() => onIntervalUnitChange(unit)}
                            >
                                <Text className={`font-sans text-[12px] ${intervalUnit === unit ? 'text-white' : 'text-ink-muted'}`}>
                                    {unit}
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                </View>
            )}
            {Platform.OS === 'ios' && (
                <InputAccessoryView nativeID="repeat-interval-accessory">
                    <View className="flex-row justify-end border-t border-hairline bg-white px-4 py-2">
                        <Pressable
                            accessibilityRole="button"
                            className="rounded-button bg-forest px-4 py-2"
                            onPress={() => Keyboard.dismiss()}
                        >
                            <Text className="font-sans-semibold text-[14px] text-white">Done</Text>
                        </Pressable>
                    </View>
                </InputAccessoryView>
            )}
            <Pressable
                accessibilityRole="button"
                accessibilityLabel="Schedule task date"
                className="h-10 justify-center rounded-input border border-hairline bg-white px-3"
                onPress={openDatePicker}
            >
                <Text className="font-sans text-[15px] text-ink-muted">
                    {scheduledDate ? `Scheduled for ${scheduledDate.toLocaleDateString()}` : 'Schedule date'}
                </Text>
            </Pressable>
            <Modal animationType="slide" onRequestClose={() => setShowDatePicker(false)} transparent visible={showDatePicker}>
                <View className="flex-1 justify-end bg-black/60">
                    <View className="rounded-t-[24px] bg-white px-5 pb-8 pt-5">
                        <View className="mb-5 flex-row items-center justify-between">
                            <Text className="font-serif-semibold text-[22px] text-ink">Schedule date</Text>
                            <View className="flex-row items-center gap-4">
                                <Pressable accessibilityRole="button" onPress={() => setShowDatePicker(false)}>
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
                                const isPast = day ? day < new Date(new Date().setHours(0, 0, 0, 0)) : false;
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
        </View>
    );
}
