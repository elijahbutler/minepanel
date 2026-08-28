import { IsEnum, IsOptional, IsString } from 'class-validator';

export class ProjectVersionsQueryDto {
  // Only used by the batch "latest versions" endpoint.
  @IsOptional()
  @IsString()
  refs?: string;

  @IsOptional()
  @IsString()
  minecraftVersion?: string;

  @IsOptional()
  @IsEnum(['forge', 'neoforge', 'fabric', 'quilt', 'datapack', 'paper'])
  loader?: 'forge' | 'neoforge' | 'fabric' | 'quilt' | 'datapack' | 'paper';
}
