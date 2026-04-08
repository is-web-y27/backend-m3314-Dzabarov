import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Participant } from '../../participants/entities/participant.entity';
import { Program } from '../../programs/entities/program.entity';
import { Shift } from '../../shifts/entities/shift.entity';

export enum ApplicationStatus {
  NEW = 'new',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  WAITLIST = 'waitlist',
}

@Entity('applications')
export class Application {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @Column({
    type: 'enum',
    enum: ApplicationStatus,
    default: ApplicationStatus.NEW,
  })
  status: ApplicationStatus;

  @Column({ type: 'boolean', default: false })
  medicalApproved: boolean;

  @Column({ type: 'boolean', default: false })
  parentConsent: boolean;

  @Column({ type: 'text', nullable: true })
  note: string | null;

  @ManyToOne(() => Participant, (participant) => participant.applications, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  participant: Participant;

  @ManyToOne(() => Program, (program) => program.applications, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  program: Program;

  @ManyToOne(() => Shift, (shift) => shift.applications, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  shift: Shift;
}
