import { useUser } from '@clerk/clerk-react';

const useUserRoles = () => {
  const { user } = useUser();

  if (!user?.publicMetadata?.['roles']) {
    return [];
  }

  return user?.publicMetadata?.['roles'] as string[];
};

export default useUserRoles;
