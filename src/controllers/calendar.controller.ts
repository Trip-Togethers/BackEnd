import { Request, Response } from "express";
import { calendarServices } from "../services/calendar.service";
import { StatusCodes } from "http-status-codes";

export const getCalendar = async (
  req: Request,
  res: Response
) => {
  const userId = req.user?.userId;
  if (!userId) {
    return res.status(StatusCodes.NOT_FOUND).json({
      message: "사용자의 아이디를 찾을 수 없습니다."
    })
  }

  try {
    const calendar = await calendarServices.getCalendar(userId);
    
    return res.status(StatusCodes.OK).json({
      message: "일정을 성공적으로 불러왔습니다.",
      calendar,
    });
  } catch (error) {
    console.error(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "일정을 가져오는 데 실패했습니다.",
    });
  }
};
