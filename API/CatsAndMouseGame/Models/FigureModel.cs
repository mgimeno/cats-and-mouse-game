using CatsAndMouseGame.Enums;
using System.Collections.Generic;

namespace CatsAndMouseGame.Models
{
    public class FigureModel
    {
        public int Id { get; set; }
        public FigurePositionModel Position { get; set; } //todo set should be disabled, use changePosition method instead.
        public FigureTypeEnum TypeId { get; set; } //todo also Id and type shouldn't use set proeprty, there should be a constructor and that's it.
        public List<FigurePositionModel> CanMoveToPositions { get; set; } //same

        public FigureModel()
        {
            this.Position = new FigurePositionModel();
            this.CanMoveToPositions = new List<FigurePositionModel>();
        }

        public void ChangePosition(int rowIndex, int columnIndex){
            this.Position.RowIndex = rowIndex;
            this.Position.ColumnIndex = columnIndex;
        }

        public void AddCanMoveToPosition(int rowIndex, int columnIndex) {
            this.CanMoveToPositions.Add(new FigurePositionModel {
                RowIndex = rowIndex,
                ColumnIndex = columnIndex
            });
        }

    }
}
