import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Task } from './task.model';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { SourceStatus } from '../enums/source-status.enum';

@ObjectType()
@Entity('sources')
export class Source {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Field()
  @Column()
  url!: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  title!: string | null;

  @ManyToOne(() => Task, (task) => task.sources, {
    onDelete: 'CASCADE',
    lazy: true,
  })
  task: Promise<Task>;

  @Field(() => SourceStatus)
  @Column({
    enumName: 'source_status',
    enum: SourceStatus,
    type: 'enum',
    default: SourceStatus.PENDING,
  })
  status!: SourceStatus;

  @Field({ nullable: true })
  @Column('timestamp', {
    nullable: true,
    comment: 'Should be matched via bot',
  })
  @Field()
  addedAt!: Date | null;

  @Field()
  @CreateDateColumn()
  createdAt!: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt!: Date;

  @Field({ nullable: true })
  @Column({ nullable: true })
  archiveUrl: string | null;

  @Field({ nullable: true })
  @Column({ nullable: true })
  archiveDate: string | null;
}
