using CatsAndMouseGame.Enums;
using CatsAndMouseGame.Models;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CatsAndMouseGame.Hubs
{
    public class GameHub : Hub
    {

        private static readonly List<GameModel> _games = new List<GameModel>();
        private static readonly List<string> _connections = new List<string>();


        public void CreateGame(string gameName, string userName, PlayerTypeEnum playerType, string gamePassword = null)
        {
            var newGame = new GameModel(gameName, gamePassword);
            newGame.SetFirstPlayer(playerType, userName, Context.ConnectionId);

            _games.Add(newGame);

            //Send the new game added command to all clients (not whole gameModel, just needed data)
        }

        public void JoinGame(string gameId, string userName, PlayerTypeEnum playerType, string gamePassword = null)
        {
            var game = _games.Where(g => g.Id == gameId).FirstOrDefault();

            if (game == null)
            {
                throw new Exception("Game does not exist");
            }

            if (!string.IsNullOrWhiteSpace(game.Password) && (game.Password != gamePassword))
            {
                throw new Exception("Game password is invalid");
            }

            if (game.IsPlayerTypeAlreadyConnected(playerType))
            {
                throw new Exception("The other player has already chosen this player type");
            }

            game.SetSecondPlayer(userName, Context.ConnectionId);

            game.Start();

            //todo Send the start command to mouse and cats players (not all clients)
            //todo send a command to all clients that this game is on.
        }

        public void Move(string gameId, int figureId, int rowIndex, int columnIndex)
        {
            var game = _games.Where(g => g.Id == gameId).FirstOrDefault();

            if (game == null)
            {
                throw new Exception("Game does not exist");
            }

            var player = game.GetPlayerByConnectionId(Context.ConnectionId);

            if (player == null)
            {
                throw new Exception("Player does not exist");
            }

            var figure = game.GetPlayerFigure(player, figureId);

            if (figure == null)
            {
                throw new Exception("Figure does not exist");
            }

            if (!game.CanMove(player, figure, rowIndex, columnIndex))
            {
                throw new Exception("This figure cannot be moved to that position");
            }

            game.Move(figure, rowIndex, columnIndex);

            //Send to mouse and cat (not all clients) that figure has moved.

            if (game.IsGameOver())
            {
                var winner = game.GetWinnerPlayer();

                //send event to both cat and mouse (not all)
                //todo send event to all clients, this game is over.

                //remove game?
                _games.Remove(game);
            }
            else
            {
                NextTurn(game);
            }
        }


        private void NextTurn(GameModel game)
        {

            game.SetNextTurn();

            var currentTurnPlayer = game.GetCurrentTurnPlayer();
            var newTurnPlayerValidMoves = game.GetPlayerValidMoves(currentTurnPlayer);

            //send message so new player can move, send their available moves for each figure.
        }

        public override Task OnConnectedAsync()
        {
            if (!_connections.Any(c => c == Context.ConnectionId))
            {
                _connections.Add(Context.ConnectionId);
            }

            //todo send the caller all the games. (not the whole game Model, just a list with the needed data)

            return base.OnConnectedAsync();
        }

        public override Task OnDisconnectedAsync(Exception exception)
        {
            if (_connections.Any(c => c == Context.ConnectionId))
            {
                //todo if he was part of an active game, they have lost.
                //set to lost and send message to opponent
                //also send message to all saying game is over.

                _connections.Remove(Context.ConnectionId);
            }

            return base.OnDisconnectedAsync(exception);
        }

        private async Task SendToClientsAsync(List<string> connectionsIds, string action, string parameters)
        {
            //todo message is an enum with the possible actions?
            await Clients.Clients(connectionsIds).SendAsync(action, parameters);
        }

    }
}
