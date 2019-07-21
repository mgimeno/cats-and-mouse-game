import { IFigurePosition } from './figure-position.interface';
import { FigureTypeEnum } from '../enums/figure-type.enum';

export interface IFigure {
  id: number;
  position: IFigurePosition;
  typeId: FigureTypeEnum;
}
