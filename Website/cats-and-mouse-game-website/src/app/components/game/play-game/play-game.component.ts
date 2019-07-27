import { Component, OnInit } from '@angular/core';
import { SignalrService } from '../../../shared/services/signalr-service';
import { IMessageToClient } from '../../../shared/interfaces/message-to-client.interface';
import { MessageToClientTypeEnum } from '../../../shared/enums/message-to-client-type.enum';
import { IGameStatus } from '../../../shared/interfaces/game-status.interface';
import { IGameStatusMessage } from '../../../shared/interfaces/game-status-message.interface';
import { ChessBoxColorEnum } from '../../../shared/enums/chess-box-color.enum';
import { IFigure } from '../../../shared/interfaces/figure.interface';
import { IChessBox } from '../../../shared/interfaces/chess-box.interface';
import { COMMON_CONSTANTS } from '../../../shared/constants/common';


@Component({
  templateUrl: './play-game.component.html',
  styleUrls: ['./play-game.component.scss']
})
export class PlayGameComponent implements OnInit {

  private chessBoard: [IChessBox[], [], [], [], [], [], [], []] = null;
  private chessBoxCurrentlySelected: IChessBox = null;

  private gameStatus: IGameStatus = null;


  constructor(private signalrService: SignalrService) {
    this.buildChessBoard();
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

        this.chessBoxCurrentlySelected = null;

        this.updateChessBoard();


      }
    });
  }

  getFigureInPosition = (rowIndex: number, columnIndex: number): IFigure => {

    //todo very bad solution see if there is a way to find an item in a nested array (lodash?)

    if (!this.gameStatus) {
      return null;
    }

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

 

  onChessBoxClicked = (rowIndex: number, columnIndex: number): void => {

    if (!this.isMyTurn()) {
      return;
    }

    let clickedChessBox = this.chessBoard[rowIndex][columnIndex];

    const canMoveCurrentlySelectedFigureToThisPosition = this.chessBoxCurrentlySelected && this.chessBoxCurrentlySelected.figure.canMoveToPositions.some(p => p.rowIndex === rowIndex && p.columnIndex === columnIndex);

    if (canMoveCurrentlySelectedFigureToThisPosition) {

      this.moveCurrentlySelectedFigure(rowIndex, columnIndex);

    }
    else {

      if (clickedChessBox.canFigureBeSelected && this.getNumberOfMyFiguresThatICanMove() > 1) {
        //Select/Deselect a figure

        this.deselectCurrentlySelectedChessBox();

        if (clickedChessBox.isFigureSelected) {
          clickedChessBox.isFigureSelected = false;
        }
        else {
          this.selectChessBox(clickedChessBox);
        }


      }

    }

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

  private buildChessBoard = (): void => {

    this.chessBoard = [[], [], [], [], [], [], [], []];

    let currentChessBoxColorId: ChessBoxColorEnum = ChessBoxColorEnum.White;

    for (let rowIndex = 0; rowIndex < COMMON_CONSTANTS.CHESS_BOARD_ROWS; rowIndex++) {

      for (let columnIndex = 0; columnIndex < COMMON_CONSTANTS.CHESS_BOARD_COLUMNS; columnIndex++) {

        if (columnIndex !== 0) {
          currentChessBoxColorId = (currentChessBoxColorId === ChessBoxColorEnum.White ? ChessBoxColorEnum.Black : ChessBoxColorEnum.White)
        }

        let chessBox = <IChessBox>{
          colorId: currentChessBoxColorId,
          figure: null,
          //Todo these should be in the figure property ?
          isFigureSelected: false,
          canFigureBeSelected: false,
          canBeNewPositionForSelectedFigure: false
        };

        this.chessBoard[rowIndex][columnIndex] = chessBox;

      }

    }

  };

  private updateChessBoard = (): void => {

    for (let rowIndex = 0; rowIndex < COMMON_CONSTANTS.CHESS_BOARD_ROWS; rowIndex++) {

      for (let columnIndex = 0; columnIndex < COMMON_CONSTANTS.CHESS_BOARD_COLUMNS; columnIndex++) {

        const figure = this.getFigureInPosition(rowIndex, columnIndex);
        this.chessBoard[rowIndex][columnIndex].figure = figure;
        //Todo these should be in the figure property
        this.chessBoard[rowIndex][columnIndex].isFigureSelected = false;
        this.chessBoard[rowIndex][columnIndex].canFigureBeSelected = this.isMyTurn() && figure && this.isMyFigure(figure.id) && (figure.canMoveToPositions.length > 0);
        this.chessBoard[rowIndex][columnIndex].canBeNewPositionForSelectedFigure = false;

      }

    }


    if (this.isMyTurn() && this.getNumberOfMyFiguresThatICanMove() === 1) {
      this.preSelectTheOnlyChessBoxThatICanSelect();
    }

  };

  private preSelectTheOnlyChessBoxThatICanSelect = (): void => {

    const onlyFigureThatICanMove = this.gameStatus.players[this.gameStatus.myPlayerIndex].figures.find(f => f.canMoveToPositions.length > 0);
    let chessBox = this.chessBoard[onlyFigureThatICanMove.position.rowIndex][onlyFigureThatICanMove.position.columnIndex];

    this.selectChessBox(chessBox);
  };

  private selectChessBox = (chessBox: IChessBox): void => {
    
    chessBox.isFigureSelected = true;

    this.chessBoxCurrentlySelected = chessBox;

    //highlight possible moves
    this.chessBoxCurrentlySelected.figure.canMoveToPositions.forEach(p => {

      this.chessBoard[p.rowIndex][p.columnIndex].canBeNewPositionForSelectedFigure = true;

    });
  };

  private getNumberOfMyFiguresThatICanMove = (): number => {
    return this.gameStatus.players[this.gameStatus.myPlayerIndex].figures.filter(f => f.canMoveToPositions.length > 0).length;
  };

  private isMyFigure = (figureId: number): boolean => {
    return this.gameStatus.players[this.gameStatus.myPlayerIndex].figures.some(f => f.id === figureId);
  }

  private deselectCurrentlySelectedChessBox = (): void => {

    if (this.chessBoxCurrentlySelected) {
      this.chessBoard[this.chessBoxCurrentlySelected.figure.position.rowIndex][this.chessBoxCurrentlySelected.figure.position.columnIndex].isFigureSelected = false;

      this.chessBoxCurrentlySelected = null;

      //remove all highlighted chessboxes possible moves
      for (let rowIndex = 0; rowIndex < COMMON_CONSTANTS.CHESS_BOARD_ROWS; rowIndex++) {

        for (let columnIndex = 0; columnIndex < COMMON_CONSTANTS.CHESS_BOARD_COLUMNS; columnIndex++) {

          this.chessBoard[rowIndex][columnIndex].canBeNewPositionForSelectedFigure = false;

        }

      }

    }

  };

  private moveCurrentlySelectedFigure = (rowIndex: number, columnIndex: number): void => {

    const message = {
      figureId: this.chessBoxCurrentlySelected.figure.id,
      rowIndex: rowIndex,
      columnIndex: columnIndex
    };

    this.signalrService.sendMessage("Move", message)
      .catch((reason: any) => {
        console.error(reason);
      });
  };

}
