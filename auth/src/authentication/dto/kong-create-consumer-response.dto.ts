import { Expose } from 'class-transformer';

export class CreateKongJwtConsumerResponse {
  username: string;

  @Expose({ name: 'created_at' })
  createdAt: string;

  usernameLower: string;

  id: string;

  @Expose({ name: 'custome_id' })
  customId: string;

  type: number;

  tags: string | null;
}
