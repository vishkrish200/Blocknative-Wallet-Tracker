import BlocknativeSdk from "bnc-sdk";
import WebSocket from "ws";

const options = {
  dappId: "74a1a3f7-990e-45e9-bd05-e43640080afe",
  networkId: 4,
  system: "ethereum", // optional, defaults to ethereum
  transactionHandlers: [(event) => console.log(event.transaction)],
  ws: WebSocket, // only neccessary in server environments
  name: "Instance name here", // optional, use when running multiple instances
  onerror: (error) => {
    console.log(error);
  }, //optional, use to catch errors
};

// initialize and connect to the api
const blocknative = new BlocknativeSdk(options);

const {
  emitter, // emitter object to listen for status updates
  details, // initial account details which are useful for internal tracking: address
} = blocknative.account("0x545ACc0e8327dE71ed31AD01358d0DB37db023C8");

emitter.on("txSent", (transaction) => {
  console.log("sent");
});

emitter.on("txPool", (transaction) => {
  console.log("pool");
});

emitter.on("txConfirmed", (transaction) => {
  console.log("confirmed");
});
