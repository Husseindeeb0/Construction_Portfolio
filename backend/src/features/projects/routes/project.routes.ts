import { Router } from 'express'
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  reorderProject
} from '../controllers/project.controller.js'
import { validateRequest } from '../../../middlewares/validators.middleware.js'
import { verifyAuth } from '../../../middlewares/verifyAuth.middleware.js'
import { verifyAdmin } from '../../../middlewares/verifyAdmin.middleware.js'
import {
  validateCreateProject,
  validateUpdateProject
} from '../validators/project.validators.js'
import { validateReorder } from '../../../utils/reorder/reorder.validator.js'

const router = Router()

router.get('/', getProjects)
router.get('/:id', getProjectById)

router.post(
  '/',
  verifyAuth,
  verifyAdmin,
  validateRequest(validateCreateProject),
  createProject
)

router.put(
  '/:id',
  verifyAuth,
  verifyAdmin,
  validateRequest(validateUpdateProject),
  updateProject
)

router.patch(
  '/:id/reorder',
  verifyAuth,
  verifyAdmin,
  validateRequest(validateReorder),
  reorderProject
)

router.delete(
  '/:id',
  verifyAuth,
  verifyAdmin,
  deleteProject
)

export default router
