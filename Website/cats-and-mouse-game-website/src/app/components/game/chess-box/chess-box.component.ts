import { Component, Input } from '@angular/core';
import { FigureTypeEnum } from '../../../shared/enums/figure-type.enum';
import { ChessBoxColorEnum } from '../../../shared/enums/chess-box-color.enum';


@Component({
  selector: 'app-chess-box',
  templateUrl: './chess-box.component.html',
  styleUrls: ['./chess-box.component.scss']
})
export class ChessBoxComponent {

  @Input() figureTypeId?: FigureTypeEnum = null;
  @Input() color: ChessBoxColorEnum;

  figureTypeEnum = FigureTypeEnum;
  chessBoxColorEnum = ChessBoxColorEnum;

  constructor() {
    
  }
}
