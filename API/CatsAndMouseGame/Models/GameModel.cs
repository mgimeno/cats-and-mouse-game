
using CatsAndMouseGame.Enums;
using System;
using System.Collections.Generic;
using System.Linq;

namespace CatsAndMouseGame.Models
{
    public class GameModel
    {
        public string Id { get; set; }
        public string Password { get; set; }
        public List<PlayerModel> Players { get; set; }
        public DateTime DateCreated { get; set; }
        public DateTime? DateStarted { get; set; } = null;
        public DateTime? DateFinished { get; set; } = null;

        public GameModel(string gamePassword = null)
        {
            this.Id = Guid.NewGuid().ToString().Replace("-","").Substring(0,5);
            this.Password = gamePassword;

            this.Players = new List<PlayerModel>();

            this.DateCreated = DateTime.UtcNow;
        }

        public void SetFirstPlayer(TeamEnum teamId, string userName, string connectionId)
        {
            SetPlayer(teamId, userName, connectionId);
        }

        public void SetSecondPlayer(string userName, string connectionId)
        {
            if (!IsTeamAlreadyConnected(TeamEnum.Cats))
            {
                SetPlayer(TeamEnum.Cats, userName, connectionId);
            }
            else
            {
                SetPlayer(TeamEnum.Mouse, userName, connectionId);
            }
        }

        public bool IsTeamAlreadyConnected(TeamEnum teamId)
        {
            return this.Players.Any(p => p.TeamId == teamId);
        }

        public void Start()
        {
            var mousePlayer = GetPlayerByTeam(TeamEnum.Mouse);

            mousePlayer.IsTheirTurn = true;
            this.DateStarted = DateTime.UtcNow;

            RecalculateFiguresCanMoveToPositions();
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

        public List<string> GetPlayersConnections() {
            return this.Players.Select(p => p.ConnectionId).ToList();
        }

        

        public void RecalculateFiguresCanMoveToPositions()
        {

            foreach (var player in this.Players) {

                foreach (var figure in player.Figures)
                {

                    figure.CanMoveToPositions = new List<FigurePositionModel>();

                    var moveUpwardsRowIndex = figure.Position.RowIndex - 1;
                    var moveDownwardsRowIndex = figure.Position.RowIndex + 1;

                    var moveLeftwards = figure.Position.ColumnIndex - 1;
                    var moveRightwards = figure.Position.ColumnIndex + 1;

                    if (figure.TypeId == FigureTypeEnum.Mouse) {

                        //up-left
                        if (this.IsNewPositionValid(moveUpwardsRowIndex, moveLeftwards)) {
                            figure.AddCanMoveToPosition(moveUpwardsRowIndex, moveLeftwards);
                        }

                        //up-right
                        if (this.IsNewPositionValid(moveUpwardsRowIndex, moveRightwards))
                        {
                            figure.AddCanMoveToPosition(moveUpwardsRowIndex, moveRightwards);
                        }

                    }

                    //down-left
                    if (this.IsNewPositionValid(moveDownwardsRowIndex, moveLeftwards))
                    {
                        figure.AddCanMoveToPosition(moveDownwardsRowIndex, moveLeftwards);
                    }

                    //down-right
                    if (this.IsNewPositionValid(moveDownwardsRowIndex, moveRightwards))
                    {
                        figure.AddCanMoveToPosition(moveDownwardsRowIndex, moveRightwards);
                    }


                }
            }

        }

        public bool CanMove(FigureModel figure, int rowIndex, int columnIndex)
        {
            if (figure.CanMoveToPositions.Any(p => p.RowIndex == rowIndex && p.ColumnIndex == columnIndex)) {
                return true;
            }

            return false;
        }

        public void Move(FigureModel figure, int rowIndex, int columnIndex)
        {
            figure.ChangePosition(rowIndex, columnIndex);

            RecalculateFiguresCanMoveToPositions();

            CheckForGameOver();
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

        public bool IsWaitingForSecondPlayer() {
            return this.DateStarted == null && this.Players.Count == 1;
        }

        public bool IsGameInProgress()
        {
            return !IsWaitingForSecondPlayer() && !IsGameOver();
        }

        public bool IsPasswordProtected() {
            return !string.IsNullOrWhiteSpace(this.Password);
        }

        public void PlayerLeftGame(PlayerModel player, PlayerModel opponentPlayer) {

            if (!this.IsGameOver())
            {

                player.IsWinner = false;
                opponentPlayer.IsWinner = true;

                this.Players.ForEach(p => p.IsTheirTurn = false);
                this.DateFinished = DateTime.UtcNow;

            }
        }

        private void CheckForGameOver()
        {
            var mousePlayer = GetPlayerByTeam(TeamEnum.Mouse) as MousePlayerModel;
            var catsPlayer = GetPlayerByTeam(TeamEnum.Cats) as CatsPlayerModel;

            if (mousePlayer.Figures[0].Position.RowIndex == 0)
            {
                mousePlayer.IsWinner = true;
            }
            else
            {
                var nextTurnPlayer = (mousePlayer.IsTheirTurn ? catsPlayer as PlayerModel : mousePlayer as PlayerModel);

                var canNextTurnPlayerMoveAnyFigure = nextTurnPlayer.Figures.Any(f => f.CanMoveToPositions.Any());

                if (!canNextTurnPlayerMoveAnyFigure)
                {
                    var currentTurnPlayer = GetCurrentTurnPlayer();
                    currentTurnPlayer.IsWinner = true;
                }
            }

            if (IsGameOver())
            {
                Players.ForEach(p => p.IsTheirTurn = false);
                this.DateFinished = DateTime.UtcNow;
            }
        }

        private PlayerModel GetPlayerByTeam(TeamEnum teamId)
        {
            return this.Players.Where(p => p.TeamId == teamId).FirstOrDefault();
        }

        private void SetPlayer(TeamEnum teamId, string userName, string connectionId)
        {
            PlayerModel player;
            if (teamId == TeamEnum.Cats)
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

        private bool IsNewPositionValid(int rowIndex, int columnIndex)
        {

            if (rowIndex < 0 || rowIndex > 7 || columnIndex < 0 || columnIndex > 7)
            {
                //Position is out of the chess board
                return false;
            }

            if (this.IsPositionCurrentlyTaken(rowIndex, columnIndex))
            {
                return false;
            }

            return true;

        }

        private bool IsPositionCurrentlyTaken(int rowIndex, int columnIndex)
        {
            return this.Players.Any(p => p.Figures.Any(f => f.Position.RowIndex == rowIndex && f.Position.ColumnIndex == columnIndex));
        }



    }
}
