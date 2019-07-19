using CatsAndMouseGame.Enums;
using CatsAndMouseGame.Hubs;
using System.Collections.Generic;

namespace CatsAndMouseGame.Models
{
    public class UpdateGameList : IMessageToClient
    {
        public MessageToClientTypeEnum Type { get; set; } = MessageToClientTypeEnum.GameList;
        public List<GameListItem> GameList { get; set; } = new List<GameListItem>();
    }
}
