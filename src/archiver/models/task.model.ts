import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Source } from './source.model';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { TaskStatus } from '../enums/task-status.enum';

@ObjectType()
@Entity('tasks')
export class Task {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Field(() => ID, { nullable: true })
  @Column({ type: 'numeric', unique: true, nullable: true })
  revisionId!: number | null;

  @Field(() => ID)
  @Column({ type: 'numeric', unique: true })
  pageId!: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  pageTitle!: string | null;

  @Field(() => [Source])
  @OneToMany(() => Source, (source) => source.task, {
    cascade: true,
    eager: true,
  })
  sources: Source[];

  @Field(() => TaskStatus)
  @Column({
    enum: TaskStatus,
    enumName: 'task_status',
    default: TaskStatus.PENDING,
  })
  status!: TaskStatus;

  @Field()
  @CreateDateColumn()
  createdAt!: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt!: Date;
}
