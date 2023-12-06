/* eslint-disable */
import * as _m0 from "protobufjs/minimal";
import { AttributeType, attributeTypeFromJSON, attributeTypeToJSON } from "./attribute";
import { Character, characterFromJSON, characterToJSON } from "./character";
import { Element, elementFromJSON, elementToJSON } from "./element";
import { Set, setFromJSON, setToJSON } from "./set";
import { Weapon, weaponFromJSON, weaponToJSON } from "./weapon";

export const protobufPackage = "io.leishi.genshin.proto";

export interface GCSimScriptParam {
  key: string;
  value: string;
}

export interface GCSimScriptWeaponInfo {
  weapon: Weapon;
  level: number;
  maxLevel: number;
  refinement: number;
  params: GCSimScriptParam[];
}

export interface GCSimScriptSetInfo {
  set: Set;
  count: number;
  params: GCSimScriptParam[];
}

export interface GCSimScriptCharacterStat {
  type: AttributeType;
  value: number;
}

export interface GCSimScriptCharacterInfo {
  character: Character;
  level: number;
  maxLevel: number;
  constellation: number;
  talents: number[];
  weaponInfo: GCSimScriptWeaponInfo | undefined;
  setInfos: GCSimScriptSetInfo[];
  stats: GCSimScriptCharacterStat[];
  params: GCSimScriptParam[];
  startHp: number;
}

export interface GCSimScriptOptions {
  defhalt: boolean;
  hitlag: boolean;
  iteration: number;
  duration: number;
  workers: number;
  swapDelay: number;
  attackDelay: number;
  chargeDelay: number;
  skillDelay: number;
  burstDelay: number;
  jumpDelay: number;
  dashDelay: number;
  aimDelay: number;
}

export interface GCSimScriptEnergySettings {
  type: GCSimScriptEnergySettings_EnergyType;
  intervals: number[];
  amount: number;
}

export enum GCSimScriptEnergySettings_EnergyType {
  ONCE = 0,
  EVERY = 1,
  UNRECOGNIZED = -1,
}

export function gCSimScriptEnergySettings_EnergyTypeFromJSON(object: any): GCSimScriptEnergySettings_EnergyType {
  switch (object) {
    case 0:
    case "ONCE":
      return GCSimScriptEnergySettings_EnergyType.ONCE;
    case 1:
    case "EVERY":
      return GCSimScriptEnergySettings_EnergyType.EVERY;
    case -1:
    case "UNRECOGNIZED":
    default:
      return GCSimScriptEnergySettings_EnergyType.UNRECOGNIZED;
  }
}

