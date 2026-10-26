import { Router } from "express";
import {
  getCompany,
  createCompany,
  updateCompany,
  deleteCompany,
} from "../controllers/company.controller.js";
import { validateRequest } from "../../../middlewares/validators.middleware.js";
import { verifyAuth } from "../../../middlewares/verifyAuth.middleware.js";
import { verifyAdmin } from "../../../middlewares/verifyAdmin.middleware.js";
import {
  validateCreateCompany,
  validateUpdateCompany,
} from "../validators/company.validators.js";

const router = Router();

router.get("/", getCompany);

router.post(
  "/",
  verifyAuth,
  verifyAdmin,
  validateRequest(validateCreateCompany),
  createCompany,
);

router.put(
  "/",
  verifyAuth,
  verifyAdmin,
  validateRequest(validateUpdateCompany),
  updateCompany,
);

router.delete("/", verifyAuth, verifyAdmin, deleteCompany);

export default router;
