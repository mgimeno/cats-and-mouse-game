import { Component, Input } from '@angular/core';
import { FigureTypeEnum } from '../../../shared/enums/figure-type.enum';
import { ChessBoxColorEnum } from '../../../shared/enums/chess-box-color.enum';
import { IChessBox } from '../../../shared/interfaces/chess-box.interface';


@Component({
  selector: 'app-chess-box',
  templateUrl: './chess-box.component.html',
  styleUrls: ['./chess-box.component.scss']
})
export class ChessBoxComponent {

  @Input() chessBox: IChessBox;

  figureTypeEnum = FigureTypeEnum;
  chessBoxColorEnum = ChessBoxColorEnum;

  constructor() {
    
  }


  ngOnInit() {
    console.log(this.chessBox)
  }
}
