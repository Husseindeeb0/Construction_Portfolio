import { getHeroService, createHeroService, updateHeroService, deleteHeroService } from '../services/hero.service.js';
/**
 * GET /api/hero
 * Public retrieval of Hero section and statistics
 */
export const getHero = async (_req, res, next) => {
    try {
        const hero = await getHeroService();
        res.status(200).json({ hero });
    }
    catch (error) {
        next(error);
    }
};
/**
 * POST /api/hero
 * Protected creation of Hero section
 */
export const createHero = async (req, res, next) => {
    try {
        const hero = await createHeroService(req.body);
        res.status(201).json({
            hero,
            message: 'Hero section created successfully'
        });
    }
    catch (error) {
        next(error);
    }
};
/**
 * PUT /api/hero
 * Protected update of Hero section
 */
export const updateHero = async (req, res, next) => {
    try {
        const hero = await updateHeroService(req.body);
        res.status(200).json({
            hero,
            message: 'Hero section updated successfully'
        });
    }
    catch (error) {
        next(error);
    }
};
/**
 * DELETE /api/hero
 * Protected deletion of Hero section
 */
export const deleteHero = async (_req, res, next) => {
    try {
        await deleteHeroService();
        res.status(200).json({
            message: 'Hero section deleted successfully'
        });
    }
    catch (error) {
        next(error);
    }
};
