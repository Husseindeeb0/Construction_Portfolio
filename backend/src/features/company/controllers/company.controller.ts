import { Request, Response, NextFunction } from "express";
import {
  getCompanyService,
  createCompanyService,
  updateCompanyService,
  deleteCompanyService,
} from "../services/company.service.js";

/**
 * GET /api/company
 * Public retrieval of company profile
 */
export const getCompany = async (
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const profile = await getCompanyService();
    res.status(200).json({ profile });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/company
 * Protected creation of company profile
 */
export const createCompany = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const profile = await createCompanyService(req.body);
    res.status(201).json({
      profile,
      message: "Company profile created successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/company
 * Protected update of company profile
 */
export const updateCompany = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const profile = await updateCompanyService(req.body);
    res.status(200).json({
      profile,
      message: "Company profile updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/company
 * Protected deletion of company profile
 */
export const deleteCompany = async (
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    await deleteCompanyService();
    res.status(200).json({
      message: "Company profile deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
