import { getProjectsService, getProjectByIdService, createProjectService, updateProjectService, deleteProjectService, getProjectCategoriesService, createProjectCategoryService, updateProjectCategoryService, deleteProjectCategoryService } from '../services/project.service.js';
import { BadRequestError } from '../../../utils/errors.js';
// Helper to safely parse numeric route params
const parseIdParam = (req, paramName = 'id') => {
    const value = req.params[paramName];
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed <= 0) {
        throw new BadRequestError(`Invalid ${paramName} parameter: must be a positive integer`);
    }
    return parsed;
};
// ─────────────────────────────────────────────────────────────────────────────
// Project Category Controllers
// ─────────────────────────────────────────────────────────────────────────────
export const getProjectCategories = async (_req, res, next) => {
    try {
        const categories = await getProjectCategoriesService();
        res.status(200).json({ categories });
    }
    catch (error) {
        next(error);
    }
};
export const createProjectCategory = async (req, res, next) => {
    try {
        const category = await createProjectCategoryService(req.body);
        res.status(201).json({
            category,
            message: 'Project category created successfully'
        });
    }
    catch (error) {
        next(error);
    }
};
export const updateProjectCategory = async (req, res, next) => {
    try {
        const id = parseIdParam(req);
        const category = await updateProjectCategoryService(id, req.body);
        res.status(200).json({
            category,
            message: 'Project category updated successfully'
        });
    }
    catch (error) {
        next(error);
    }
};
export const deleteProjectCategory = async (req, res, next) => {
    try {
        const id = parseIdParam(req);
        await deleteProjectCategoryService(id);
        res.status(200).json({
            message: 'Project category deleted successfully'
        });
    }
    catch (error) {
        next(error);
    }
};
// ─────────────────────────────────────────────────────────────────────────────
// Project Controllers
// ─────────────────────────────────────────────────────────────────────────────
export const getProjects = async (req, res, next) => {
    try {
        // If request does not have an authenticated admin user, filter by active projects
        const isPublic = !req.user || req.user.role !== 'ADMIN';
        const projects = await getProjectsService(isPublic);
        res.status(200).json({ projects });
    }
    catch (error) {
        next(error);
    }
};
export const getProjectById = async (req, res, next) => {
    try {
        const id = parseIdParam(req);
        const project = await getProjectByIdService(id);
        res.status(200).json({ project });
    }
    catch (error) {
        next(error);
    }
};
export const createProject = async (req, res, next) => {
    try {
        const project = await createProjectService(req.body);
        res.status(201).json({
            project,
            message: 'Project created successfully'
        });
    }
    catch (error) {
        next(error);
    }
};
export const updateProject = async (req, res, next) => {
    try {
        const id = parseIdParam(req);
        const project = await updateProjectService(id, req.body);
        res.status(200).json({
            project,
            message: 'Project updated successfully'
        });
    }
    catch (error) {
        next(error);
    }
};
export const deleteProject = async (req, res, next) => {
    try {
        const id = parseIdParam(req);
        await deleteProjectService(id);
        res.status(200).json({
            message: 'Project deleted successfully'
        });
    }
    catch (error) {
        next(error);
    }
};
