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
        private static readonly Random random = new Random();


        public void CreateGame(string gameName, string userName, PlayerTypeEnum playerType, string gamePassword = null)
        {
            var newGame = new GameModel(gameName, gamePassword);

            switch (playerType)
            {
                case PlayerTypeEnum.Cats:

                    newGame.SetPlayer(newGame.CatsPlayer, userName, Context.ConnectionId);

                    break;
                case PlayerTypeEnum.Mouse:

                    newGame.SetPlayer(newGame.MousePlayer, userName, Context.ConnectionId);

                    break;
            }

            _games.Add(newGame);
            
            //Send the new game added command to all clients.
        }

        public void JoinGame(string gameId, string userName, PlayerTypeEnum playerType, string gamePassword = null)
        {
            var game = _games.FirstOrDefault(g => g.Id == gameId);

            if(game == null)
            {
                //todo fail fast
            }

            if (!string.IsNullOrWhiteSpace(game.Password) && (game.Password != gamePassword)) {
                //todo fail: password incorrect
            }

            if (game.IsPlayerTypeAlreadySelected(playerType)) {
                //todo fail: can't select that player type
            }

            game.SetRemainingPlayer(userName, Context.ConnectionId);

            game.Start();

            //todo Send the start command to mouse and cats players.
            //todo send a command to all clients that this game is on.
            

        }


        public void Subscribe(string userName)
        {

        }

        public async Task SendMessage(string gameId, string message)
        {

            await Clients.

            await Clients.All.SendAsync("ReceiveMessage", user, message);
        }

    }
}
