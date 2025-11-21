import { 
    BillingInfoDto, 
    AddPaymentMethodDto, 
    PaymentMethodDto,
    UpdateSubscriptionDto,
    SubscriptionDto
} from '../dto/billing.dto';

export const BILLING_SERVICE = Symbol('IBillingService');

export interface IBillingService {
    getBillingInfo(tenantId: string): Promise<BillingInfoDto>;
    addPaymentMethod(tenantId: string, paymentMethodData: AddPaymentMethodDto): Promise<PaymentMethodDto>;
    removePaymentMethod(tenantId: string, paymentMethodId: string): Promise<void>;
    setDefaultPaymentMethod(tenantId: string, paymentMethodId: string): Promise<PaymentMethodDto>;
    updateSubscription(tenantId: string, subscriptionData: UpdateSubscriptionDto): Promise<SubscriptionDto>;
}