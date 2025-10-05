import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  // https://stackoverflow.com/questions/50360101/how-to-exclude-entity-field-from-returned-by-controller-json-nestjs-typeorm
  @Column()
  password: string;

  @Column({ default: false })
  isActive: boolean;
}
