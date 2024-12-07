import { Controller, Get, Query } from '@nestjs/common';
import { FilesService } from './files.service';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { PresignedUrlEntity } from './entities/presigned-url.entity';

@ApiTags('Files')
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}
  @Get('presigned-url')
  @ApiResponse({
    status: 200,
    type: PresignedUrlEntity,
  })
  async getPresignedUrl(
    @Query('fileName') fileName: string,
  ): Promise<PresignedUrlEntity> {
    const url = await this.filesService.getPresignedUrl(fileName);
    return { url };
  }
}
