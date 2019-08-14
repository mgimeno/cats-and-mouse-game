import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { IChatLine } from '../../../shared/interfaces/chat-line.interface';
import { SignalrService } from '../../../shared/services/signalr-service';
import { IChatMessage } from '../../../shared/interfaces/chat-message.interface';
import { TeamEnum } from '../../../shared/enums/team.enum';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy {

  formGroup: FormGroup = null;
  chatLines: IChatLine[] = [];

  teamEnum = TeamEnum;

  constructor(private signalrService: SignalrService) {

    this.formGroup = new FormGroup({
      'message': new FormControl(null)
    });

  }

  ngOnInit() {
    this.signalrService.subscribeToMethod("ChatMessage", (message: IChatMessage) => {
        this.chatLines.push(message.chatLine);
    });
  }

  isSubmitButtonDisabled(): boolean {
    return !this.formGroup.controls.message.value || !this.formGroup.controls.message.value.length;
  }

  onSubmit(): void {

    this.signalrService.sendMessage("SendChatMessage", { message: this.formGroup.controls.message.value })
      .then(() => {
        this.formGroup.controls.message.setValue(null);
      })
      .catch((reason: any) => {
        console.error(reason);
      });

  }

  ngOnDestroy(): void {
    console.log("Destroy chat");
    this.signalrService.unsubscribeToMethod("ChatMessage");
  }
}
