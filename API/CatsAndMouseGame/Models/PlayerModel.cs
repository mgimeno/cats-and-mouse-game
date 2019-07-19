using CatsAndMouseGame.Enums;
using System.Collections.Generic;

namespace CatsAndMouseGame.Models
{
    public class PlayerModel
    {
        public string ConnectionId { get; set; } = null;
        public string Name { get; set; } = null;
        public bool IsTheirTurn { get; set; } = false;
        public PlayerTypeEnum PlayerType { get; set; }
        public bool IsWinner { get; set; } = false;

        public List<FigureModel> Figures { get; set; }

        public PlayerModel() {
            this.Figures = new List<FigureModel>();
        }
        
    }
}
