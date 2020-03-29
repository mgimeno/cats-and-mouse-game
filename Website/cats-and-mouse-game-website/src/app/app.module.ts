import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatDialogModule, MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';

import { ClipboardModule } from 'ngx-clipboard';

import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ErrorInterceptor } from './shared/interceptors/error.interceptor';
import { JwtInterceptor } from './shared/interceptors/jwt.interceptor';
import { LoaderInterceptor } from './shared/interceptors/loader.interceptor';
import { HowToPlayDialogComponent } from './components/how-to-play-dialog/how-to-play-dialog.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { PlayGameComponent } from './components/game/play-game/play-game.component';
import { CreateGameDialogComponent } from './components/game/create-game-dialog/create-game-dialog.component';
import { JoinGameDialogComponent } from './components/game/join-game-dialog/join-game-dialog.component';
import { HomeComponent } from './components/home/home.component';
import { MatTableModule, MatSnackBarModule, MatTooltipModule } from '@angular/material';
import { SignalrService } from './shared/services/signalr-service';
import { ChessBoxComponent } from './components/game/chess-box/chess-box.component';
import { ChatComponent } from './components/game/chat/chat.component';
import { ReconnectingDialogComponent } from './components/reconnecting-dialog/reconnecting-dialog.component';
import { LoaderComponent } from './shared/components/loader/loader.component';
import { TeamSelectComponent } from './shared/components/team-select/team-select.component';


@NgModule({
  declarations: [
    AppComponent,

    ReconnectingDialogComponent,

    HowToPlayDialogComponent,
    PageNotFoundComponent,

    CreateGameDialogComponent,
    JoinGameDialogComponent,
    PlayGameComponent,

    HomeComponent,

    ChessBoxComponent,
    ChatComponent,

    LoaderComponent,
    TeamSelectComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,

    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,

    MatButtonModule,
    MatFormFieldModule,
    MatOptionModule,
    MatSelectModule,
    MatInputModule,
    MatIconModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatBottomSheetModule,
    MatDialogModule,
    MatTableModule,
    MatSnackBarModule,
    MatTooltipModule,
    ClipboardModule
  ],
  entryComponents: [
    CreateGameDialogComponent,
    JoinGameDialogComponent,
    ReconnectingDialogComponent,
    HowToPlayDialogComponent
  ],
  providers: [
    SignalrService,
    { provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: { hasBackdrop: true, disableClose: true, minWidth:310 } },
    //{ provide: HTTP_INTERCEPTORS, useClass: LoaderInterceptor, multi: true },
    //{ provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    //{ provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
