import { IsEnum, IsOptional } from 'class-validator';

export class ModCategoriesQueryDto {
  @IsOptional()
  @IsEnum(['mod', 'datapack', 'plugin'])
  projectType?: 'mod' | 'datapack' | 'plugin';
}
