import { Component, OnInit, OnDestroy } from '@angular/core';
import { TeamEnum } from 'src/app/shared/enums/team.enum';
import { IGameListItem } from 'src/app/shared/interfaces/game-list-item.interface';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CreateGameDialogComponent } from '../game/create-game-dialog/create-game-dialog.component';
import { JoinGameDialogComponent } from '../game/join-game-dialog/join-game-dialog.component';
import { ActivatedRoute, Router } from '@angular/router';
import { SignalrService } from '../../shared/services/signalr-service';
import { IGameListMessage } from '../../shared/interfaces/game-list-message.interface';
import { NotificationService } from '../../shared/services/notification.service';
import { HowToPlayDialogComponent } from '../how-to-play-dialog/how-to-play-dialog.component';
import { IGameStartMessage } from 'src/app/shared/interfaces/game-start-message.interface';


@Component({
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {

  tableColumns: string[] = ["userName", "teamId", "isPasswordProtected", "gameId"];
  teamEnum = TeamEnum;

  games: IGameListItem[] = [];

  createGameDialogRef: MatDialogRef<CreateGameDialogComponent>;
  joinGameDialogRef:MatDialogRef<JoinGameDialogComponent>;
  howToPlayDialogRef:MatDialogRef<HowToPlayDialogComponent>;

  constructor(
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private signalrService: SignalrService,
    private notificationService: NotificationService,
    private router: Router,
    private activatedRoute: ActivatedRoute) {

    console.log("home constructor")

  }

  ngOnInit() {

    console.log("home on init")

    this.signalrService.sendMessage("HasInProgressGame")
      .then((hasInProgressGame: boolean) => {
        console.log({hasInProgressGame});
        if (hasInProgressGame) {
          this.router.navigate(['/play']);
        }
      })
      .catch((reason: any) => {
        console.error(reason);
      });

    this.signalrService.sendMessage("SendGamesAwaitingForSecondPlayerToCallerAsync")
      .catch((reason: any) => {
        this.notificationService.showError("Error when getting the list of games");
        console.error(reason);
      });

    this.signalrService.subscribeToMethod("GameList", (message: IGameListMessage) => {

      console.log("HomeComponent message", message);

      console.log("list of games received", message.gameList);
      this.games = message.gameList;

      this.openJoinGameDialogIfGameInUrl();

    });

    this.signalrService.subscribeToMethod("GameStart", (message: IGameStartMessage) => {

      console.log("Home Component message", message);

      console.log("game start");

      if(this.createGameDialogRef){
        this.createGameDialogRef.close();
      }

      if(this.joinGameDialogRef){
        this.joinGameDialogRef.close();
      }

      if(this.howToPlayDialogRef){
        this.howToPlayDialogRef.close();
      }

      this.router.navigate(['/play']);

    });
  }

  openJoinGameDialogIfGameInUrl = (): void => {

    const gameIdFromUrl: string = (this.route.snapshot.queryParams["joinGame"] || null);
    if (gameIdFromUrl) {
      //This removes the 'joinGame' url param to avoid issues.
      this.router.navigate(
        [],
        {
          relativeTo: this.activatedRoute
        });
      this.openJoinGameDialog(gameIdFromUrl);
    }
  }
  

  openCreateGameDialog(): void {
    this.createGameDialogRef =this.dialog.open(CreateGameDialogComponent, { height: "100%", width: "100%" });
  }

  openJoinGameDialog(gameId: string): void {
    const game = this.games.find(g => g.gameId == gameId);
    console.log({ game });
    if (!game) {
      this.notificationService.showError("Game does not exist");
    }
    else {
      this.joinGameDialogRef = this.dialog.open(JoinGameDialogComponent, { data: game, height: "100%", width: "100%" });
    }

  }

  openHowToPlayDialog(): void {
    this.howToPlayDialogRef =this.dialog.open(HowToPlayDialogComponent, { height: "100%", width: "100%" });
  }

  ngOnDestroy(): void {
    console.log("Destroy home");
    this.signalrService.unsubscribeToMethod("GameList");
    this.signalrService.unsubscribeToMethod("GameStart");
  }
}
