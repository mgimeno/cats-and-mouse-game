import { IFigurePosition } from './figure-position.interface';

export interface IPlayerValidMove  {
  figureId: number;
  positions: IFigurePosition[];
}
