import { parseISO, isSameDay } from "date-fns";
import { Detaile } from "../entities/detail.schedule.entity";

export const generateFormattedDates = (
  startDate: Date,
  endDate: Date
): string[] => {
  const dates: string[] = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    // YYYY-MM-DD 포맷으로 변환하여 추가
    dates.push(currentDate.toISOString().split("T")[0]);
    currentDate.setDate(currentDate.getDate() + 1); // 하루씩 증가
  }
  return dates;
};

export const findDetailedSchedules = (
  detaList: string[],
  detailedSchedule: Detaile[]
) => {
  return detaList.map((currentDate) => {
    const currentDateObj = parseISO(`${currentDate}T00:00:00`);
    const matchingDates = detailedSchedule.filter((details) => {
      const scheduleDate = details.schedule_date;
      return isSameDay(scheduleDate, currentDateObj);
    });
    return {
      scheduleDate: currentDate, // 날짜
      currentDate:
        matchingDates.length > 0 ? matchingDates : "No detail available", // 해당 날짜의 상세 일정들
    };
  });
};

// 날짜를 UTC로 변환하는 함수
export const convertToUTC = (date: string): Date => {
  const dateObj = parseISO(date); // 받은 날짜 문자열을 Date 객체로 변환
  return new Date(Date.UTC(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate())); // UTC로 변환
};

// 날짜가 범위 안에 있는지 확인하는 함수
export const isDateInRange = (scheduleDate: Date, startDate: Date, endDate: Date): boolean => {
    const formattedScheduleDate = scheduleDate.toISOString().split('T')[0];
    const formattedStartDate = startDate.toISOString().split('T')[0];
    const formattedEndDate = endDate.toISOString().split('T')[0];
    
    return formattedScheduleDate >= formattedStartDate && formattedScheduleDate <= formattedEndDate;
}; 