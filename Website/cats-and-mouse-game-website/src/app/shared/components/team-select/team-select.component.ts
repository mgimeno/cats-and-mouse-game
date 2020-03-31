import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { TeamEnum } from '../../enums/team.enum';
import { IGameListItem } from '../../interfaces/game-list-item.interface';


@Component({
  selector: 'app-team-select',
  templateUrl: './team-select.component.html',
  styleUrls: ['./team-select.component.scss']
})
export class TeamSelectComponent {

  @Input() formGroup: FormGroup;
  @Input() game: IGameListItem = null;

  teamEnum = TeamEnum;

  constructor() { }

  getTeamName(teamEnum: TeamEnum): string {


    if (this.game) {
      if (this.game.teamId === teamEnum) {
        return this.game.userName;
      }
      else {
        return this.formGroup.controls.userName.value;
      }
    }
    else {
      if (this.formGroup.controls.teamId.value == null) {
        if (teamEnum === TeamEnum.Cats) {
          return "cats";
        }
        else {
          return "mouse";
        }
      }
      else {
        if (+this.formGroup.controls.teamId.value === teamEnum) {
          return this.formGroup.controls.userName.value;
        }
        else {
          return "opponent";
        }
      }
    }

  }

  selectMyTeam(teamEnum: TeamEnum): void {
    if (this.canSelectTeam()) {
      this.formGroup.controls.teamId.setValue(teamEnum);
    }
  }

  isMyTeamSelected(teamEnum: TeamEnum): boolean {
    return this.formGroup.controls.teamId.value !== null && (+this.formGroup.controls.teamId.value === teamEnum);
  }

  isOpponentTeamSelected(teamEnum: TeamEnum): boolean {
    if(this.formGroup.controls.teamId.value == null){
      return false;
    }
    else{
      return (this.formGroup.controls.teamId.value !== teamEnum);
    }
  }

  canSelectTeam(): boolean {
    return this.game == null;
  }

}
