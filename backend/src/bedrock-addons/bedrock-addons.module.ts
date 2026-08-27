import { forwardRef, Module } from '@nestjs/common';
import { DockerComposeModule } from 'src/docker-compose/docker-compose.module';
import { ServerManagementModule } from 'src/server-management/server-management.module';
import { UsersModule } from 'src/users/users.module';
import { BedrockAddonsController } from './bedrock-addons.controller';
import { BedrockAddonsService } from './bedrock-addons.service';

@Module({
  imports: [DockerComposeModule, UsersModule, forwardRef(() => ServerManagementModule)],
  controllers: [BedrockAddonsController],
  providers: [BedrockAddonsService],
  exports: [BedrockAddonsService],
})
export class BedrockAddonsModule {}
