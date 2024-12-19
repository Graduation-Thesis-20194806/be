import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { CreateProjectDomainDto } from './create-project-url.dto';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  description: string;

  @IsOptional()
  @ApiPropertyOptional()
  projectThumbnail: string;

  @IsOptional()
  @ApiPropertyOptional({
    isArray: true,
    type: CreateProjectDomainDto,
  })
  projectDomain?: CreateProjectDomainDto[];
}
