using CatsAndMouseGame.Enums;

namespace CatsAndMouseGame.Models
{
    public class MousePlayerModel : PlayerModel
    {

        public MousePlayerModel()
        {
            this.PlayerType = PlayerTypeEnum.Mouse;

            var mouse = new MouseModel
            {
                Id = 1,
                Position = new PositionModel
                {
                    RowIndex = 7,
                    ColumnIndex = 4
                }
            };

            this.Figures.Add(mouse);
        }


    }
}
