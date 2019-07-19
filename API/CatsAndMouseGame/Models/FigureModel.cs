namespace CatsAndMouseGame.Models
{
    public class FigureModel
    {
        public int Id { get; set; }
        public PositionModel Position { get; set; }

        public FigureModel()
        {
            this.Position = new PositionModel();
        }

        public void ChangePosition(int rowIndex, int columnIndex){
            this.Position.RowIndex = rowIndex;
            this.Position.ColumnIndex = columnIndex;
        }

    }
}
