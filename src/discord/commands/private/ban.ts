import { ApplicationCommandOptionType, ApplicationCommandType, ChannelType } from "discord.js";
import { Command } from "@/discord/base";

export default new Command({
    name: "ban",
    description: "⭕ Banir um membro.",
    dmPermission,
    type: ApplicationCommandType.ChatInput,
    defaultMemberPermissions: ["BanMembers"],
    options: [
        {
            name: "membro",
            description: "Membro que deseja banir.",
            type: ApplicationCommandOptionType.User,
            required
        },
        {
            name: "motivo",
            description: "Motivo do banimento.",
            type: ApplicationCommandOptionType.String,
            required
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
            await guild.members.ban(user, { reason });

            const banMessage = `**${user.tag}** foi banido por **${member.user.tag}**!\nMotivo: ${reason}`;

            await interaction.reply({ content: banMessage, ephemeral });

        } catch (error) {
            console.error(`Ops, erro ao banir o usuário ${user.tag}:`, error);
            await interaction.reply({ content: '❌ Ocorreu um erro ao executar esse comando.', ephemeral });
        }
    },
});