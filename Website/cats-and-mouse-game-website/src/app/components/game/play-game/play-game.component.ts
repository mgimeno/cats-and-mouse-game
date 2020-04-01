import { Component, OnInit, OnDestroy } from '@angular/core';
import { SignalrService } from '../../../shared/services/signalr-service';
import { IMessageToClient } from '../../../shared/interfaces/message-to-client.interface';
import { MessageToClientTypeEnum } from '../../../shared/enums/message-to-client-type.enum';
import { IGameStatus } from '../../../shared/interfaces/game-status.interface';
import { IGameStatusMessage } from '../../../shared/interfaces/game-status-message.interface';
import { ChessBoxColorEnum } from '../../../shared/enums/chess-box-color.enum';
import { IFigure } from '../../../shared/interfaces/figure.interface';
import { IChessBox } from '../../../shared/interfaces/chess-box.interface';
import { COMMON_CONSTANTS } from '../../../shared/constants/common';
import { IPlayer } from 'src/app/shared/interfaces/player.interface';
import { TeamEnum } from 'src/app/shared/enums/team.enum';
import { Router } from '@angular/router';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { HowToPlayDialogComponent } from '../../how-to-play-dialog/how-to-play-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';


@Component({
  templateUrl: './play-game.component.html',
  styleUrls: ['./play-game.component.scss']
})
export class PlayGameComponent implements OnInit, OnDestroy {

  private chessBoard: [IChessBox[], [], [], [], [], [], [], []] = null;
  private chessBoxCurrentlySelected: IChessBox = null;

  gameStatus: IGameStatus = null;

  private beepAudio = new Audio("data:audio/mpeg;base64,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wZ0G7jqlt/OcDIKX+/1NblSX+VKfQfP8xuJJGk7////rf////+PgXTv///1JThJJQainmySAB6imUyuVbVttUo7T4Csa821OuF88f62+CZHFnGf///mQgYIEO0SMF2NVy9NxYTdlqJ8AuS4zr//SJoTUJ+CaKKTcZvosrUPo8W/MUv0f033E9E/QpN6P///v/////WRR2mwUAYUABjabRu1vrOLKAF0kIdHjnEx/iNWo7jGn1////mApxNTJQQOU1Het/NoUFTMQs6Vja///THaGIl/0fojl8mjd/Jo8W+ZfpNpCajsz7////6kn/////WRRgDz//LD1KSTDjKOciSAKxdLx5S31uYqKIWj/+5JECgAC8V5M6g9rdFyr6Vo9rW6KtHcr5DEJQRkSpLRklSigvVc4QpmyPe9H3zHR1/in9P/8VNCMJOzYUDyVjfwHP0ZgiZt/3/+9EBnDKbegdUrckhgntHaQ9vX/X/9A/////+r/////mJ3/9ItRcoVRogAcmV9N8z0pvES8QQsKoMGXEymPQyWm6E4HQLqgpv/CZJAtYXQSwoF8e6SB56zABEoW+qgZjJAZovGr0Gl5/OjFKL3JwnaX9v7/X8y1f/////////49WAzMzEYYMZLq6CUANIqbDX7lisBIdraAEPwShTRc9WZ2vAqBc4NQ9GrUNaw0Czcrte0g1NEoiU8NFjx4NFh54FSwlOlgaCp0S3hqo8SLOh3/63f7P/KgKJxxhgGSnAFMCnIogwU5JoqBIDAuBIiNLETyFmiImtYiDTSlb8ziIFYSFv/QPC38zyxEOuPeVGHQ77r/1u/+kq49//6g4gjoVQSUMYQUSAP8PwRcZIyh2kCI2OwkZICZmaZxgnsNY8DmSCWX0idhtz3VTJSqErTSB//1X7TTTVVV//uSZB2P8xwRJ4HvYcItQlWBACM4AAABpAAAACAAADSAAAAEVf/+qCE000VVVVU0002//+qqqqummmmr///qqqppppoqqqqppppoqqATkEjIyIxBlBA5KwUEDBBwkFhYWFhUVFfiqhYWFhcVFRUVFv/Ff/xUVFRYWFpMQU1FMy45OS41qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqg==");


