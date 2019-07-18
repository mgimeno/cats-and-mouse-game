using CatsAndMouseGame.Enums;

namespace CatsAndMouseGame.Models
{
    public class PlayerModel
    {
        public string ConnectionId { get; set; } = null;
        public string Name { get; set; } = null;
        public bool IsTheirTurn { get; set; } = false;
        public PlayerTypeEnum PlayerType { get; set; }
        
    }
}
