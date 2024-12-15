import { ApiProperty } from '@nestjs/swagger';

export class PhaseEntity {
  @ApiProperty({ description: 'Unique identifier of the Phase', example: 1 })
  id: number;

  @ApiProperty({ description: 'Name of the Phase', example: 'Design Phase' })
  name: string;

  @ApiProperty({
    description: 'Description of the Phase',
    example: 'Initial design and planning',
    nullable: true,
  })
  description?: string;

  @ApiProperty({
    description: 'Start datetime of the Phase',
    example: '2024-01-01T00:00:00.000Z',
  })
  from: Date;

  @ApiProperty({
    description: 'End datetime of the Phase',
    example: '2024-02-01T00:00:00.000Z',
  })
  to: Date;

  @ApiProperty({ description: 'Associated Project ID', example: 10 })
  projectId: number;
}
