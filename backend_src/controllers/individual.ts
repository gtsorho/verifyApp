import { Request, Response } from 'express';
import db from '../models';
import Joi from 'joi';
import { Op } from 'sequelize';
import XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';


const individualSchema = Joi.object({
    organization: Joi.string().optional().allow(null, ''),
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
                const individualsList = await db.individual.findAll({ });
                res.json([individuals, individualsList]);
            } else {
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

                const individualsList = await db.individual.findAll({ });

                res.json([individuals,individualsList]);

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
    
            if (!certificate || certificate.InstitutionId !== req.decodedToken.InstitutionID) {
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
    
            const certificate = await db.certificate.findByPk(CertificateId);
            if (!certificate) {
                return res.status(404).json({ message: 'Certificate not found' });
            }
    
            // Check for duplicate entry
            const existingEntry = await db.certification_pivot.findOne({
                where: { IndividualId, CertificateId }
            });
    
            if (existingEntry) {
                return res.status(409).json({ message: 'Duplicate entry. Certification already exists for this individual and certificate.' });
            }
    
            const certificationPivot = await db.certification_pivot.create({
                IndividualId,
                CertificateId,
                issueDate,
                expiryDate
            });
    
            const count = await db.certification_pivot.count({
                where: { CertificateId }
            });
    
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
                                { prefix: certificate },
                                { id: certificate }

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
    },
    fileUploadCertificate: async (req: Request, res: Response) => {
        if (req.file) {
            const filePath = req.file.path;
        
            const workbook = XLSX.readFile(filePath);
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const data = XLSX.utils.sheet_to_json(sheet);
            try {
                const promises = data.map(async (row: any) => {
                    const individual = await checkAndCreateIndividual(row['ghana_card/TIN'], row.organization);
                    const expiryDate = row.expiryDate; 
                    const issueDate = row.issueDate;
                    return await handleCertificate(row.prefix, individual.id, expiryDate, issueDate);
                  });
                const results = await Promise.all(promises);
                res.json(results);
            } catch (error:any) {
                const errorMessage = error instanceof Error ? error.message : 'An error occurred';
                res.status(500).json({ error: errorMessage });
            } 
        
          } else {
            res.status(400).send('No file uploaded');
          }
    },

    fileUploadIndividual: async (req: Request, res: Response) => {
        if (req.file) {
            const filePath = req.file.path;
        
            const workbook = XLSX.readFile(filePath);
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const data = XLSX.utils.sheet_to_json(sheet);
            try {
                const promises = data.map(async (row: any) => {
                    await checkAndCreateIndividual(row['ghana_card/TIN'], row.organization);
                  });
                const results = await Promise.all(promises);
                res.json(results);
            } catch (error:any) {
                const errorMessage = error instanceof Error ? error.message : 'An error occurred';
                res.status(500).json({ error: errorMessage });
            } 
        
          } else {
            res.status(400).send('No file uploaded');
          }
    },
    downloadFile: (req: Request, res: Response) => {
        const uploadDir = path.join(__dirname, '../files');
        const filePath = path.join(uploadDir, 'certificationTemp.xlsx');
    
        fs.access(filePath, fs.constants.F_OK, (err) => {
          if (err) {
            return res.status(404).send('File not found');
          }
    
          res.download(filePath, 'certificationTemp.xlsx', (err) => {
            if (err) {
              res.status(500).send('Error downloading the file');
            }
          });
        });
      },

      downloadIndividualFile: (req: Request, res: Response) => {
        const uploadDir = path.join(__dirname, '../files');
        const filePath = path.join(uploadDir, 'individualsTemp.xlsx');
    
        fs.access(filePath, fs.constants.F_OK, (err) => {
          if (err) {
            return res.status(404).send('File not found');
          }
    
          res.download(filePath, 'individualsTemp.xlsx', (err) => {
            if (err) {
              res.status(500).send('Error downloading the file');
            }
          });
        });
      },

      searchIndividual: async (req: Request, res: Response) => {
          try {
              const ghanaCard = req.query.searchVal;
      
              let individuals;
      
              if (ghanaCard) {
                  individuals = await db.individual.findAll({
                      where: {
                          ghana_card: {
                              [Op.like]: `%${ghanaCard}%`
                          }
                      }
                  });
              } else {
                  individuals = await db.individual.findAll();
              }
      
              res.json(individuals);
          } catch (error) {
              console.error(error);
              res.status(500).json({ message: 'Internal server error' });
          }
      },
      
    


      
}

const checkAndCreateIndividual = async (ghana_card: string, organization: string) => {
    const individual = await db.individual.findOne({ where: { ghana_card } });
    if (!individual) {
      return await db.individual.create({ 'ghana_card':ghana_card, 'organization':organization });
    }
  
    return individual;
  };

  const handleCertificate = async (prefix: string, individualId: number, expiryDate: string, issueDate: string) => {
    const certificate = await db.certificate.findOne({ where: { prefix: prefix } });
  
    if (!certificate) {
      throw new Error(`Certificate with prefix ${prefix} not found`);
    }

    const existingEntry = await db.certification_pivot.findOne({
        where: {
            IndividualId : individualId,
            CertificateId : certificate.id,
        }
      });

      if (existingEntry) {
        throw new Error(`Duplicate entry found for IndividualId ${individualId} and CertificateId ${certificate.id}`);
      }

    const certificationPivot = await db.certification_pivot.create({
        IndividualId : individualId,
        CertificateId : certificate.id,
        issueDate,
        expiryDate
    });
    return certificationPivot
  };