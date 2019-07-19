


using CatsAndMouseGame.Enums;

namespace CatsAndMouseGame.Hubs
{
    public interface IMessageToClient
    {
        MessageToClientTypeEnum Type { get; set; }
    }
}
