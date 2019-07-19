using System.Collections.Generic;

namespace CatsAndMouseGame.Models
{
    public class PlayerValidMoves
    {
        public int FigureId { get; set; }
        public List<PositionModel> Positions { get; set; }
    }
}
