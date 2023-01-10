/* eslint-disable */
import * as _m0 from "protobufjs/minimal";
import { Set, setFromJSON, setToJSON } from "./set";

export const protobufPackage = "io.leishi.genshin.proto";

export interface SetCombo {
  set: Set;
  count: number;
}

export interface Suit {
  setCombos: SetCombo[];
}

function createBaseSetCombo(): SetCombo {
  return { set: 0, count: 0 };
}

export const SetCombo = {
  encode(message: SetCombo, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.set !== 0) {
      writer.uint32(8).int32(message.set);
    }
    if (message.count !== 0) {
      writer.uint32(16).int32(message.count);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): SetCombo {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSetCombo();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.set = reader.int32() as any;
          break;
        case 2:
          message.count = reader.int32();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): SetCombo {
    return {
      set: isSet(object.set) ? setFromJSON(object.set) : 0,
      count: isSet(object.count) ? Number(object.count) : 0,
    };
  },

  toJSON(message: SetCombo): unknown {
    const obj: any = {};
    message.set !== undefined && (obj.set = setToJSON(message.set));
    message.count !== undefined && (obj.count = Math.round(message.count));
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<SetCombo>, I>>(object: I): SetCombo {
    const message = createBaseSetCombo();
    message.set = object.set ?? 0;
    message.count = object.count ?? 0;
    return message;
  },
};

function createBaseSuit(): Suit {
  return { setCombos: [] };
}

export const Suit = {
  encode(message: Suit, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.setCombos) {
      SetCombo.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Suit {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSuit();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.setCombos.push(SetCombo.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): Suit {
    return {
      setCombos: Array.isArray(object?.setCombos) ? object.setCombos.map((e: any) => SetCombo.fromJSON(e)) : [],
    };
  },

  toJSON(message: Suit): unknown {
    const obj: any = {};
    if (message.setCombos) {
      obj.setCombos = message.setCombos.map((e) => e ? SetCombo.toJSON(e) : undefined);
    } else {
      obj.setCombos = [];
    }
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<Suit>, I>>(object: I): Suit {
    const message = createBaseSuit();
    message.setCombos = object.setCombos?.map((e) => SetCombo.fromPartial(e)) || [];
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
