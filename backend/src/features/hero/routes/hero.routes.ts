import { Router } from "express";
import {
  getHero,
  createHero,
  updateHero,
  deleteHero,
  reorderHeroStat
} from "../controllers/hero.controller.js";
import { validateRequest } from "../../../middlewares/validators.middleware.js";
import { verifyAuth } from "../../../middlewares/verifyAuth.middleware.js";
import { verifyAdmin } from "../../../middlewares/verifyAdmin.middleware.js";
import {
  validateCreateHero,
  validateUpdateHero,
} from "../validators/hero.validators.js";
import { validateReorder } from "../../../utils/reorder/reorder.validator.js";

const router = Router();

router.get("/", getHero);

router.post(
  "/",
  verifyAuth,
  verifyAdmin,
  validateRequest(validateCreateHero),
  createHero,
);

router.put(
  "/",
  verifyAuth,
  verifyAdmin,
  validateRequest(validateUpdateHero),
  updateHero,
);

router.patch(
  "/stats/:id/reorder",
  verifyAuth,
  verifyAdmin,
  validateRequest(validateReorder),
  reorderHeroStat
);

router.delete("/", verifyAuth, verifyAdmin, deleteHero);

export default router;
