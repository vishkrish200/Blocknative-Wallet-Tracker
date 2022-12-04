import {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  WebhookClient,
} from "discord.js";
import express from "express";
import * as dotenv from "dotenv";
dotenv.config();
import { createClient } from "@supabase/supabase-js";
import { Alchemy, Utils } from "alchemy-sdk";

const app = express();
const alchemy = new Alchemy();

const supabaseUrl = "https://qdoexehcrycynqjrixyt.supabase.co";
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const brainWebhookClient = new WebhookClient({
  id: "1043521694490427392",
  token: "eE6hl46ik8T7qaOI7YfQ2ODv9DxB0bL6KXjjAUZYLfATKzJmEV9DWMB390dJBleEZSOj",
});

const PORT = 3000;

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
app.use(express.json());

let messageId = "";
app.post("/brain", async (req, res) => {
  const brainEmbed = new EmbedBuilder();
  const confirmedEmbed = new EmbedBuilder()
    .setColor("Green")
    .setTitle("Transaction Confirmed");
  const request = req.body;
  const tx_hash = request.hash;
  const watchedAddress = request.watchedAddress;
  try {
    let { data, error } = await supabase
      .from("wallets")
      .select("name,label")
      .ilike("address", watchedAddress);

    const action = checkFunction(request.contractCall?.methodName);
    if (request.status === "pending") {
      brainEmbed
        .setTitle(`${data[0].name}`)
        .setURL(`https://goerli.etherscan.io/address/${watchedAddress}`)
        .setDescription(
          `[Transaction Pending](https://goerli.etherscan.io/tx/${tx_hash})`
        )
        .addFields({ name: "To", value: `${request.to}` });

      if (request.contractCall?.contractName) {
        brainEmbed.addFields({
          name: "Contract Name",
          value: `${request.contractCall?.contractName}`,
          inline: true,
        });
      }
      brainEmbed
        .addFields({
          name: "Function",
          value: `${action}`,
          inline: true,
        })
        .addFields({
          name: "Value",
          value: `${Utils.formatEther(request.value)} ETH`,
          inline: true,
        })
        .addFields({
          name: "Gas",
          value: `Base: ${request.maxFeePerGasGwei} gwei\nPrio: ${request.maxPriorityFeePerGasGwei} gwei`,
        })
        .setColor("Yellow");
      await brainWebhookClient
        .send({
          content: " ",
          username: "brain",
          avatarURL: "https://i.imgur.com/AfFp7pu.png",
          embeds: [brainEmbed],
        })
        .then((message) => {
          messageId = message.id;
        });
    } else if (request.status === "confirmed") {
      brainEmbed
        .setColor("Green")
        .setTitle(`${data[0].name}`)
        .setURL(`https://goerli.etherscan.io/address/${watchedAddress}`)
        .setDescription(
          `[Transaction Confirmed](https://goerli.etherscan.io/tx/${tx_hash})`
        )
        .addFields({ name: "To", value: `${request.to}` });
      if (request.contractCall?.contractName) {
        brainEmbed.addFields({
          name: "Contract Name",
          value: `${request.contractCall?.contractName}`,
          inline: true,
        });
      }
      brainEmbed
        .addFields({
          name: "Function",
          value: `${action}`,
          inline: true,
        })
        .addFields({
          name: "Value",
          value: `${Utils.formatEther(request.value)} ETH`,
          inline: true,
        })
        .addFields({
          name: "Gas",
          value: `Base: ${request.maxFeePerGasGwei} gwei\nPrio: ${request.maxPriorityFeePerGasGwei} gwei`,
        });
      await brainWebhookClient.send({
        content: " ",
        username: "brain",
        avatarURL: "https://i.imgur.com/AfFp7pu.png",
        embeds: [brainEmbed],
      });
    }
  } catch (error) {
    console.log(error);
  }
  res.status(200).end(); // Responding is important
});

function checkFunction(functionName) {
  if (functionName === "fulfillAvailableOrders") return "Sold";
  else if (functionName === "matchOrders") return "Bought";
  else if (functionName === undefined) return "Transfer";
}

const coinWebhookClient = new WebhookClient({
  id: "1043524250256015390",
  token: "k4s4T62awrSf8Fw3n8_nduMgaRh_IqqW9dQocWv33lj2U6_OKQE4huGTkpA55fwmpoJA",
});
const coinEmbed = new EmbedBuilder().setTitle("Transaction").setColor(0x00ffff);
