using CatsAndMouseGame.Enums;
using CatsAndMouseGame.Models;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CatsAndMouseGame.Hubs
{
    [EnableCors("CorsPolicy")]
    public class GameHub : Hub
    {

        private static readonly List<GameModel> _games = new List<GameModel>();
        private static readonly List<string> _connections = new List<string>();

        public GameListItem CreateGame(CreateGameModel model)
        {
            var newGame = new GameModel(model.GamePassword);
            newGame.SetFirstPlayer(model.TeamId, model.UserName, Context.ConnectionId);

            _games.Add(newGame);

            SendGamesAwaitingForSecondPlayerToAllClientsAsync();

            return BuildGameListItem(newGame);
        }

        public void JoinGame(JoinGameModel model)
        {
            var game = _games.Where(g => g.Id == model.GameId).FirstOrDefault();

            if (game == null)
            {
                throw new Exception("Game does not exist");
            }

            if (game.IsPasswordProtected() && (game.Password != model.GamePassword))
            {
                throw new Exception("Game password is invalid");
            }

            if (!game.IsWaitingForSecondPlayer())
            {
                throw new Exception("Game is in progress or over");
            }

            game.SetSecondPlayer(model.UserName, Context.ConnectionId);

            game.Start();

            SendMessageToClientsAsync("GameStart", game.GetPlayersConnections(), new GameStartMessage());

            SendGamesAwaitingForSecondPlayerToAllClientsAsync();
        }

        public void Move(MoveFigureModel model)
        {
            var game = GetInProgressGameByCurrentConnectionId();

            if (game.IsGameOver())
            {
                throw new Exception("Game is over");
            }

            var player = game.GetPlayerByConnectionId(Context.ConnectionId);

            if (player == null)
            {
                throw new Exception("Player does not exist");
            }

            if (!player.IsTheirTurn)
            {
                throw new Exception("It's not your turn");
            }

            var figure = game.GetPlayerFigure(player, model.FigureId);

            if (figure == null)
            {
                throw new Exception("Figure does not exist");
            }

            if (!game.CanMove(figure, model.RowIndex, model.ColumnIndex))
            {
                throw new Exception("This figure cannot be moved to that position");
            }

            game.Move(figure, model.RowIndex, model.ColumnIndex);

            if (game.IsGameOver())
            {
                SendGameStatusToPlayers(game);
            }
            else
            {
                game.SetNextTurn();

                SendGameStatusToPlayers(game);
            }
        }

        public void CancelGame(GameIdModel model)
        {
            var game = _games
                .Where(g => g.Id == model.GameId)
                .Where(g => g.IsWaitingForSecondPlayer())
                .Where(g => g.GetPlayerByConnectionId(Context.ConnectionId) != null)
                .FirstOrDefault();

            if (game != null)
            {
                _games.Remove(game);
                SendGamesAwaitingForSecondPlayerToAllClientsAsync();
            }
        }

        public void SendInProgressGameStatusByConnectionId()
        {
            var game = GetInProgressGameByCurrentConnectionId();

            var player = game.GetPlayerByConnectionId(Context.ConnectionId);

            SendGameStatusToPlayer(game, player);
        }

        public bool HasInProgressGameByConnectionId()
        {
            var game = GetInProgressGameByCurrentConnectionId();

            return (game != null);
        }

        public void SendChatMessage(MessageModel model)
        {

            var game = GetGameByCurrentConnectionId();

            var player = game.GetPlayerByConnectionId(Context.ConnectionId);

            var message = new ChatMessage
            {
                ChatLine = new ChatLineModel
                {
                    UserName = player.Name,
                    TeamId = player.TeamId,
                    Message = model.Message
                }
            };

            SendMessageToClientsAsync("ChatMessage", game.GetPlayersConnections(), message);

        }

        public async override Task OnConnectedAsync()
        {
            if (!_connections.Any(c => c == Context.ConnectionId))
            {
                _connections.Add(Context.ConnectionId);
            }

            SendGamesAwaitingForSecondPlayerToCallerAsync();

            await base.OnConnectedAsync();
        }

        public async override Task OnDisconnectedAsync(Exception exception)
        {
            if (_connections.Any(c => c == Context.ConnectionId))
            {
                //todo if he was part of an active game, they have lost.
                //set to lost and send message to opponent
                //also send message to all saying game is over.
                //also delete the game from _games.

                _connections.Remove(Context.ConnectionId);
            }

            await base.OnDisconnectedAsync(exception);
        }

        public void ExitGameByConnectionId()
        {

            var message = new MessageModel
            {
                Message = "left the game."
            };
            SendChatMessage(message);

            var game = GetGameByCurrentConnectionId();

            if (!game.IsGameOver())
            {

                var player = game.GetPlayerByConnectionId(Context.ConnectionId);
                var opponentPlayer = game.Players.Where(p => p.ConnectionId != Context.ConnectionId).FirstOrDefault();

                game.PlayerLeftGame(player, opponentPlayer);

                SendGameStatusToPlayer(game, opponentPlayer);

            }

        }


        private GameModel GetInProgressGameByCurrentConnectionId()
        {
            var game = _games
                .Where(g => g.IsGameInProgress())
                .Where(g => g.Players.Any(p => p.ConnectionId == Context.ConnectionId))
                .FirstOrDefault();

            if (game == null)
            {
                throw new Exception("Game does not exist");
            }

            return game;
        }

        private GameModel GetGameByCurrentConnectionId()
        {
            var game = _games
                .Where(g => g.Players.Any(p => p.ConnectionId == Context.ConnectionId))
                .FirstOrDefault();

            if (game == null)
            {
                throw new Exception("Game does not exist");
            }

            return game;
        }


        private void SendGameStatusToPlayers(GameModel game)
        {
            foreach (var player in game.Players)
            {
                SendGameStatusToPlayer(game, player);
            }

        }

        private void SendGameStatusToPlayer(GameModel game, PlayerModel player)
        {
            var gameStatus = GetGameStatusForPlayer(game, player);
            var connectionsIds = new List<string> { player.ConnectionId };

            var message = new GameStatusMessage
            {
                GameStatus = gameStatus
            };

            SendMessageToClientsAsync("GameStatus", connectionsIds, message);
        }



        private async Task SendMessageToClientsAsync(string methodName, List<string> connectionsIds, IMessageToClient message)
        {
            await Clients.Clients(connectionsIds).SendAsync(methodName, message);
        }

        public void SendGamesAwaitingForSecondPlayerToCallerAsync()
        {
            var message = new GameListMessage();
            message.GameList = GetGamesAwaitingForSecondPlayer();

            SendMessageToClientsAsync("GameList", new List<string> { Context.ConnectionId }, message);
        }


        private async Task SendGamesAwaitingForSecondPlayerToAllClientsAsync()
        {

            var message = new GameListMessage();
            message.GameList = GetGamesAwaitingForSecondPlayer();

            await SendMessageToClientsAsync("GameList", _connections, message);
        }

        private List<GameListItem> GetGamesAwaitingForSecondPlayer()
        {
            var gamesAwaitingForSecondPlayer = new List<GameListItem>();

            _games
                .Where(g => g.IsWaitingForSecondPlayer())
                .OrderByDescending(g => g.DateCreated)
                .ToList()
                .ForEach(g => gamesAwaitingForSecondPlayer.Add(BuildGameListItem(g)));

            return gamesAwaitingForSecondPlayer;


        }

        //todo rename GameListItem
        //todo rename BuildGameListItem (this is a game that hasn't started) call it like this.
        private GameListItem BuildGameListItem(GameModel game)
        {
            return new GameListItem
            {
                GameId = game.Id,
                UserName = game.Players[0].Name,
                TeamId = game.Players[0].TeamId,
                IsPasswordProtected = game.IsPasswordProtected()
            };
        }

        private GameStatusForPlayerModel GetGameStatusForPlayer(GameModel game, PlayerModel player)
        {
            return new GameStatusForPlayerModel
            {
                Players = game.Players,
                MyPlayerIndex = game.Players.IndexOf(player)
            };

        }

    }
}
