/* eslint-disable */
import * as _m0 from "protobufjs/minimal.js";
import { Attribute, AttributeType, attributeTypeFromJSON, attributeTypeToJSON } from "./attribute.js";
import { Character, characterFromJSON, characterToJSON } from "./character.js";
import { Suit } from "./suit.js";
import { Weapon, weaponFromJSON, weaponToJSON } from "./weapon.js";

export const protobufPackage = "io.leishi.genshin.proto";

export interface Build {
  name: string;
  character: Character;
  weapons: Weapon[];
  suits: Suit[];
  flowerAttributes: AttributeType[];
  plumeAttributes: AttributeType[];
  sandsAttributes: AttributeType[];
  gobletAttributes: AttributeType[];
  circletAttributes: AttributeType[];
  subAttributes: Attribute[];
}

function createBaseBuild(): Build {
  return {
    name: "",
    character: 0,
    weapons: [],
    suits: [],
    flowerAttributes: [],
    plumeAttributes: [],
    sandsAttributes: [],
    gobletAttributes: [],
    circletAttributes: [],
    subAttributes: [],
  };
}

export const Build = {
  encode(message: Build, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.name !== "") {
      writer.uint32(10).string(message.name);
    }
    if (message.character !== 0) {
      writer.uint32(16).int32(message.character);
    }
    writer.uint32(26).fork();
    for (const v of message.weapons) {
      writer.int32(v);
    }
    writer.ldelim();
    for (const v of message.suits) {
      Suit.encode(v!, writer.uint32(34).fork()).ldelim();
    }
    writer.uint32(42).fork();
    for (const v of message.flowerAttributes) {
      writer.int32(v);
    }
    writer.ldelim();
    writer.uint32(50).fork();
    for (const v of message.plumeAttributes) {
      writer.int32(v);
    }
    writer.ldelim();
    writer.uint32(58).fork();
    for (const v of message.sandsAttributes) {
      writer.int32(v);
    }
    writer.ldelim();
    writer.uint32(66).fork();
    for (const v of message.gobletAttributes) {
      writer.int32(v);
    }
    writer.ldelim();
    writer.uint32(74).fork();
    for (const v of message.circletAttributes) {
      writer.int32(v);
    }
    writer.ldelim();
    for (const v of message.subAttributes) {
      Attribute.encode(v!, writer.uint32(82).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Build {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseBuild();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.name = reader.string();
          break;
        case 2:
          message.character = reader.int32() as any;
          break;
        case 3:
          if ((tag & 7) === 2) {
            const end2 = reader.uint32() + reader.pos;
            while (reader.pos < end2) {
              message.weapons.push(reader.int32() as any);
            }
          } else {
            message.weapons.push(reader.int32() as any);
          }
          break;
        case 4:
          message.suits.push(Suit.decode(reader, reader.uint32()));
          break;
        case 5:
          if ((tag & 7) === 2) {
            const end2 = reader.uint32() + reader.pos;
            while (reader.pos < end2) {
              message.flowerAttributes.push(reader.int32() as any);
            }
          } else {
            message.flowerAttributes.push(reader.int32() as any);
          }
          break;
        case 6:
          if ((tag & 7) === 2) {
            const end2 = reader.uint32() + reader.pos;
            while (reader.pos < end2) {
              message.plumeAttributes.push(reader.int32() as any);
            }
          } else {
            message.plumeAttributes.push(reader.int32() as any);
          }
          break;
        case 7:
          if ((tag & 7) === 2) {
            const end2 = reader.uint32() + reader.pos;
            while (reader.pos < end2) {
              message.sandsAttributes.push(reader.int32() as any);
            }
          } else {
            message.sandsAttributes.push(reader.int32() as any);
          }
          break;
        case 8:
          if ((tag & 7) === 2) {
            const end2 = reader.uint32() + reader.pos;
            while (reader.pos < end2) {
              message.gobletAttributes.push(reader.int32() as any);
            }
          } else {
            message.gobletAttributes.push(reader.int32() as any);
          }
          break;
        case 9:
          if ((tag & 7) === 2) {
            const end2 = reader.uint32() + reader.pos;
            while (reader.pos < end2) {
              message.circletAttributes.push(reader.int32() as any);
            }
          } else {
            message.circletAttributes.push(reader.int32() as any);
          }
          break;
        case 10:
          message.subAttributes.push(Attribute.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): Build {
    return {
      name: isSet(object.name) ? String(object.name) : "",
      character: isSet(object.character) ? characterFromJSON(object.character) : 0,
      weapons: Array.isArray(object?.weapons) ? object.weapons.map((e: any) => weaponFromJSON(e)) : [],
      suits: Array.isArray(object?.suits) ? object.suits.map((e: any) => Suit.fromJSON(e)) : [],
      flowerAttributes: Array.isArray(object?.flowerAttributes)
        ? object.flowerAttributes.map((e: any) => attributeTypeFromJSON(e))
        : [],
      plumeAttributes: Array.isArray(object?.plumeAttributes)
        ? object.plumeAttributes.map((e: any) => attributeTypeFromJSON(e))
        : [],
      sandsAttributes: Array.isArray(object?.sandsAttributes)
        ? object.sandsAttributes.map((e: any) => attributeTypeFromJSON(e))
        : [],
      gobletAttributes: Array.isArray(object?.gobletAttributes)
        ? object.gobletAttributes.map((e: any) => attributeTypeFromJSON(e))
        : [],
      circletAttributes: Array.isArray(object?.circletAttributes)
        ? object.circletAttributes.map((e: any) => attributeTypeFromJSON(e))
        : [],
      subAttributes: Array.isArray(object?.subAttributes)
        ? object.subAttributes.map((e: any) => Attribute.fromJSON(e))
        : [],
    };
  },

  toJSON(message: Build): unknown {
    const obj: any = {};
    message.name !== undefined && (obj.name = message.name);
    message.character !== undefined && (obj.character = characterToJSON(message.character));
    if (message.weapons) {
      obj.weapons = message.weapons.map((e) => weaponToJSON(e));
    } else {
      obj.weapons = [];
    }
    if (message.suits) {
      obj.suits = message.suits.map((e) => e ? Suit.toJSON(e) : undefined);
    } else {
      obj.suits = [];
    }
    if (message.flowerAttributes) {
      obj.flowerAttributes = message.flowerAttributes.map((e) => attributeTypeToJSON(e));
    } else {
      obj.flowerAttributes = [];
    }
    if (message.plumeAttributes) {
      obj.plumeAttributes = message.plumeAttributes.map((e) => attributeTypeToJSON(e));
    } else {
      obj.plumeAttributes = [];
    }
    if (message.sandsAttributes) {
      obj.sandsAttributes = message.sandsAttributes.map((e) => attributeTypeToJSON(e));
    } else {
      obj.sandsAttributes = [];
    }
    if (message.gobletAttributes) {
      obj.gobletAttributes = message.gobletAttributes.map((e) => attributeTypeToJSON(e));
    } else {
      obj.gobletAttributes = [];
    }
    if (message.circletAttributes) {
      obj.circletAttributes = message.circletAttributes.map((e) => attributeTypeToJSON(e));
    } else {
      obj.circletAttributes = [];
    }
    if (message.subAttributes) {
      obj.subAttributes = message.subAttributes.map((e) => e ? Attribute.toJSON(e) : undefined);
    } else {
      obj.subAttributes = [];
    }
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<Build>, I>>(object: I): Build {
    const message = createBaseBuild();
    message.name = object.name ?? "";
    message.character = object.character ?? 0;
    message.weapons = object.weapons?.map((e) => e) || [];
    message.suits = object.suits?.map((e) => Suit.fromPartial(e)) || [];
    message.flowerAttributes = object.flowerAttributes?.map((e) => e) || [];
    message.plumeAttributes = object.plumeAttributes?.map((e) => e) || [];
    message.sandsAttributes = object.sandsAttributes?.map((e) => e) || [];
    message.gobletAttributes = object.gobletAttributes?.map((e) => e) || [];
    message.circletAttributes = object.circletAttributes?.map((e) => e) || [];
    message.subAttributes = object.subAttributes?.map((e) => Attribute.fromPartial(e)) || [];
    return message;
  },
};

type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;

export type DeepPartial<T> = T extends Builtin ? T
  : T extends Array<infer U> ? Array<DeepPartial<U>> : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>>
  : T extends {} ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>;

type KeysOfUnion<T> = T extends T ? keyof T : never;
export type Exact<P, I extends P> = P extends Builtin ? P
  : P & { [K in keyof P]: Exact<P[K], I[K]> } & { [K in Exclude<keyof I, KeysOfUnion<P>>]: never };

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}
