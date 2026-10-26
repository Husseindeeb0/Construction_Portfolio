import { Router } from 'express'
import {
  getAbout,
  createAbout,
  updateAbout,
  deleteAbout,
  reorderAboutFeature
} from '../controllers/about.controller.js'
import { validateRequest } from '../../../middlewares/validators.middleware.js'
import { verifyAuth } from '../../../middlewares/verifyAuth.middleware.js'
import { verifyAdmin } from '../../../middlewares/verifyAdmin.middleware.js'
import {
  validateCreateAbout,
  validateUpdateAbout
} from '../validators/about.validators.js'
import { validateReorder } from '../../../utils/reorder/reorder.validator.js'

const router = Router()

router.get('/', getAbout)

router.post(
  '/',
  verifyAuth,
  verifyAdmin,
  validateRequest(validateCreateAbout),
  createAbout
)

router.put(
  '/',
  verifyAuth,
  verifyAdmin,
  validateRequest(validateUpdateAbout),
  updateAbout
)

router.delete('/', verifyAuth, verifyAdmin, deleteAbout)

router.patch(
  '/features/:id/reorder',
  verifyAuth,
  verifyAdmin,
  validateRequest(validateReorder),
  reorderAboutFeature
)

export default router
