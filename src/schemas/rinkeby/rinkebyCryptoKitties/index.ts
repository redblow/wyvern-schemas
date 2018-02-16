import axios from 'axios';
import * as Web3 from 'web3';

import {
  EventInputKind,
  FunctionInputKind,
  FunctionOutputKind,
  Schema,
  StateMutability,
} from '../../../types';

export type RinkebyCryptoKittiesType = string;

export const rinkebyCryptoKittiesSchema: Schema<RinkebyCryptoKittiesType> = {
  name: 'RinkebyCryptoKitties',
  description: 'Rinkeby Testnet CryptoKitties',
  thumbnail: 'https://www.cryptokitties.co/images/kitty-eth.svg',
  website: 'https://cryptokitties.co',
  fields: [
    {name: 'ID', type: 'uint256', description: 'CryptoKitty number.'},
  ],
  assetFromFields: (fields: any) => fields.ID,
  assetToFields: asset => ({ID: asset}),
  formatter:
    async asset => {
      const response = await axios.get(`https://api.cryptokitties.co/kitties/${asset}`);
      const data = response.data;
      return {
        thumbnail: data.image_url_cdn,
        title: 'RinkebyCryptoKitty #' + asset,
        description: data.bio,
        url: 'https://www.cryptokitties.co/kitty/' + asset,
        properties: data.cattributes.map((c: any) => ({
          key: c.type,
          kind: 'string',
          value: c.description,
        })),
      };
  },
  functions: {
    transfer: asset => ({
      type: Web3.AbiType.Function,
      name: 'transfer',
      payable: false,
      constant: false,
      stateMutability: StateMutability.Nonpayable,
      target: '0x16baf0de678e52367adc69fd067e5edd1d33e3bf',
      inputs: [
        {kind: FunctionInputKind.Replaceable, name: '_to', type: 'address'},
        {kind: FunctionInputKind.Asset, name: '_tokenId', type: 'uint256', value: asset},
      ],
      outputs: [],
    }),
    ownerOf: asset => ({
      type: Web3.AbiType.Function,
      name: 'ownerOf',
      payable: false,
      constant: true,
      stateMutability: StateMutability.View,
      target: '0x16baf0de678e52367adc69fd067e5edd1d33e3bf',
      inputs: [
        {kind: FunctionInputKind.Asset, name: '_tokenId', type: 'uint256', value: asset},
      ],
      outputs: [
        {kind: FunctionOutputKind.Owner, name: 'owner', type: 'address'},
      ],
    }),
    tokensOfOwnerByIndex: {
      type: Web3.AbiType.Function,
      name: 'tokensOfOwnerByIndex',
      payable: false,
      constant: true,
      stateMutability: StateMutability.View,
      target: '0x16baf0de678e52367adc69fd067e5edd1d33e3bf',
      inputs: [
        {kind: FunctionInputKind.Owner, name: '_owner', type: 'address'},
        {kind: FunctionInputKind.Index, name: '_index', type: 'uint'},
      ],
      outputs: [
        {kind: FunctionOutputKind.Asset, name: 'tokenId', type: 'uint'},
      ],
      assetFromOutputs: (output: any) => {
        if (output.toNumber() === 0) {
          return null;
        } else {
          return output.toString();
        }
      },
    },
  },
  events: {
    transfer: {
      type: Web3.AbiType.Event,
      name: 'Transfer',
      target: '0x16baf0de678e52367adc69fd067e5edd1d33e3bf',
      anonymous: false,
      inputs: [
        {kind: EventInputKind.Source, indexed: true, name: 'from', type: 'address'},
        {kind: EventInputKind.Destination, indexed: true, name: 'to', type: 'address'},
        {kind: EventInputKind.Asset, indexed: true, name: 'tokenId', type: 'uint256'},
      ],
      assetFromInputs: (inputs: any) => inputs.tokenId,
    },
  },
};