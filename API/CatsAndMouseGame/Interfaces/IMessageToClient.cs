


using CatsAndMouseGame.Enums;

namespace CatsAndMouseGame.Hubs
{
    public interface IMessageToClient
    {
        MessageToClientTypeEnum TypeId { get; }
    }
}
