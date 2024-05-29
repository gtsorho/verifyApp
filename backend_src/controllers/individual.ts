import { Request, Response } from 'express';
import db from '../models';
import Joi from 'joi';
import { Op } from 'sequelize';

const individualSchema = Joi.object({
    organization: Joi.string().allow(null),
    ghana_card: Joi.string().required()
});

const certificateIssuanceSchema = Joi.object({
    IndividualId: Joi.number().required(),
    CertificateId: Joi.number().required(),
    issueDate: Joi.date().iso().allow(null),
    expiryDate: Joi.date().iso().allow(null),
});

export default {
    createIndividual: async (req: Request, res: Response) => {
        try {
            const { error } = individualSchema.validate(req.body);
            if (error) {
                return res.status(400).json({ error: error.details[0].message });
            }

            const individual = await db.individual.create(req.body);
            res.status(201).json(individual);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },
    getIndividualsWithCertificates: async (req: Request, res: Response) => {
        try {
            if (req.decodedToken?.role === 'admin') {
                const individuals = await db.individual.findAll({
                    include: [
                        {
                            model: db.certificate,
                            include: [
                                {
                                    model: db.institution
                                }
                            ],
                            through: {
                                model: db.certification_pivot,
                            }
                        },
                    ]
                });
                res.json(individuals);
            } else {
                console.log(req.decodedToken)
                const institutionId = req.decodedToken?.InstitutionID

                const certificates = await db.certificate.findAll({
                    where: {
                        InstitutionId: institutionId
                    }
                });

                const individuals = await db.individual.findAll({
                    include: [{
                        model: db.certificate,
                        include: [
                            {
                                model: db.institution
                            }
                        ],
                        where: {
                            id: certificates.map((cert: { id: any; }) => cert.id)
                        }
                    }]
                });

                res.json(individuals);

            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },
    getIndividualByIdWithCertificates: async (req: Request, res: Response) => {
        const { id } = req.params;
        try {
            const individual = await db.individual.findByPk(id, {
                include: [
                    {
                        model: db.certificate,
                        through: {
                            model: db.certification_pivot,
                        }
                    }
                ]
            });
            if (!individual) {
                return res.status(404).json({ message: 'Individual not found' });
            }
            res.json(individual);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },
    updateIndividual: async (req: Request, res: Response) => {
        const { id } = req.params;
        try {
            const { error } = individualSchema.validate(req.body);
            if (error) {
                return res.status(400).json({ error: error.details[0].message });
            }

            const [updated] = await db.individual.update(req.body, { where: { id } });
            if (!updated) {
                return res.status(404).json({ message: 'Individual not found' });
            }
            const updatedIndividual = await db.individual.findByPk(id);
            res.json(updatedIndividual);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },
    deleteIndividual: async (req: Request, res: Response) => {
        const { id } = req.params;
        try {
            const deleted = await db.individual.destroy({ where: { id } });
            if (!deleted) {
                return res.status(404).json({ message: 'Individual not found' });
            }
            res.json({ message: 'Individual deleted successfully' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },

    populateCertificationPivot: async (req: Request, res: Response) => {
        const { IndividualId, organization, CertificateId, issueDate, expiryDate } = req.body;

        if (req.decodedToken?.role === "organization") {
            const certificate = await db.certificate.findByPk(CertificateId);

            if (!certificate || certificate.InstitutionId !== req.decodedToken.InstitutionId) {
                return res.status(403).json({ message: 'Access denied. Certificate does not belong to your institution' });
            }
        }

        try {
            const { error } = certificateIssuanceSchema.validate(req.body);
            if (error) {
                return res.status(400).json({ error: error.details[0].message });
            }

            if (!IndividualId || !CertificateId) {
                return res.status(400).json({ message: 'IndividualId and CertificateId are required in the query' });
            }

            const individual = await db.individual.findByPk(IndividualId);
            if (!individual) {
                return res.status(404).json({ message: 'Individual not found' });
            }
            // else{
            //     const individual = await db.individual.create({});

            // }

            const certificate = await db.certificate.findByPk(CertificateId);
            if (!certificate) {
                return res.status(404).json({ message: 'Certificate not found' });
            }

            const certificationPivot = await db.certification_pivot.create({
                IndividualId,
                CertificateId,
                issueDate,
                expiryDate
            });

            const count = await db.certification_pivot.count({
                CertificateId
            })

            await db.certificate.update({ count: count }, { where: { id: CertificateId } });

            res.status(201).json(certificationPivot);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },
    checkCertificateExists: async (req: Request, res: Response) => {
        const { ghana_cardNo, certificate } = req.query;

        try {
            const certificationPivot = await db.certification_pivot.findOne({
                include: [
                    {
                        model: db.individual,
                        where: { ghana_card: ghana_cardNo }
                    },
                    {
                        model: db.certificate,
                        where: {
                            [Op.or]: [
                                { certificate: certificate },
                                { prefix: certificate }
                            ]
                        }, include: [
                            {
                                model: db.institution,
                                attributes: ['id', 'name']
                            }
                        ]
                    }
                ]
            });

            if (certificationPivot) {
                res.json({ exists: true, data: certificationPivot });
            } else {
                res.json({ exists: false });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },
    findRelatedCertificates: async (req: Request, res: Response) => {
        const { ghana_cardNo } = req.query;

        try {
            const individual = await db.certification_pivot.findAll({
                include: [
                    {
                        model: db.individual,
                        where: { ghana_card: ghana_cardNo }
                    },
                    {
                        model: db.certificate,
                        include: [
                            {
                                model: db.institution,
                                attributes: ['id', 'name']
                            }
                        ]
                    }
                ]
            });

            res.json(individual);

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
}