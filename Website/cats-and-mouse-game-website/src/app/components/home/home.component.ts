import { Component, OnInit, OnDestroy } from '@angular/core';
import { TeamEnum } from 'src/app/shared/enums/team.enum';
import { IGameListItem } from 'src/app/shared/interfaces/game-list-item.interface';
import { MatDialog } from '@angular/material/dialog';
import { CreateGameDialogComponent } from '../game/create-game-dialog/create-game-dialog.component';
import { JoinGameDialogComponent } from '../game/join-game-dialog/join-game-dialog.component';
import { ActivatedRoute } from '@angular/router';
import { SignalrService } from '../../shared/services/signalr-service';
import { IGameListMessage } from '../../shared/interfaces/game-list-message.interface';
import { NotificationService } from '../../shared/services/notification.service';
import { HowToPlayDialogComponent } from '../how-to-play-dialog/how-to-play-dialog.component';


@Component({
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {

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

    this.signalrService.subscribeToMethod("GameList", (message: IGameListMessage) => {

      console.log("HomeComponent message", message);

        console.log("list of games received", message.gameList);
        this.games = message.gameList;

        this.openJoinGameDialogIfGameInUrl();
      
    });
  }

  openJoinGameDialogIfGameInUrl = (): void => {

    const gameIdFromUrl: string = (this.route.snapshot.queryParams["joinGame"] || null);
    if (gameIdFromUrl) {
      this.openJoinGameDialog(gameIdFromUrl);
    }
  }

  openCreateGameDialog(): void {
    this.dialog.open(CreateGameDialogComponent, {height: "100%", width: "100%"});
  }

  openJoinGameDialog(gameId: string): void {
    const game = this.games.find(g => g.gameId == gameId);
    console.log({ game });
    if (!game) {
      this.notificationService.showError("Game does not exist");
    }
    else {
      this.dialog.open(JoinGameDialogComponent, { data: game,height: "100%", width: "100%" });
    }

  }

  openHowToPlayDialog(): void{
    this.dialog.open(HowToPlayDialogComponent, {height: "100%", width: "100%"});
  }

  ngOnDestroy(): void {
    console.log("Destroy home");
    this.signalrService.unsubscribeToMethod("GameList");
  }
}
