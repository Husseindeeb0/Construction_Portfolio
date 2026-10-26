import { Router } from 'express'
import {
  getServiceSection,
  createServiceSection,
  updateServiceSection,
  deleteServiceSection,
  reorderServiceItem
} from '../controllers/serviceSection.controller.js'
import { validateRequest } from '../../../middlewares/validators.middleware.js'
import { verifyAuth } from '../../../middlewares/verifyAuth.middleware.js'
import { verifyAdmin } from '../../../middlewares/verifyAdmin.middleware.js'
import {
  validateCreateServiceSection,
  validateUpdateServiceSection
} from '../validators/serviceSection.validators.js'
import { validateReorder } from '../../../utils/reorder/reorder.validator.js'

const router = Router()

router.get('/', getServiceSection)

router.post(
  '/',
  verifyAuth,
  verifyAdmin,
  validateRequest(validateCreateServiceSection),
  createServiceSection
)

router.put(
  '/',
  verifyAuth,
  verifyAdmin,
  validateRequest(validateUpdateServiceSection),
  updateServiceSection
)

router.patch(
  '/items/:id/reorder',
  verifyAuth,
  verifyAdmin,
  validateRequest(validateReorder),
  reorderServiceItem
)

router.delete('/', verifyAuth, verifyAdmin, deleteServiceSection)

export default router
