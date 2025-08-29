# Deployment

This document describes the process for deploying the application.

1. First, you need to run Terraform scripts to create all required resources in the cloud. Please refer to the `README.md` file under the `/terraform` folder.
2. A Clerk account is required to run the application. Check [How to configure Clerk for production environment](https://clerk.com/docs/deployments/overview?_gl=1*1b1301e*_gcl_au*NzAwODc0MjU2LjE3NDM2OTY3NTguMTg4MzUzMTc1OS4xNzQ0MzA3Nzg5LjE3NDQzMDc3ODg.*_ga*MTEzMDM0NzE1Ni4xNzQzNjk3Mzcy*_ga_1WMF5X234K*MTc0NDg5NjcwNy4yOC4xLjE3NDQ4OTY3NzkuMC4wLjA.)
3. To configure session token on clerk dashboard go to: `Configure` => `Sessions` => `Customize session token` and paste the following JSON template:
    ```json
    {
    	"roles": "{{user.public_metadata.roles}}",
    	"tenantId": "{{user.public_metadata.tenantId}}"
    }
    ```
    This configuration will add `tenantId` and `roles` to the claims.
4. In Azure DevOps, clone the variable group and fill values according to the desired environment. See the list below with explanations and where to find them:

    1. `CLERK_SECRET_KEY` - Can be found on the Clerk dashboard: `Configure` => `API keys` => choose `next.js` and copy the secret key.
    2. `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Can be found on the Clerk dashboard: `Configure` => `API keys` => choose `next.js` and copy the publishable key.
    3. `DEFAULT_TENANT_ID` - An identifier of the tenant in the database that will be used for all users (single tenancy). If you want a multi-tenant application, leave it empty.
    4. `DEFAULT_SUPER_ADMIN_EMAIL` - The email of the first super admin that will be created at the startup of the application.
    5. `CORS_ORIGIN` - List of origin that are allowed to make requests to api, for example: `https://mytestapplication.com,https://mytestapplication2.com`.
    6. `VITE_API_URL` - The URL to the API application, for example `https://mytestapplication.com`.
    7. `VITE_CLERK_PUBLISHABLE_KEY` - The same as `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, but for the frontend side.
    8. `SENTRY_DSN` - The Data Source Name for your Sentry project, used for error tracking. Found in Sentry project settings.

5. Authorize the pipeline to use the variable group:
    - Select the variable group created in the previous step.
    - Go to the `Pipeline permissions` tab.
    - Click `+` and select the deployment pipeline to authorize
6. Create a service connection to your cloud provider (Azure or AWS) in Azure DevOps project settings. Service connection name can be edited in deployment pipeline variables, default value is: `ai-template-service-connection`
7. Run the deployment pipeline.
