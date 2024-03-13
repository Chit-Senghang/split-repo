import { Expose } from 'class-transformer';

export class CreateKongJwtCredentialResponse {
  @Expose({ name: 'created_at' })
  createdAt: number;

  secret: string;

  tags: string | null;

  key: string;

  id: string;

  consumer: { id: string };

  algorithm: string;

  @Expose({ name: 'rsa_public_key' })
  rsaPublicKey: string | null;
}
