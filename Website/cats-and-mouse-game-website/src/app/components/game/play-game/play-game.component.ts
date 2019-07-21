import { Component, OnInit } from '@angular/core';
import { SignalrService } from '../../../shared/services/signalr-service';
import { IMessageToClient } from '../../../shared/interfaces/message-to-client.interface';
import { MessageToClientTypeEnum } from '../../../shared/enums/message-to-client-type.enum';
import { IGameStatus } from '../../../shared/interfaces/game-status.interface';
import { IGameStatusMessage } from '../../../shared/interfaces/game-status-message.interface';
import { FigureTypeEnum } from '../../../shared/enums/figure-type.enum';
import { ChessBoxColorEnum } from '../../../shared/enums/chess-box-color.enum';
import { IFigure } from '../../../shared/interfaces/figure.interface';


@Component({
  templateUrl: './play-game.component.html',
  styleUrls: ['./play-game.component.scss']
})
export class PlayGameComponent implements OnInit {

  private gameStatus: IGameStatus = null;

  private chessBoxColor: ChessBoxColorEnum = ChessBoxColorEnum.White;

  constructor(private signalrService: SignalrService) {
  }

  ngOnInit() {
    this.signalrService.sendMessage("GetGameStatusByConnectionId")
      .catch((reason: any) => {
        console.error(reason);
      });


    this.signalrService.subscribeToMethod("messageToClient", (message: IMessageToClient) => {

      if (message.typeId === MessageToClientTypeEnum.GameStatus) {

        const gameStatusMessage: IGameStatusMessage = message as IGameStatusMessage;

        this.gameStatus = gameStatusMessage.gameStatus;
      }
    });
  }

  getFigureInPosition = (rowIndex: number, columnIndex: number): IFigure => {

    //todo very bad solution see if there is a way to find an item in a nested array (lodash?)

    let figureInPosition: IFigure = null;

    for (let playerIndex = 0; playerIndex < this.gameStatus.players.length; playerIndex++) {

      for (let figureIndex = 0; figureIndex < this.gameStatus.players[playerIndex].figures.length; figureIndex++) {

        const figure = this.gameStatus.players[playerIndex].figures[figureIndex];

        if (figure.position.rowIndex === rowIndex && figure.position.columnIndex === columnIndex) {

          figureInPosition = figure;

          break;
        }

      }

    }

    return figureInPosition;

  }

  getNextChessBoxColor = (columnIndex: number): ChessBoxColorEnum => {

    if (columnIndex === 0) {
      return this.chessBoxColor;
    }
    else {

      this.chessBoxColor = (this.chessBoxColor === ChessBoxColorEnum.White ? ChessBoxColorEnum.Black : ChessBoxColorEnum.White);

      return this.chessBoxColor;
    }

  };

  onChessBoxClicked = (rowIndex: number, columnIndex: number): void => {
    console.log("box clicked: " + rowIndex + "," + columnIndex);
  };

  isGameOver = (): boolean => {
    return this.gameStatus.players.some(p => p.isWinner);
  }

  isMyTurn = (): boolean => {
    return this.gameStatus.players[this.gameStatus.myPlayerIndex].isTheirTurn;
  }

  amITheWinner = (): boolean => {
    return this.gameStatus.players[this.gameStatus.myPlayerIndex].isWinner;
  }
}
