import bcrypt from 'bcrypt';
import { Sequelize, Model, DataTypes, BuildOptions } from 'sequelize';

interface UserAttributes {
  username: string;
  password: string;
  phone: string;
  role:string;
  InstitutionId:string
}

interface UserCreationAttributes extends UserAttributes {}

interface UserInstance extends Model<UserAttributes, UserCreationAttributes>, UserAttributes {
  isValidPassword(password: string): Promise<boolean>;
}

type UserModelStatic = typeof Model & {
  new (values?: Record<string, any>, options?: BuildOptions): UserInstance;
};

export default (sequelize: Sequelize) => {
  const User :any= <UserModelStatic>sequelize.define('User', {
    username: DataTypes.STRING,
    password: DataTypes.STRING,
    phone: {
      type: DataTypes.STRING,
      defaultValue: "0544069203"
    },
    role: {
      type: DataTypes.ENUM('admin', 'organization'), 
      defaultValue: 'organization'
    },
    InstitutionId: DataTypes.STRING,
  });

  User.beforeCreate(async (user: UserInstance) => {
    if (user.password) {
      const hash = await bcrypt.hash(user.password, 10);
      user.password = hash;
    }
  });

  User.prototype.isValidPassword = async function (password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  };

  return User;
};
