
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
            this.Id = Guid.NewGuid().ToString();
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

        public List<PlayerValidMove> GetPlayerValidMoves(PlayerModel player)
        {
            var result = new List<PlayerValidMove>();

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

        public bool IsWaitingForSecondPlayerToStart() {
            return this.DateStarted == null && this.Players.Count == 1;
        }

        public bool IsGameInProgress()
        {
            return !IsWaitingForSecondPlayerToStart() && !IsGameOver();
        }

        public bool IsPasswordProtected() {
            return !string.IsNullOrWhiteSpace(this.Password);
        }

        private void CheckForGameOver()
        {

            var mousePlayer = GetPlayerByTeam(TeamEnum.Mouse) as MousePlayerModel;
            var catsPlayer = GetPlayerByTeam(TeamEnum.Cats) as CatsPlayerModel;
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

        private bool IsPositionCurrentlyTaken(int rowIndex, int columnIndex) {
            return this.Players.Any(p => p.Figures.Any(f => f.Position.RowIndex == rowIndex && f.Position.ColumnIndex == columnIndex));
        }

    }
}
