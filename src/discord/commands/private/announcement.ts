import { Command, Component } from "@/discord/base";
import { settings } from "@/settings";
import { brBuilder, createModalInput, createRow, hexToRgb } from "@magicyan/discord";
import { ApplicationCommandOptionType, ApplicationCommandType, Attachment, AttachmentBuilder, ButtonBuilder, ButtonStyle, ChannelType, Collection, ComponentType, EmbedBuilder, ModalBuilder, TextChannel, TextInputStyle, codeBlock, formatEmoji } from "discord.js";

interface MessageProps {
    channelId: string,
    image: Attachment | null
}
const members: Collection<string, MessageProps> = new Collection();

new Command({
    name: "anunciar",
    description: "Comando de anúncios",
    dmPermission: false,
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "canal",
            description: "Canal onde será enviado o anúncio",
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildText],
            required,
        },
        {
            name: "imagem",
            description: "Imagem anexada no anúncio",
            type: ApplicationCommandOptionType.Attachment,
        }
    ],
    async run(interaction) {
        const { options, member } = interaction;

        const channel = options.getChannel("canal", true);
        const image = options.getAttachment("imagem");

        members.set(member.id, { channelId: channel.id, image });

        await interaction.showModal(new ModalBuilder({
            customId: "announcement-modal",
            title: "Fazer um anúncio",
            components: [
                createModalInput({
                    customId: "announcement-title-input",
                    label: "Título",
                    placeholder: "Insira o título",
                    style: TextInputStyle.Short,
                    maxLength: 256,
                }),
                createModalInput({
                    customId: "announcement-description-input",
                    label: "Descrição",
                    placeholder: "Insira a descrição",
                    style: TextInputStyle.Paragraph,
                    maxLength: 4000
                })
            ]
        }));
    }
});

new Component({
    customId: "announcement-modal",
    type: "Modal", cache: "cached",
    async run(interaction) {
        const { fields, guild, member } = interaction;

        const messageProps = members.get(member.id);
        if (!messageProps) {
            interaction.reply({
                ephemeral,
                content: "Não foi possível obter os dados iniciais! Utilize o comando novamente."
            });
            return;
        }

        const title = fields.getTextInputValue("announcement-title-input");
        const description = fields.getTextInputValue("announcement-description-input");

        const embed = new EmbedBuilder({
            title, description,
            color: hexToRgb(settings.colors.theme.default),
            image: { url: "attachment://image.png" }
        });

        await interaction.deferReply({ ephemeral, fetchReply });

        const files: AttachmentBuilder[] = [];

        if (messageProps.image) {
            files.push(new AttachmentBuilder(messageProps.image.url, { name: "image.png" }));
        }

        const message = await interaction.editReply({
            embeds: [embed], files,
            components: [
                createRow(
                    new ButtonBuilder({
                        customId: "announcement-confirm-button", style: ButtonStyle.Success,
                    }),
                    new ButtonBuilder({
                        customId: "announcement-cancel-button", style: ButtonStyle.Danger,
                    })
                )
            ]
        });

        const collector = message.createMessageComponentCollector({ componentType: ComponentType.Button });
        collector.on("collect", async (subInteraction) => {
            const { customId } = subInteraction;
            collector.stop();

            if (customId === "announcement-cancel-button") {
                subInteraction.update({
                    embeds, components, files: [],
                    content: "Ação cancelada!"
                });
                return;
            }
            await subInteraction.deferUpdate();

            const channel = guild.channels.cache.get(messageProps.channelId) as TextChannel;

            channel.send({ embeds: [embed], files })
                .then(msg => {
                    interaction.editReply({
                        components, embeds, files: [],
                        content: `Mensagem enviada com sucesso! Confira: ${msg.url}`
                    });
                })
                .catch(err => {
                    interaction.editReply({
                        components, embeds, files: [],
                        content: brBuilder(`Não foi possível enviar a mensagem`, codeBlock("bash", err))
                    });
                });

            members.delete(member.id);
        });
    },
});