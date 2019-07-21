using CatsAndMouseGame.Enums;

namespace CatsAndMouseGame.Models
{
    public class FigureModel
    {
        public int Id { get; set; }
        public FigurePositionModel Position { get; set; } //todo set should be disabled, use changePosition method instead.
        public FigureTypeEnum TypeId { get; set; } //todo also Id and type shouldn't use set proeprty, there should be a constructor and that's it.

        public FigureModel()
        {
            this.Position = new FigurePositionModel();
        }

        public void ChangePosition(int rowIndex, int columnIndex){
            this.Position.RowIndex = rowIndex;
            this.Position.ColumnIndex = columnIndex;
        }

    }
}