  constructor(private signalrService: SignalrService,
    private router: Router,
    private notificationService: NotificationService,
    private dialog: MatDialog) {

    console.log("play game constructor");
    console.log(this.chessBoard);
    console.log(this.chessBoxCurrentlySelected);
    console.log(this.gameStatus);

    this.buildChessBoard();
  }

  ngOnInit() {
    console.log("play game on init");

    this.signalrService.sendMessage("SendInProgressGameStatusToCaller")
      .catch((reason: any) => {
        console.error(reason);
        this.notificationService.showError("Game does not exist");
        this.router.navigate(['/']);
      });


    this.signalrService.subscribeToMethod("GameStatus", (message: IGameStatusMessage) => {

      this.gameStatus = message.gameStatus;
      console.log(message.gameStatus);

      this.chessBoxCurrentlySelected = null;

      this.updateChessBoard();

      this.alertUserIfItsTheirTurnOrGameOver();

    });
  }

  private async alertUserIfItsTheirTurnOrGameOver(): Promise<any> {
    if (this.isGameOver()) {

      navigator.vibrate([250, 250, 250]);
      this.beepAudio.play();
      await new Promise(r => setTimeout(r, 300));
      this.beepAudio.play();
      await new Promise(r => setTimeout(r, 300));
      this.beepAudio.play();

    }
    else if (this.isMyTurn()) {

      navigator.vibrate(250);
      this.beepAudio.play();
    }
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

  getMyPlayer(): IPlayer {
    return this.gameStatus.players[this.gameStatus.myPlayerIndex];
  }

  getEnemyPlayer(): IPlayer {
    return this.gameStatus.players[(this.gameStatus.myPlayerIndex === 0 ? 1 : 0)];
  }

  isGameOver = (): boolean => {
    return this.gameStatus.players.some(p => p.isWinner);
  }

  isMyTurn = (): boolean => {
    return this.getMyPlayer().isTheirTurn;
  }

  amITheWinner = (): boolean => {
    return this.getMyPlayer().isWinner;
  }

  amICatsPlayer = (): boolean => {
    return (this.getMyPlayer().teamId === TeamEnum.Cats);
  }

  hasAnyPlayerLeft = (): boolean => {
    return this.gameStatus.players.some(p=> p.hasUserLeftTheGame);
  }

  openHowToPlayDialog(): void {
    this.dialog.open(HowToPlayDialogComponent, { height: "100%", width: "100%" });
  }

  exitGame(): void {

    if (this.isGameOver()) {
      this.signalrService.sendMessage("ExitFinishedGame", { gameId: this.gameStatus.gameId})
        .then(() => {
          this.router.navigate(['/']);
        })
        .catch((reason: any) => {
          console.error(reason);
          this.notificationService.showError("Error when exiting the game");
        });
    }
    else {
      const dialogRef = this.dialog.open(ConfirmationDialogComponent,
        {
          data: {
            dialogTitle: "Exit this game?",
            dialogBody: null
          }
        });

      dialogRef.afterClosed().subscribe((result: any) => {

        if (result.confirmed) {

          this.signalrService.sendMessage("ExitInProgressGame")
            .then(() => {
              this.router.navigate(['/']);
            })
            .catch((reason: any) => {
              console.error(reason);
              this.notificationService.showError("Error when exiting the game");
            });

        }

      });
    }


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

    const onlyFigureThatICanMove = this.getMyPlayer().figures.find(f => f.canMoveToPositions.length > 0);
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
    return this.getMyPlayer().figures.filter(f => f.canMoveToPositions.length > 0).length;
  };

  private isMyFigure = (figureId: number): boolean => {
    return this.getMyPlayer().figures.some(f => f.id === figureId);
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
        this.notificationService.showError("Error when moving the piece");
        console.error(reason);
      });
  };

  ngOnDestroy(): void {
    console.log("Destroy play game");
    this.signalrService.unsubscribeToMethod("GameStatus");
  }

}
