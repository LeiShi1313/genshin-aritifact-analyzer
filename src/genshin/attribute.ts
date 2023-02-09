/* eslint-disable */
import * as _m0 from "protobufjs/minimal";

export const protobufPackage = "io.leishi.genshin.proto";

export enum AttributeType {
  ATTRIBUTE_TYPE_UNSPECIFIED = 0,
  HP = 1,
  ATK = 2,
  DEF = 3,
  ELEMENTAL_MASTERY = 4,
  ENERGY_RECHARGE = 5,
  HP_PERCENT = 6,
  ATK_PERCENT = 7,
  DEF_PERCENT = 8,
  CRIT_RATE = 9,
  CRIT_DAMAGE = 10,
  HEALING_BONUS = 11,
  ANEMO_DAMAGE_BONUS = 12,
  CRYO_DAMAGE_BONUS = 13,
  DENDRO_DAMAGE_BONUS = 14,
  ELECTRO_DAMAGE_BONUS = 15,
  GEO_DAMAGE_BONUS = 16,
  HYDRO_DAMAGE_BONUS = 17,
  PHYSICAL_DAMAGE_BONUS = 18,
  PYRO_DAMAGE_BONUS = 19,
  UNRECOGNIZED = -1,
}

export function attributeTypeFromJSON(object: any): AttributeType {
  switch (object) {
    case 0:
    case "ATTRIBUTE_TYPE_UNSPECIFIED":
      return AttributeType.ATTRIBUTE_TYPE_UNSPECIFIED;
    case 1:
    case "HP":
      return AttributeType.HP;
    case 2:
    case "ATK":
      return AttributeType.ATK;
    case 3:
    case "DEF":
      return AttributeType.DEF;
    case 4:
    case "ELEMENTAL_MASTERY":
      return AttributeType.ELEMENTAL_MASTERY;
    case 5:
    case "ENERGY_RECHARGE":
      return AttributeType.ENERGY_RECHARGE;
    case 6:
    case "HP_PERCENT":
      return AttributeType.HP_PERCENT;
    case 7:
    case "ATK_PERCENT":
      return AttributeType.ATK_PERCENT;
    case 8:
    case "DEF_PERCENT":
      return AttributeType.DEF_PERCENT;
    case 9:
    case "CRIT_RATE":
      return AttributeType.CRIT_RATE;
    case 10:
    case "CRIT_DAMAGE":
      return AttributeType.CRIT_DAMAGE;
    case 11:
    case "HEALING_BONUS":
      return AttributeType.HEALING_BONUS;
    case 12:
    case "ANEMO_DAMAGE_BONUS":
      return AttributeType.ANEMO_DAMAGE_BONUS;
    case 13:
    case "CRYO_DAMAGE_BONUS":
      return AttributeType.CRYO_DAMAGE_BONUS;
    case 14:
    case "DENDRO_DAMAGE_BONUS":
      return AttributeType.DENDRO_DAMAGE_BONUS;
    case 15:
    case "ELECTRO_DAMAGE_BONUS":
      return AttributeType.ELECTRO_DAMAGE_BONUS;
    case 16:
    case "GEO_DAMAGE_BONUS":
      return AttributeType.GEO_DAMAGE_BONUS;
    case 17:
    case "HYDRO_DAMAGE_BONUS":
      return AttributeType.HYDRO_DAMAGE_BONUS;
    case 18:
    case "PHYSICAL_DAMAGE_BONUS":
      return AttributeType.PHYSICAL_DAMAGE_BONUS;
    case 19:
    case "PYRO_DAMAGE_BONUS":
      return AttributeType.PYRO_DAMAGE_BONUS;
    case -1:
    case "UNRECOGNIZED":
    default:
      return AttributeType.UNRECOGNIZED;
  }
}

