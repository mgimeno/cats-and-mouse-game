using System.Collections.Generic;

namespace CatsAndMouseGame.Models
{
    public class PlayerValidMove
    {
        public int FigureId { get; set; }
        public List<FigurePositionModel> Positions { get; set; }
    }
}
