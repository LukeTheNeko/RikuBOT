import { Command } from "@/discord/base";
import { ApplicationCommandOptionType, ApplicationCommandType } from "discord.js";

export default new Command({
    name: "kick",
    description: "⚽ Expulsar um membro.",
    dmPermission,
    type: ApplicationCommandType.ChatInput,
    defaultMemberPermissions: ["KickMembers"],
    options: [
        {
            name: "membro",
            description: "Membro que deseja expulsar.",
            type: ApplicationCommandOptionType.User,
            required
        },
        {
            name: "motivo",
            description: "Motivo da expulsão.",
            type: ApplicationCommandOptionType.String,
        },
    ],
    async run(interaction) {
        const { guild, member } = interaction;

        const user = interaction.options.getUser('membro');
        if (!user) {
            await interaction.reply({ content: '❌ Usuário não encontrado.', ephemeral });
            return;
        }

        const reason = interaction.options.getString('motivo') || 'Sem motivo fornecido';

        try {
            await guild.members.kick(user, reason);

            const kickMessage = `⚽ **${user.tag}** foi expulso por **${member.user.tag}**!\nMotivo: ${reason}`;

            await interaction.reply({ content: kickMessage, ephemeral });

        } catch (error) {
            console.error(`Ops, erro ao expulsar o usuário ${user.tag}:`, error);
            await interaction.reply({ content: '❌ Ocorreu um erro ao executar esse comando.', ephemeral });
        }
    },
});