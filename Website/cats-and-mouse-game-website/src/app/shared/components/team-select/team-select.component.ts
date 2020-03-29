import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { TeamEnum } from '../../enums/team.enum';


@Component({
  selector: 'app-team-select',
  templateUrl: './team-select.component.html',
  styleUrls: ['./team-select.component.scss']
})
export class TeamSelectComponent {

  @Input() formGroup: FormGroup;

  teamEnum = TeamEnum;

  constructor() { }

  getTeamName(teamEnum: TeamEnum): string {

    if (teamEnum === TeamEnum.Cats) {
      return "Cats name";
    }
    else {
      return "Mouse name";
    }

  }

  selectTeam(teamEnum: TeamEnum): void {
    this.formGroup.controls.teamId.setValue(teamEnum);
  }

}
