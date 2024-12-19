import { PartialType } from '@nestjs/swagger';
import { CreateProjectDomainDto } from './create-project-url.dto';

export class UpdateProjectDomainDto extends PartialType(CreateProjectDomainDto) {}