export function gCSimScriptEnergySettings_EnergyTypeToJSON(object: GCSimScriptEnergySettings_EnergyType): string {
  switch (object) {
    case GCSimScriptEnergySettings_EnergyType.ONCE:
      return "ONCE";
    case GCSimScriptEnergySettings_EnergyType.EVERY:
      return "EVERY";
    case GCSimScriptEnergySettings_EnergyType.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export interface GCSimScriptHurtSettings {
  type: GCSimScriptHurtSettings_HurtType;
  intervals: number[];
  amount: GCSimScriptHurtSettings_HurtAmount | undefined;
  element: Element;
}

export enum GCSimScriptHurtSettings_HurtType {
  ONCE = 0,
  EVERY = 1,
  UNRECOGNIZED = -1,
}

export function gCSimScriptHurtSettings_HurtTypeFromJSON(object: any): GCSimScriptHurtSettings_HurtType {
  switch (object) {
    case 0:
    case "ONCE":
      return GCSimScriptHurtSettings_HurtType.ONCE;
    case 1:
    case "EVERY":
      return GCSimScriptHurtSettings_HurtType.EVERY;
    case -1:
    case "UNRECOGNIZED":
    default:
      return GCSimScriptHurtSettings_HurtType.UNRECOGNIZED;
  }
}

export function gCSimScriptHurtSettings_HurtTypeToJSON(object: GCSimScriptHurtSettings_HurtType): string {
  switch (object) {
    case GCSimScriptHurtSettings_HurtType.ONCE:
      return "ONCE";
    case GCSimScriptHurtSettings_HurtType.EVERY:
      return "EVERY";
    case GCSimScriptHurtSettings_HurtType.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export interface GCSimScriptHurtSettings_HurtAmount {
  min: number;
  max: number;
}

export interface GCSimScriptTarget {
  position: number[];
  radius: number;
  level: number;
  resist: number;
  intervals: number[];
  hp: number;
  amount: number;
  particleThreshold: number;
  particleDropCount: number;
  freezeResist: number;
  electroResist: number;
  hydroResist: number;
  pyroResist: number;
  cryoResist: number;
  dendroResist: number;
  physicalResist: number;
  anemoResist: number;
  geoResist: number;
}

export interface GCSimScript {
  options: GCSimScriptOptions | undefined;
  characterInfos: GCSimScriptCharacterInfo[];
  targets: GCSimScriptTarget[];
  energySettings: GCSimScriptEnergySettings | undefined;
  hurtSettings: GCSimScriptHurtSettings | undefined;
  scripts: string[];
}

function createBaseGCSimScriptParam(): GCSimScriptParam {
  return { key: "", value: "" };
}

export const GCSimScriptParam = {
  encode(message: GCSimScriptParam, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.key !== "") {
      writer.uint32(10).string(message.key);
    }
    if (message.value !== "") {
      writer.uint32(18).string(message.value);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GCSimScriptParam {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGCSimScriptParam();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.key = reader.string();
          break;
        case 2:
          message.value = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): GCSimScriptParam {
    return { key: isSet(object.key) ? String(object.key) : "", value: isSet(object.value) ? String(object.value) : "" };
  },

  toJSON(message: GCSimScriptParam): unknown {
    const obj: any = {};
    message.key !== undefined && (obj.key = message.key);
    message.value !== undefined && (obj.value = message.value);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<GCSimScriptParam>, I>>(object: I): GCSimScriptParam {
    const message = createBaseGCSimScriptParam();
    message.key = object.key ?? "";
    message.value = object.value ?? "";
    return message;
  },
};

function createBaseGCSimScriptWeaponInfo(): GCSimScriptWeaponInfo {
  return { weapon: 0, level: 0, maxLevel: 0, refinement: 0, params: [] };
}

export const GCSimScriptWeaponInfo = {
  encode(message: GCSimScriptWeaponInfo, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.weapon !== 0) {
      writer.uint32(8).int32(message.weapon);
    }
    if (message.level !== 0) {
      writer.uint32(16).int32(message.level);
    }
    if (message.maxLevel !== 0) {
      writer.uint32(24).int32(message.maxLevel);
    }
    if (message.refinement !== 0) {
      writer.uint32(32).int32(message.refinement);
    }
    for (const v of message.params) {
      GCSimScriptParam.encode(v!, writer.uint32(42).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GCSimScriptWeaponInfo {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGCSimScriptWeaponInfo();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.weapon = reader.int32() as any;
          break;
        case 2:
          message.level = reader.int32();
          break;
        case 3:
          message.maxLevel = reader.int32();
          break;
        case 4:
          message.refinement = reader.int32();
          break;
        case 5:
          message.params.push(GCSimScriptParam.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): GCSimScriptWeaponInfo {
    return {
      weapon: isSet(object.weapon) ? weaponFromJSON(object.weapon) : 0,
      level: isSet(object.level) ? Number(object.level) : 0,
      maxLevel: isSet(object.maxLevel) ? Number(object.maxLevel) : 0,
      refinement: isSet(object.refinement) ? Number(object.refinement) : 0,
      params: Array.isArray(object?.params) ? object.params.map((e: any) => GCSimScriptParam.fromJSON(e)) : [],
    };
  },

  toJSON(message: GCSimScriptWeaponInfo): unknown {
    const obj: any = {};
    message.weapon !== undefined && (obj.weapon = weaponToJSON(message.weapon));
    message.level !== undefined && (obj.level = Math.round(message.level));
    message.maxLevel !== undefined && (obj.maxLevel = Math.round(message.maxLevel));
    message.refinement !== undefined && (obj.refinement = Math.round(message.refinement));
    if (message.params) {
      obj.params = message.params.map((e) => e ? GCSimScriptParam.toJSON(e) : undefined);
    } else {
      obj.params = [];
    }
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<GCSimScriptWeaponInfo>, I>>(object: I): GCSimScriptWeaponInfo {
    const message = createBaseGCSimScriptWeaponInfo();
    message.weapon = object.weapon ?? 0;
    message.level = object.level ?? 0;
    message.maxLevel = object.maxLevel ?? 0;
    message.refinement = object.refinement ?? 0;
    message.params = object.params?.map((e) => GCSimScriptParam.fromPartial(e)) || [];
    return message;
  },
};

function createBaseGCSimScriptSetInfo(): GCSimScriptSetInfo {
  return { set: 0, count: 0, params: [] };
}

export const GCSimScriptSetInfo = {
  encode(message: GCSimScriptSetInfo, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.set !== 0) {
      writer.uint32(8).int32(message.set);
    }
    if (message.count !== 0) {
      writer.uint32(16).int32(message.count);
    }
    for (const v of message.params) {
      GCSimScriptParam.encode(v!, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GCSimScriptSetInfo {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGCSimScriptSetInfo();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.set = reader.int32() as any;
          break;
        case 2:
          message.count = reader.int32();
          break;
        case 3:
          message.params.push(GCSimScriptParam.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): GCSimScriptSetInfo {
    return {
      set: isSet(object.set) ? setFromJSON(object.set) : 0,
      count: isSet(object.count) ? Number(object.count) : 0,
      params: Array.isArray(object?.params) ? object.params.map((e: any) => GCSimScriptParam.fromJSON(e)) : [],
    };
  },

  toJSON(message: GCSimScriptSetInfo): unknown {
    const obj: any = {};
    message.set !== undefined && (obj.set = setToJSON(message.set));
    message.count !== undefined && (obj.count = Math.round(message.count));
    if (message.params) {
      obj.params = message.params.map((e) => e ? GCSimScriptParam.toJSON(e) : undefined);
    } else {
      obj.params = [];
    }
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<GCSimScriptSetInfo>, I>>(object: I): GCSimScriptSetInfo {
    const message = createBaseGCSimScriptSetInfo();
    message.set = object.set ?? 0;
    message.count = object.count ?? 0;
    message.params = object.params?.map((e) => GCSimScriptParam.fromPartial(e)) || [];
    return message;
  },
};

function createBaseGCSimScriptCharacterStat(): GCSimScriptCharacterStat {
  return { type: 0, value: 0 };
}

export const GCSimScriptCharacterStat = {
  encode(message: GCSimScriptCharacterStat, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.type !== 0) {
      writer.uint32(8).int32(message.type);
    }
    if (message.value !== 0) {
      writer.uint32(21).float(message.value);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GCSimScriptCharacterStat {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGCSimScriptCharacterStat();
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

  fromJSON(object: any): GCSimScriptCharacterStat {
    return {
      type: isSet(object.type) ? attributeTypeFromJSON(object.type) : 0,
      value: isSet(object.value) ? Number(object.value) : 0,
    };
  },

  toJSON(message: GCSimScriptCharacterStat): unknown {
    const obj: any = {};
    message.type !== undefined && (obj.type = attributeTypeToJSON(message.type));
    message.value !== undefined && (obj.value = message.value);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<GCSimScriptCharacterStat>, I>>(object: I): GCSimScriptCharacterStat {
    const message = createBaseGCSimScriptCharacterStat();
    message.type = object.type ?? 0;
    message.value = object.value ?? 0;
    return message;
  },
};

function createBaseGCSimScriptCharacterInfo(): GCSimScriptCharacterInfo {
  return {
    character: 0,
    level: 0,
    maxLevel: 0,
    constellation: 0,
    talents: [],
    weaponInfo: undefined,
    setInfos: [],
    stats: [],
    params: [],
    startHp: 0,
  };
}

export const GCSimScriptCharacterInfo = {
  encode(message: GCSimScriptCharacterInfo, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.character !== 0) {
      writer.uint32(8).int32(message.character);
    }
    if (message.level !== 0) {
      writer.uint32(16).int32(message.level);
    }
    if (message.maxLevel !== 0) {
      writer.uint32(24).int32(message.maxLevel);
    }
    if (message.constellation !== 0) {
      writer.uint32(32).int32(message.constellation);
    }
    writer.uint32(42).fork();
    for (const v of message.talents) {
      writer.int32(v);
    }
    writer.ldelim();
    if (message.weaponInfo !== undefined) {
      GCSimScriptWeaponInfo.encode(message.weaponInfo, writer.uint32(50).fork()).ldelim();
    }
    for (const v of message.setInfos) {
      GCSimScriptSetInfo.encode(v!, writer.uint32(58).fork()).ldelim();
    }
    for (const v of message.stats) {
      GCSimScriptCharacterStat.encode(v!, writer.uint32(66).fork()).ldelim();
    }
    for (const v of message.params) {
      GCSimScriptParam.encode(v!, writer.uint32(74).fork()).ldelim();
    }
    if (message.startHp !== 0) {
      writer.uint32(80).int32(message.startHp);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GCSimScriptCharacterInfo {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGCSimScriptCharacterInfo();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.character = reader.int32() as any;
          break;
        case 2:
          message.level = reader.int32();
          break;
        case 3:
          message.maxLevel = reader.int32();
          break;
        case 4:
          message.constellation = reader.int32();
          break;
        case 5:
          if ((tag & 7) === 2) {
            const end2 = reader.uint32() + reader.pos;
            while (reader.pos < end2) {
              message.talents.push(reader.int32());
            }
          } else {
            message.talents.push(reader.int32());
          }
          break;
        case 6:
          message.weaponInfo = GCSimScriptWeaponInfo.decode(reader, reader.uint32());
          break;
        case 7:
          message.setInfos.push(GCSimScriptSetInfo.decode(reader, reader.uint32()));
          break;
        case 8:
          message.stats.push(GCSimScriptCharacterStat.decode(reader, reader.uint32()));
          break;
        case 9:
          message.params.push(GCSimScriptParam.decode(reader, reader.uint32()));
          break;
        case 10:
          message.startHp = reader.int32();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): GCSimScriptCharacterInfo {
    return {
      character: isSet(object.character) ? characterFromJSON(object.character) : 0,
      level: isSet(object.level) ? Number(object.level) : 0,
      maxLevel: isSet(object.maxLevel) ? Number(object.maxLevel) : 0,
      constellation: isSet(object.constellation) ? Number(object.constellation) : 0,
      talents: Array.isArray(object?.talents) ? object.talents.map((e: any) => Number(e)) : [],
      weaponInfo: isSet(object.weaponInfo) ? GCSimScriptWeaponInfo.fromJSON(object.weaponInfo) : undefined,
      setInfos: Array.isArray(object?.setInfos) ? object.setInfos.map((e: any) => GCSimScriptSetInfo.fromJSON(e)) : [],
      stats: Array.isArray(object?.stats) ? object.stats.map((e: any) => GCSimScriptCharacterStat.fromJSON(e)) : [],
      params: Array.isArray(object?.params) ? object.params.map((e: any) => GCSimScriptParam.fromJSON(e)) : [],
      startHp: isSet(object.startHp) ? Number(object.startHp) : 0,
    };
  },

  toJSON(message: GCSimScriptCharacterInfo): unknown {
    const obj: any = {};
    message.character !== undefined && (obj.character = characterToJSON(message.character));
    message.level !== undefined && (obj.level = Math.round(message.level));
    message.maxLevel !== undefined && (obj.maxLevel = Math.round(message.maxLevel));
    message.constellation !== undefined && (obj.constellation = Math.round(message.constellation));
    if (message.talents) {
      obj.talents = message.talents.map((e) => Math.round(e));
    } else {
      obj.talents = [];
    }
    message.weaponInfo !== undefined &&
      (obj.weaponInfo = message.weaponInfo ? GCSimScriptWeaponInfo.toJSON(message.weaponInfo) : undefined);
    if (message.setInfos) {
      obj.setInfos = message.setInfos.map((e) => e ? GCSimScriptSetInfo.toJSON(e) : undefined);
    } else {
      obj.setInfos = [];
    }
    if (message.stats) {
      obj.stats = message.stats.map((e) => e ? GCSimScriptCharacterStat.toJSON(e) : undefined);
    } else {
      obj.stats = [];
    }
    if (message.params) {
      obj.params = message.params.map((e) => e ? GCSimScriptParam.toJSON(e) : undefined);
    } else {
      obj.params = [];
    }
    message.startHp !== undefined && (obj.startHp = Math.round(message.startHp));
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<GCSimScriptCharacterInfo>, I>>(object: I): GCSimScriptCharacterInfo {
    const message = createBaseGCSimScriptCharacterInfo();
    message.character = object.character ?? 0;
    message.level = object.level ?? 0;
    message.maxLevel = object.maxLevel ?? 0;
    message.constellation = object.constellation ?? 0;
    message.talents = object.talents?.map((e) => e) || [];
    message.weaponInfo = (object.weaponInfo !== undefined && object.weaponInfo !== null)
      ? GCSimScriptWeaponInfo.fromPartial(object.weaponInfo)
      : undefined;
    message.setInfos = object.setInfos?.map((e) => GCSimScriptSetInfo.fromPartial(e)) || [];
    message.stats = object.stats?.map((e) => GCSimScriptCharacterStat.fromPartial(e)) || [];
    message.params = object.params?.map((e) => GCSimScriptParam.fromPartial(e)) || [];
    message.startHp = object.startHp ?? 0;
    return message;
  },
};

function createBaseGCSimScriptOptions(): GCSimScriptOptions {
  return {
    defhalt: false,
    hitlag: false,
    iteration: 0,
    duration: 0,
    workers: 0,
    swapDelay: 0,
    attackDelay: 0,
    chargeDelay: 0,
    skillDelay: 0,
    burstDelay: 0,
    jumpDelay: 0,
    dashDelay: 0,
    aimDelay: 0,
  };
}

export const GCSimScriptOptions = {
  encode(message: GCSimScriptOptions, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.defhalt === true) {
      writer.uint32(8).bool(message.defhalt);
    }
    if (message.hitlag === true) {
      writer.uint32(16).bool(message.hitlag);
    }
    if (message.iteration !== 0) {
      writer.uint32(24).int32(message.iteration);
    }
    if (message.duration !== 0) {
      writer.uint32(32).int32(message.duration);
    }
    if (message.workers !== 0) {
      writer.uint32(40).int32(message.workers);
    }
    if (message.swapDelay !== 0) {
      writer.uint32(48).int32(message.swapDelay);
    }
    if (message.attackDelay !== 0) {
      writer.uint32(56).int32(message.attackDelay);
    }
    if (message.chargeDelay !== 0) {
      writer.uint32(64).int32(message.chargeDelay);
    }
    if (message.skillDelay !== 0) {
      writer.uint32(72).int32(message.skillDelay);
    }
    if (message.burstDelay !== 0) {
      writer.uint32(80).int32(message.burstDelay);
    }
    if (message.jumpDelay !== 0) {
      writer.uint32(88).int32(message.jumpDelay);
    }
    if (message.dashDelay !== 0) {
      writer.uint32(96).int32(message.dashDelay);
    }
    if (message.aimDelay !== 0) {
      writer.uint32(104).int32(message.aimDelay);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GCSimScriptOptions {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGCSimScriptOptions();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.defhalt = reader.bool();
          break;
        case 2:
          message.hitlag = reader.bool();
          break;
        case 3:
          message.iteration = reader.int32();
          break;
        case 4:
          message.duration = reader.int32();
          break;
        case 5:
          message.workers = reader.int32();
          break;
        case 6:
          message.swapDelay = reader.int32();
          break;
        case 7:
          message.attackDelay = reader.int32();
          break;
        case 8:
          message.chargeDelay = reader.int32();
          break;
        case 9:
          message.skillDelay = reader.int32();
          break;
        case 10:
          message.burstDelay = reader.int32();
          break;
        case 11:
          message.jumpDelay = reader.int32();
          break;
        case 12:
          message.dashDelay = reader.int32();
          break;
        case 13:
          message.aimDelay = reader.int32();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): GCSimScriptOptions {
    return {
      defhalt: isSet(object.defhalt) ? Boolean(object.defhalt) : false,
      hitlag: isSet(object.hitlag) ? Boolean(object.hitlag) : false,
      iteration: isSet(object.iteration) ? Number(object.iteration) : 0,
      duration: isSet(object.duration) ? Number(object.duration) : 0,
      workers: isSet(object.workers) ? Number(object.workers) : 0,
      swapDelay: isSet(object.swapDelay) ? Number(object.swapDelay) : 0,
      attackDelay: isSet(object.attackDelay) ? Number(object.attackDelay) : 0,
      chargeDelay: isSet(object.chargeDelay) ? Number(object.chargeDelay) : 0,
      skillDelay: isSet(object.skillDelay) ? Number(object.skillDelay) : 0,
      burstDelay: isSet(object.burstDelay) ? Number(object.burstDelay) : 0,
      jumpDelay: isSet(object.jumpDelay) ? Number(object.jumpDelay) : 0,
      dashDelay: isSet(object.dashDelay) ? Number(object.dashDelay) : 0,
      aimDelay: isSet(object.aimDelay) ? Number(object.aimDelay) : 0,
    };
  },

  toJSON(message: GCSimScriptOptions): unknown {
    const obj: any = {};
    message.defhalt !== undefined && (obj.defhalt = message.defhalt);
    message.hitlag !== undefined && (obj.hitlag = message.hitlag);
    message.iteration !== undefined && (obj.iteration = Math.round(message.iteration));
    message.duration !== undefined && (obj.duration = Math.round(message.duration));
    message.workers !== undefined && (obj.workers = Math.round(message.workers));
    message.swapDelay !== undefined && (obj.swapDelay = Math.round(message.swapDelay));
    message.attackDelay !== undefined && (obj.attackDelay = Math.round(message.attackDelay));
    message.chargeDelay !== undefined && (obj.chargeDelay = Math.round(message.chargeDelay));
    message.skillDelay !== undefined && (obj.skillDelay = Math.round(message.skillDelay));
    message.burstDelay !== undefined && (obj.burstDelay = Math.round(message.burstDelay));
    message.jumpDelay !== undefined && (obj.jumpDelay = Math.round(message.jumpDelay));
    message.dashDelay !== undefined && (obj.dashDelay = Math.round(message.dashDelay));
    message.aimDelay !== undefined && (obj.aimDelay = Math.round(message.aimDelay));
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<GCSimScriptOptions>, I>>(object: I): GCSimScriptOptions {
    const message = createBaseGCSimScriptOptions();
    message.defhalt = object.defhalt ?? false;
    message.hitlag = object.hitlag ?? false;
    message.iteration = object.iteration ?? 0;
    message.duration = object.duration ?? 0;
    message.workers = object.workers ?? 0;
    message.swapDelay = object.swapDelay ?? 0;
    message.attackDelay = object.attackDelay ?? 0;
    message.chargeDelay = object.chargeDelay ?? 0;
    message.skillDelay = object.skillDelay ?? 0;
    message.burstDelay = object.burstDelay ?? 0;
    message.jumpDelay = object.jumpDelay ?? 0;
    message.dashDelay = object.dashDelay ?? 0;
    message.aimDelay = object.aimDelay ?? 0;
    return message;
  },
};

function createBaseGCSimScriptEnergySettings(): GCSimScriptEnergySettings {
  return { type: 0, intervals: [], amount: 0 };
}

export const GCSimScriptEnergySettings = {
  encode(message: GCSimScriptEnergySettings, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.type !== 0) {
      writer.uint32(8).int32(message.type);
    }
    writer.uint32(18).fork();
    for (const v of message.intervals) {
      writer.int32(v);
    }
    writer.ldelim();
    if (message.amount !== 0) {
      writer.uint32(24).int32(message.amount);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GCSimScriptEnergySettings {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGCSimScriptEnergySettings();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.type = reader.int32() as any;
          break;
        case 2:
          if ((tag & 7) === 2) {
            const end2 = reader.uint32() + reader.pos;
            while (reader.pos < end2) {
              message.intervals.push(reader.int32());
            }
          } else {
            message.intervals.push(reader.int32());
          }
          break;
        case 3:
          message.amount = reader.int32();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): GCSimScriptEnergySettings {
    return {
      type: isSet(object.type) ? gCSimScriptEnergySettings_EnergyTypeFromJSON(object.type) : 0,
      intervals: Array.isArray(object?.intervals) ? object.intervals.map((e: any) => Number(e)) : [],
      amount: isSet(object.amount) ? Number(object.amount) : 0,
    };
  },

  toJSON(message: GCSimScriptEnergySettings): unknown {
    const obj: any = {};
    message.type !== undefined && (obj.type = gCSimScriptEnergySettings_EnergyTypeToJSON(message.type));
    if (message.intervals) {
      obj.intervals = message.intervals.map((e) => Math.round(e));
    } else {
      obj.intervals = [];
    }
    message.amount !== undefined && (obj.amount = Math.round(message.amount));
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<GCSimScriptEnergySettings>, I>>(object: I): GCSimScriptEnergySettings {
    const message = createBaseGCSimScriptEnergySettings();
    message.type = object.type ?? 0;
    message.intervals = object.intervals?.map((e) => e) || [];
    message.amount = object.amount ?? 0;
    return message;
  },
};

function createBaseGCSimScriptHurtSettings(): GCSimScriptHurtSettings {
  return { type: 0, intervals: [], amount: undefined, element: 0 };
}

export const GCSimScriptHurtSettings = {
  encode(message: GCSimScriptHurtSettings, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.type !== 0) {
      writer.uint32(8).int32(message.type);
    }
    writer.uint32(18).fork();
    for (const v of message.intervals) {
      writer.int32(v);
    }
    writer.ldelim();
    if (message.amount !== undefined) {
      GCSimScriptHurtSettings_HurtAmount.encode(message.amount, writer.uint32(26).fork()).ldelim();
    }
    if (message.element !== 0) {
      writer.uint32(32).int32(message.element);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GCSimScriptHurtSettings {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGCSimScriptHurtSettings();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.type = reader.int32() as any;
          break;
        case 2:
          if ((tag & 7) === 2) {
            const end2 = reader.uint32() + reader.pos;
            while (reader.pos < end2) {
              message.intervals.push(reader.int32());
            }
          } else {
            message.intervals.push(reader.int32());
          }
          break;
        case 3:
          message.amount = GCSimScriptHurtSettings_HurtAmount.decode(reader, reader.uint32());
          break;
        case 4:
          message.element = reader.int32() as any;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): GCSimScriptHurtSettings {
    return {
      type: isSet(object.type) ? gCSimScriptHurtSettings_HurtTypeFromJSON(object.type) : 0,
      intervals: Array.isArray(object?.intervals) ? object.intervals.map((e: any) => Number(e)) : [],
      amount: isSet(object.amount) ? GCSimScriptHurtSettings_HurtAmount.fromJSON(object.amount) : undefined,
      element: isSet(object.element) ? elementFromJSON(object.element) : 0,
    };
  },

  toJSON(message: GCSimScriptHurtSettings): unknown {
    const obj: any = {};
    message.type !== undefined && (obj.type = gCSimScriptHurtSettings_HurtTypeToJSON(message.type));
    if (message.intervals) {
      obj.intervals = message.intervals.map((e) => Math.round(e));
    } else {
      obj.intervals = [];
    }
    message.amount !== undefined &&
      (obj.amount = message.amount ? GCSimScriptHurtSettings_HurtAmount.toJSON(message.amount) : undefined);
    message.element !== undefined && (obj.element = elementToJSON(message.element));
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<GCSimScriptHurtSettings>, I>>(object: I): GCSimScriptHurtSettings {
    const message = createBaseGCSimScriptHurtSettings();
    message.type = object.type ?? 0;
    message.intervals = object.intervals?.map((e) => e) || [];
    message.amount = (object.amount !== undefined && object.amount !== null)
      ? GCSimScriptHurtSettings_HurtAmount.fromPartial(object.amount)
      : undefined;
    message.element = object.element ?? 0;
    return message;
  },
};

function createBaseGCSimScriptHurtSettings_HurtAmount(): GCSimScriptHurtSettings_HurtAmount {
  return { min: 0, max: 0 };
}

export const GCSimScriptHurtSettings_HurtAmount = {
  encode(message: GCSimScriptHurtSettings_HurtAmount, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.min !== 0) {
      writer.uint32(13).float(message.min);
    }
    if (message.max !== 0) {
      writer.uint32(21).float(message.max);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GCSimScriptHurtSettings_HurtAmount {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGCSimScriptHurtSettings_HurtAmount();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.min = reader.float();
          break;
        case 2:
          message.max = reader.float();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): GCSimScriptHurtSettings_HurtAmount {
    return { min: isSet(object.min) ? Number(object.min) : 0, max: isSet(object.max) ? Number(object.max) : 0 };
  },

  toJSON(message: GCSimScriptHurtSettings_HurtAmount): unknown {
    const obj: any = {};
    message.min !== undefined && (obj.min = message.min);
    message.max !== undefined && (obj.max = message.max);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<GCSimScriptHurtSettings_HurtAmount>, I>>(
    object: I,
  ): GCSimScriptHurtSettings_HurtAmount {
    const message = createBaseGCSimScriptHurtSettings_HurtAmount();
    message.min = object.min ?? 0;
    message.max = object.max ?? 0;
    return message;
  },
};

function createBaseGCSimScriptTarget(): GCSimScriptTarget {
  return {
    position: [],
    radius: 0,
    level: 0,
    resist: 0,
    intervals: [],
    hp: 0,
    amount: 0,
    particleThreshold: 0,
    particleDropCount: 0,
    freezeResist: 0,
    electroResist: 0,
    hydroResist: 0,
    pyroResist: 0,
    cryoResist: 0,
    dendroResist: 0,
    physicalResist: 0,
    anemoResist: 0,
    geoResist: 0,
  };
}

export const GCSimScriptTarget = {
  encode(message: GCSimScriptTarget, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    writer.uint32(10).fork();
    for (const v of message.position) {
      writer.float(v);
    }
    writer.ldelim();
    if (message.radius !== 0) {
      writer.uint32(21).float(message.radius);
    }
    if (message.level !== 0) {
      writer.uint32(24).int32(message.level);
    }
    if (message.resist !== 0) {
      writer.uint32(37).float(message.resist);
    }
    writer.uint32(42).fork();
    for (const v of message.intervals) {
      writer.int32(v);
    }
    writer.ldelim();
    if (message.hp !== 0) {
      writer.uint32(48).int32(message.hp);
    }
    if (message.amount !== 0) {
      writer.uint32(56).int32(message.amount);
    }
    if (message.particleThreshold !== 0) {
      writer.uint32(64).int32(message.particleThreshold);
    }
    if (message.particleDropCount !== 0) {
      writer.uint32(72).int32(message.particleDropCount);
    }
    if (message.freezeResist !== 0) {
      writer.uint32(85).float(message.freezeResist);
    }
    if (message.electroResist !== 0) {
      writer.uint32(93).float(message.electroResist);
    }
    if (message.hydroResist !== 0) {
      writer.uint32(101).float(message.hydroResist);
    }
    if (message.pyroResist !== 0) {
      writer.uint32(109).float(message.pyroResist);
    }
    if (message.cryoResist !== 0) {
      writer.uint32(117).float(message.cryoResist);
    }
    if (message.dendroResist !== 0) {
      writer.uint32(125).float(message.dendroResist);
    }
    if (message.physicalResist !== 0) {
      writer.uint32(133).float(message.physicalResist);
    }
    if (message.anemoResist !== 0) {
      writer.uint32(141).float(message.anemoResist);
    }
    if (message.geoResist !== 0) {
      writer.uint32(149).float(message.geoResist);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GCSimScriptTarget {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGCSimScriptTarget();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if ((tag & 7) === 2) {
            const end2 = reader.uint32() + reader.pos;
            while (reader.pos < end2) {
              message.position.push(reader.float());
            }
          } else {
            message.position.push(reader.float());
          }
          break;
        case 2:
          message.radius = reader.float();
          break;
        case 3:
          message.level = reader.int32();
          break;
        case 4:
          message.resist = reader.float();
          break;
        case 5:
          if ((tag & 7) === 2) {
            const end2 = reader.uint32() + reader.pos;
            while (reader.pos < end2) {
              message.intervals.push(reader.int32());
            }
          } else {
            message.intervals.push(reader.int32());
          }
          break;
        case 6:
          message.hp = reader.int32();
          break;
        case 7:
          message.amount = reader.int32();
          break;
        case 8:
          message.particleThreshold = reader.int32();
          break;
        case 9:
          message.particleDropCount = reader.int32();
          break;
        case 10:
          message.freezeResist = reader.float();
          break;
        case 11:
          message.electroResist = reader.float();
          break;
        case 12:
          message.hydroResist = reader.float();
          break;
        case 13:
          message.pyroResist = reader.float();
          break;
        case 14:
          message.cryoResist = reader.float();
          break;
        case 15:
          message.dendroResist = reader.float();
          break;
        case 16:
          message.physicalResist = reader.float();
          break;
        case 17:
          message.anemoResist = reader.float();
          break;
        case 18:
          message.geoResist = reader.float();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): GCSimScriptTarget {
    return {
      position: Array.isArray(object?.position) ? object.position.map((e: any) => Number(e)) : [],
      radius: isSet(object.radius) ? Number(object.radius) : 0,
      level: isSet(object.level) ? Number(object.level) : 0,
      resist: isSet(object.resist) ? Number(object.resist) : 0,
      intervals: Array.isArray(object?.intervals) ? object.intervals.map((e: any) => Number(e)) : [],
      hp: isSet(object.hp) ? Number(object.hp) : 0,
      amount: isSet(object.amount) ? Number(object.amount) : 0,
      particleThreshold: isSet(object.particleThreshold) ? Number(object.particleThreshold) : 0,
      particleDropCount: isSet(object.particleDropCount) ? Number(object.particleDropCount) : 0,
      freezeResist: isSet(object.freezeResist) ? Number(object.freezeResist) : 0,
      electroResist: isSet(object.electroResist) ? Number(object.electroResist) : 0,
      hydroResist: isSet(object.hydroResist) ? Number(object.hydroResist) : 0,
      pyroResist: isSet(object.pyroResist) ? Number(object.pyroResist) : 0,
      cryoResist: isSet(object.cryoResist) ? Number(object.cryoResist) : 0,
      dendroResist: isSet(object.dendroResist) ? Number(object.dendroResist) : 0,
      physicalResist: isSet(object.physicalResist) ? Number(object.physicalResist) : 0,
      anemoResist: isSet(object.anemoResist) ? Number(object.anemoResist) : 0,
      geoResist: isSet(object.geoResist) ? Number(object.geoResist) : 0,
    };
  },

  toJSON(message: GCSimScriptTarget): unknown {
    const obj: any = {};
    if (message.position) {
      obj.position = message.position.map((e) => e);
    } else {
      obj.position = [];
    }
    message.radius !== undefined && (obj.radius = message.radius);
    message.level !== undefined && (obj.level = Math.round(message.level));
    message.resist !== undefined && (obj.resist = message.resist);
    if (message.intervals) {
      obj.intervals = message.intervals.map((e) => Math.round(e));
    } else {
      obj.intervals = [];
    }
    message.hp !== undefined && (obj.hp = Math.round(message.hp));
    message.amount !== undefined && (obj.amount = Math.round(message.amount));
    message.particleThreshold !== undefined && (obj.particleThreshold = Math.round(message.particleThreshold));
    message.particleDropCount !== undefined && (obj.particleDropCount = Math.round(message.particleDropCount));
    message.freezeResist !== undefined && (obj.freezeResist = message.freezeResist);
    message.electroResist !== undefined && (obj.electroResist = message.electroResist);
    message.hydroResist !== undefined && (obj.hydroResist = message.hydroResist);
    message.pyroResist !== undefined && (obj.pyroResist = message.pyroResist);
    message.cryoResist !== undefined && (obj.cryoResist = message.cryoResist);
    message.dendroResist !== undefined && (obj.dendroResist = message.dendroResist);
    message.physicalResist !== undefined && (obj.physicalResist = message.physicalResist);
    message.anemoResist !== undefined && (obj.anemoResist = message.anemoResist);
    message.geoResist !== undefined && (obj.geoResist = message.geoResist);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<GCSimScriptTarget>, I>>(object: I): GCSimScriptTarget {
    const message = createBaseGCSimScriptTarget();
    message.position = object.position?.map((e) => e) || [];
    message.radius = object.radius ?? 0;
    message.level = object.level ?? 0;
    message.resist = object.resist ?? 0;
    message.intervals = object.intervals?.map((e) => e) || [];
    message.hp = object.hp ?? 0;
    message.amount = object.amount ?? 0;
    message.particleThreshold = object.particleThreshold ?? 0;
    message.particleDropCount = object.particleDropCount ?? 0;
    message.freezeResist = object.freezeResist ?? 0;
    message.electroResist = object.electroResist ?? 0;
    message.hydroResist = object.hydroResist ?? 0;
    message.pyroResist = object.pyroResist ?? 0;
    message.cryoResist = object.cryoResist ?? 0;
    message.dendroResist = object.dendroResist ?? 0;
    message.physicalResist = object.physicalResist ?? 0;
    message.anemoResist = object.anemoResist ?? 0;
    message.geoResist = object.geoResist ?? 0;
    return message;
  },
};

function createBaseGCSimScript(): GCSimScript {
  return {
    options: undefined,
    characterInfos: [],
    targets: [],
    energySettings: undefined,
    hurtSettings: undefined,
    scripts: [],
  };
}

export const GCSimScript = {
  encode(message: GCSimScript, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.options !== undefined) {
      GCSimScriptOptions.encode(message.options, writer.uint32(10).fork()).ldelim();
    }
    for (const v of message.characterInfos) {
      GCSimScriptCharacterInfo.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    for (const v of message.targets) {
      GCSimScriptTarget.encode(v!, writer.uint32(26).fork()).ldelim();
    }
    if (message.energySettings !== undefined) {
      GCSimScriptEnergySettings.encode(message.energySettings, writer.uint32(34).fork()).ldelim();
    }
    if (message.hurtSettings !== undefined) {
      GCSimScriptHurtSettings.encode(message.hurtSettings, writer.uint32(42).fork()).ldelim();
    }
    for (const v of message.scripts) {
      writer.uint32(50).string(v!);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GCSimScript {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGCSimScript();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.options = GCSimScriptOptions.decode(reader, reader.uint32());
          break;
        case 2:
          message.characterInfos.push(GCSimScriptCharacterInfo.decode(reader, reader.uint32()));
          break;
        case 3:
          message.targets.push(GCSimScriptTarget.decode(reader, reader.uint32()));
          break;
        case 4:
          message.energySettings = GCSimScriptEnergySettings.decode(reader, reader.uint32());
          break;
        case 5:
          message.hurtSettings = GCSimScriptHurtSettings.decode(reader, reader.uint32());
          break;
        case 6:
          message.scripts.push(reader.string());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): GCSimScript {
    return {
      options: isSet(object.options) ? GCSimScriptOptions.fromJSON(object.options) : undefined,
      characterInfos: Array.isArray(object?.characterInfos)
        ? object.characterInfos.map((e: any) => GCSimScriptCharacterInfo.fromJSON(e))
        : [],
      targets: Array.isArray(object?.targets) ? object.targets.map((e: any) => GCSimScriptTarget.fromJSON(e)) : [],
      energySettings: isSet(object.energySettings)
        ? GCSimScriptEnergySettings.fromJSON(object.energySettings)
        : undefined,
      hurtSettings: isSet(object.hurtSettings) ? GCSimScriptHurtSettings.fromJSON(object.hurtSettings) : undefined,
      scripts: Array.isArray(object?.scripts) ? object.scripts.map((e: any) => String(e)) : [],
    };
  },

  toJSON(message: GCSimScript): unknown {
    const obj: any = {};
    message.options !== undefined &&
      (obj.options = message.options ? GCSimScriptOptions.toJSON(message.options) : undefined);
    if (message.characterInfos) {
      obj.characterInfos = message.characterInfos.map((e) => e ? GCSimScriptCharacterInfo.toJSON(e) : undefined);
    } else {
      obj.characterInfos = [];
    }
    if (message.targets) {
      obj.targets = message.targets.map((e) => e ? GCSimScriptTarget.toJSON(e) : undefined);
    } else {
      obj.targets = [];
    }
    message.energySettings !== undefined && (obj.energySettings = message.energySettings
      ? GCSimScriptEnergySettings.toJSON(message.energySettings)
      : undefined);
    message.hurtSettings !== undefined &&
      (obj.hurtSettings = message.hurtSettings ? GCSimScriptHurtSettings.toJSON(message.hurtSettings) : undefined);
    if (message.scripts) {
      obj.scripts = message.scripts.map((e) => e);
    } else {
      obj.scripts = [];
    }
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<GCSimScript>, I>>(object: I): GCSimScript {
    const message = createBaseGCSimScript();
    message.options = (object.options !== undefined && object.options !== null)
      ? GCSimScriptOptions.fromPartial(object.options)
      : undefined;
    message.characterInfos = object.characterInfos?.map((e) => GCSimScriptCharacterInfo.fromPartial(e)) || [];
    message.targets = object.targets?.map((e) => GCSimScriptTarget.fromPartial(e)) || [];
    message.energySettings = (object.energySettings !== undefined && object.energySettings !== null)
      ? GCSimScriptEnergySettings.fromPartial(object.energySettings)
      : undefined;
    message.hurtSettings = (object.hurtSettings !== undefined && object.hurtSettings !== null)
      ? GCSimScriptHurtSettings.fromPartial(object.hurtSettings)
      : undefined;
    message.scripts = object.scripts?.map((e) => e) || [];
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
