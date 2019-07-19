
using CatsAndMouseGame.Enums;
using System;
using System.Collections.Generic;
using System.Linq;

namespace CatsAndMouseGame.Models
{
    public class GameModel
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string Password { get; set; }
        public List<PlayerModel> Players { get; set; }
        public DateTime DateCreated { get; set; }
        public DateTime? DateStarted { get; set; } = null;
        public DateTime? DateFinished { get; set; } = null;

        public GameModel(string gameName, string gamePassword = null)
        {
            this.Id = Guid.NewGuid().ToString();
            this.Name = gameName;
            this.Password = gamePassword;

            this.Players = new List<PlayerModel>();

            this.DateCreated = DateTime.UtcNow;
        }

        public void SetFirstPlayer(PlayerTypeEnum playerType, string userName, string connectionId)
        {
            SetPlayer(playerType, userName, connectionId);
        }

        public void SetSecondPlayer(string userName, string connectionId)
        {
            if (!IsPlayerTypeAlreadyConnected(PlayerTypeEnum.Cats))
            {
                SetPlayer(PlayerTypeEnum.Cats, userName, connectionId);
            }
            else
            {
                SetPlayer(PlayerTypeEnum.Mouse, userName, connectionId);
            }
        }

        public bool IsPlayerTypeAlreadyConnected(PlayerTypeEnum playerType)
        {
            return this.Players.Any(p => p.PlayerType == playerType);
        }

        public void Start()
        {
            var mousePlayer = GetPlayerByType(PlayerTypeEnum.Mouse);

            mousePlayer.IsTheirTurn = true;
            this.DateStarted = DateTime.UtcNow;
        }

        public PlayerModel GetPlayerByConnectionId(string connectionId)
        {
            return this.Players.Where(p => p.ConnectionId == connectionId).FirstOrDefault();
        }

        public FigureModel GetPlayerFigure(PlayerModel player, int figureId)
        {
            if (player == null)
            {
                return null;
            }

            return player.Figures.Where(c => c.Id == figureId).FirstOrDefault();
        }

        public List<PlayerValidMoves> GetPlayerValidMoves(PlayerModel player)
        {
            var result = new List<PlayerValidMoves>();

            //todo use IsPositionCurrentlyTaken()
            //todo check newPosition is not out of the array
            //todo can only move diagonally.

            if (player is CatsPlayerModel)
            {
                //Can only move to a greater rowIndex
            }
            else if (player is MousePlayerModel)
            {
                //Can only move to a lower rowIndex
            }

            return result;

        }

        public bool CanMove(PlayerModel player, FigureModel figure, int rowIndex, int columnIndex)
        {
            var playerValidMoves = GetPlayerValidMoves(player);

            if (playerValidMoves.Any(pvm => pvm.FigureId == figure.Id && pvm.Positions.Any(p => p.RowIndex == rowIndex && p.ColumnIndex == columnIndex))) {
                return true;
            }

            return false;
        }

        public void Move(FigureModel figure, int rowIndex, int columnIndex)
        {
            figure.ChangePosition(rowIndex, columnIndex);

            SetWinnerIfAny();
        }

        public bool IsGameOver()
        {
            return this.Players.Any(p => p.IsWinner);
        }

        public PlayerModel GetWinnerPlayer()
        {
            return this.Players.Where(p => p.IsWinner).FirstOrDefault();
        }

        public void SetNextTurn()
        {
            this.Players.ForEach(p => p.IsTheirTurn = !p.IsTheirTurn);
        }

        public PlayerModel GetCurrentTurnPlayer()
        {
            return this.Players.Where(p => p.IsTheirTurn).FirstOrDefault();
        }

        private void SetWinnerIfAny()
        {

            var mousePlayer = GetPlayerByType(PlayerTypeEnum.Mouse) as MousePlayerModel;
            var catsPlayer = GetPlayerByType(PlayerTypeEnum.Cats) as CatsPlayerModel;
            //todo, I don't link figures[0] maybe create a method getMouse() ?
            if (mousePlayer.Figures[0].Position.RowIndex == 0)
            {
                mousePlayer.IsWinner = true;
            }
            else
            {

                var nextTurnPlayer = (mousePlayer.IsTheirTurn ? catsPlayer as PlayerModel : mousePlayer as PlayerModel);

                var canNextTurnPlayerMoveAnyFigure = GetPlayerValidMoves(nextTurnPlayer).Any();

                if (!canNextTurnPlayerMoveAnyFigure)
                {
                    var currentTurnPlayer = GetCurrentTurnPlayer();
                    currentTurnPlayer.IsWinner = true;
                }
            }

            if (IsGameOver())
            {
                this.DateFinished = DateTime.UtcNow;
            }
        }

        private PlayerModel GetPlayerByType(PlayerTypeEnum playerType)
        {
            return this.Players.Where(p => p.PlayerType == playerType).FirstOrDefault();
        }

        private void SetPlayer(PlayerTypeEnum playerType, string userName, string connectionId)
        {
            PlayerModel player;
            if (playerType == PlayerTypeEnum.Cats)
            {
                player = new CatsPlayerModel();
            }
            else
            {
                player = new MousePlayerModel();
            }

            player.Name = userName;
            player.ConnectionId = connectionId;

            this.Players.Add(player);
        }

        private bool IsPositionCurrentlyTaken(int rowIndex, int columnIndex) {
            return this.Players.Any(p => p.Figures.Any(f => f.Position.RowIndex == rowIndex && f.Position.ColumnIndex == columnIndex));
        }

    }
}
