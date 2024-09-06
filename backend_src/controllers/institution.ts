import { Request, Response } from 'express';
import db from '../models/index'
import Joi from 'joi';
const { QueryTypes } = require('sequelize');

const institutionSchema = Joi.object({
    name: Joi.string().required(),
    description: Joi.string().required(),
    location: Joi.string().required(),
    accreditation: Joi.string().required(),
});

export default {
    createInstitution: async (req: Request, res: Response) => {
        try {
            const { error } = institutionSchema.validate(req.body);
            if (error) {
                return res.status(400).json({ error: error.details[0].message });
            }


            const institution = await db.institution.create(req.body);
            res.status(201).json(institution);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },
    getInstitutions: async (req: Request, res: Response) => {
        try {
            const institutions = await db.institution.findAll({
                include: [{
                    model: db.certificate,
                }]
            });
            const certificateCount = await db.certificate.count({});

            const certificateIssuedCount = await db.certification_pivot.count();

            const individualsAssociatedCount = await db.individual.count();
            res.json([institutions, {'individuals': individualsAssociatedCount, 'issued': certificateIssuedCount, 'certificates':certificateCount}]);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },

    getInstitutionById: async (req: Request, res: Response) => {
        const { id } = req.params;
        try {
            const institution = await db.institution.findByPk(id, {
                include: [{
                    model: db.certificate,
                }]
            });

            const certificateCount = await db.certificate.count({
                where: {
                    institutionId: id
                }
            });

            const certificateIssuedCount = await db.sequelize.query(`
              SELECT COUNT(*) as count
              FROM Certification_Pivots AS cp
              JOIN Certificates AS c ON cp.CertificateId = c.id
              WHERE c.InstitutionId = :institutionId
            `, {
                replacements: { institutionId: id },
                type: QueryTypes.SELECT
            })

            const individualsAssociatedCount = await db.individual.count({
                include: [{
                    model: db.certificate,
                    where: {
                        institutionId: id
                    },
                    through: {
                        attributes: []
                    }
                }],
                distinct: true
            });

            if (!institution) {
                return res.status(404).json({ message: 'Institution not found' });
            }
            res.json([[institution],  {'individuals': individualsAssociatedCount, 'issued': certificateIssuedCount[0].count, 'certificates':certificateCount}]);

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },
    updateInstitution: async (req: Request, res: Response) => {
        const { id } = req.params;
        try {
            const [updated] = await db.institution.update(req.body, { where: { id } });
            if (!updated) {
                return res.status(404).json({ message: 'Institution not found' });
            }
            const updatedInstitution = await db.institution.findByPk(id);
            res.json(updatedInstitution);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },
    deleteInstitution: async (req: Request, res: Response) => {
        const { id } = req.params;
        try {
            const deleted = await db.institution.destroy({ where: { id } });
            if (!deleted) {
                return res.status(404).json({ message: 'Institution not found' });
            }
            res.json({ message: 'Institution deleted successfully' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },
}