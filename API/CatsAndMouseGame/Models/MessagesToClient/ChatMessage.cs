using CatsAndMouseGame.Enums;
using CatsAndMouseGame.Hubs;

namespace CatsAndMouseGame.Models
{
    public class ChatMessage : IMessageToClient
    {
        public MessageToClientTypeEnum TypeId { get; } = MessageToClientTypeEnum.ChatMessage;
        public string GameId { get; set; }

        public ChatLineModel ChatLine { get; set; }
    }
}
