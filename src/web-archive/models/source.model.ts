import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SourceStatus } from '../enums/source-status.enum';
import { Task } from './task.model';

@Entity('sources')
export class Source {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  url!: string;

  @ManyToOne(() => Task, (task) => task.sources)
  task: Task;

  @Column({ enum: SourceStatus, type: 'enum', default: SourceStatus.PENDING })
  status!: SourceStatus;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
