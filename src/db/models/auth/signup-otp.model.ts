import { Table, Column, Model, DataType } from "sequelize-typescript";

@Table({ tableName: "signup_otps", timestamps: true })
export class SignupOtp extends Model {
  @Column({ type: DataType.INTEGER, autoIncrement: true, primaryKey: true })
  declare id: number;

  @Column({ type: DataType.STRING(191), allowNull: false, unique: true })
  email!: string;

  @Column({ type: DataType.STRING(150), allowNull: false })
  full_name!: string;

  @Column({ type: DataType.STRING(15), allowNull: false })
  mobile_number!: string;

  @Column({ type: DataType.STRING(50), allowNull: false })
  username!: string;

  @Column({ type: DataType.STRING(255), allowNull: false })
  password_hash!: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  password_plain!: string | null;

  @Column({ type: DataType.STRING(6), allowNull: false })
  otp!: string;

  @Column({ type: DataType.DATE, allowNull: false })
  expires_at!: Date;

  @Column({ type: DataType.DATE, allowNull: false })
  last_sent_at!: Date;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  attempts!: number;
}
