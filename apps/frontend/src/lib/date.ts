import type { ScheduleTimeBlock } from "../services/api";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString();
}

function formatDayLabel(value: string) {
  return new Date(value).toLocaleDateString([], {
    weekday: "long",
    month: "short",
    day: "numeric"
  });
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit"
  });
}

function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getTotalScheduledHours(timeBlocks: ScheduleTimeBlock[]) {
  const totalMinutes = timeBlocks.reduce((sum, block) => {
    const start = new Date(block.startTime).getTime();
    const end = new Date(block.endTime).getTime();
    return sum + (end - start) / (1000 * 60);
  }, 0);

  return (totalMinutes / 60).toFixed(1);
}

function sortScheduleBlocks(timeBlocks: ScheduleTimeBlock[]) {
  return [...timeBlocks].sort((left, right) => new Date(left.startTime).getTime() - new Date(right.startTime).getTime());
}

export { formatDate, formatDayLabel, formatTime, getTotalScheduledHours, sortScheduleBlocks, toDateInputValue };
