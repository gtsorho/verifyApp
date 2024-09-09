import Joi from 'joi';
import db from '../models';
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express'; // Assuming express is used
import dotenv from 'dotenv';

dotenv.config();

const schema = Joi.object({
  id: Joi.optional(),
  username: Joi.string().required(),
  phone: Joi.string().allow(null),
  role: Joi.string().required(),
  InstitutionId: Joi.number().allow(null),
  password: Joi.string().required(),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required(),
});

export default {
  login: async (req: Request, res: Response) => {
    const { username, password } = req.body;
    try {
      const user = await db.user.findOne({ where: { username } });

      if (!user || !(await user.isValidPassword(password))) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign({ username: user.username, id: user.id, role:user.role, InstitutionID:user.InstitutionId }, process.env.JWT_KEY!, { expiresIn: '1h' });

      res.json({ token });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },
  createUser: async (req: Request, res: Response) => {
    function validExtOfficer(user: any) {
      return schema.validate(user);
    }
    const { error } = validExtOfficer(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    try {
      const user = await db.user.create(req.body);
      res.status(201).json(user);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error', error });
    }
  },
  getUsers: async (req: Request, res: Response) => {
    try {
      const users = await db.user.findAll({
        include:{
          model:db.institution
        },
        attributes: { exclude: ['password'] }
      });
      res.json(users);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }, 
  getUser: async (req: Request, res: Response) => {
    try {
      const user = await db.user.findByPk(req.params.id);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      await user.update(req.body);
      res.json(user);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },
  destroyUser: async (req: Request, res: Response) => {
    try {
      const user = await db.user.findByPk(req.params.id);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      await user.destroy();
      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  updateUser: async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const [updated] = await db.user.update(req.body, { where: { id } });
        if (!updated) {
            return res.status(404).json({ message: 'user not found' });
        }
        res.status(200).json({ message: 'update successful' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
},
};
