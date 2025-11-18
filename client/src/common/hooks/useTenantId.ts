import { useUser } from '@clerk/clerk-react';

const useTenantId = (): string | null => {
  const { user } = useUser();

  if (!user?.publicMetadata?.['tenantId']) {
    return null;
  }

  return user.publicMetadata['tenantId'] as string;
};

export default useTenantId;