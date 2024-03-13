import axios from 'axios';
import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { ResourceNotFoundException } from '../shared-resources/exception';
import { ResourceConflictException } from '../shared-resources/exception/conflict-resource.exception';
import { KongCredentialResponse } from './dto/kong-get-credential-response.dto';
import { CreateKongJwtConsumerResponse } from './dto/kong-create-consumer-response.dto';
import { CreateKongJwtCredentialResponse } from './dto/kong-create-credential-response.dto';

@Injectable()
export class KongJwtService {
  private readonly uri: string = process.env.KONG_URI;

  async deleteConsumer(id: string) {
    try {
      const resp = await axios.delete(`${this.uri}/consumers/${id}`);

      return resp.data;
    } catch (error) {
      throw new ResourceNotFoundException('consumer', `id ${id}`);
    }
  }

  async createConsumer(
    username: string,
    userId: string
  ): Promise<CreateKongJwtConsumerResponse> {
    try {
      const resp = await axios.post(`${this.uri}/consumers/`, {
        username: username,
        // eslint-disable-next-line camelcase
        custom_id: userId
      });

      await this.createConsumerCredential(String(resp.data.id));

      return plainToInstance(CreateKongJwtConsumerResponse, resp.data);
    } catch (error) {
      throw new ResourceConflictException(
        'user.username',
        `Data already exist.`
      );
    }
  }

  async createConsumerCredential(
    consumerId: string
  ): Promise<CreateKongJwtCredentialResponse> {
    try {
      const resp = await axios.post(`${this.uri}/consumers/${consumerId}/jwt`);

      return plainToInstance(CreateKongJwtCredentialResponse, resp.data);
    } catch (error) {
      throw new ResourceNotFoundException('jwt consumer', `id ${consumerId}`);
    }
  }

  async getJwtCredentialById(
    credentialId: string
  ): Promise<KongCredentialResponse> {
    try {
      const resp = await axios.get(`${this.uri}/jwts/${credentialId}`);
      return plainToInstance(KongCredentialResponse, resp.data);
    } catch (error) {
      throw new ResourceNotFoundException('jwt consumer', `id ${credentialId}`);
    }
  }

  async deleteJwtCredentialById(credentialId: string) {
    try {
      const resp = await axios.delete(`${this.uri}/jwts/${credentialId}`);
      return resp.data;
    } catch (error) {
      throw new ResourceNotFoundException(`jwt-credential`, `consumer`);
    }
  }
}
