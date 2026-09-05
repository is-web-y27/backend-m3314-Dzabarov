import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Shift } from '../../shifts/entities/shift.entity';
import { Application } from '../../applications/entities/application.entity';
import { Review } from '../../reviews/entities/review.entity';

@Entity('programs')
export class Program {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 120 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'varchar', length: 50 })
  format: string;

  @Column({ type: 'varchar', length: 30 })
  difficulty: string;

  @Column({ type: 'int' })
  durationDays: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany(() => Shift, (shift) => shift.program)
  shifts: Shift[];

  @OneToMany(() => Application, (application) => application.program)
  applications: Application[];

  @OneToMany(() => Review, (review) => review.program)
  reviews: Review[];
}
