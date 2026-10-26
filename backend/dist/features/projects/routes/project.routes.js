import { Router } from 'express';
import { getProjects, getProjectById, createProject, updateProject, deleteProject, getProjectCategories, createProjectCategory, updateProjectCategory, deleteProjectCategory } from '../controllers/project.controller.js';
import { validateRequest } from '../../../middlewares/validators.middleware.js';
import { verifyAuth } from '../../../middlewares/verifyAuth.middleware.js';
import { verifyAdmin } from '../../../middlewares/verifyAdmin.middleware.js';
import { validateCreateProject, validateUpdateProject, validateCreateProjectCategory, validateUpdateProjectCategory } from '../validators/project.validators.js';
const router = Router();
// ─────────────────────────────────────────────────────────────────────────────
// Category Routes
// (Registered BEFORE /:id to prevent "categories" from matching numeric :id)
// ─────────────────────────────────────────────────────────────────────────────
// Public: get project categories (used by public filters and admin dropdowns)
router.get('/categories', getProjectCategories);
// Admin: category mutations
router.post('/categories', verifyAuth, verifyAdmin, validateRequest(validateCreateProjectCategory), createProjectCategory);
router.put('/categories/:id', verifyAuth, verifyAdmin, validateRequest(validateUpdateProjectCategory), updateProjectCategory);
router.delete('/categories/:id', verifyAuth, verifyAdmin, deleteProjectCategory);
// ─────────────────────────────────────────────────────────────────────────────
// Project Routes
// ─────────────────────────────────────────────────────────────────────────────
// Public: get projects list & get project by id
router.get('/', getProjects);
router.get('/:id', getProjectById);
// Admin: project mutations
router.post('/', verifyAuth, verifyAdmin, validateRequest(validateCreateProject), createProject);
router.put('/:id', verifyAuth, verifyAdmin, validateRequest(validateUpdateProject), updateProject);
router.delete('/:id', verifyAuth, verifyAdmin, deleteProject);
export default router;
