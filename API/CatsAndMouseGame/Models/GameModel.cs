
using CatsAndMouseGame.Enums;
using System;

namespace CatsAndMouseGame.Models
{
    public class GameModel
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string Password { get; set; }
        public CatsPlayerModel CatsPlayer { get; set; }
        public MousePlayerModel MousePlayer { get; set; }
        public DateTime DateCreated { get; set; }
        public DateTime? DateStarted { get; set; } = null;
        public DateTime? DateFinished { get; set; } = null;

        public GameModel(string gameName, string gamePassword = null)
        {
            this.Id = Guid.NewGuid().ToString();
            this.Name = gameName;
            this.Password = gamePassword;

            this.CatsPlayer = new CatsPlayerModel();
            this.MousePlayer = new MousePlayerModel();

            this.DateCreated = DateTime.UtcNow;
        }

        public void SetPlayer(PlayerModel player, string userName, string connectionId)
        {
            player.Name = userName;
            player.ConnectionId = connectionId;
        }

        public void SetRemainingPlayer(string userName, string connectionId)
        {
            if (!IsCatsPlayerReady())
            {
                SetPlayer(CatsPlayer, userName, connectionId);
            }
            else
            {
                SetPlayer(MousePlayer, userName, connectionId);
            }
        }

        public bool IsCatsPlayerReady()
        {
            return this.CatsPlayer.ConnectionId != null;
        }

        public bool IsMousePlayerReady()
        {
            return this.MousePlayer.ConnectionId != null;
        }

        public bool IsPlayerTypeAlreadySelected(PlayerTypeEnum playerType)
        {

            switch (playerType)
            {
                case PlayerTypeEnum.Cats:
                    return IsCatsPlayerReady();
                case PlayerTypeEnum.Mouse:
                    return IsMousePlayerReady();
            }

            return true;

        }

        public void Start()
        {
            this.MousePlayer.IsTheirTurn = true;
            this.DateStarted = DateTime.UtcNow;
        }

    }
}
