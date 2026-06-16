import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';
import { RegistrationAttributes, RegistrationCreationAttributes } from '../interfaces/registration.interface';

class Registration extends Model<RegistrationAttributes, RegistrationCreationAttributes>
  implements RegistrationAttributes {
  public id!: number;
  public registrationNumber!: string;
  public eventId!: number;
  public fullName!: string;
  public email!: string;
  public tickets!: number;
  public totalAmount!: number;
  public status!: 'REGISTERED' | 'CANCELLED' | 'WAITLIST';

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Registration.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    registrationNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    eventId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    tickets: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      get() {
        const rawValue = this.getDataValue('totalAmount');
        return rawValue ? parseFloat(rawValue as unknown as string) : 0;
      },
    },
    status: {
      type: DataTypes.ENUM('REGISTERED', 'CANCELLED', 'WAITLIST'),
      allowNull: false,
      defaultValue: 'REGISTERED',
    },
  },
  {
    sequelize,
    tableName: 'registrations',
    timestamps: true,
  }
);

export default Registration;
export { Registration };
