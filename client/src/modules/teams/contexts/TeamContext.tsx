import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Team } from '../types/team';
import { useTeams } from '../hooks/useTeams';

interface TeamContextType {
  selectedTeam: Team | null;
  setSelectedTeam: (team: Team | null) => void;
  availableTeams: Team[];
  isLoadingTeams: boolean;
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

interface TeamProviderProps {
  children: ReactNode;
}

export const TeamProvider: React.FC<TeamProviderProps> = ({ children }) => {
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  
  const { data: teamsData, isLoading: isLoadingTeams } = useTeams();
  const availableTeams = teamsData?.data || [];

  useEffect(() => {
    if (!selectedTeam && availableTeams.length > 0) {
      const activeTeams = availableTeams.filter((team: Team) => team.isActive);
      if (activeTeams.length > 0) {
        setSelectedTeam(activeTeams[0]);
      }
    }
  }, [availableTeams, selectedTeam]);

  const contextValue: TeamContextType = {
    selectedTeam,
    setSelectedTeam,
    availableTeams,
    isLoadingTeams,
  };

  return <TeamContext.Provider value={contextValue}>{children}</TeamContext.Provider>;
};

export const useTeamContext = (): TeamContextType => {
  const context = useContext(TeamContext);
  if (context === undefined) {
    throw new Error('useTeamContext must be used within a TeamProvider');
  }
  return context;
};

export default TeamContext;