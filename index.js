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

const brainEmbed = new EmbedBuilder()
  // .setTitle("Transaction")
  .setColor(0x00ffff);

const confirmedEmbed = new EmbedBuilder()
  .setColor("Green")
  .setTitle("Transaction Confirmed");

const PORT = 3000;

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
app.use(express.json());

app.post("/brain", async (req, res) => {
  let response = req.body;
  const tx_hash = response.hash;
  const watchedAddress = response.watchedAddress;
  try {
    let { data, error } = await supabase
      .from("wallets")
      .select("name,label")
      .ilike("address", watchedAddress);

    if (response.status === "pending") {
      const action = checkFunction(response.contractCall?.methodName);
      brainEmbed
        .setTitle(`${data[0].name}`)
        .setURL(`https://goerli.etherscan.io/address/${watchedAddress}`)
        .setDescription(
          `[Transaction Pending](https://goerli.etherscan.io/tx/${tx_hash})`
        )
        .addFields({
          name: "Contract Name",
          value: `${response.contractCall?.contractName}`,
          inline: true,
        })
        .addFields({
          name: "Function",
          value: `${action}`,
          inline: true,
        })
        .addFields({
          name: "Value",
          value: `${Utils.formatEther(response.value)} ETH`,
          inline: true,
        })
        .addFields({ name: "To", value: `${response.to}` })
        .setColor("Yellow");
      await brainWebhookClient.send({
        content: ` `,
        username: "brain",
        avatarURL: "https://i.imgur.com/AfFp7pu.png",
        embeds: [brainEmbed],
      });
    } else if (response.status === "confirmed") {
      brainEmbed.setColor("Green");
      confirmedEmbed
        .setTitle("Transaction Confirmed")
        .setURL(`https://goerli.etherscan.io/tx/${tx_hash}`);
      await brainWebhookClient.send({
        content: ` `,
        username: "brain",
        avatarURL: "https://i.imgur.com/AfFp7pu.png",
        embeds: [confirmedEmbed],
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
}

const coinWebhookClient = new WebhookClient({
  id: "1043524250256015390",
  token: "k4s4T62awrSf8Fw3n8_nduMgaRh_IqqW9dQocWv33lj2U6_OKQE4huGTkpA55fwmpoJA",
});
const coinEmbed = new EmbedBuilder().setTitle("Transaction").setColor(0x00ffff);

// app.post("/coin", async (req, res) => {
//   let response = await req.body;
//   const tx_hash = response.hash;
//   try {
//     await coinEmbed.addFields({
//       name: "Transaction",
//       value: `[Etherscan] (https://etherscan.io/tx/${tx_hash})`,
//     });
//     coinWebhookClient.send({
//       content: "",
//       username: "coin",
//       avatarURL: "https://i.imgur.com/AfFp7pu.png",
//       embeds: [coinEmbed],
//     });
//   } catch (error) {
//     console.log(error);
//   }
//   res.status(200).end(); // Responding is important
// });
