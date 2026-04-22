import {
  Controller,
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConsumes,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiServiceUnavailableResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/roles/role.enum';
import { ObjectStorageService } from './object-storage.service';
import type { UploadedFile as StorageUploadedFile } from './object-storage.service';

@ApiTags('files')
@Controller('api/files')
export class ObjectStorageController {
  constructor(private readonly objectStorageService: ObjectStorageService) {}

  @Post()
  @Roles(Role.Admin)
  @ApiCookieAuth('supertokens')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiCreatedResponse({
    schema: {
      type: 'object',
      properties: {
        key: { type: 'string' },
        url: { type: 'string' },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Invalid file' })
  @ApiServiceUnavailableResponse({
    description: 'S3 storage is not configured',
  })
  upload(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({
            fileType: /(image\/jpeg|image\/png|image\/webp|application\/pdf)/,
          }),
        ],
      }),
    )
    file: StorageUploadedFile,
  ) {
    return this.objectStorageService.upload(file);
  }
}
