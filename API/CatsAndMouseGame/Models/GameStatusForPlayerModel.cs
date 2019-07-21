using System.Collections.Generic;

namespace CatsAndMouseGame.Models
{
    public class GameStatusForPlayerModel
    {
        public List<PlayerModel> Players { get; set; }
        public int MyPlayerIndex { get; set; }
        public List<PlayerValidMove> MyValidMoves { get; set; }
    }
}
