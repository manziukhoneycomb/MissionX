import {
    registerDecorator,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
    ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'isValidEmailDomain', async: false })
export class IsValidEmailDomainConstraint implements ValidatorConstraintInterface {
    validate(email: string, _args: ValidationArguments) {
        if (!email) {
            return false;
        }

        const allowedDomain = process.env.ALLOWED_EMAIL_DOMAIN || '@honeycombsoft.com';

        return email.endsWith(allowedDomain);
    }

    defaultMessage(_args: ValidationArguments) {
        const allowedDomain = process.env.ALLOWED_EMAIL_DOMAIN || '@honeycombsoft.com';
        return `Email must be from the ${allowedDomain} domain`;
    }
}

export function IsValidEmailDomain(validationOptions?: ValidationOptions) {
    return function (object: object, propertyName: string) {
        registerDecorator({
            name: 'isValidEmailDomain',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsValidEmailDomainConstraint,
        });
    };
}
