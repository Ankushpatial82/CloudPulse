import { Request, Response, NextFunction } from "express";

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("[Unhandled Error]:", err);

  const statusCode = err.statusCode || res.statusCode || 500;
  const message = err.message || "Internal Server Error";

  return res.status(statusCode >= 400 ? statusCode : 500).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};
