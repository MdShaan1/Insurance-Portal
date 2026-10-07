using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InsurancePolicyPortalDemo.Migrations
{
    /// <inheritdoc />
    public partial class MakePolicyNumberUnique : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Users_PolicyNumber",
                table: "Users");

            migrationBuilder.CreateIndex(
                name: "IX_Users_PolicyNumber",
                table: "Users",
                column: "PolicyNumber",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Users_PolicyNumber",
                table: "Users");

            migrationBuilder.CreateIndex(
                name: "IX_Users_PolicyNumber",
                table: "Users",
                column: "PolicyNumber");
        }
    }
}
