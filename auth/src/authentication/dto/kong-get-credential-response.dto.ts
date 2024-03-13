import { Expose } from 'class-transformer';

export class KongCredentialResponse {
  @Expose({ name: 'created_at' })
  createdAt: string;

  secret: string;

  tags: null | string;

  key: string;

  id: string;

  consumer: {
    id: string;
  };

  algorithm: string;

  @Expose({ name: 'rsa_public_key' })
  rsaPublicKey: null | string;
}
