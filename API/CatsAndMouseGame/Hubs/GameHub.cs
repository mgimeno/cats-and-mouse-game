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

            //todo this method has to return (not send with signalR, jus treturn) the newly created game.(Game List item)
            SendGameListToClientsAsync(_connections);

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

            game.SetSecondPlayer(model.UserName, Context.ConnectionId);

            game.Start();

            SendGameListToClientsAsync(_connections);

            SendMessageToClientsAsync(game.GetPlayersConnections(), new GameStartMessage());
        }

        public void Move(MoveFigureModel model)
        {
            var game = GetGameByCurrentConnectionId();

            var player = game.GetPlayerByConnectionId(Context.ConnectionId);

            if (player == null)
            {
                throw new Exception("Player does not exist");
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

                _games.Remove(game);
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
                .Where(g => g.IsWaitingForSecondPlayerToStart())
                .Where(g => g.GetPlayerByConnectionId(Context.ConnectionId) != null)
                .FirstOrDefault();

            if (game != null)
            {
                _games.Remove(game);
                SendGameListToClientsAsync(_connections);
            }
        }

        public List<GameListItem> GetGameList()
        {
            var result = new List<GameListItem>();

            _games
                .Where(g => g.IsWaitingForSecondPlayerToStart())
                .ToList()
                .ForEach(g => result.Add(BuildGameListItem(g)));

            return result;
        }

        public void GetGameStatusByConnectionId()
        {
            var game = GetGameByCurrentConnectionId();

            var player = game.GetPlayerByConnectionId(Context.ConnectionId);

            SendGameStatusToPlayer(player);
        }

        public void SendChatMessage(MessageModel model)
        {

            var game = GetGameByCurrentConnectionId();

            var message = new ChatMessage
            {
                ChatLine = new ChatLineModel
                {
                    UserName = game.GetPlayerByConnectionId(Context.ConnectionId).Name,
                    Message = model.Message
                }
            };

            SendMessageToClientsAsync(game.GetPlayersConnections(), message);

        }

        public async override Task OnConnectedAsync()
        {
            if (!_connections.Any(c => c == Context.ConnectionId))
            {
                _connections.Add(Context.ConnectionId);
            }

            await SendGameListToClientsAsync(new List<string>() { Context.ConnectionId });

            await base.OnConnectedAsync();
        }

        public async override Task OnDisconnectedAsync(Exception exception)
        {
            if (_connections.Any(c => c == Context.ConnectionId))
            {
                //todo if he was part of an active game, they have lost.
                //set to lost and send message to opponent
                //also send message to all saying game is over.

                _connections.Remove(Context.ConnectionId);
            }

            await base.OnDisconnectedAsync(exception);
        }

        private GameModel GetGameByCurrentConnectionId()
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


        private void SendGameStatusToPlayers(GameModel game)
        {
            foreach (var player in game.Players)
            {
                SendGameStatusToPlayer(player);
            }

        }

        private void SendGameStatusToPlayer(PlayerModel player)
        {
            var gameStatus = GetGameStatusForPlayer(player);
            var connectionsIds = new List<string> { player.ConnectionId };

            var message = new GameStatusMessage
            {
                GameStatus = gameStatus
            };

            SendMessageToClientsAsync(connectionsIds, message);
        }



        private async Task SendMessageToClientsAsync(List<string> connectionsIds, IMessageToClient message)
        {
            await Clients.Clients(connectionsIds).SendAsync("messageToClient", message);
        }

        private async Task SendGameListToClientsAsync(List<string> connectionsIds)
        {

            var message = new GameListMessage();
            message.GameList = GetGameList();

            await SendMessageToClientsAsync(connectionsIds, message);
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

        private GameStatusForPlayerModel GetGameStatusForPlayer(PlayerModel player)
        {
            var game = GetGameByCurrentConnectionId();

            return new GameStatusForPlayerModel
            {
                Players = game.Players,
                MyPlayerIndex = game.Players.IndexOf(player)
            };

        }

    }
}
