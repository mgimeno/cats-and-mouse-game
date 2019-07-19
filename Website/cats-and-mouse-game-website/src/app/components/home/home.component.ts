import { Component, OnInit } from '@angular/core';
import { TeamEnum } from 'src/app/shared/enums/team.enum';
import { IGameListItem } from 'src/app/shared/interfaces/game-list-item.interface';
import { MatDialog } from '@angular/material';
import { CreateGameDialogComponent } from '../game/create-game-dialog/create-game-dialog.component';
import { JoinGameDialogComponent } from '../game/join-game-dialog/join-game-dialog.component';
import { ActivatedRoute } from '@angular/router';
import { SignalrService } from '../../shared/services/signalr-service';


@Component({
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  tableColumns: string[] = ["userName", "teamId", "isPasswordProtected", "gameId"];
  teamEnum = TeamEnum;

  games: IGameListItem[] = [];

  constructor(private dialog: MatDialog, private route: ActivatedRoute) { }

  ngOnInit() {

    //todo do this after the games have been retrieved
    const gameIdFromUrl: string = (this.route.snapshot.queryParams["joinGame"] || null);
    if (gameIdFromUrl) {
      this.openJoinGameDialog(gameIdFromUrl);
    }
  }

  openCreateGameDialog(): void {
    let dialogRef = this.dialog.open(CreateGameDialogComponent, { maxWidth: '310px' });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        //todo create game
      }
    });
  }

  openJoinGameDialog(gameId: string): void {
    const game = this.games.find(g => g.gameId == gameId);

    if (!game) {
      alert("Game does not exist");
      //todo info dialog -> game does not exist
    }
    else {
      let dialogRef = this.dialog.open(JoinGameDialogComponent, { data: game, maxWidth: '310px' });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          //todo join game
        }
      });
    }

  }
}
