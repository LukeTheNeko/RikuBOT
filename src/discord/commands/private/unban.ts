import { Command } from "@/discord/base";
import { ApplicationCommandOptionType, ApplicationCommandType } from "discord.js";

new Command({
    name: "unban",
    description: "⬜ Desbanir um membro.",
    dmPermission,
    type: ApplicationCommandType.ChatInput,
    defaultMemberPermissions: ["BanMembers"],
    options: [
        {
            name: "membro_id",
            description: "ID do membro que deseja desbanir.",
            type: ApplicationCommandOptionType.String,
            required
        },
    ],
    async run(interaction) {
        const { guild } = interaction;

        const memberId = interaction.options.getString("membro_id");

        if (!memberId) {
            return interaction.reply({ content: "ID de membro não especificado ou inválido.", ephemeral });
        }

        try {
            const bannedUser = await interaction.guild!.bans.fetch(memberId);

            if (!bannedUser) {
                return interaction.reply({ content: "Esse membro não está banido neste servidor.", ephemeral });
            }

            const bannedUserName = bannedUser.user.tag;

            await interaction.guild!.bans.remove(memberId);
            interaction.reply({ content: `O membro ${bannedUserName} foi desbanido com sucesso.`, ephemeral });

        } catch (error) {
            console.error(error);
            interaction.reply({ content: "Ocorreu um erro ao desbanir o membro.", ephemeral });
        }
    }
});