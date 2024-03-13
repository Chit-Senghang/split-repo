import { Injectable, PipeTransform } from '@nestjs/common';
import { ResourceConflictException } from '../../../shared-resources/exception/conflict-resource.exception';
import { ALLOW_FILE_EXTENSION } from '../ts/constants/regex.constant';

@Injectable()
export class FileExtensionValidationPipe implements PipeTransform {
  async transform(value: string) {
    const extension = value.split('.').pop();
    if (!ALLOW_FILE_EXTENSION.test(extension)) {
      throw new ResourceConflictException(
        'file extension',
        `file extension ${extension} is not supported!`
      );
    }

    return value;
  }
}
