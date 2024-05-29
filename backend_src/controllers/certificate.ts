import { Request, Response } from 'express';
import db from '../models';
import Joi, { required } from 'joi';

const certificateSchema = Joi.object({
    certificate: Joi.string().required(),
    prefix: Joi.string().required(),
    count: Joi.number(),
    category: Joi.string().required(),
    description: Joi.string().required(),
    InstitutionId: Joi.string().allow(null)
});

export default {

    createCertificate: async (req: Request, res: Response) => {
        try {
            if (req.decodedToken?.role == "organization") req.body.InstitutionId = req.decodedToken.InstitutionID
            const { error } = certificateSchema.validate(req.body);
            if (error) {
                return res.status(400).json({ error: error.details[0].message });
            }

            const certificate = await db.certificate.create(req.body);
            res.status(201).json(certificate);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },
    getCertificates: async (req: Request, res: Response) => {
        try {

            if (req.decodedToken?.role === "organization") {
                const query = {
                    where: {
                        InstitutionId: req.decodedToken.InstitutionID
                    }
                };

                const certificates = await db.certificate.findAll({
                    include: [{
                        model: db.institution,
                    }],
                    ...query
                });
                res.json(certificates);
            } else {
                const certificates = await db.certificate.findAll({
                    include: [{
                        model: db.institution,
                    }]
                });
                res.json(certificates);

            }

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },
    getCertificateById: async (req: Request, res: Response) => {
        const { id } = req.params;
        try {
            const certificate = await db.certificate.findByPk(id, {
                include: [{
                    model: db.institution,
                }]
            });
            
            if (!certificate) {
                return res.status(404).json({ message: 'Certificate not found' });
            }
            
            if (req.decodedToken?.role === "organization") {
                const query = {
                    where: {
                        InstitutionId: req.decodedToken.InstitutionID
                    }
                };
            
                certificate.institution = await db.institution.findOne({
                    where: {
                        id: req.decodedToken.InstitutionID
                    }
                });
            
                certificate.certificates = await db.certificate.findAll({
                    ...query,
                    include: [{
                        model: db.institution,
                    }]
                });
            }
            
            res.json(certificate);
            
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },
    updateCertificate: async (req: Request, res: Response) => {
        const { id } = req.params;
        try {
            const { error } = certificateSchema.validate(req.body);
            if (error) {
                return res.status(400).json({ error: error.details[0].message });
            }

            const [updated] = await db.certificate.update(req.body, { where: { id } });
            if (!updated) {
                return res.status(404).json({ message: 'Certificate not found' });
            }
            const updatedCertificate = await db.certificate.findByPk(id);
            res.json(updatedCertificate);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },
    deleteCertificate: async (req: Request, res: Response) => {
        const { id } = req.params;
        try {
            const deleted = await db.certificate.destroy({ where: { id } });
            if (!deleted) {
                return res.status(404).json({ message: 'Certificate not found' });
            }
            res.json({ message: 'Certificate deleted successfully' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },
}
