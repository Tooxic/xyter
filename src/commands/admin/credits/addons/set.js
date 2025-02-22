const { Permissions } = require('discord.js');
const config = require('../../../../../config.json');
const logger = require('../../../../handlers/logger');

// Database models

const { users } = require('../../../../helpers/database/models');
const creditNoun = require('../../../../helpers/creditNoun');

module.exports = async (interaction) => {
  // Destructure member
  const { member } = interaction;

  // Check permission
  if (!member.permissions.has(Permissions.FLAGS.MANAGE_GUILD)) {
    // Create embed object
    const embed = {
      title: ':toolbox: Admin - Credits [Set]',
      color: config.colors.error,
      description: 'You do not have permission to manage this!',
      timestamp: new Date(),
      footer: { iconURL: config.footer.icon, text: config.footer.text },
    };

    // Send interaction reply
    return interaction.editReply({ embeds: [embed], ephemeral: true });
  }

  // Get options
  const user = await interaction.options.getUser('user');
  const amount = await interaction.options.getInteger('amount');

  // If amount is zero or below
  if (amount <= 0) {
    // Create embed object
    const embed = {
      title: ':toolbox: Admin - Credits [Set]',
      description: "You can't give zero or below.",
      color: 0xbb2124,
      timestamp: new Date(),
      footer: { iconURL: config.footer.icon, text: config.footer.text },
    };

    // Send interaction reply
    return interaction.editReply({ embeds: [embed], ephemeral: true });
  }

  // Get toUserDB object
  const toUserDB = await users.findOne({
    userId: user.id,
    guildId: interaction.member.guild.id,
  });

  // If toUserDB has no credits
  if (!toUserDB) {
    // Create embed object
    const embed = {
      title: ':toolbox: Admin - Credits [Set]',
      description:
        'That user has no credits, I can not set credits to the user',
      color: config.colors.error,
      timestamp: new Date(),
      footer: { iconURL: config.footer.icon, text: config.footer.text },
    };

    // Send interaction reply
    return interaction.editReply({ embeds: [embed], ephemeral: true });
  }

  // Set toUserDB with amount
  toUserDB.credits = amount;

  // Save toUserDB
  await toUserDB
    .save()

    // If successful
    .then(async () => {
      // Create embed object
      const embed = {
        title: ':toolbox: Admin - Credits [Set]',
        description: `You set ${creditNoun(amount)} on ${user}.`,
        color: 0x22bb33,
        timestamp: new Date(),
        footer: { iconURL: config.footer.icon, text: config.footer.text },
      };

      // Send debug message
      await logger.debug(
        `Administrator: ${interaction.user.username} set ${
          amount <= 1 ? `${amount} credit` : `${amount} credits`
        } on ${user.username}`
      );

      // Send interaction reply
      await interaction.editReply({ embeds: [embed], ephemeral: true });

      // Send debug message
      await logger.debug(
        `Guild: ${member.guild.id} User: ${member.id} set ${
          user.id
        } to ${creditNoun(amount)}.`
      );
    });
};
