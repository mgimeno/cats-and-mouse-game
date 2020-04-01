import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { IChatLine } from '../../../shared/interfaces/chat-line.interface';
import { SignalrService } from '../../../shared/services/signalr-service';
import { IChatMessage } from '../../../shared/interfaces/chat-message.interface';
import { TeamEnum } from '../../../shared/enums/team.enum';
import { NotificationService } from 'src/app/shared/services/notification.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy {

  @Input() gameId: string;

  formGroup: FormGroup = null;
  chatLines: IChatLine[] = [];

  teamEnum = TeamEnum;

  constructor(
    private signalrService: SignalrService,
    private notificationService: NotificationService) {

    this.formGroup = new FormGroup({
      'message': new FormControl(null)
    });

  }

  ngOnInit() {
    this.signalrService.subscribeToMethod("ChatMessage", (message: IChatMessage) => {
      if (message.gameId === this.gameId) {
        this.chatLines.push(message.chatLine);
      }
    });
  }

  isSubmitButtonDisabled(): boolean {
    return !this.formGroup.controls.message.value || !this.formGroup.controls.message.value.length;
  }

  onSubmit(): void {

    this.signalrService.sendMessage("SendChatMessage", { gameId: this.gameId, message: this.formGroup.controls.message.value })
      .then(() => {
        this.formGroup.controls.message.setValue(null);
      })
      .catch((reason: any) => {
        this.notificationService.showError("Error when sending message");
        console.error(reason);
      });

  }

  ngOnDestroy(): void {
    console.log("Destroy chat");
    this.signalrService.unsubscribeToMethod("ChatMessage");
  }
}
