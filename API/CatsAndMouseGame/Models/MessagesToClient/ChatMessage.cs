using CatsAndMouseGame.Enums;
using CatsAndMouseGame.Hubs;

namespace CatsAndMouseGame.Models
{
    public class ChatMessage : IMessageToClient
    {
        public MessageToClientTypeEnum TypeId { get; } = MessageToClientTypeEnum.ChatMessage;

        public ChatLineModel ChatLine { get; set; }
    }
}
