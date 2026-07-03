import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('request_logs')
export class RequestLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  mock_id: string;

  @Column()
  method: string;

  @Column()
  path: string;

  @Column()
  status_code: number;

  @Column()
  latency_ms: number;

  @Column('jsonb', { nullable: true })
  request_body: any;

  @Column('jsonb', { nullable: true })
  response_body: any;

  @CreateDateColumn()
  created_at: Date;
}
