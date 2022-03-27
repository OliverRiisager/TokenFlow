import { DecodedLog } from "../../src";

export const expectedDecodedLogsResult: DecodedLog[] = [
    {
      name: "Deposit",
      events: [
        {
          name: "dst",
          type: "address",
          value: "0xd47140f6ab73f6d6b6675fb1610bb5e9b5d96fe5",
        },
        {
          name: "wad",
          type: "uint256",
          value: "107494237500000000",
        },
      ],
      address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    },
    {
      name: "Transfer",
      events: [
        {
          name: "src",
          type: "address",
          value: "0xd47140f6ab73f6d6b6675fb1610bb5e9b5d96fe5",
        },
        {
          name: "dst",
          type: "address",
          value: "0x0d4a11d5eeaac28ec3f61d100daf4d40471f1852",
        },
        {
          name: "wad",
          type: "uint256",
          value: "107494237500000000",
        },
      ],
      address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    },
    {
      name: "Transfer",
      events: [
        {
          name: "src",
          type: "address",
          value: "0x0d4a11d5eeaac28ec3f61d100daf4d40471f1852",
        },
        {
          name: "dst",
          type: "address",
          value: "0xaf0bbec3ef0aee655ef0b7ee62124ca02e866b5f",
        },
        {
          name: "wad",
          type: "uint256",
          value: "58440236",
        },
      ],
      address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    },
    null,
    null,
    null,
  ]