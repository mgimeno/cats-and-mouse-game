import { TeamEnum } from '../enums/team.enum';

export interface IGameListItem  {
    gameId: string;
    userName: string;
    teamId: TeamEnum;
    isPasswordProtected: boolean;
}
