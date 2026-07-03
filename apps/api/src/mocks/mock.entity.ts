import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('mocks')
export class Mock {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  user_id: string;

  @Column({ unique: true, length: 8 })
  mock_id: string;

  @Column()
  name: string;

  @Column('jsonb')
  config: any;

  @Column()
  mock_token: string;

  @CreateDateColumn()
  created_at: Date;
}
