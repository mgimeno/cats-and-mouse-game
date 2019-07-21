import { Component, OnInit } from '@angular/core';
import { TeamEnum } from 'src/app/shared/enums/team.enum';
import { IGameListItem } from 'src/app/shared/interfaces/game-list-item.interface';
import { MatDialog } from '@angular/material';
import { CreateGameDialogComponent } from '../game/create-game-dialog/create-game-dialog.component';
import { JoinGameDialogComponent } from '../game/join-game-dialog/join-game-dialog.component';
import { ActivatedRoute } from '@angular/router';
import { SignalrService } from '../../shared/services/signalr-service';
import { IMessageToClient } from '../../shared/interfaces/message-to-client.interface';
import { MessageToClientTypeEnum } from '../../shared/enums/message-to-client-type.enum';
import { IGameListMessage } from '../../shared/interfaces/game-list-message.interface';
import { NotificationService } from '../../shared/services/notification.service';


@Component({
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  tableColumns: string[] = ["userName", "teamId", "isPasswordProtected", "gameId"];
  teamEnum = TeamEnum;

  games: IGameListItem[] = [];

  constructor(
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private signalrService: SignalrService,
    private notificationService: NotificationService) {

    console.log("home constructor")

  }

  ngOnInit() {

    console.log("home on init")

    this.signalrService.sendMessage("SendGamesAwaitingForSecondPlayerToCallerAsync")
      .catch((reason: any) => {
        console.error(reason);
      });

    this.signalrService.subscribeToMethod("messageToClient", (message: IMessageToClient) => {

      console.log("HomeComponent message", message);

      if (message.typeId === MessageToClientTypeEnum.GameList) {

        console.log("list of games received", (<IGameListMessage>message).gameList);
        this.games = (<IGameListMessage>message).gameList;

        this.openJoinGameDialogIfGameInUrl();
      }
    });
  }

  openJoinGameDialogIfGameInUrl = (): void => {

    const gameIdFromUrl: string = (this.route.snapshot.queryParams["joinGame"] || null);
    if (gameIdFromUrl) {
      this.openJoinGameDialog(gameIdFromUrl);
    }
  }

  openCreateGameDialog(): void {
    this.dialog.open(CreateGameDialogComponent);
  }

  openJoinGameDialog(gameId: string): void {
    const game = this.games.find(g => g.gameId == gameId);

    if (!game) {
      this.notificationService.showError("Game does not exist");
    }
    else {
      this.dialog.open(JoinGameDialogComponent, { data: game });
    }

  }
}
