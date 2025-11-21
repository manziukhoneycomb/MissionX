import { Module } from '@nestjs/common';
import { BillingService } from './billing.service';
import { BILLING_SERVICE } from './interfaces/billing.service.interface';

@Module({
    providers: [
        {
            provide: BILLING_SERVICE,
            useClass: BillingService,
        },
    ],
    exports: [BILLING_SERVICE],
})
export class BillingModule {}