export function attributeTypeToJSON(object: AttributeType): string {
  switch (object) {
    case AttributeType.ATTRIBUTE_TYPE_UNSPECIFIED:
      return "ATTRIBUTE_TYPE_UNSPECIFIED";
    case AttributeType.HP:
      return "HP";
    case AttributeType.ATK:
      return "ATK";
    case AttributeType.DEF:
      return "DEF";
    case AttributeType.ELEMENTAL_MASTERY:
      return "ELEMENTAL_MASTERY";
    case AttributeType.ENERGY_RECHARGE:
      return "ENERGY_RECHARGE";
    case AttributeType.HP_PERCENT:
      return "HP_PERCENT";
    case AttributeType.ATK_PERCENT:
      return "ATK_PERCENT";
    case AttributeType.DEF_PERCENT:
      return "DEF_PERCENT";
    case AttributeType.CRIT_RATE:
      return "CRIT_RATE";
    case AttributeType.CRIT_DAMAGE:
      return "CRIT_DAMAGE";
    case AttributeType.HEALING_BONUS:
      return "HEALING_BONUS";
    case AttributeType.ANEMO_DAMAGE_BONUS:
      return "ANEMO_DAMAGE_BONUS";
    case AttributeType.CRYO_DAMAGE_BONUS:
      return "CRYO_DAMAGE_BONUS";
    case AttributeType.DENDRO_DAMAGE_BONUS:
      return "DENDRO_DAMAGE_BONUS";
    case AttributeType.ELECTRO_DAMAGE_BONUS:
      return "ELECTRO_DAMAGE_BONUS";
    case AttributeType.GEO_DAMAGE_BONUS:
      return "GEO_DAMAGE_BONUS";
    case AttributeType.HYDRO_DAMAGE_BONUS:
      return "HYDRO_DAMAGE_BONUS";
    case AttributeType.PHYSICAL_DAMAGE_BONUS:
      return "PHYSICAL_DAMAGE_BONUS";
    case AttributeType.PYRO_DAMAGE_BONUS:
      return "PYRO_DAMAGE_BONUS";
    case AttributeType.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export enum AttributePosition {
  ATTRIBUTE_POSITION_UNSPECIFIED = 0,
  FLOWER = 1,
  PLUME = 2,
  SANDS = 3,
  GOBLET = 4,
  CIRCLET = 5,
  SUB = 6,
  UNRECOGNIZED = -1,
}

export function attributePositionFromJSON(object: any): AttributePosition {
  switch (object) {
    case 0:
    case "ATTRIBUTE_POSITION_UNSPECIFIED":
      return AttributePosition.ATTRIBUTE_POSITION_UNSPECIFIED;
    case 1:
    case "FLOWER":
      return AttributePosition.FLOWER;
    case 2:
    case "PLUME":
      return AttributePosition.PLUME;
    case 3:
    case "SANDS":
      return AttributePosition.SANDS;
    case 4:
    case "GOBLET":
      return AttributePosition.GOBLET;
    case 5:
    case "CIRCLET":
      return AttributePosition.CIRCLET;
    case 6:
    case "SUB":
      return AttributePosition.SUB;
    case -1:
    case "UNRECOGNIZED":
    default:
      return AttributePosition.UNRECOGNIZED;
  }
}

export function attributePositionToJSON(object: AttributePosition): string {
  switch (object) {
    case AttributePosition.ATTRIBUTE_POSITION_UNSPECIFIED:
      return "ATTRIBUTE_POSITION_UNSPECIFIED";
    case AttributePosition.FLOWER:
      return "FLOWER";
    case AttributePosition.PLUME:
      return "PLUME";
    case AttributePosition.SANDS:
      return "SANDS";
    case AttributePosition.GOBLET:
      return "GOBLET";
    case AttributePosition.CIRCLET:
      return "CIRCLET";
    case AttributePosition.SUB:
      return "SUB";
    case AttributePosition.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export interface Attribute {
  type: AttributeType;
  value: number;
}

function createBaseAttribute(): Attribute {
  return { type: 0, value: 0 };
}

export const Attribute = {
  encode(message: Attribute, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.type !== 0) {
      writer.uint32(8).int32(message.type);
    }
    if (message.value !== 0) {
      writer.uint32(21).float(message.value);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Attribute {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseAttribute();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.type = reader.int32() as any;
          break;
        case 2:
          message.value = reader.float();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): Attribute {
    return {
      type: isSet(object.type) ? attributeTypeFromJSON(object.type) : 0,
      value: isSet(object.value) ? Number(object.value) : 0,
    };
  },

  toJSON(message: Attribute): unknown {
    const obj: any = {};
    message.type !== undefined && (obj.type = attributeTypeToJSON(message.type));
    message.value !== undefined && (obj.value = message.value);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<Attribute>, I>>(object: I): Attribute {
    const message = createBaseAttribute();
    message.type = object.type ?? 0;
    message.value = object.value ?? 0;
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
