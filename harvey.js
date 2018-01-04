const axios = require('axios');

const NEM_NODE = '108.61.182.27';
const DELEGATED_NEM_ADDRESS = process.env.DELEGATED_NEM_ADDRESS;
const DELEGATED_PRIVATE_KEY = {
  value: process.env.DELEGATED_PRIVATE_KEY
};
const TOKEN = process.env.TELEGRAM_TOKEN;
const TELEGRAM = `https://api.telegram.org/bot${TOKEN}`;

const isHarvesting = async (nemNode, nemAccount) => {
  const res = await axios.get(
    `http://${nemNode}:7890/account/get?address=${nemAccount}`
  );
  if (res.data.meta.status === 'UNLOCKED') {
    return true;
  }
  return false;
};

const sendMessage = async message => {
  const res = await axios.get(`${TELEGRAM}/sendMessage`, {
    params: {
      chat_id: 182317806,
      text: message
    }
  });
};

const setHarvesting = async () => {
  const privateKey = JSON.stringify(DELEGATED_PRIVATE_KEY);
  const res = await axios
    .post(`http://${NEM_NODE}:7890/account/unlock`, DELEGATED_PRIVATE_KEY)
    .then(() => {
      sendMessage(`Harvesting on ${NEM_NODE}.`);
    })
    .catch(err => {
      sendMessage(
        `We encountered an error while trying to start harvesting on this node: ${
          err.message
        }`
      );
    });
};

(async () => {
  try {
    const harvestingStatus = await isHarvesting(
      NEM_NODE,
      DELEGATED_NEM_ADDRESS
    );
    if (!harvestingStatus) {
      setHarvesting();
    }
  } catch (error) {
    sendMessage(
      `Please check your NEM harvesting server (${NEM_NODE}), as we encountered an error while querying it: ${error}`
    );
  }
})();
