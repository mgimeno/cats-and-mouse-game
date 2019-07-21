import { IPlayer } from './player.interface';
import { IPlayerValidMove } from './player-valid-move.interface';

export interface IGameStatus  {

  players: IPlayer[];
  myPlayerIndex: number;
  myValidMoves: IPlayerValidMove[];

}
