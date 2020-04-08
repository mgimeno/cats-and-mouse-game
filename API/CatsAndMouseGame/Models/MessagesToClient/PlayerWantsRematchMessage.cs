using CatsAndMouseGame.Enums;
using CatsAndMouseGame.Hubs;

namespace CatsAndMouseGame.Models
{
    public class PlayerWantsRematchMessage : IMessageToClient
    {
        public MessageToClientTypeEnum TypeId { get; } = MessageToClientTypeEnum.PlayerHasLeftGame;
        public string GameId { get; set; }
        public string UserName { get; set; }
        public TeamEnum TeamId { get; set; }
    }
}
