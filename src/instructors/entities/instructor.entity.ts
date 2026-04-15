import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Shift } from '../../shifts/entities/shift.entity';

@Entity('instructors')
export class Instructor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 120 })
  fullName: string;

  @Column({ type: 'varchar', length: 80 })
  specialization: string;

  @Column({ type: 'int' })
  experienceYears: number;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  email: string | null;

  @ManyToMany(() => Shift, (shift) => shift.instructors)
  shifts: Shift[];
}