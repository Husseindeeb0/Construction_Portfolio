import { Router } from 'express'
import {
  getTrackRecordSection,
  createTrackRecordSection,
  updateTrackRecordSection,
  deleteTrackRecordSection,
  reorderTrackRecordStat
} from '../controllers/trackRecordSection.controller.js'
import { validateRequest } from '../../../middlewares/validators.middleware.js'
import { verifyAuth } from '../../../middlewares/verifyAuth.middleware.js'
import { verifyAdmin } from '../../../middlewares/verifyAdmin.middleware.js'
import {
  validateCreateTrackRecordSection,
  validateUpdateTrackRecordSection
} from '../validators/trackRecord.validators.js'
import { validateReorder } from '../../../utils/reorder/reorder.validator.js'

const router = Router()

router.get('/', getTrackRecordSection)

router.post(
  '/',
  verifyAuth,
  verifyAdmin,
  validateRequest(validateCreateTrackRecordSection),
  createTrackRecordSection
)

router.put(
  '/',
  verifyAuth,
  verifyAdmin,
  validateRequest(validateUpdateTrackRecordSection),
  updateTrackRecordSection
)

router.patch(
  '/stats/:id/reorder',
  verifyAuth,
  verifyAdmin,
  validateRequest(validateReorder),
  reorderTrackRecordStat
)

router.delete('/', verifyAuth, verifyAdmin, deleteTrackRecordSection)

export default router
