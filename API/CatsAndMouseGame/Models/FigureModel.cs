namespace CatsAndMouseGame.Models
{
    public class FigureModel
    {
        public FigureModel()
        {
            this.Position = new PositionModel();
        }

        public PositionModel Position { get; set; }
    }
}
