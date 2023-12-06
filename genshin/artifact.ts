/* eslint-disable */
import * as _m0 from "protobufjs/minimal.js";
import { Attribute, AttributePosition, attributePositionFromJSON, attributePositionToJSON } from "./attribute.js";
import { Character, characterFromJSON, characterToJSON } from "./character.js";
import { Set, setFromJSON, setToJSON } from "./set.js";

export const protobufPackage = "io.leishi.genshin.proto";

export interface Artifact {
  set: Set;
  star: number;
  level: number;
  position: AttributePosition;
  mainAttribute: Attribute | undefined;
  subAttributes: Attribute[];
  character: Character;
  locked: boolean;
}

function createBaseArtifact(): Artifact {
  return {
    set: 0,
    star: 0,
    level: 0,
    position: 0,
    mainAttribute: undefined,
    subAttributes: [],
    character: 0,
    locked: false,
  };
}

export const Artifact = {
  encode(message: Artifact, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.set !== 0) {
      writer.uint32(8).int32(message.set);
    }
    if (message.star !== 0) {
      writer.uint32(16).int32(message.star);
    }
    if (message.level !== 0) {
      writer.uint32(24).int32(message.level);
    }
    if (message.position !== 0) {
      writer.uint32(32).int32(message.position);
    }
    if (message.mainAttribute !== undefined) {
      Attribute.encode(message.mainAttribute, writer.uint32(42).fork()).ldelim();
    }
    for (const v of message.subAttributes) {
      Attribute.encode(v!, writer.uint32(50).fork()).ldelim();
    }
    if (message.character !== 0) {
      writer.uint32(56).int32(message.character);
    }
    if (message.locked === true) {
      writer.uint32(64).bool(message.locked);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Artifact {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseArtifact();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.set = reader.int32() as any;
          break;
        case 2:
          message.star = reader.int32();
          break;
        case 3:
          message.level = reader.int32();
          break;
        case 4:
          message.position = reader.int32() as any;
          break;
        case 5:
          message.mainAttribute = Attribute.decode(reader, reader.uint32());
          break;
        case 6:
          message.subAttributes.push(Attribute.decode(reader, reader.uint32()));
          break;
        case 7:
          message.character = reader.int32() as any;
          break;
        case 8:
          message.locked = reader.bool();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): Artifact {
    return {
      set: isSet(object.set) ? setFromJSON(object.set) : 0,
      star: isSet(object.star) ? Number(object.star) : 0,
      level: isSet(object.level) ? Number(object.level) : 0,
      position: isSet(object.position) ? attributePositionFromJSON(object.position) : 0,
      mainAttribute: isSet(object.mainAttribute) ? Attribute.fromJSON(object.mainAttribute) : undefined,
      subAttributes: Array.isArray(object?.subAttributes)
        ? object.subAttributes.map((e: any) => Attribute.fromJSON(e))
        : [],
      character: isSet(object.character) ? characterFromJSON(object.character) : 0,
      locked: isSet(object.locked) ? Boolean(object.locked) : false,
    };
  },

  toJSON(message: Artifact): unknown {
    const obj: any = {};
    message.set !== undefined && (obj.set = setToJSON(message.set));
    message.star !== undefined && (obj.star = Math.round(message.star));
    message.level !== undefined && (obj.level = Math.round(message.level));
    message.position !== undefined && (obj.position = attributePositionToJSON(message.position));
    message.mainAttribute !== undefined &&
      (obj.mainAttribute = message.mainAttribute ? Attribute.toJSON(message.mainAttribute) : undefined);
    if (message.subAttributes) {
      obj.subAttributes = message.subAttributes.map((e) => e ? Attribute.toJSON(e) : undefined);
    } else {
      obj.subAttributes = [];
    }
    message.character !== undefined && (obj.character = characterToJSON(message.character));
    message.locked !== undefined && (obj.locked = message.locked);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<Artifact>, I>>(object: I): Artifact {
    const message = createBaseArtifact();
    message.set = object.set ?? 0;
    message.star = object.star ?? 0;
    message.level = object.level ?? 0;
    message.position = object.position ?? 0;
    message.mainAttribute = (object.mainAttribute !== undefined && object.mainAttribute !== null)
      ? Attribute.fromPartial(object.mainAttribute)
      : undefined;
    message.subAttributes = object.subAttributes?.map((e) => Attribute.fromPartial(e)) || [];
    message.character = object.character ?? 0;
    message.locked = object.locked ?? false;
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
