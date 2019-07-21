using CatsAndMouseGame.Enums;
using CatsAndMouseGame.Hubs;
using System.Collections.Generic;

namespace CatsAndMouseGame.Models
{
    public class GameListMessage : IMessageToClient
    {
        public MessageToClientTypeEnum TypeId { get; } = MessageToClientTypeEnum.GameList;
        public List<GameListItem> GameList { get; set; } = new List<GameListItem>();
    }
}
