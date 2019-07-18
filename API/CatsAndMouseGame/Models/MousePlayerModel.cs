using CatsAndMouseGame.Enums;
using System.Collections.Generic;

namespace CatsAndMouseGame.Models
{
    public class MousePlayerModel : PlayerModel
    {
        public MousePlayerModel()
        {
            this.PlayerType = PlayerTypeEnum.Mouse;

            this.Mouse = new MouseModel();
            
            this.Mouse.Position.RowIndex = 7;
            this.Mouse.Position.ColumnIndex = 4;
        }

        public MouseModel Mouse { get; set; }
    }
}
