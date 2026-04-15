import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Program } from '../../programs/entities/program.entity';
import { Instructor } from '../../instructors/entities/instructor.entity';
import { Application } from '../../applications/entities/application.entity';

@Entity('shifts')
export class Shift {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 80 })
  name: string;

  @Column({ type: 'date' })
  startDate: string;

  @Column({ type: 'date' })
  endDate: string;

  @Column({ type: 'int' })
  capacity: number;

  @Column({ type: 'int' })
  availablePlaces: number;

  @Column({ type: 'varchar', length: 20 })
  season: string;

  @ManyToOne(() => Program, (program) => program.shifts, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  program: Program;

  @ManyToMany(() => Instructor, (instructor) => instructor.shifts)
  @JoinTable({
    name: 'shift_instructors',
  })
  instructors: Instructor[];

  @OneToMany(() => Application, (application) => application.shift)
  applications: Application[];
}
