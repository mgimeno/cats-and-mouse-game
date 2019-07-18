using CatsAndMouseGame.Enums;
using System.Collections.Generic;

namespace CatsAndMouseGame.Models
{
    public class CatsPlayerModel : PlayerModel
    {
        public CatsPlayerModel()
        {
            this.PlayerType = PlayerTypeEnum.Cats;

            this.Cats = new List<CatModel>();

            var cat1 = new CatModel();
            cat1.Position.RowIndex = 0;
            cat1.Position.ColumnIndex = 1;
            this.Cats.Add(cat1);

            var cat2 = new CatModel();
            cat2.Position.RowIndex = 0;
            cat2.Position.ColumnIndex = 3;
            this.Cats.Add(cat2);

            var cat3 = new CatModel();
            cat3.Position.RowIndex = 0;
            cat3.Position.ColumnIndex = 5;
            this.Cats.Add(cat3);

            var cat4 = new CatModel();
            cat4.Position.RowIndex = 0;
            cat4.Position.ColumnIndex = 7;
            this.Cats.Add(cat4);
        }

        public List<CatModel> Cats { get; set; }
    }
}
