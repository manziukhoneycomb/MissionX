import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ModelService } from '../services/model-service';
import { McpService } from '../services/mcp.service';

@Global()
@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
    ],
    providers: [ModelService, McpService],
    exports: [ModelService, McpService],
})
export class LlmModule {}
