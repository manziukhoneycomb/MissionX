import { PartialType } from '@nestjs/swagger';
import { CreateWebhookEventDto } from './create-webhook-event.dto';

export class UpdateWebhookEventDto extends PartialType(CreateWebhookEventDto) {}