import { Router } from 'express'
import {
  getProjectCategories,
  getProjectCategoryById,
  createProjectCategory,
  updateProjectCategory,
  deleteProjectCategory,
  reorderProjectCategory
} from '../controllers/category.controller.js'
import { validateRequest } from '../../../middlewares/validators.middleware.js'
import { verifyAuth } from '../../../middlewares/verifyAuth.middleware.js'
import { verifyAdmin } from '../../../middlewares/verifyAdmin.middleware.js'
import {
  validateCreateCategory,
  validateUpdateCategory
} from '../validators/category.validators.js'
import { validateReorder } from '../../../utils/reorder/reorder.validator.js'

const router = Router()

router.get('/', getProjectCategories)
router.get('/:id', getProjectCategoryById)

router.post(
  '/',
  verifyAuth,
  verifyAdmin,
  validateRequest(validateCreateCategory),
  createProjectCategory
)

router.put(
  '/:id',
  verifyAuth,
  verifyAdmin,
  validateRequest(validateUpdateCategory),
  updateProjectCategory
)

router.patch(
  '/:id/reorder',
  verifyAuth,
  verifyAdmin,
  validateRequest(validateReorder),
  reorderProjectCategory
)

router.delete(
  '/:id',
  verifyAuth,
  verifyAdmin,
  deleteProjectCategory
)

export default router
