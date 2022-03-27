import { TransfersNodes } from "../../src";
export const transfersNodesNoExternalTranslation : TransfersNodes = {
  transfers: [
    {
      token: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
      to: "0x111111125434b319222cdbf8c261674adb56f3ae",
      from: "0xaf0bbec3ef0aee655ef0b7ee62124ca02e866b5f",
      rawValue: "0x187b03ee0cf2800",
      type: "ethTransfer",
      logCompareType: "ethTransfer",
      tokenName: "ETH",
      value: 0.11,
    },
    {
      token: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
      to: "0xd47140f6ab73f6d6b6675fb1610bb5e9b5d96fe5",
      from: "0x111111125434b319222cdbf8c261674adb56f3ae",
      rawValue: "0x187b03ee0cf2800",
      type: "ethTransfer",
      logCompareType: "ethTransfer",
      logs: [
        {
          logIndex: 5,
        },
      ],
      tokenName: "ETH",
      value: 0.11,
    },
    {
      token: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
      to: "0x1e34c4c920c1b6a397cab786ebfd83dcaee1ff64",
      from: "0xd47140f6ab73f6d6b6675fb1610bb5e9b5d96fe5",
      rawValue: "0x9cace5f386100",
      type: "ethTransfer",
      logCompareType: "ethTransfer",
      tokenName: "ETH",
      value: 0.003,
    },
    {
      token: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
      to: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
      from: "0xd47140f6ab73f6d6b6675fb1610bb5e9b5d96fe5",
      rawValue: "0x17de5708196c700",
      type: "deposit",
      logCompareType: "deposit",
      logs: [
        {
          logIndex: 0,
        },
      ],
      tokenName: "ETH",
      value: 0.107,
    },
    {
      token: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
      to: "0xd47140f6ab73f6d6b6675fb1610bb5e9b5d96fe5",
      from: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
      rawValue: "107494237500000000",
      type: "deposit",
      isLog: true,
      logIndex: 0,
      tokenName: "WETH",
      value: 0.107,
    },
    {
      token: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
      to: "0x0d4a11d5eeaac28ec3f61d100daf4d40471f1852",
      from: "0xd47140f6ab73f6d6b6675fb1610bb5e9b5d96fe5",
      rawValue: "107494237500000000",
      type: "transfer",
      logCompareType: "transfer",
      logs: [
        {
          logIndex: 1,
        },
      ],
      tokenName: "WETH",
      value: 0.107,
    },
    {
      token: "0xdac17f958d2ee523a2206206994597c13d831ec7",
      to: "0xaf0bbec3ef0aee655ef0b7ee62124ca02e866b5f",
      from: "0x0d4a11d5eeaac28ec3f61d100daf4d40471f1852",
      rawValue: "58440236",
      type: "transfer",
      logCompareType: "transfer",
      logs: [
        {
          logIndex: 2,
        },
        {
          logIndex: 3,
        },
        {
          logIndex: 4,
        },
      ],
      tokenName: "0xdac17f958d2ee523a2206206994597c13d831ec7",
      value: 0,
    },
  ],
  nodes: [
    {
      address: "0xaf0bbec3ef0aee655ef0b7ee62124ca02e866b5f",
      name: "sender",
    },
    {
      address: "0x111111125434b319222cdbf8c261674adb56f3ae",
      name: "1inch.exchange v2",
    },
    {
      address: "0xd47140f6ab73f6d6b6675fb1610bb5e9b5d96fe5",
      name: "0xd47140f6ab73f6d6b6675fb1610bb5e9b5d96fe5",
    },
    {
      address: "0x1e34c4c920c1b6a397cab786ebfd83dcaee1ff64",
      name: "0x1e34c4c920c1b6a397cab786ebfd83dcaee1ff64",
    },
    {
      address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
      name: "WETH contract",
    },
    {
      address: "0x0d4a11d5eeaac28ec3f61d100daf4d40471f1852",
      name: "Uniswap V2, USDT 2",
    },
  ],
}