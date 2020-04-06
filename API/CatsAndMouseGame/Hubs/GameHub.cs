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

        private static readonly ConnectionMapping<string> _connections = new ConnectionMapping<string>();

        public async override Task OnConnectedAsync()
        {
            await base.OnConnectedAsync();
        }

        public void RegisterConnection(string userId)
        {
            if (!_connections.GetConnectionsByKey(userId).Contains(Context.ConnectionId))
            {
                _connections.Add(userId, Context.ConnectionId);
            }

            var playerInProgressGame = GetInProgressGame();
            if (playerInProgressGame != null)
            {
                SendInProgressGameStatusToCaller();
            }
            else {
                SendGamesAwaitingForSecondPlayerToCallerAsync();
            }

            SendWhetherHasInProgressGameToCaller();
        }

        public async override Task OnDisconnectedAsync(Exception exception)
        {
            var result = _connections.RemoveConnection(Context.ConnectionId);

            if (!result.HasOtherActiveConnections)
            {
                CancelGamesThatHaveNotStartedCreatedByUser(result.Key);
            }

            await base.OnDisconnectedAsync(exception);
        }

        public GameListItem CreateGame(CreateGameModel model)
        {
            var userId = GetUserIdByCurrentConnectionId();

            if (GetGamesAwaitingForSecondPlayer().Any(g => g.UserId == userId)) {
                throw new Exception("You are already creating another game");
            }

            var newGame = new GameModel(model.GamePassword);
            newGame.SetFirstPlayer(model.TeamId, model.UserName, userId);

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

            if (game.Players[0].UserId == GetUserIdByCurrentConnectionId()) {
                throw new Exception("You cannot join your own game");
            }

            game.SetSecondPlayer(model.UserName, GetUserIdByCurrentConnectionId());

            game.Start();

            var allPlayersConnections = GetAllConnectionsByUsersIds(game.GetPlayersUsersIds());

            SendMessageToClientsAsync("GameStart", allPlayersConnections, new GameStartMessage());

            SendGamesAwaitingForSecondPlayerToAllClientsAsync();
        }

        public void Move(MoveFigureModel model)
        {
            var game = GetInProgressGame();

            if (game == null)
            {
                throw new Exception("Game does not exist");
            }

            if (game.IsGameOver())
            {
                throw new Exception("Game is over");
            }

            var player = game.GetPlayerByUserId(GetUserIdByCurrentConnectionId());

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
                SendGameStatusToAllPlayers(game);
            }
            else
            {
                game.SetNextTurn();

                SendGameStatusToAllPlayers(game);
            }
        }

        public void CancelGameThatHasNotStarted(CancelGameModel model)
        {
            var game = _games
                .Where(g => g.Id == model.GameId)
                .Where(g => g.IsWaitingForSecondPlayer())
                .Where(g => g.GetPlayerByUserId(model.UserId) != null)
                .FirstOrDefault();

            if (game != null)
            {
                _games.Remove(game);


                if (model.SendAwaitingGamesToAllClients)
                {
                    SendGamesAwaitingForSecondPlayerToAllClientsAsync();
                }
            }
        }

        public void SendInProgressGameStatusToCaller()
        {
            var game = GetInProgressGame();

            if (game == null)
            {
                throw new Exception("Game does not exist");
            }

            var player = game.GetPlayerByUserId(GetUserIdByCurrentConnectionId());

            SendGameStatusToPlayer(game, player);
        }

        public void SendWhetherHasInProgressGameToCaller() {
            var game = GetInProgressGame();

            var message = new PlayerHasInProgressGameMessage
            {
                HasInProgressGame = (game != null)
            };
            SendMessageToClientsAsync("HasInProgressGame", GetAllConnectionsOfCurrentConnectionUser(), message);
        }

        public void SendChatMessage(ChatLineSentByClientModel model)
        {

            var game = GetGame(model.GameId);

            var player = game.GetPlayerByUserId(GetUserIdByCurrentConnectionId());

            var message = new ChatMessage
            {
                GameId = model.GameId,
                ChatLine = new ChatLineModel
                {
                    UserName = player.Name,
                    TeamId = player.TeamId,
                    Message = model.Message
                }
            };

            var allPlayersConnections = GetAllConnectionsByUsersIds(game.GetPlayersUsersIds());

            SendMessageToClientsAsync("ChatMessage", allPlayersConnections, message);

        }

        public void ExitInProgressGame()
        {
            var game = GetInProgressGame();
            var playerWhoLeft = game.GetPlayerByUserId(GetUserIdByCurrentConnectionId());
            var opponentPlayer = game.Players.Where(p => p.UserId != playerWhoLeft.UserId).FirstOrDefault();

            var message = new PlayerHasLeftGameMessage
            {
                GameId = game.Id,
                UserName = playerWhoLeft.Name,
                TeamId = playerWhoLeft.TeamId
            };

            SendMessageToClientsAsync("PlayerHasLeftGame", GetAllConnectionsByUsersIds(new List<string>() { opponentPlayer.UserId }), message);

           
            game.PlayerLeft(playerWhoLeft);

            SendGameStatusToPlayer(game, opponentPlayer);

        }

        public void ExitFinishedGame(GameIdModel model)
        {
            var game = GetGame(model.GameId);
            var playerWhoLeft = game.GetPlayerByUserId(GetUserIdByCurrentConnectionId());
            var opponentPlayer = game.Players.Where(p => p.UserId != playerWhoLeft.UserId).FirstOrDefault();

            var message = new PlayerHasLeftGameMessage
            {
                GameId = game.Id,
                UserName = playerWhoLeft.Name,
                TeamId = playerWhoLeft.TeamId
            };

            SendMessageToClientsAsync("PlayerHasLeftGame", GetAllConnectionsByUsersIds(new List<string>() { opponentPlayer.UserId }), message);

            game.PlayerLeft(playerWhoLeft);

            SendGameStatusToPlayer(game, opponentPlayer);
        }


        private GameModel GetInProgressGame()
        {
            var userId = GetUserIdByCurrentConnectionId();

            var game = _games
                .Where(g => g.IsGameInProgress())
                .Where(g => g.Players.Any(p => p.UserId == userId))
                .FirstOrDefault();

            return game;
        }

        private GameModel GetGame(string gameId = null)
        {
            var userId = GetUserIdByCurrentConnectionId();

            var game = _games
                .Where(g => g.Players.Any(p => p.UserId == userId))
                .Where(g => (gameId == null || (g.Id.Equals(gameId))))
                .FirstOrDefault();

            if (game == null)
            {
                throw new Exception("Game does not exist");
            }

            return game;
        }


        private void SendGameStatusToAllPlayers(GameModel game)
        {
            foreach (var player in game.Players)
            {
                SendGameStatusToPlayer(game, player);
            }

        }

        private void SendGameStatusToPlayer(GameModel game, PlayerModel player)
        {
            var gameStatus = GetGameStatusForPlayer(game, player);
            var userConnections = _connections.GetConnectionsByKey(player.UserId);

            var message = new GameStatusMessage
            {
                GameStatus = gameStatus
            };

            SendMessageToClientsAsync("GameStatus", userConnections, message);
        }



        private async Task SendMessageToClientsAsync(string methodName, List<string> connectionsIds, IMessageToClient message)
        {
            await Clients.Clients(connectionsIds).SendAsync(methodName, message);
        }

        public void SendGamesAwaitingForSecondPlayerToCallerAsync()
        {
            var message = new GameListMessage();
            message.GameList = GetGamesAwaitingForSecondPlayer();

            SendMessageToClientsAsync("GameList", GetAllConnectionsOfCurrentConnectionUser(), message);
        }


        private async Task SendGamesAwaitingForSecondPlayerToAllClientsAsync()
        {

            var message = new GameListMessage();
            message.GameList = GetGamesAwaitingForSecondPlayer();

            await SendMessageToClientsAsync("GameList", _connections.GetAllConnections(), message);
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

        private GameListItem BuildGameListItem(GameModel game)
        {
            return new GameListItem
            {
                GameId = game.Id,
                UserId = game.Players[0].UserId,
                UserName = game.Players[0].Name,
                TeamId = game.Players[0].TeamId,
                IsPasswordProtected = game.IsPasswordProtected()
            };
        }

        private GameStatusForPlayerModel GetGameStatusForPlayer(GameModel game, PlayerModel player)
        {
            return new GameStatusForPlayerModel
            {
                GameId = game.Id,
                Players = game.Players,
                MyPlayerIndex = game.Players.IndexOf(player)
            };

        }

        private void CancelGamesThatHaveNotStartedCreatedByUser(string userId)
        {
            var gamesIds = GetGamesAwaitingForSecondPlayer().Select(g => g.GameId).ToList();

            var games = _games
                .Where(g => gamesIds.Contains(g.Id))
                .Where(g => g.GetPlayerByUserId(userId) != null)
                .ToList();

            games.ForEach(g => CancelGameThatHasNotStarted(new CancelGameModel
            {
                GameId = g.Id,
                UserId = userId,
                SendAwaitingGamesToAllClients = false
            }));

            SendGamesAwaitingForSecondPlayerToAllClientsAsync();
        }

        private string GetUserIdByCurrentConnectionId()
        {
            return _connections.GetKeyByConnection(Context.ConnectionId);
        }

        private List<string> GetAllConnectionsOfCurrentConnectionUser()
        {
            var userId = GetUserIdByCurrentConnectionId();

            return _connections.GetConnectionsByKey(userId);
        }

        private List<string> GetAllConnectionsByUsersIds(List<string> usersIds)
        {
            var result = new List<string>();

            foreach (var userId in usersIds)
            {
                result.AddRange(_connections.GetConnectionsByKey(userId));
            }

            return result;
        }

    }
}
