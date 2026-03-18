import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Participant } from '../../participants/entities/participant.entity';
import { Program } from '../../programs/entities/program.entity';

@Entity('reviews')
@Check(`rating >= 1 AND rating <= 5`)
export class Review {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  rating: number;

  @Column({ type: 'text' })
  comment: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Participant, (participant) => participant.reviews, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  participant: Participant;

  @ManyToOne(() => Program, (program) => program.reviews, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  program: Program;
}
