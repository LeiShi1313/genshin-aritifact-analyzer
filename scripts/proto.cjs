/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
"use strict";

var $protobuf = require("protobufjs/minimal");

// Common aliases
var $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
var $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

$root.io = (function() {

    /**
     * Namespace io.
     * @exports io
     * @namespace
     */
    var io = {};

    io.leishi = (function() {

        /**
         * Namespace leishi.
         * @memberof io
         * @namespace
         */
        var leishi = {};

        leishi.genshin = (function() {

            /**
             * Namespace genshin.
             * @memberof io.leishi
             * @namespace
             */
            var genshin = {};

            genshin.proto = (function() {

                /**
                 * Namespace proto.
                 * @memberof io.leishi.genshin
                 * @namespace
                 */
                var proto = {};

                proto.Artifact = (function() {

                    /**
                     * Properties of an Artifact.
                     * @memberof io.leishi.genshin.proto
                     * @interface IArtifact
                     * @property {io.leishi.genshin.proto.Set|null} [set] Artifact set
                     * @property {number|null} [star] Artifact star
                     * @property {number|null} [level] Artifact level
                     * @property {io.leishi.genshin.proto.AttributePosition|null} [position] Artifact position
                     * @property {io.leishi.genshin.proto.IAttribute|null} [mainAttribute] Artifact mainAttribute
                     * @property {Array.<io.leishi.genshin.proto.IAttribute>|null} [subAttributes] Artifact subAttributes
                     * @property {io.leishi.genshin.proto.Character|null} [character] Artifact character
                     * @property {boolean|null} [locked] Artifact locked
                     */

                    /**
                     * Constructs a new Artifact.
                     * @memberof io.leishi.genshin.proto
                     * @classdesc Represents an Artifact.
                     * @implements IArtifact
                     * @constructor
                     * @param {io.leishi.genshin.proto.IArtifact=} [properties] Properties to set
                     */
                    function Artifact(properties) {
                        this.subAttributes = [];
                        if (properties)
                            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                                if (properties[keys[i]] != null)
                                    this[keys[i]] = properties[keys[i]];
                    }

                    /**
                     * Artifact set.
                     * @member {io.leishi.genshin.proto.Set} set
                     * @memberof io.leishi.genshin.proto.Artifact
                     * @instance
                     */
                    Artifact.prototype.set = 0;

                    /**
                     * Artifact star.
                     * @member {number} star
                     * @memberof io.leishi.genshin.proto.Artifact
                     * @instance
                     */
                    Artifact.prototype.star = 0;

                    /**
                     * Artifact level.
                     * @member {number} level
                     * @memberof io.leishi.genshin.proto.Artifact
                     * @instance
                     */
                    Artifact.prototype.level = 0;

                    /**
                     * Artifact position.
                     * @member {io.leishi.genshin.proto.AttributePosition} position
                     * @memberof io.leishi.genshin.proto.Artifact
                     * @instance
                     */
                    Artifact.prototype.position = 0;

                    /**
                     * Artifact mainAttribute.
                     * @member {io.leishi.genshin.proto.IAttribute|null|undefined} mainAttribute
                     * @memberof io.leishi.genshin.proto.Artifact
                     * @instance
                     */
                    Artifact.prototype.mainAttribute = null;

                    /**
                     * Artifact subAttributes.
                     * @member {Array.<io.leishi.genshin.proto.IAttribute>} subAttributes
                     * @memberof io.leishi.genshin.proto.Artifact
                     * @instance
                     */
                    Artifact.prototype.subAttributes = $util.emptyArray;

                    /**
                     * Artifact character.
                     * @member {io.leishi.genshin.proto.Character} character
                     * @memberof io.leishi.genshin.proto.Artifact
                     * @instance
                     */
                    Artifact.prototype.character = 0;

                    /**
                     * Artifact locked.
                     * @member {boolean} locked
                     * @memberof io.leishi.genshin.proto.Artifact
                     * @instance
                     */
                    Artifact.prototype.locked = false;

                    /**
                     * Creates a new Artifact instance using the specified properties.
                     * @function create
                     * @memberof io.leishi.genshin.proto.Artifact
                     * @static
                     * @param {io.leishi.genshin.proto.IArtifact=} [properties] Properties to set
                     * @returns {io.leishi.genshin.proto.Artifact} Artifact instance
                     */
                    Artifact.create = function create(properties) {
                        return new Artifact(properties);
                    };

                    /**
                     * Encodes the specified Artifact message. Does not implicitly {@link io.leishi.genshin.proto.Artifact.verify|verify} messages.
                     * @function encode
                     * @memberof io.leishi.genshin.proto.Artifact
                     * @static
                     * @param {io.leishi.genshin.proto.IArtifact} message Artifact message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    Artifact.encode = function encode(message, writer) {
                        if (!writer)
                            writer = $Writer.create();
                        if (message.set != null && Object.hasOwnProperty.call(message, "set"))
                            writer.uint32(/* id 1, wireType 0 =*/8).int32(message.set);
                        if (message.star != null && Object.hasOwnProperty.call(message, "star"))
                            writer.uint32(/* id 2, wireType 0 =*/16).int32(message.star);
                        if (message.level != null && Object.hasOwnProperty.call(message, "level"))
                            writer.uint32(/* id 3, wireType 0 =*/24).int32(message.level);
                        if (message.position != null && Object.hasOwnProperty.call(message, "position"))
                            writer.uint32(/* id 4, wireType 0 =*/32).int32(message.position);
                        if (message.mainAttribute != null && Object.hasOwnProperty.call(message, "mainAttribute"))
                            $root.io.leishi.genshin.proto.Attribute.encode(message.mainAttribute, writer.uint32(/* id 5, wireType 2 =*/42).fork()).ldelim();
                        if (message.subAttributes != null && message.subAttributes.length)
                            for (var i = 0; i < message.subAttributes.length; ++i)
                                $root.io.leishi.genshin.proto.Attribute.encode(message.subAttributes[i], writer.uint32(/* id 6, wireType 2 =*/50).fork()).ldelim();
                        if (message.character != null && Object.hasOwnProperty.call(message, "character"))
                            writer.uint32(/* id 7, wireType 0 =*/56).int32(message.character);
                        if (message.locked != null && Object.hasOwnProperty.call(message, "locked"))
                            writer.uint32(/* id 8, wireType 0 =*/64).bool(message.locked);
                        return writer;
                    };

                    /**
                     * Encodes the specified Artifact message, length delimited. Does not implicitly {@link io.leishi.genshin.proto.Artifact.verify|verify} messages.
                     * @function encodeDelimited
                     * @memberof io.leishi.genshin.proto.Artifact
                     * @static
                     * @param {io.leishi.genshin.proto.IArtifact} message Artifact message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    Artifact.encodeDelimited = function encodeDelimited(message, writer) {
                        return this.encode(message, writer).ldelim();
                    };

                    /**
                     * Decodes an Artifact message from the specified reader or buffer.
                     * @function decode
                     * @memberof io.leishi.genshin.proto.Artifact
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @param {number} [length] Message length if known beforehand
                     * @returns {io.leishi.genshin.proto.Artifact} Artifact
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    Artifact.decode = function decode(reader, length) {
                        if (!(reader instanceof $Reader))
                            reader = $Reader.create(reader);
                        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.io.leishi.genshin.proto.Artifact();
                        while (reader.pos < end) {
                            var tag = reader.uint32();
                            switch (tag >>> 3) {
                            case 1: {
                                    message.set = reader.int32();
                                    break;
                                }
                            case 2: {
                                    message.star = reader.int32();
                                    break;
                                }
                            case 3: {
                                    message.level = reader.int32();
                                    break;
                                }
                            case 4: {
                                    message.position = reader.int32();
                                    break;
                                }
                            case 5: {
                                    message.mainAttribute = $root.io.leishi.genshin.proto.Attribute.decode(reader, reader.uint32());
                                    break;
                                }
                            case 6: {
                                    if (!(message.subAttributes && message.subAttributes.length))
                                        message.subAttributes = [];
                                    message.subAttributes.push($root.io.leishi.genshin.proto.Attribute.decode(reader, reader.uint32()));
                                    break;
                                }
                            case 7: {
                                    message.character = reader.int32();
                                    break;
                                }
                            case 8: {
                                    message.locked = reader.bool();
                                    break;
                                }
                            default:
                                reader.skipType(tag & 7);
                                break;
                            }
                        }
                        return message;
                    };

                    /**
                     * Decodes an Artifact message from the specified reader or buffer, length delimited.
                     * @function decodeDelimited
                     * @memberof io.leishi.genshin.proto.Artifact
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @returns {io.leishi.genshin.proto.Artifact} Artifact
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    Artifact.decodeDelimited = function decodeDelimited(reader) {
                        if (!(reader instanceof $Reader))
                            reader = new $Reader(reader);
                        return this.decode(reader, reader.uint32());
                    };

                    /**
                     * Verifies an Artifact message.
                     * @function verify
                     * @memberof io.leishi.genshin.proto.Artifact
                     * @static
                     * @param {Object.<string,*>} message Plain object to verify
                     * @returns {string|null} `null` if valid, otherwise the reason why it is not
                     */
                    Artifact.verify = function verify(message) {
                        if (typeof message !== "object" || message === null)
                            return "object expected";
                        if (message.set != null && message.hasOwnProperty("set"))
                            switch (message.set) {
                            default:
                                return "set: enum value expected";
                            case 0:
                            case 1:
                            case 2:
                            case 3:
                            case 4:
                            case 5:
                            case 6:
                            case 7:
                            case 8:
                            case 9:
                            case 10:
                            case 11:
                            case 12:
                            case 13:
                            case 14:
                            case 15:
                            case 16:
                            case 17:
                            case 18:
                            case 19:
                            case 20:
                            case 21:
                            case 22:
                            case 23:
                            case 24:
                            case 25:
                            case 26:
                            case 27:
                            case 28:
                            case 29:
                            case 30:
                            case 31:
                            case 32:
                            case 33:
                            case 34:
                            case 35:
                            case 36:
                            case 37:
                            case 38:
                            case 39:
                            case 40:
                                break;
                            }
                        if (message.star != null && message.hasOwnProperty("star"))
                            if (!$util.isInteger(message.star))
                                return "star: integer expected";
                        if (message.level != null && message.hasOwnProperty("level"))
                            if (!$util.isInteger(message.level))
                                return "level: integer expected";
                        if (message.position != null && message.hasOwnProperty("position"))
                            switch (message.position) {
                            default:
                                return "position: enum value expected";
                            case 0:
                            case 1:
                            case 2:
                            case 3:
                            case 4:
                            case 5:
                                break;
                            }
                        if (message.mainAttribute != null && message.hasOwnProperty("mainAttribute")) {
                            var error = $root.io.leishi.genshin.proto.Attribute.verify(message.mainAttribute);
                            if (error)
                                return "mainAttribute." + error;
                        }
                        if (message.subAttributes != null && message.hasOwnProperty("subAttributes")) {
                            if (!Array.isArray(message.subAttributes))
                                return "subAttributes: array expected";
                            for (var i = 0; i < message.subAttributes.length; ++i) {
                                var error = $root.io.leishi.genshin.proto.Attribute.verify(message.subAttributes[i]);
                                if (error)
                                    return "subAttributes." + error;
                            }
                        }
                        if (message.character != null && message.hasOwnProperty("character"))
                            switch (message.character) {
                            default:
                                return "character: enum value expected";
                            case 0:
                            case 1:
                            case 2:
                            case 3:
                            case 4:
                            case 5:
                            case 6:
                            case 7:
                            case 8:
                            case 9:
                            case 10:
                            case 11:
                            case 12:
                            case 13:
                            case 14:
                            case 15:
                            case 16:
                            case 17:
                            case 18:
                            case 19:
                            case 20:
                            case 21:
                            case 22:
                            case 23:
                            case 24:
                            case 25:
                            case 26:
                            case 27:
                            case 28:
                            case 29:
                            case 30:
                            case 31:
                            case 32:
                            case 33:
                            case 34:
                            case 35:
                            case 36:
                            case 37:
                            case 38:
                            case 39:
                            case 40:
                            case 41:
                            case 42:
                            case 43:
                            case 44:
                            case 45:
                            case 46:
                            case 47:
                            case 48:
                            case 49:
                            case 50:
                            case 51:
                            case 52:
                            case 53:
                            case 54:
                            case 55:
                            case 56:
                            case 57:
                            case 58:
                            case 59:
                            case 60:
                            case 61:
                            case 62:
                            case 63:
                            case 64:
                            case 65:
                            case 66:
                            case 67:
                            case 68:
                                break;
                            }
                        if (message.locked != null && message.hasOwnProperty("locked"))
                            if (typeof message.locked !== "boolean")
                                return "locked: boolean expected";
                        return null;
                    };

                    /**
                     * Creates an Artifact message from a plain object. Also converts values to their respective internal types.
                     * @function fromObject
                     * @memberof io.leishi.genshin.proto.Artifact
                     * @static
                     * @param {Object.<string,*>} object Plain object
                     * @returns {io.leishi.genshin.proto.Artifact} Artifact
                     */
                    Artifact.fromObject = function fromObject(object) {
                        if (object instanceof $root.io.leishi.genshin.proto.Artifact)
                            return object;
                        var message = new $root.io.leishi.genshin.proto.Artifact();
                        switch (object.set) {
                        default:
                            if (typeof object.set === "number") {
                                message.set = object.set;
                                break;
                            }
                            break;
                        case "SET_UNSPECIFIED":
                        case 0:
                            message.set = 0;
                            break;
                        case "ARCHAIC_PETRA":
                        case 1:
                            message.set = 1;
                            break;
                        case "BERSERKER":
                        case 2:
                            message.set = 2;
                            break;
                        case "BLIZZARD_STRAYER":
                        case 3:
                            message.set = 3;
                            break;
                        case "BLOODSTAINED_CHIVALRY":
                        case 4:
                            message.set = 4;
                            break;
                        case "BRAVE_HEART":
                        case 5:
                            message.set = 5;
                            break;
                        case "CRIMSON_WITCH_OF_FLAMES":
                        case 6:
                            message.set = 6;
                            break;
                        case "DEEPWOOD_MEMORIES":
                        case 7:
                            message.set = 7;
                            break;
                        case "DEFENDERS_WILL":
                        case 8:
                            message.set = 8;
                            break;
                        case "DESERT_PAVILION_CHRONICLE":
                        case 9:
                            message.set = 9;
                            break;
                        case "ECHOES_OF_AN_OFFERING":
                        case 10:
                            message.set = 10;
                            break;
                        case "EMBLEM_OF_SEVERED_FATE":
                        case 11:
                            message.set = 11;
                            break;
                        case "FLOWER_OF_PARADISE_LOST":
                        case 12:
                            message.set = 12;
                            break;
                        case "GAMBLER":
                        case 13:
                            message.set = 13;
                            break;
                        case "GILDED_DREAMS":
                        case 14:
                            message.set = 14;
                            break;
                        case "GLADIATORS_FINALE":
                        case 15:
                            message.set = 15;
                            break;
                        case "HEART_OF_DEPTH":
                        case 16:
                            message.set = 16;
                            break;
                        case "HUSK_OF_OPULENT_DREAMS":
                        case 17:
                            message.set = 17;
                            break;
                        case "INSTRUCTOR":
                        case 18:
                            message.set = 18;
                            break;
                        case "LAVAWALKER":
                        case 19:
                            message.set = 19;
                            break;
                        case "MAIDEN_BELOVED":
                        case 20:
                            message.set = 20;
                            break;
                        case "MARTIAL_ARTIST":
                        case 21:
                            message.set = 21;
                            break;
                        case "NOBLESSE_OBLIGE":
                        case 22:
                            message.set = 22;
                            break;
                        case "OCEAN_HUED_CLAM":
                        case 23:
                            message.set = 23;
                            break;
                        case "PALE_FLAME":
                        case 24:
                            message.set = 24;
                            break;
                        case "PRAYERS_FOR_DESTINY":
                        case 25:
                            message.set = 25;
                            break;
                        case "PRAYERS_FOR_ILLUMINATION":
                        case 26:
                            message.set = 26;
                            break;
                        case "PRAYERS_FOR_WISDOM":
                        case 27:
                            message.set = 27;
                            break;
                        case "PRAYERS_TO_SPRINGTIME":
                        case 28:
                            message.set = 28;
                            break;
                        case "RESOLUTION_OF_SOJOURNER":
                        case 29:
                            message.set = 29;
                            break;
                        case "RETRACING_BOLIDE":
                        case 30:
                            message.set = 30;
                            break;
                        case "SCHOLAR":
                        case 31:
                            message.set = 31;
                            break;
                        case "SHIMENAWAS_REMINISCENCE":
                        case 32:
                            message.set = 32;
                            break;
                        case "TENACITY_OF_THE_MILLELITH":
                        case 33:
                            message.set = 33;
                            break;
                        case "THE_EXILE":
                        case 34:
                            message.set = 34;
                            break;
                        case "THUNDERING_FURY":
                        case 35:
                            message.set = 35;
                            break;
                        case "THUNDERSOOTHER":
                        case 36:
                            message.set = 36;
                            break;
                        case "TINY_MIRACLE":
                        case 37:
                            message.set = 37;
                            break;
                        case "VERMILLION_HEREAFTER":
                        case 38:
                            message.set = 38;
                            break;
                        case "VIRIDESCENT_VENERER":
                        case 39:
                            message.set = 39;
                            break;
                        case "WANDERERS_TROUPE":
                        case 40:
                            message.set = 40;
                            break;
                        }
                        if (object.star != null)
                            message.star = object.star | 0;
                        if (object.level != null)
                            message.level = object.level | 0;
                        switch (object.position) {
                        default:
                            if (typeof object.position === "number") {
                                message.position = object.position;
                                break;
                            }
                            break;
                        case "ATTRIBUTE_POSITION_UNSPECIFIED":
                        case 0:
                            message.position = 0;
                            break;
                        case "FLOWER":
                        case 1:
                            message.position = 1;
                            break;
                        case "PLUME":
                        case 2:
                            message.position = 2;
                            break;
                        case "SANDS":
                        case 3:
                            message.position = 3;
                            break;
                        case "GOBLET":
                        case 4:
                            message.position = 4;
                            break;
                        case "CIRCLET":
                        case 5:
                            message.position = 5;
                            break;
                        }
                        if (object.mainAttribute != null) {
                            if (typeof object.mainAttribute !== "object")
                                throw TypeError(".io.leishi.genshin.proto.Artifact.mainAttribute: object expected");
                            message.mainAttribute = $root.io.leishi.genshin.proto.Attribute.fromObject(object.mainAttribute);
                        }
                        if (object.subAttributes) {
                            if (!Array.isArray(object.subAttributes))
                                throw TypeError(".io.leishi.genshin.proto.Artifact.subAttributes: array expected");
                            message.subAttributes = [];
                            for (var i = 0; i < object.subAttributes.length; ++i) {
                                if (typeof object.subAttributes[i] !== "object")
                                    throw TypeError(".io.leishi.genshin.proto.Artifact.subAttributes: object expected");
                                message.subAttributes[i] = $root.io.leishi.genshin.proto.Attribute.fromObject(object.subAttributes[i]);
                            }
                        }
                        switch (object.character) {
                        default:
                            if (typeof object.character === "number") {
                                message.character = object.character;
                                break;
                            }
                            break;
                        case "CHARACTER_UNSPECIFIED":
                        case 0:
                            message.character = 0;
                            break;
                        case "TRAVELER_ANEMO":
                        case 1:
                            message.character = 1;
                            break;
                        case "TRAVELER_GEO":
                        case 2:
                            message.character = 2;
                            break;
                        case "TRAVELER_ELECTRO":
                        case 3:
                            message.character = 3;
                            break;
                        case "TRAVELER_DENDRO":
                        case 4:
                            message.character = 4;
                            break;
                        case "AETHER":
                        case 5:
                            message.character = 5;
                            break;
                        case "LUMINE":
                        case 6:
                            message.character = 6;
                            break;
                        case "ALBEDO":
                        case 7:
                            message.character = 7;
                            break;
                        case "ALOY":
                        case 8:
                            message.character = 8;
                            break;
                        case "AMBER":
                        case 9:
                            message.character = 9;
                            break;
                        case "BARBARA":
                        case 10:
                            message.character = 10;
                            break;
                        case "BEIDOU":
                        case 11:
                            message.character = 11;
                            break;
                        case "BENNETT":
                        case 12:
                            message.character = 12;
                            break;
                        case "CHONGYUN":
                        case 13:
                            message.character = 13;
                            break;
                        case "DILUC":
                        case 14:
                            message.character = 14;
                            break;
                        case "DIONA":
                        case 15:
                            message.character = 15;
                            break;
                        case "EULA":
                        case 16:
                            message.character = 16;
                            break;
                        case "FISCHL":
                        case 17:
                            message.character = 17;
                            break;
                        case "GANYU":
                        case 18:
                            message.character = 18;
                            break;
                        case "HU_TAO":
                        case 19:
                            message.character = 19;
                            break;
                        case "JEAN":
                        case 20:
                            message.character = 20;
                            break;
                        case "KAEDEHARA_KAZUHA":
                        case 21:
                            message.character = 21;
                            break;
                        case "KAEYA":
                        case 22:
                            message.character = 22;
                            break;
                        case "KAMISATO_AYAKA":
                        case 23:
                            message.character = 23;
                            break;
                        case "KEQING":
                        case 24:
                            message.character = 24;
                            break;
                        case "KLEE":
                        case 25:
                            message.character = 25;
                            break;
                        case "KUJOU_SARA":
                        case 26:
                            message.character = 26;
                            break;
                        case "LISA":
                        case 27:
                            message.character = 27;
                            break;
                        case "MONA":
                        case 28:
                            message.character = 28;
                            break;
                        case "NINGGUANG":
                        case 29:
                            message.character = 29;
                            break;
                        case "NOELLE":
                        case 30:
                            message.character = 30;
                            break;
                        case "QIQI":
                        case 31:
                            message.character = 31;
                            break;
                        case "RAIDEN_SHOGUN":
                        case 32:
                            message.character = 32;
                            break;
                        case "RAZOR":
                        case 33:
                            message.character = 33;
                            break;
                        case "ROSARIA":
                        case 34:
                            message.character = 34;
                            break;
                        case "SANGONOMIYA_KOKOMI":
                        case 35:
                            message.character = 35;
                            break;
                        case "SAYU":
                        case 36:
                            message.character = 36;
                            break;
                        case "SUCROSE":
                        case 37:
                            message.character = 37;
                            break;
                        case "TARTAGLIA":
                        case 38:
                            message.character = 38;
                            break;
                        case "THOMA":
                        case 39:
                            message.character = 39;
                            break;
                        case "VENTI":
                        case 40:
                            message.character = 40;
                            break;
                        case "XIANGLING":
                        case 41:
                            message.character = 41;
                            break;
                        case "XIAO":
                        case 42:
                            message.character = 42;
                            break;
                        case "XINGQIU":
                        case 43:
                            message.character = 43;
                            break;
                        case "XINYAN":
                        case 44:
                            message.character = 44;
                            break;
                        case "YANFEI":
                        case 45:
                            message.character = 45;
                            break;
                        case "YOIMIYA":
                        case 46:
                            message.character = 46;
                            break;
                        case "ZHONGLI":
                        case 47:
                            message.character = 47;
                            break;
                        case "GOROU":
                        case 48:
                            message.character = 48;
                            break;
                        case "ARATAKI_ITTO":
                        case 49:
                            message.character = 49;
                            break;
                        case "SHENHE":
                        case 50:
                            message.character = 50;
                            break;
                        case "YUN_JIN":
                        case 51:
                            message.character = 51;
                            break;
                        case "YAE_MIKO":
                        case 52:
                            message.character = 52;
                            break;
                        case "KAMISATO_AYATO":
                        case 53:
                            message.character = 53;
                            break;
                        case "YELAN":
                        case 54:
                            message.character = 54;
                            break;
                        case "KUKI_SHINOBU":
                        case 55:
                            message.character = 55;
                            break;
                        case "SHIKANOIN_HEIZOU":
                        case 56:
                            message.character = 56;
                            break;
                        case "COLLEI":
                        case 57:
                            message.character = 57;
                            break;
                        case "DORI":
                        case 58:
                            message.character = 58;
                            break;
                        case "TIGHNARI":
                        case 59:
                            message.character = 59;
                            break;
                        case "CANDACE":
                        case 60:
                            message.character = 60;
                            break;
                        case "CYNO":
                        case 61:
                            message.character = 61;
                            break;
                        case "NILOU":
                        case 62:
                            message.character = 62;
                            break;
                        case "NAHIDA":
                        case 63:
                            message.character = 63;
                            break;
                        case "LAYLA":
                        case 64:
                            message.character = 64;
                            break;
                        case "FARUZAN":
                        case 65:
                            message.character = 65;
                            break;
                        case "WANDERER":
                        case 66:
                            message.character = 66;
                            break;
                        case "ALHAITHAM":
                        case 67:
                            message.character = 67;
                            break;
                        case "YAOYAO":
                        case 68:
                            message.character = 68;
                            break;
                        }
                        if (object.locked != null)
                            message.locked = Boolean(object.locked);
                        return message;
                    };

                    /**
                     * Creates a plain object from an Artifact message. Also converts values to other types if specified.
                     * @function toObject
                     * @memberof io.leishi.genshin.proto.Artifact
                     * @static
                     * @param {io.leishi.genshin.proto.Artifact} message Artifact
                     * @param {$protobuf.IConversionOptions} [options] Conversion options
                     * @returns {Object.<string,*>} Plain object
                     */
                    Artifact.toObject = function toObject(message, options) {
                        if (!options)
                            options = {};
                        var object = {};
                        if (options.arrays || options.defaults)
                            object.subAttributes = [];
                        if (options.defaults) {
                            object.set = options.enums === String ? "SET_UNSPECIFIED" : 0;
                            object.star = 0;
                            object.level = 0;
                            object.position = options.enums === String ? "ATTRIBUTE_POSITION_UNSPECIFIED" : 0;
                            object.mainAttribute = null;
                            object.character = options.enums === String ? "CHARACTER_UNSPECIFIED" : 0;
                            object.locked = false;
                        }
                        if (message.set != null && message.hasOwnProperty("set"))
                            object.set = options.enums === String ? $root.io.leishi.genshin.proto.Set[message.set] === undefined ? message.set : $root.io.leishi.genshin.proto.Set[message.set] : message.set;
                        if (message.star != null && message.hasOwnProperty("star"))
                            object.star = message.star;
                        if (message.level != null && message.hasOwnProperty("level"))
                            object.level = message.level;
                        if (message.position != null && message.hasOwnProperty("position"))
                            object.position = options.enums === String ? $root.io.leishi.genshin.proto.AttributePosition[message.position] === undefined ? message.position : $root.io.leishi.genshin.proto.AttributePosition[message.position] : message.position;
                        if (message.mainAttribute != null && message.hasOwnProperty("mainAttribute"))
                            object.mainAttribute = $root.io.leishi.genshin.proto.Attribute.toObject(message.mainAttribute, options);
                        if (message.subAttributes && message.subAttributes.length) {
                            object.subAttributes = [];
                            for (var j = 0; j < message.subAttributes.length; ++j)
                                object.subAttributes[j] = $root.io.leishi.genshin.proto.Attribute.toObject(message.subAttributes[j], options);
                        }
                        if (message.character != null && message.hasOwnProperty("character"))
                            object.character = options.enums === String ? $root.io.leishi.genshin.proto.Character[message.character] === undefined ? message.character : $root.io.leishi.genshin.proto.Character[message.character] : message.character;
                        if (message.locked != null && message.hasOwnProperty("locked"))
                            object.locked = message.locked;
                        return object;
                    };

                    /**
                     * Converts this Artifact to JSON.
                     * @function toJSON
                     * @memberof io.leishi.genshin.proto.Artifact
                     * @instance
                     * @returns {Object.<string,*>} JSON object
                     */
                    Artifact.prototype.toJSON = function toJSON() {
                        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                    };

                    /**
                     * Gets the default type url for Artifact
                     * @function getTypeUrl
                     * @memberof io.leishi.genshin.proto.Artifact
                     * @static
                     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns {string} The default type url
                     */
                    Artifact.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                        if (typeUrlPrefix === undefined) {
                            typeUrlPrefix = "type.googleapis.com";
                        }
                        return typeUrlPrefix + "/io.leishi.genshin.proto.Artifact";
                    };

                    return Artifact;
                })();

                /**
                 * AttributeType enum.
                 * @name io.leishi.genshin.proto.AttributeType
                 * @enum {number}
                 * @property {number} ATTRIBUTE_TYPE_UNSPECIFIED=0 ATTRIBUTE_TYPE_UNSPECIFIED value
                 * @property {number} HP=1 HP value
                 * @property {number} ATK=2 ATK value
                 * @property {number} DEF=3 DEF value
                 * @property {number} ELEMENTAL_MASTERY=4 ELEMENTAL_MASTERY value
                 * @property {number} ENERGY_RECHARGE=5 ENERGY_RECHARGE value
                 * @property {number} HP_PERCENT=6 HP_PERCENT value
                 * @property {number} ATK_PERCENT=7 ATK_PERCENT value
                 * @property {number} DEF_PERCENT=8 DEF_PERCENT value
                 * @property {number} CRIT_RATE=9 CRIT_RATE value
                 * @property {number} CRIT_DAMAGE=10 CRIT_DAMAGE value
                 * @property {number} HEALING_BONUS=11 HEALING_BONUS value
                 * @property {number} ANEMO_DAMAGE_BONUS=12 ANEMO_DAMAGE_BONUS value
                 * @property {number} CRYO_DAMAGE_BONUS=13 CRYO_DAMAGE_BONUS value
                 * @property {number} DENDRO_DAMAGE_BONUS=14 DENDRO_DAMAGE_BONUS value
                 * @property {number} ELECTRO_DAMAGE_BONUS=15 ELECTRO_DAMAGE_BONUS value
                 * @property {number} GEO_DAMAGE_BONUS=16 GEO_DAMAGE_BONUS value
                 * @property {number} HYDRO_DAMAGE_BONUS=17 HYDRO_DAMAGE_BONUS value
                 * @property {number} PHYSICAL_DAMAGE_BONUS=18 PHYSICAL_DAMAGE_BONUS value
                 * @property {number} PYRO_DAMAGE_BONUS=19 PYRO_DAMAGE_BONUS value
                 */
                proto.AttributeType = (function() {
                    var valuesById = {}, values = Object.create(valuesById);
                    values[valuesById[0] = "ATTRIBUTE_TYPE_UNSPECIFIED"] = 0;
                    values[valuesById[1] = "HP"] = 1;
                    values[valuesById[2] = "ATK"] = 2;
                    values[valuesById[3] = "DEF"] = 3;
                    values[valuesById[4] = "ELEMENTAL_MASTERY"] = 4;
                    values[valuesById[5] = "ENERGY_RECHARGE"] = 5;
                    values[valuesById[6] = "HP_PERCENT"] = 6;
                    values[valuesById[7] = "ATK_PERCENT"] = 7;
                    values[valuesById[8] = "DEF_PERCENT"] = 8;
                    values[valuesById[9] = "CRIT_RATE"] = 9;
                    values[valuesById[10] = "CRIT_DAMAGE"] = 10;
                    values[valuesById[11] = "HEALING_BONUS"] = 11;
                    values[valuesById[12] = "ANEMO_DAMAGE_BONUS"] = 12;
                    values[valuesById[13] = "CRYO_DAMAGE_BONUS"] = 13;
                    values[valuesById[14] = "DENDRO_DAMAGE_BONUS"] = 14;
                    values[valuesById[15] = "ELECTRO_DAMAGE_BONUS"] = 15;
                    values[valuesById[16] = "GEO_DAMAGE_BONUS"] = 16;
                    values[valuesById[17] = "HYDRO_DAMAGE_BONUS"] = 17;
                    values[valuesById[18] = "PHYSICAL_DAMAGE_BONUS"] = 18;
                    values[valuesById[19] = "PYRO_DAMAGE_BONUS"] = 19;
                    return values;
                })();

                /**
                 * AttributePosition enum.
                 * @name io.leishi.genshin.proto.AttributePosition
                 * @enum {number}
                 * @property {number} ATTRIBUTE_POSITION_UNSPECIFIED=0 ATTRIBUTE_POSITION_UNSPECIFIED value
                 * @property {number} FLOWER=1 FLOWER value
                 * @property {number} PLUME=2 PLUME value
                 * @property {number} SANDS=3 SANDS value
                 * @property {number} GOBLET=4 GOBLET value
                 * @property {number} CIRCLET=5 CIRCLET value
                 */
                proto.AttributePosition = (function() {
                    var valuesById = {}, values = Object.create(valuesById);
                    values[valuesById[0] = "ATTRIBUTE_POSITION_UNSPECIFIED"] = 0;
                    values[valuesById[1] = "FLOWER"] = 1;
                    values[valuesById[2] = "PLUME"] = 2;
                    values[valuesById[3] = "SANDS"] = 3;
                    values[valuesById[4] = "GOBLET"] = 4;
                    values[valuesById[5] = "CIRCLET"] = 5;
                    return values;
                })();

                proto.Attribute = (function() {

                    /**
                     * Properties of an Attribute.
                     * @memberof io.leishi.genshin.proto
                     * @interface IAttribute
                     * @property {io.leishi.genshin.proto.AttributeType|null} [type] Attribute type
                     * @property {number|null} [value] Attribute value
                     */

                    /**
                     * Constructs a new Attribute.
                     * @memberof io.leishi.genshin.proto
                     * @classdesc Represents an Attribute.
                     * @implements IAttribute
                     * @constructor
                     * @param {io.leishi.genshin.proto.IAttribute=} [properties] Properties to set
                     */
                    function Attribute(properties) {
                        if (properties)
                            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                                if (properties[keys[i]] != null)
                                    this[keys[i]] = properties[keys[i]];
                    }

                    /**
                     * Attribute type.
                     * @member {io.leishi.genshin.proto.AttributeType} type
                     * @memberof io.leishi.genshin.proto.Attribute
                     * @instance
                     */
                    Attribute.prototype.type = 0;

                    /**
                     * Attribute value.
                     * @member {number} value
                     * @memberof io.leishi.genshin.proto.Attribute
                     * @instance
                     */
                    Attribute.prototype.value = 0;

                    /**
                     * Creates a new Attribute instance using the specified properties.
                     * @function create
                     * @memberof io.leishi.genshin.proto.Attribute
                     * @static
                     * @param {io.leishi.genshin.proto.IAttribute=} [properties] Properties to set
                     * @returns {io.leishi.genshin.proto.Attribute} Attribute instance
                     */
                    Attribute.create = function create(properties) {
                        return new Attribute(properties);
                    };

                    /**
                     * Encodes the specified Attribute message. Does not implicitly {@link io.leishi.genshin.proto.Attribute.verify|verify} messages.
                     * @function encode
                     * @memberof io.leishi.genshin.proto.Attribute
                     * @static
                     * @param {io.leishi.genshin.proto.IAttribute} message Attribute message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    Attribute.encode = function encode(message, writer) {
                        if (!writer)
                            writer = $Writer.create();
                        if (message.type != null && Object.hasOwnProperty.call(message, "type"))
                            writer.uint32(/* id 1, wireType 0 =*/8).int32(message.type);
                        if (message.value != null && Object.hasOwnProperty.call(message, "value"))
                            writer.uint32(/* id 2, wireType 5 =*/21).float(message.value);
                        return writer;
                    };

                    /**
                     * Encodes the specified Attribute message, length delimited. Does not implicitly {@link io.leishi.genshin.proto.Attribute.verify|verify} messages.
                     * @function encodeDelimited
                     * @memberof io.leishi.genshin.proto.Attribute
                     * @static
                     * @param {io.leishi.genshin.proto.IAttribute} message Attribute message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    Attribute.encodeDelimited = function encodeDelimited(message, writer) {
                        return this.encode(message, writer).ldelim();
                    };

                    /**
                     * Decodes an Attribute message from the specified reader or buffer.
                     * @function decode
                     * @memberof io.leishi.genshin.proto.Attribute
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @param {number} [length] Message length if known beforehand
                     * @returns {io.leishi.genshin.proto.Attribute} Attribute
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    Attribute.decode = function decode(reader, length) {
                        if (!(reader instanceof $Reader))
                            reader = $Reader.create(reader);
                        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.io.leishi.genshin.proto.Attribute();
                        while (reader.pos < end) {
                            var tag = reader.uint32();
                            switch (tag >>> 3) {
                            case 1: {
                                    message.type = reader.int32();
                                    break;
                                }
                            case 2: {
                                    message.value = reader.float();
                                    break;
                                }
                            default:
                                reader.skipType(tag & 7);
                                break;
                            }
                        }
                        return message;
                    };

                    /**
                     * Decodes an Attribute message from the specified reader or buffer, length delimited.
                     * @function decodeDelimited
                     * @memberof io.leishi.genshin.proto.Attribute
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @returns {io.leishi.genshin.proto.Attribute} Attribute
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    Attribute.decodeDelimited = function decodeDelimited(reader) {
                        if (!(reader instanceof $Reader))
                            reader = new $Reader(reader);
                        return this.decode(reader, reader.uint32());
                    };

                    /**
                     * Verifies an Attribute message.
                     * @function verify
                     * @memberof io.leishi.genshin.proto.Attribute
                     * @static
                     * @param {Object.<string,*>} message Plain object to verify
                     * @returns {string|null} `null` if valid, otherwise the reason why it is not
                     */
                    Attribute.verify = function verify(message) {
                        if (typeof message !== "object" || message === null)
                            return "object expected";
                        if (message.type != null && message.hasOwnProperty("type"))
                            switch (message.type) {
                            default:
                                return "type: enum value expected";
                            case 0:
                            case 1:
                            case 2:
                            case 3:
                            case 4:
                            case 5:
                            case 6:
                            case 7:
                            case 8:
                            case 9:
                            case 10:
                            case 11:
                            case 12:
                            case 13:
                            case 14:
                            case 15:
                            case 16:
                            case 17:
                            case 18:
                            case 19:
                                break;
                            }
                        if (message.value != null && message.hasOwnProperty("value"))
                            if (typeof message.value !== "number")
                                return "value: number expected";
                        return null;
                    };

                    /**
                     * Creates an Attribute message from a plain object. Also converts values to their respective internal types.
                     * @function fromObject
                     * @memberof io.leishi.genshin.proto.Attribute
                     * @static
                     * @param {Object.<string,*>} object Plain object
                     * @returns {io.leishi.genshin.proto.Attribute} Attribute
                     */
                    Attribute.fromObject = function fromObject(object) {
                        if (object instanceof $root.io.leishi.genshin.proto.Attribute)
                            return object;
                        var message = new $root.io.leishi.genshin.proto.Attribute();
                        switch (object.type) {
                        default:
                            if (typeof object.type === "number") {
                                message.type = object.type;
                                break;
                            }
                            break;
                        case "ATTRIBUTE_TYPE_UNSPECIFIED":
                        case 0:
                            message.type = 0;
                            break;
                        case "HP":
                        case 1:
                            message.type = 1;
                            break;
                        case "ATK":
                        case 2:
                            message.type = 2;
                            break;
                        case "DEF":
                        case 3:
                            message.type = 3;
                            break;
                        case "ELEMENTAL_MASTERY":
                        case 4:
                            message.type = 4;
                            break;
                        case "ENERGY_RECHARGE":
                        case 5:
                            message.type = 5;
                            break;
                        case "HP_PERCENT":
                        case 6:
                            message.type = 6;
                            break;
                        case "ATK_PERCENT":
                        case 7:
                            message.type = 7;
                            break;
                        case "DEF_PERCENT":
                        case 8:
                            message.type = 8;
                            break;
                        case "CRIT_RATE":
                        case 9:
                            message.type = 9;
                            break;
                        case "CRIT_DAMAGE":
                        case 10:
                            message.type = 10;
                            break;
                        case "HEALING_BONUS":
                        case 11:
                            message.type = 11;
                            break;
                        case "ANEMO_DAMAGE_BONUS":
                        case 12:
                            message.type = 12;
                            break;
                        case "CRYO_DAMAGE_BONUS":
                        case 13:
                            message.type = 13;
                            break;
                        case "DENDRO_DAMAGE_BONUS":
                        case 14:
                            message.type = 14;
                            break;
                        case "ELECTRO_DAMAGE_BONUS":
                        case 15:
                            message.type = 15;
                            break;
                        case "GEO_DAMAGE_BONUS":
                        case 16:
                            message.type = 16;
                            break;
                        case "HYDRO_DAMAGE_BONUS":
                        case 17:
                            message.type = 17;
                            break;
                        case "PHYSICAL_DAMAGE_BONUS":
                        case 18:
                            message.type = 18;
                            break;
                        case "PYRO_DAMAGE_BONUS":
                        case 19:
                            message.type = 19;
                            break;
                        }
                        if (object.value != null)
                            message.value = Number(object.value);
                        return message;
                    };

                    /**
                     * Creates a plain object from an Attribute message. Also converts values to other types if specified.
                     * @function toObject
                     * @memberof io.leishi.genshin.proto.Attribute
                     * @static
                     * @param {io.leishi.genshin.proto.Attribute} message Attribute
                     * @param {$protobuf.IConversionOptions} [options] Conversion options
                     * @returns {Object.<string,*>} Plain object
                     */
                    Attribute.toObject = function toObject(message, options) {
                        if (!options)
                            options = {};
                        var object = {};
                        if (options.defaults) {
                            object.type = options.enums === String ? "ATTRIBUTE_TYPE_UNSPECIFIED" : 0;
                            object.value = 0;
                        }
                        if (message.type != null && message.hasOwnProperty("type"))
                            object.type = options.enums === String ? $root.io.leishi.genshin.proto.AttributeType[message.type] === undefined ? message.type : $root.io.leishi.genshin.proto.AttributeType[message.type] : message.type;
                        if (message.value != null && message.hasOwnProperty("value"))
                            object.value = options.json && !isFinite(message.value) ? String(message.value) : message.value;
                        return object;
                    };

                    /**
                     * Converts this Attribute to JSON.
                     * @function toJSON
                     * @memberof io.leishi.genshin.proto.Attribute
                     * @instance
                     * @returns {Object.<string,*>} JSON object
                     */
                    Attribute.prototype.toJSON = function toJSON() {
                        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                    };

                    /**
                     * Gets the default type url for Attribute
                     * @function getTypeUrl
                     * @memberof io.leishi.genshin.proto.Attribute
                     * @static
                     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns {string} The default type url
                     */
                    Attribute.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                        if (typeUrlPrefix === undefined) {
                            typeUrlPrefix = "type.googleapis.com";
                        }
                        return typeUrlPrefix + "/io.leishi.genshin.proto.Attribute";
                    };

                    return Attribute;
                })();

                /**
                 * Character enum.
                 * @name io.leishi.genshin.proto.Character
                 * @enum {number}
                 * @property {number} CHARACTER_UNSPECIFIED=0 CHARACTER_UNSPECIFIED value
                 * @property {number} TRAVELER_ANEMO=1 TRAVELER_ANEMO value
                 * @property {number} TRAVELER_GEO=2 TRAVELER_GEO value
                 * @property {number} TRAVELER_ELECTRO=3 TRAVELER_ELECTRO value
                 * @property {number} TRAVELER_DENDRO=4 TRAVELER_DENDRO value
                 * @property {number} AETHER=5 AETHER value
                 * @property {number} LUMINE=6 LUMINE value
                 * @property {number} ALBEDO=7 ALBEDO value
                 * @property {number} ALOY=8 ALOY value
                 * @property {number} AMBER=9 AMBER value
                 * @property {number} BARBARA=10 BARBARA value
                 * @property {number} BEIDOU=11 BEIDOU value
                 * @property {number} BENNETT=12 BENNETT value
                 * @property {number} CHONGYUN=13 CHONGYUN value
                 * @property {number} DILUC=14 DILUC value
                 * @property {number} DIONA=15 DIONA value
                 * @property {number} EULA=16 EULA value
                 * @property {number} FISCHL=17 FISCHL value
                 * @property {number} GANYU=18 GANYU value
                 * @property {number} HU_TAO=19 HU_TAO value
                 * @property {number} JEAN=20 JEAN value
                 * @property {number} KAEDEHARA_KAZUHA=21 KAEDEHARA_KAZUHA value
                 * @property {number} KAEYA=22 KAEYA value
                 * @property {number} KAMISATO_AYAKA=23 KAMISATO_AYAKA value
                 * @property {number} KEQING=24 KEQING value
                 * @property {number} KLEE=25 KLEE value
                 * @property {number} KUJOU_SARA=26 KUJOU_SARA value
                 * @property {number} LISA=27 LISA value
                 * @property {number} MONA=28 MONA value
                 * @property {number} NINGGUANG=29 NINGGUANG value
                 * @property {number} NOELLE=30 NOELLE value
                 * @property {number} QIQI=31 QIQI value
                 * @property {number} RAIDEN_SHOGUN=32 RAIDEN_SHOGUN value
                 * @property {number} RAZOR=33 RAZOR value
                 * @property {number} ROSARIA=34 ROSARIA value
                 * @property {number} SANGONOMIYA_KOKOMI=35 SANGONOMIYA_KOKOMI value
                 * @property {number} SAYU=36 SAYU value
                 * @property {number} SUCROSE=37 SUCROSE value
                 * @property {number} TARTAGLIA=38 TARTAGLIA value
                 * @property {number} THOMA=39 THOMA value
                 * @property {number} VENTI=40 VENTI value
                 * @property {number} XIANGLING=41 XIANGLING value
                 * @property {number} XIAO=42 XIAO value
                 * @property {number} XINGQIU=43 XINGQIU value
                 * @property {number} XINYAN=44 XINYAN value
                 * @property {number} YANFEI=45 YANFEI value
                 * @property {number} YOIMIYA=46 YOIMIYA value
                 * @property {number} ZHONGLI=47 ZHONGLI value
                 * @property {number} GOROU=48 GOROU value
                 * @property {number} ARATAKI_ITTO=49 ARATAKI_ITTO value
                 * @property {number} SHENHE=50 SHENHE value
                 * @property {number} YUN_JIN=51 YUN_JIN value
                 * @property {number} YAE_MIKO=52 YAE_MIKO value
                 * @property {number} KAMISATO_AYATO=53 KAMISATO_AYATO value
                 * @property {number} YELAN=54 YELAN value
                 * @property {number} KUKI_SHINOBU=55 KUKI_SHINOBU value
                 * @property {number} SHIKANOIN_HEIZOU=56 SHIKANOIN_HEIZOU value
                 * @property {number} COLLEI=57 COLLEI value
                 * @property {number} DORI=58 DORI value
                 * @property {number} TIGHNARI=59 TIGHNARI value
                 * @property {number} CANDACE=60 CANDACE value
                 * @property {number} CYNO=61 CYNO value
                 * @property {number} NILOU=62 NILOU value
                 * @property {number} NAHIDA=63 NAHIDA value
                 * @property {number} LAYLA=64 LAYLA value
                 * @property {number} FARUZAN=65 FARUZAN value
                 * @property {number} WANDERER=66 WANDERER value
                 * @property {number} ALHAITHAM=67 ALHAITHAM value
                 * @property {number} YAOYAO=68 YAOYAO value
                 */
                proto.Character = (function() {
                    var valuesById = {}, values = Object.create(valuesById);
                    values[valuesById[0] = "CHARACTER_UNSPECIFIED"] = 0;
                    values[valuesById[1] = "TRAVELER_ANEMO"] = 1;
                    values[valuesById[2] = "TRAVELER_GEO"] = 2;
                    values[valuesById[3] = "TRAVELER_ELECTRO"] = 3;
                    values[valuesById[4] = "TRAVELER_DENDRO"] = 4;
                    values[valuesById[5] = "AETHER"] = 5;
                    values[valuesById[6] = "LUMINE"] = 6;
                    values[valuesById[7] = "ALBEDO"] = 7;
                    values[valuesById[8] = "ALOY"] = 8;
                    values[valuesById[9] = "AMBER"] = 9;
                    values[valuesById[10] = "BARBARA"] = 10;
                    values[valuesById[11] = "BEIDOU"] = 11;
                    values[valuesById[12] = "BENNETT"] = 12;
                    values[valuesById[13] = "CHONGYUN"] = 13;
                    values[valuesById[14] = "DILUC"] = 14;
                    values[valuesById[15] = "DIONA"] = 15;
                    values[valuesById[16] = "EULA"] = 16;
                    values[valuesById[17] = "FISCHL"] = 17;
                    values[valuesById[18] = "GANYU"] = 18;
                    values[valuesById[19] = "HU_TAO"] = 19;
                    values[valuesById[20] = "JEAN"] = 20;
                    values[valuesById[21] = "KAEDEHARA_KAZUHA"] = 21;
                    values[valuesById[22] = "KAEYA"] = 22;
                    values[valuesById[23] = "KAMISATO_AYAKA"] = 23;
                    values[valuesById[24] = "KEQING"] = 24;
                    values[valuesById[25] = "KLEE"] = 25;
                    values[valuesById[26] = "KUJOU_SARA"] = 26;
                    values[valuesById[27] = "LISA"] = 27;
                    values[valuesById[28] = "MONA"] = 28;
                    values[valuesById[29] = "NINGGUANG"] = 29;
                    values[valuesById[30] = "NOELLE"] = 30;
                    values[valuesById[31] = "QIQI"] = 31;
                    values[valuesById[32] = "RAIDEN_SHOGUN"] = 32;
                    values[valuesById[33] = "RAZOR"] = 33;
                    values[valuesById[34] = "ROSARIA"] = 34;
                    values[valuesById[35] = "SANGONOMIYA_KOKOMI"] = 35;
                    values[valuesById[36] = "SAYU"] = 36;
                    values[valuesById[37] = "SUCROSE"] = 37;
                    values[valuesById[38] = "TARTAGLIA"] = 38;
                    values[valuesById[39] = "THOMA"] = 39;
                    values[valuesById[40] = "VENTI"] = 40;
                    values[valuesById[41] = "XIANGLING"] = 41;
                    values[valuesById[42] = "XIAO"] = 42;
                    values[valuesById[43] = "XINGQIU"] = 43;
                    values[valuesById[44] = "XINYAN"] = 44;
                    values[valuesById[45] = "YANFEI"] = 45;
                    values[valuesById[46] = "YOIMIYA"] = 46;
                    values[valuesById[47] = "ZHONGLI"] = 47;
                    values[valuesById[48] = "GOROU"] = 48;
                    values[valuesById[49] = "ARATAKI_ITTO"] = 49;
                    values[valuesById[50] = "SHENHE"] = 50;
                    values[valuesById[51] = "YUN_JIN"] = 51;
                    values[valuesById[52] = "YAE_MIKO"] = 52;
                    values[valuesById[53] = "KAMISATO_AYATO"] = 53;
                    values[valuesById[54] = "YELAN"] = 54;
                    values[valuesById[55] = "KUKI_SHINOBU"] = 55;
                    values[valuesById[56] = "SHIKANOIN_HEIZOU"] = 56;
                    values[valuesById[57] = "COLLEI"] = 57;
                    values[valuesById[58] = "DORI"] = 58;
                    values[valuesById[59] = "TIGHNARI"] = 59;
                    values[valuesById[60] = "CANDACE"] = 60;
                    values[valuesById[61] = "CYNO"] = 61;
                    values[valuesById[62] = "NILOU"] = 62;
                    values[valuesById[63] = "NAHIDA"] = 63;
                    values[valuesById[64] = "LAYLA"] = 64;
                    values[valuesById[65] = "FARUZAN"] = 65;
                    values[valuesById[66] = "WANDERER"] = 66;
                    values[valuesById[67] = "ALHAITHAM"] = 67;
                    values[valuesById[68] = "YAOYAO"] = 68;
                    return values;
                })();

                /**
                 * Set enum.
                 * @name io.leishi.genshin.proto.Set
                 * @enum {number}
                 * @property {number} SET_UNSPECIFIED=0 SET_UNSPECIFIED value
                 * @property {number} ARCHAIC_PETRA=1 ARCHAIC_PETRA value
                 * @property {number} BERSERKER=2 BERSERKER value
                 * @property {number} BLIZZARD_STRAYER=3 BLIZZARD_STRAYER value
                 * @property {number} BLOODSTAINED_CHIVALRY=4 BLOODSTAINED_CHIVALRY value
                 * @property {number} BRAVE_HEART=5 BRAVE_HEART value
                 * @property {number} CRIMSON_WITCH_OF_FLAMES=6 CRIMSON_WITCH_OF_FLAMES value
                 * @property {number} DEEPWOOD_MEMORIES=7 DEEPWOOD_MEMORIES value
                 * @property {number} DEFENDERS_WILL=8 DEFENDERS_WILL value
                 * @property {number} DESERT_PAVILION_CHRONICLE=9 DESERT_PAVILION_CHRONICLE value
                 * @property {number} ECHOES_OF_AN_OFFERING=10 ECHOES_OF_AN_OFFERING value
                 * @property {number} EMBLEM_OF_SEVERED_FATE=11 EMBLEM_OF_SEVERED_FATE value
                 * @property {number} FLOWER_OF_PARADISE_LOST=12 FLOWER_OF_PARADISE_LOST value
                 * @property {number} GAMBLER=13 GAMBLER value
                 * @property {number} GILDED_DREAMS=14 GILDED_DREAMS value
                 * @property {number} GLADIATORS_FINALE=15 GLADIATORS_FINALE value
                 * @property {number} HEART_OF_DEPTH=16 HEART_OF_DEPTH value
                 * @property {number} HUSK_OF_OPULENT_DREAMS=17 HUSK_OF_OPULENT_DREAMS value
                 * @property {number} INSTRUCTOR=18 INSTRUCTOR value
                 * @property {number} LAVAWALKER=19 LAVAWALKER value
                 * @property {number} MAIDEN_BELOVED=20 MAIDEN_BELOVED value
                 * @property {number} MARTIAL_ARTIST=21 MARTIAL_ARTIST value
                 * @property {number} NOBLESSE_OBLIGE=22 NOBLESSE_OBLIGE value
                 * @property {number} OCEAN_HUED_CLAM=23 OCEAN_HUED_CLAM value
                 * @property {number} PALE_FLAME=24 PALE_FLAME value
                 * @property {number} PRAYERS_FOR_DESTINY=25 PRAYERS_FOR_DESTINY value
                 * @property {number} PRAYERS_FOR_ILLUMINATION=26 PRAYERS_FOR_ILLUMINATION value
                 * @property {number} PRAYERS_FOR_WISDOM=27 PRAYERS_FOR_WISDOM value
                 * @property {number} PRAYERS_TO_SPRINGTIME=28 PRAYERS_TO_SPRINGTIME value
                 * @property {number} RESOLUTION_OF_SOJOURNER=29 RESOLUTION_OF_SOJOURNER value
                 * @property {number} RETRACING_BOLIDE=30 RETRACING_BOLIDE value
                 * @property {number} SCHOLAR=31 SCHOLAR value
                 * @property {number} SHIMENAWAS_REMINISCENCE=32 SHIMENAWAS_REMINISCENCE value
                 * @property {number} TENACITY_OF_THE_MILLELITH=33 TENACITY_OF_THE_MILLELITH value
                 * @property {number} THE_EXILE=34 THE_EXILE value
                 * @property {number} THUNDERING_FURY=35 THUNDERING_FURY value
                 * @property {number} THUNDERSOOTHER=36 THUNDERSOOTHER value
                 * @property {number} TINY_MIRACLE=37 TINY_MIRACLE value
                 * @property {number} VERMILLION_HEREAFTER=38 VERMILLION_HEREAFTER value
                 * @property {number} VIRIDESCENT_VENERER=39 VIRIDESCENT_VENERER value
                 * @property {number} WANDERERS_TROUPE=40 WANDERERS_TROUPE value
                 */
                proto.Set = (function() {
                    var valuesById = {}, values = Object.create(valuesById);
                    values[valuesById[0] = "SET_UNSPECIFIED"] = 0;
                    values[valuesById[1] = "ARCHAIC_PETRA"] = 1;
                    values[valuesById[2] = "BERSERKER"] = 2;
                    values[valuesById[3] = "BLIZZARD_STRAYER"] = 3;
                    values[valuesById[4] = "BLOODSTAINED_CHIVALRY"] = 4;
                    values[valuesById[5] = "BRAVE_HEART"] = 5;
                    values[valuesById[6] = "CRIMSON_WITCH_OF_FLAMES"] = 6;
                    values[valuesById[7] = "DEEPWOOD_MEMORIES"] = 7;
                    values[valuesById[8] = "DEFENDERS_WILL"] = 8;
                    values[valuesById[9] = "DESERT_PAVILION_CHRONICLE"] = 9;
                    values[valuesById[10] = "ECHOES_OF_AN_OFFERING"] = 10;
                    values[valuesById[11] = "EMBLEM_OF_SEVERED_FATE"] = 11;
                    values[valuesById[12] = "FLOWER_OF_PARADISE_LOST"] = 12;
                    values[valuesById[13] = "GAMBLER"] = 13;
                    values[valuesById[14] = "GILDED_DREAMS"] = 14;
                    values[valuesById[15] = "GLADIATORS_FINALE"] = 15;
                    values[valuesById[16] = "HEART_OF_DEPTH"] = 16;
                    values[valuesById[17] = "HUSK_OF_OPULENT_DREAMS"] = 17;
                    values[valuesById[18] = "INSTRUCTOR"] = 18;
                    values[valuesById[19] = "LAVAWALKER"] = 19;
                    values[valuesById[20] = "MAIDEN_BELOVED"] = 20;
                    values[valuesById[21] = "MARTIAL_ARTIST"] = 21;
                    values[valuesById[22] = "NOBLESSE_OBLIGE"] = 22;
                    values[valuesById[23] = "OCEAN_HUED_CLAM"] = 23;
                    values[valuesById[24] = "PALE_FLAME"] = 24;
                    values[valuesById[25] = "PRAYERS_FOR_DESTINY"] = 25;
                    values[valuesById[26] = "PRAYERS_FOR_ILLUMINATION"] = 26;
                    values[valuesById[27] = "PRAYERS_FOR_WISDOM"] = 27;
                    values[valuesById[28] = "PRAYERS_TO_SPRINGTIME"] = 28;
                    values[valuesById[29] = "RESOLUTION_OF_SOJOURNER"] = 29;
                    values[valuesById[30] = "RETRACING_BOLIDE"] = 30;
                    values[valuesById[31] = "SCHOLAR"] = 31;
                    values[valuesById[32] = "SHIMENAWAS_REMINISCENCE"] = 32;
                    values[valuesById[33] = "TENACITY_OF_THE_MILLELITH"] = 33;
                    values[valuesById[34] = "THE_EXILE"] = 34;
                    values[valuesById[35] = "THUNDERING_FURY"] = 35;
                    values[valuesById[36] = "THUNDERSOOTHER"] = 36;
                    values[valuesById[37] = "TINY_MIRACLE"] = 37;
                    values[valuesById[38] = "VERMILLION_HEREAFTER"] = 38;
                    values[valuesById[39] = "VIRIDESCENT_VENERER"] = 39;
                    values[valuesById[40] = "WANDERERS_TROUPE"] = 40;
                    return values;
                })();

                proto.Build = (function() {

                    /**
                     * Properties of a Build.
                     * @memberof io.leishi.genshin.proto
                     * @interface IBuild
                     * @property {string|null} [name] Build name
                     * @property {io.leishi.genshin.proto.Character|null} [character] Build character
                     * @property {Array.<io.leishi.genshin.proto.Weapon>|null} [weapons] Build weapons
                     * @property {Array.<io.leishi.genshin.proto.ISuit>|null} [suits] Build suits
                     * @property {Array.<io.leishi.genshin.proto.AttributeType>|null} [flowerAttributes] Build flowerAttributes
                     * @property {Array.<io.leishi.genshin.proto.AttributeType>|null} [plumeAttributes] Build plumeAttributes
                     * @property {Array.<io.leishi.genshin.proto.AttributeType>|null} [sandsAttributes] Build sandsAttributes
                     * @property {Array.<io.leishi.genshin.proto.AttributeType>|null} [gobletAttributes] Build gobletAttributes
                     * @property {Array.<io.leishi.genshin.proto.AttributeType>|null} [circletAttributes] Build circletAttributes
                     * @property {Array.<io.leishi.genshin.proto.IAttribute>|null} [subAttributes] Build subAttributes
                     */

                    /**
                     * Constructs a new Build.
                     * @memberof io.leishi.genshin.proto
                     * @classdesc Represents a Build.
                     * @implements IBuild
                     * @constructor
                     * @param {io.leishi.genshin.proto.IBuild=} [properties] Properties to set
                     */
                    function Build(properties) {
                        this.weapons = [];
                        this.suits = [];
                        this.flowerAttributes = [];
                        this.plumeAttributes = [];
                        this.sandsAttributes = [];
                        this.gobletAttributes = [];
                        this.circletAttributes = [];
                        this.subAttributes = [];
                        if (properties)
                            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                                if (properties[keys[i]] != null)
                                    this[keys[i]] = properties[keys[i]];
                    }

                    /**
                     * Build name.
                     * @member {string} name
                     * @memberof io.leishi.genshin.proto.Build
                     * @instance
                     */
                    Build.prototype.name = "";

                    /**
                     * Build character.
                     * @member {io.leishi.genshin.proto.Character} character
                     * @memberof io.leishi.genshin.proto.Build
                     * @instance
                     */
                    Build.prototype.character = 0;

                    /**
                     * Build weapons.
                     * @member {Array.<io.leishi.genshin.proto.Weapon>} weapons
                     * @memberof io.leishi.genshin.proto.Build
                     * @instance
                     */
                    Build.prototype.weapons = $util.emptyArray;

                    /**
                     * Build suits.
                     * @member {Array.<io.leishi.genshin.proto.ISuit>} suits
                     * @memberof io.leishi.genshin.proto.Build
                     * @instance
                     */
                    Build.prototype.suits = $util.emptyArray;

                    /**
                     * Build flowerAttributes.
                     * @member {Array.<io.leishi.genshin.proto.AttributeType>} flowerAttributes
                     * @memberof io.leishi.genshin.proto.Build
                     * @instance
                     */
                    Build.prototype.flowerAttributes = $util.emptyArray;

                    /**
                     * Build plumeAttributes.
                     * @member {Array.<io.leishi.genshin.proto.AttributeType>} plumeAttributes
                     * @memberof io.leishi.genshin.proto.Build
                     * @instance
                     */
                    Build.prototype.plumeAttributes = $util.emptyArray;

                    /**
                     * Build sandsAttributes.
                     * @member {Array.<io.leishi.genshin.proto.AttributeType>} sandsAttributes
                     * @memberof io.leishi.genshin.proto.Build
                     * @instance
                     */
                    Build.prototype.sandsAttributes = $util.emptyArray;

                    /**
                     * Build gobletAttributes.
                     * @member {Array.<io.leishi.genshin.proto.AttributeType>} gobletAttributes
                     * @memberof io.leishi.genshin.proto.Build
                     * @instance
                     */
                    Build.prototype.gobletAttributes = $util.emptyArray;

                    /**
                     * Build circletAttributes.
                     * @member {Array.<io.leishi.genshin.proto.AttributeType>} circletAttributes
                     * @memberof io.leishi.genshin.proto.Build
                     * @instance
                     */
                    Build.prototype.circletAttributes = $util.emptyArray;

                    /**
                     * Build subAttributes.
                     * @member {Array.<io.leishi.genshin.proto.IAttribute>} subAttributes
                     * @memberof io.leishi.genshin.proto.Build
                     * @instance
                     */
                    Build.prototype.subAttributes = $util.emptyArray;

                    /**
                     * Creates a new Build instance using the specified properties.
                     * @function create
                     * @memberof io.leishi.genshin.proto.Build
                     * @static
                     * @param {io.leishi.genshin.proto.IBuild=} [properties] Properties to set
                     * @returns {io.leishi.genshin.proto.Build} Build instance
                     */
                    Build.create = function create(properties) {
                        return new Build(properties);
                    };

                    /**
                     * Encodes the specified Build message. Does not implicitly {@link io.leishi.genshin.proto.Build.verify|verify} messages.
                     * @function encode
                     * @memberof io.leishi.genshin.proto.Build
                     * @static
                     * @param {io.leishi.genshin.proto.IBuild} message Build message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    Build.encode = function encode(message, writer) {
                        if (!writer)
                            writer = $Writer.create();
                        if (message.name != null && Object.hasOwnProperty.call(message, "name"))
                            writer.uint32(/* id 1, wireType 2 =*/10).string(message.name);
                        if (message.character != null && Object.hasOwnProperty.call(message, "character"))
                            writer.uint32(/* id 2, wireType 0 =*/16).int32(message.character);
                        if (message.weapons != null && message.weapons.length) {
                            writer.uint32(/* id 3, wireType 2 =*/26).fork();
                            for (var i = 0; i < message.weapons.length; ++i)
                                writer.int32(message.weapons[i]);
                            writer.ldelim();
                        }
                        if (message.suits != null && message.suits.length)
                            for (var i = 0; i < message.suits.length; ++i)
                                $root.io.leishi.genshin.proto.Suit.encode(message.suits[i], writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
                        if (message.flowerAttributes != null && message.flowerAttributes.length) {
                            writer.uint32(/* id 5, wireType 2 =*/42).fork();
                            for (var i = 0; i < message.flowerAttributes.length; ++i)
                                writer.int32(message.flowerAttributes[i]);
                            writer.ldelim();
                        }
                        if (message.plumeAttributes != null && message.plumeAttributes.length) {
                            writer.uint32(/* id 6, wireType 2 =*/50).fork();
                            for (var i = 0; i < message.plumeAttributes.length; ++i)
                                writer.int32(message.plumeAttributes[i]);
                            writer.ldelim();
                        }
                        if (message.sandsAttributes != null && message.sandsAttributes.length) {
                            writer.uint32(/* id 7, wireType 2 =*/58).fork();
                            for (var i = 0; i < message.sandsAttributes.length; ++i)
                                writer.int32(message.sandsAttributes[i]);
                            writer.ldelim();
                        }
                        if (message.gobletAttributes != null && message.gobletAttributes.length) {
                            writer.uint32(/* id 8, wireType 2 =*/66).fork();
                            for (var i = 0; i < message.gobletAttributes.length; ++i)
                                writer.int32(message.gobletAttributes[i]);
                            writer.ldelim();
                        }
                        if (message.circletAttributes != null && message.circletAttributes.length) {
                            writer.uint32(/* id 9, wireType 2 =*/74).fork();
                            for (var i = 0; i < message.circletAttributes.length; ++i)
                                writer.int32(message.circletAttributes[i]);
                            writer.ldelim();
                        }
                        if (message.subAttributes != null && message.subAttributes.length)
                            for (var i = 0; i < message.subAttributes.length; ++i)
                                $root.io.leishi.genshin.proto.Attribute.encode(message.subAttributes[i], writer.uint32(/* id 10, wireType 2 =*/82).fork()).ldelim();
                        return writer;
                    };

                    /**
                     * Encodes the specified Build message, length delimited. Does not implicitly {@link io.leishi.genshin.proto.Build.verify|verify} messages.
                     * @function encodeDelimited
                     * @memberof io.leishi.genshin.proto.Build
                     * @static
                     * @param {io.leishi.genshin.proto.IBuild} message Build message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    Build.encodeDelimited = function encodeDelimited(message, writer) {
                        return this.encode(message, writer).ldelim();
                    };

                    /**
                     * Decodes a Build message from the specified reader or buffer.
                     * @function decode
                     * @memberof io.leishi.genshin.proto.Build
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @param {number} [length] Message length if known beforehand
                     * @returns {io.leishi.genshin.proto.Build} Build
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    Build.decode = function decode(reader, length) {
                        if (!(reader instanceof $Reader))
                            reader = $Reader.create(reader);
                        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.io.leishi.genshin.proto.Build();
                        while (reader.pos < end) {
                            var tag = reader.uint32();
                            switch (tag >>> 3) {
                            case 1: {
                                    message.name = reader.string();
                                    break;
                                }
                            case 2: {
                                    message.character = reader.int32();
                                    break;
                                }
                            case 3: {
                                    if (!(message.weapons && message.weapons.length))
                                        message.weapons = [];
                                    if ((tag & 7) === 2) {
                                        var end2 = reader.uint32() + reader.pos;
                                        while (reader.pos < end2)
                                            message.weapons.push(reader.int32());
                                    } else
                                        message.weapons.push(reader.int32());
                                    break;
                                }
                            case 4: {
                                    if (!(message.suits && message.suits.length))
                                        message.suits = [];
                                    message.suits.push($root.io.leishi.genshin.proto.Suit.decode(reader, reader.uint32()));
                                    break;
                                }
                            case 5: {
                                    if (!(message.flowerAttributes && message.flowerAttributes.length))
                                        message.flowerAttributes = [];
                                    if ((tag & 7) === 2) {
                                        var end2 = reader.uint32() + reader.pos;
                                        while (reader.pos < end2)
                                            message.flowerAttributes.push(reader.int32());
                                    } else
                                        message.flowerAttributes.push(reader.int32());
                                    break;
                                }
                            case 6: {
                                    if (!(message.plumeAttributes && message.plumeAttributes.length))
                                        message.plumeAttributes = [];
                                    if ((tag & 7) === 2) {
                                        var end2 = reader.uint32() + reader.pos;
                                        while (reader.pos < end2)
                                            message.plumeAttributes.push(reader.int32());
                                    } else
                                        message.plumeAttributes.push(reader.int32());
                                    break;
                                }
                            case 7: {
                                    if (!(message.sandsAttributes && message.sandsAttributes.length))
                                        message.sandsAttributes = [];
                                    if ((tag & 7) === 2) {
                                        var end2 = reader.uint32() + reader.pos;
                                        while (reader.pos < end2)
                                            message.sandsAttributes.push(reader.int32());
                                    } else
                                        message.sandsAttributes.push(reader.int32());
                                    break;
                                }
                            case 8: {
                                    if (!(message.gobletAttributes && message.gobletAttributes.length))
                                        message.gobletAttributes = [];
                                    if ((tag & 7) === 2) {
                                        var end2 = reader.uint32() + reader.pos;
                                        while (reader.pos < end2)
                                            message.gobletAttributes.push(reader.int32());
                                    } else
                                        message.gobletAttributes.push(reader.int32());
                                    break;
                                }
                            case 9: {
                                    if (!(message.circletAttributes && message.circletAttributes.length))
                                        message.circletAttributes = [];
                                    if ((tag & 7) === 2) {
                                        var end2 = reader.uint32() + reader.pos;
                                        while (reader.pos < end2)
                                            message.circletAttributes.push(reader.int32());
                                    } else
                                        message.circletAttributes.push(reader.int32());
                                    break;
                                }
                            case 10: {
                                    if (!(message.subAttributes && message.subAttributes.length))
                                        message.subAttributes = [];
                                    message.subAttributes.push($root.io.leishi.genshin.proto.Attribute.decode(reader, reader.uint32()));
                                    break;
                                }
                            default:
                                reader.skipType(tag & 7);
                                break;
                            }
                        }
                        return message;
                    };

                    /**
                     * Decodes a Build message from the specified reader or buffer, length delimited.
                     * @function decodeDelimited
                     * @memberof io.leishi.genshin.proto.Build
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @returns {io.leishi.genshin.proto.Build} Build
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    Build.decodeDelimited = function decodeDelimited(reader) {
                        if (!(reader instanceof $Reader))
                            reader = new $Reader(reader);
                        return this.decode(reader, reader.uint32());
                    };

                    /**
                     * Verifies a Build message.
                     * @function verify
                     * @memberof io.leishi.genshin.proto.Build
                     * @static
                     * @param {Object.<string,*>} message Plain object to verify
                     * @returns {string|null} `null` if valid, otherwise the reason why it is not
                     */
                    Build.verify = function verify(message) {
                        if (typeof message !== "object" || message === null)
                            return "object expected";
                        if (message.name != null && message.hasOwnProperty("name"))
                            if (!$util.isString(message.name))
                                return "name: string expected";
                        if (message.character != null && message.hasOwnProperty("character"))
                            switch (message.character) {
                            default:
                                return "character: enum value expected";
                            case 0:
                            case 1:
                            case 2:
                            case 3:
                            case 4:
                            case 5:
                            case 6:
                            case 7:
                            case 8:
                            case 9:
                            case 10:
                            case 11:
                            case 12:
                            case 13:
                            case 14:
                            case 15:
                            case 16:
                            case 17:
                            case 18:
                            case 19:
                            case 20:
                            case 21:
                            case 22:
                            case 23:
                            case 24:
                            case 25:
                            case 26:
                            case 27:
                            case 28:
                            case 29:
                            case 30:
                            case 31:
                            case 32:
                            case 33:
                            case 34:
                            case 35:
                            case 36:
                            case 37:
                            case 38:
                            case 39:
                            case 40:
                            case 41:
                            case 42:
                            case 43:
                            case 44:
                            case 45:
                            case 46:
                            case 47:
                            case 48:
                            case 49:
                            case 50:
                            case 51:
                            case 52:
                            case 53:
                            case 54:
                            case 55:
                            case 56:
                            case 57:
                            case 58:
                            case 59:
                            case 60:
                            case 61:
                            case 62:
                            case 63:
                            case 64:
                            case 65:
                            case 66:
                            case 67:
                            case 68:
                                break;
                            }
                        if (message.weapons != null && message.hasOwnProperty("weapons")) {
                            if (!Array.isArray(message.weapons))
                                return "weapons: array expected";
                            for (var i = 0; i < message.weapons.length; ++i)
                                switch (message.weapons[i]) {
                                default:
                                    return "weapons: enum value[] expected";
                                case 0:
                                case 1:
                                case 2:
                                case 3:
                                case 4:
                                case 5:
                                case 6:
                                case 7:
                                case 8:
                                case 9:
                                case 10:
                                case 11:
                                case 12:
                                case 13:
                                case 14:
                                case 15:
                                case 16:
                                case 17:
                                case 18:
                                case 19:
                                case 20:
                                case 21:
                                case 22:
                                case 23:
                                case 24:
                                case 25:
                                case 26:
                                case 27:
                                case 28:
                                case 29:
                                case 30:
                                case 31:
                                case 32:
                                case 33:
                                case 34:
                                case 35:
                                case 36:
                                case 37:
                                case 38:
                                case 39:
                                case 40:
                                case 41:
                                case 42:
                                case 43:
                                case 44:
                                case 45:
                                case 46:
                                case 47:
                                case 48:
                                case 49:
                                case 50:
                                case 51:
                                case 52:
                                case 53:
                                case 54:
                                case 55:
                                case 56:
                                case 57:
                                case 58:
                                case 59:
                                case 60:
                                case 61:
                                case 62:
                                case 63:
                                case 64:
                                case 65:
                                case 66:
                                case 67:
                                case 68:
                                case 69:
                                case 70:
                                case 71:
                                case 72:
                                case 73:
                                case 74:
                                case 75:
                                case 76:
                                case 77:
                                case 78:
                                case 79:
                                case 80:
                                case 81:
                                case 82:
                                case 83:
                                case 84:
                                case 85:
                                case 86:
                                case 87:
                                case 88:
                                case 89:
                                case 90:
                                case 91:
                                case 92:
                                case 93:
                                case 94:
                                case 95:
                                case 96:
                                case 97:
                                case 98:
                                case 99:
                                case 100:
                                case 101:
                                case 102:
                                case 103:
                                case 104:
                                case 105:
                                case 106:
                                case 107:
                                case 108:
                                case 109:
                                case 110:
                                case 111:
                                case 112:
                                case 113:
                                case 114:
                                case 115:
                                case 116:
                                case 117:
                                case 118:
                                case 119:
                                case 120:
                                case 121:
                                case 122:
                                case 123:
                                case 124:
                                case 125:
                                case 126:
                                case 127:
                                case 128:
                                case 129:
                                case 130:
                                case 131:
                                case 132:
                                case 133:
                                case 134:
                                case 135:
                                case 136:
                                case 137:
                                case 138:
                                case 139:
                                case 140:
                                case 141:
                                case 142:
                                case 143:
                                case 144:
                                case 145:
                                case 146:
                                case 147:
                                case 148:
                                case 149:
                                case 150:
                                case 151:
                                case 152:
                                    break;
                                }
                        }
                        if (message.suits != null && message.hasOwnProperty("suits")) {
                            if (!Array.isArray(message.suits))
                                return "suits: array expected";
                            for (var i = 0; i < message.suits.length; ++i) {
                                var error = $root.io.leishi.genshin.proto.Suit.verify(message.suits[i]);
                                if (error)
                                    return "suits." + error;
                            }
                        }
                        if (message.flowerAttributes != null && message.hasOwnProperty("flowerAttributes")) {
                            if (!Array.isArray(message.flowerAttributes))
                                return "flowerAttributes: array expected";
                            for (var i = 0; i < message.flowerAttributes.length; ++i)
                                switch (message.flowerAttributes[i]) {
                                default:
                                    return "flowerAttributes: enum value[] expected";
                                case 0:
                                case 1:
                                case 2:
                                case 3:
                                case 4:
                                case 5:
                                case 6:
                                case 7:
                                case 8:
                                case 9:
                                case 10:
                                case 11:
                                case 12:
                                case 13:
                                case 14:
                                case 15:
                                case 16:
                                case 17:
                                case 18:
                                case 19:
                                    break;
                                }
                        }
                        if (message.plumeAttributes != null && message.hasOwnProperty("plumeAttributes")) {
                            if (!Array.isArray(message.plumeAttributes))
                                return "plumeAttributes: array expected";
                            for (var i = 0; i < message.plumeAttributes.length; ++i)
                                switch (message.plumeAttributes[i]) {
                                default:
                                    return "plumeAttributes: enum value[] expected";
                                case 0:
                                case 1:
                                case 2:
                                case 3:
                                case 4:
                                case 5:
                                case 6:
                                case 7:
                                case 8:
                                case 9:
                                case 10:
                                case 11:
                                case 12:
                                case 13:
                                case 14:
                                case 15:
                                case 16:
                                case 17:
                                case 18:
                                case 19:
                                    break;
                                }
                        }
                        if (message.sandsAttributes != null && message.hasOwnProperty("sandsAttributes")) {
                            if (!Array.isArray(message.sandsAttributes))
                                return "sandsAttributes: array expected";
                            for (var i = 0; i < message.sandsAttributes.length; ++i)
                                switch (message.sandsAttributes[i]) {
                                default:
                                    return "sandsAttributes: enum value[] expected";
                                case 0:
                                case 1:
                                case 2:
                                case 3:
                                case 4:
                                case 5:
                                case 6:
                                case 7:
                                case 8:
                                case 9:
                                case 10:
                                case 11:
                                case 12:
                                case 13:
                                case 14:
                                case 15:
                                case 16:
                                case 17:
                                case 18:
                                case 19:
                                    break;
                                }
                        }
                        if (message.gobletAttributes != null && message.hasOwnProperty("gobletAttributes")) {
                            if (!Array.isArray(message.gobletAttributes))
                                return "gobletAttributes: array expected";
                            for (var i = 0; i < message.gobletAttributes.length; ++i)
                                switch (message.gobletAttributes[i]) {
                                default:
                                    return "gobletAttributes: enum value[] expected";
                                case 0:
                                case 1:
                                case 2:
                                case 3:
                                case 4:
                                case 5:
                                case 6:
                                case 7:
                                case 8:
                                case 9:
                                case 10:
                                case 11:
                                case 12:
                                case 13:
                                case 14:
                                case 15:
                                case 16:
                                case 17:
                                case 18:
                                case 19:
                                    break;
                                }
                        }
                        if (message.circletAttributes != null && message.hasOwnProperty("circletAttributes")) {
                            if (!Array.isArray(message.circletAttributes))
                                return "circletAttributes: array expected";
                            for (var i = 0; i < message.circletAttributes.length; ++i)
                                switch (message.circletAttributes[i]) {
                                default:
                                    return "circletAttributes: enum value[] expected";
                                case 0:
                                case 1:
                                case 2:
                                case 3:
                                case 4:
                                case 5:
                                case 6:
                                case 7:
                                case 8:
                                case 9:
                                case 10:
                                case 11:
                                case 12:
                                case 13:
                                case 14:
                                case 15:
                                case 16:
                                case 17:
                                case 18:
                                case 19:
                                    break;
                                }
                        }
                        if (message.subAttributes != null && message.hasOwnProperty("subAttributes")) {
                            if (!Array.isArray(message.subAttributes))
                                return "subAttributes: array expected";
                            for (var i = 0; i < message.subAttributes.length; ++i) {
                                var error = $root.io.leishi.genshin.proto.Attribute.verify(message.subAttributes[i]);
                                if (error)
                                    return "subAttributes." + error;
                            }
                        }
                        return null;
                    };

                    /**
                     * Creates a Build message from a plain object. Also converts values to their respective internal types.
                     * @function fromObject
                     * @memberof io.leishi.genshin.proto.Build
                     * @static
                     * @param {Object.<string,*>} object Plain object
                     * @returns {io.leishi.genshin.proto.Build} Build
                     */
                    Build.fromObject = function fromObject(object) {
                        if (object instanceof $root.io.leishi.genshin.proto.Build)
                            return object;
                        var message = new $root.io.leishi.genshin.proto.Build();
                        if (object.name != null)
                            message.name = String(object.name);
                        switch (object.character) {
                        default:
                            if (typeof object.character === "number") {
                                message.character = object.character;
                                break;
                            }
                            break;
                        case "CHARACTER_UNSPECIFIED":
                        case 0:
                            message.character = 0;
                            break;
                        case "TRAVELER_ANEMO":
                        case 1:
                            message.character = 1;
                            break;
                        case "TRAVELER_GEO":
                        case 2:
                            message.character = 2;
                            break;
                        case "TRAVELER_ELECTRO":
                        case 3:
                            message.character = 3;
                            break;
                        case "TRAVELER_DENDRO":
                        case 4:
                            message.character = 4;
                            break;
                        case "AETHER":
                        case 5:
                            message.character = 5;
                            break;
                        case "LUMINE":
                        case 6:
                            message.character = 6;
                            break;
                        case "ALBEDO":
                        case 7:
                            message.character = 7;
                            break;
                        case "ALOY":
                        case 8:
                            message.character = 8;
                            break;
                        case "AMBER":
                        case 9:
                            message.character = 9;
                            break;
                        case "BARBARA":
                        case 10:
                            message.character = 10;
                            break;
                        case "BEIDOU":
                        case 11:
                            message.character = 11;
                            break;
                        case "BENNETT":
                        case 12:
                            message.character = 12;
                            break;
                        case "CHONGYUN":
                        case 13:
                            message.character = 13;
                            break;
                        case "DILUC":
                        case 14:
                            message.character = 14;
                            break;
                        case "DIONA":
                        case 15:
                            message.character = 15;
                            break;
                        case "EULA":
                        case 16:
                            message.character = 16;
                            break;
                        case "FISCHL":
                        case 17:
                            message.character = 17;
                            break;
                        case "GANYU":
                        case 18:
                            message.character = 18;
                            break;
                        case "HU_TAO":
                        case 19:
                            message.character = 19;
                            break;
                        case "JEAN":
                        case 20:
                            message.character = 20;
                            break;
                        case "KAEDEHARA_KAZUHA":
                        case 21:
                            message.character = 21;
                            break;
                        case "KAEYA":
                        case 22:
                            message.character = 22;
                            break;
                        case "KAMISATO_AYAKA":
                        case 23:
                            message.character = 23;
                            break;
                        case "KEQING":
                        case 24:
                            message.character = 24;
                            break;
                        case "KLEE":
                        case 25:
                            message.character = 25;
                            break;
                        case "KUJOU_SARA":
                        case 26:
                            message.character = 26;
                            break;
                        case "LISA":
                        case 27:
                            message.character = 27;
                            break;
                        case "MONA":
                        case 28:
                            message.character = 28;
                            break;
                        case "NINGGUANG":
                        case 29:
                            message.character = 29;
                            break;
                        case "NOELLE":
                        case 30:
                            message.character = 30;
                            break;
                        case "QIQI":
                        case 31:
                            message.character = 31;
                            break;
                        case "RAIDEN_SHOGUN":
                        case 32:
                            message.character = 32;
                            break;
                        case "RAZOR":
                        case 33:
                            message.character = 33;
                            break;
                        case "ROSARIA":
                        case 34:
                            message.character = 34;
                            break;
                        case "SANGONOMIYA_KOKOMI":
                        case 35:
                            message.character = 35;
                            break;
                        case "SAYU":
                        case 36:
                            message.character = 36;
                            break;
                        case "SUCROSE":
                        case 37:
                            message.character = 37;
                            break;
                        case "TARTAGLIA":
                        case 38:
                            message.character = 38;
                            break;
                        case "THOMA":
                        case 39:
                            message.character = 39;
                            break;
                        case "VENTI":
                        case 40:
                            message.character = 40;
                            break;
                        case "XIANGLING":
                        case 41:
                            message.character = 41;
                            break;
                        case "XIAO":
                        case 42:
                            message.character = 42;
                            break;
                        case "XINGQIU":
                        case 43:
                            message.character = 43;
                            break;
                        case "XINYAN":
                        case 44:
                            message.character = 44;
                            break;
                        case "YANFEI":
                        case 45:
                            message.character = 45;
                            break;
                        case "YOIMIYA":
                        case 46:
                            message.character = 46;
                            break;
                        case "ZHONGLI":
                        case 47:
                            message.character = 47;
                            break;
                        case "GOROU":
                        case 48:
                            message.character = 48;
                            break;
                        case "ARATAKI_ITTO":
                        case 49:
                            message.character = 49;
                            break;
                        case "SHENHE":
                        case 50:
                            message.character = 50;
                            break;
                        case "YUN_JIN":
                        case 51:
                            message.character = 51;
                            break;
                        case "YAE_MIKO":
                        case 52:
                            message.character = 52;
                            break;
                        case "KAMISATO_AYATO":
                        case 53:
                            message.character = 53;
                            break;
                        case "YELAN":
                        case 54:
                            message.character = 54;
                            break;
                        case "KUKI_SHINOBU":
                        case 55:
                            message.character = 55;
                            break;
                        case "SHIKANOIN_HEIZOU":
                        case 56:
                            message.character = 56;
                            break;
                        case "COLLEI":
                        case 57:
                            message.character = 57;
                            break;
                        case "DORI":
                        case 58:
                            message.character = 58;
                            break;
                        case "TIGHNARI":
                        case 59:
                            message.character = 59;
                            break;
                        case "CANDACE":
                        case 60:
                            message.character = 60;
                            break;
                        case "CYNO":
                        case 61:
                            message.character = 61;
                            break;
                        case "NILOU":
                        case 62:
                            message.character = 62;
                            break;
                        case "NAHIDA":
                        case 63:
                            message.character = 63;
                            break;
                        case "LAYLA":
                        case 64:
                            message.character = 64;
                            break;
                        case "FARUZAN":
                        case 65:
                            message.character = 65;
                            break;
                        case "WANDERER":
                        case 66:
                            message.character = 66;
                            break;
                        case "ALHAITHAM":
                        case 67:
                            message.character = 67;
                            break;
                        case "YAOYAO":
                        case 68:
                            message.character = 68;
                            break;
                        }
                        if (object.weapons) {
                            if (!Array.isArray(object.weapons))
                                throw TypeError(".io.leishi.genshin.proto.Build.weapons: array expected");
                            message.weapons = [];
                            for (var i = 0; i < object.weapons.length; ++i)
                                switch (object.weapons[i]) {
                                default:
                                    if (typeof object.weapons[i] === "number") {
                                        message.weapons[i] = object.weapons[i];
                                        break;
                                    }
                                case "WEAPON_UNSPECIFIED":
                                case 0:
                                    message.weapons[i] = 0;
                                    break;
                                case "AKUOUMARU":
                                case 1:
                                    message.weapons[i] = 1;
                                    break;
                                case "ALLEY_HUNTER":
                                case 2:
                                    message.weapons[i] = 2;
                                    break;
                                case "AMENOMA_KAGEUCHI":
                                case 3:
                                    message.weapons[i] = 3;
                                    break;
                                case "AMOS_BOW":
                                case 4:
                                    message.weapons[i] = 4;
                                    break;
                                case "APPRENTICES_NOTES":
                                case 5:
                                    message.weapons[i] = 5;
                                    break;
                                case "AQUA_SIMULACRA":
                                case 6:
                                    message.weapons[i] = 6;
                                    break;
                                case "AQUILA_FAVONIA":
                                case 7:
                                    message.weapons[i] = 7;
                                    break;
                                case "A_THOUSAND_FLOATING_DREAMS":
                                case 8:
                                    message.weapons[i] = 8;
                                    break;
                                case "BEGINNERS_PROTECTOR":
                                case 9:
                                    message.weapons[i] = 9;
                                    break;
                                case "BLACKCLIFF_AGATE":
                                case 10:
                                    message.weapons[i] = 10;
                                    break;
                                case "BLACKCLIFF_LONGSWORD":
                                case 11:
                                    message.weapons[i] = 11;
                                    break;
                                case "BLACKCLIFF_POLE":
                                case 12:
                                    message.weapons[i] = 12;
                                    break;
                                case "BLACKCLIFF_SLASHER":
                                case 13:
                                    message.weapons[i] = 13;
                                    break;
                                case "BLACKCLIFF_WARBOW":
                                case 14:
                                    message.weapons[i] = 14;
                                    break;
                                case "BLACK_TASSEL":
                                case 15:
                                    message.weapons[i] = 15;
                                    break;
                                case "BLOODTAINTED_GREATSWORD":
                                case 16:
                                    message.weapons[i] = 16;
                                    break;
                                case "CALAMITY_QUELLER":
                                case 17:
                                    message.weapons[i] = 17;
                                    break;
                                case "CINNABAR_SPINDLE":
                                case 18:
                                    message.weapons[i] = 18;
                                    break;
                                case "COMPOUND_BOW":
                                case 19:
                                    message.weapons[i] = 19;
                                    break;
                                case "COOL_STEEL":
                                case 20:
                                    message.weapons[i] = 20;
                                    break;
                                case "CRESCENT_PIKE":
                                case 21:
                                    message.weapons[i] = 21;
                                    break;
                                case "DARK_IRON_SWORD":
                                case 22:
                                    message.weapons[i] = 22;
                                    break;
                                case "DEATHMATCH":
                                case 23:
                                    message.weapons[i] = 23;
                                    break;
                                case "DEBATE_CLUB":
                                case 24:
                                    message.weapons[i] = 24;
                                    break;
                                case "DODOCO_TALES":
                                case 25:
                                    message.weapons[i] = 25;
                                    break;
                                case "DRAGONS_BANE":
                                case 26:
                                    message.weapons[i] = 26;
                                    break;
                                case "DRAGONSPINE_SPEAR":
                                case 27:
                                    message.weapons[i] = 27;
                                    break;
                                case "DULL_BLADE":
                                case 28:
                                    message.weapons[i] = 28;
                                    break;
                                case "ELEGY_FOR_THE_END":
                                case 29:
                                    message.weapons[i] = 29;
                                    break;
                                case "EMERALD_ORB":
                                case 30:
                                    message.weapons[i] = 30;
                                    break;
                                case "END_OF_THE_LINE":
                                case 31:
                                    message.weapons[i] = 31;
                                    break;
                                case "ENGULFING_LIGHTNING":
                                case 32:
                                    message.weapons[i] = 32;
                                    break;
                                case "EVERLASTING_MOONGLOW":
                                case 33:
                                    message.weapons[i] = 33;
                                    break;
                                case "EYE_OF_PERCEPTION":
                                case 34:
                                    message.weapons[i] = 34;
                                    break;
                                case "FADING_TWILIGHT":
                                case 35:
                                    message.weapons[i] = 35;
                                    break;
                                case "FAVONIUS_CODEX":
                                case 36:
                                    message.weapons[i] = 36;
                                    break;
                                case "FAVONIUS_GREATSWORD":
                                case 37:
                                    message.weapons[i] = 37;
                                    break;
                                case "FAVONIUS_LANCE":
                                case 38:
                                    message.weapons[i] = 38;
                                    break;
                                case "FAVONIUS_SWORD":
                                case 39:
                                    message.weapons[i] = 39;
                                    break;
                                case "FAVONIUS_WARBOW":
                                case 40:
                                    message.weapons[i] = 40;
                                    break;
                                case "FERROUS_SHADOW":
                                case 41:
                                    message.weapons[i] = 41;
                                    break;
                                case "FESTERING_DESIRE":
                                case 42:
                                    message.weapons[i] = 42;
                                    break;
                                case "FILLET_BLADE":
                                case 43:
                                    message.weapons[i] = 43;
                                    break;
                                case "FOREST_REGALIA":
                                case 44:
                                    message.weapons[i] = 44;
                                    break;
                                case "FREEDOM_SWORN":
                                case 45:
                                    message.weapons[i] = 45;
                                    break;
                                case "FROSTBEARER":
                                case 46:
                                    message.weapons[i] = 46;
                                    break;
                                case "FRUIT_OF_FULFILLMENT":
                                case 47:
                                    message.weapons[i] = 47;
                                    break;
                                case "HAKUSHIN_RING":
                                case 48:
                                    message.weapons[i] = 48;
                                    break;
                                case "HALBERD":
                                case 49:
                                    message.weapons[i] = 49;
                                    break;
                                case "HAMAYUMI":
                                case 50:
                                    message.weapons[i] = 50;
                                    break;
                                case "HARAN_GEPPAKU_FUTSU":
                                case 51:
                                    message.weapons[i] = 51;
                                    break;
                                case "HARBINGER_OF_DAWN":
                                case 52:
                                    message.weapons[i] = 52;
                                    break;
                                case "HUNTERS_BOW":
                                case 53:
                                    message.weapons[i] = 53;
                                    break;
                                case "HUNTERS_PATH":
                                case 54:
                                    message.weapons[i] = 54;
                                    break;
                                case "IRON_POINT":
                                case 55:
                                    message.weapons[i] = 55;
                                    break;
                                case "IRON_STING":
                                case 56:
                                    message.weapons[i] = 56;
                                    break;
                                case "KAGOTSURUBE_ISSHIN":
                                case 57:
                                    message.weapons[i] = 57;
                                    break;
                                case "KAGURAS_VERITY":
                                case 58:
                                    message.weapons[i] = 58;
                                    break;
                                case "KATSURAGIKIRI_NAGAMASA":
                                case 59:
                                    message.weapons[i] = 59;
                                    break;
                                case "KEY_OF_KHAJ_NISUT":
                                case 60:
                                    message.weapons[i] = 60;
                                    break;
                                case "KINGS_SQUIRE":
                                case 61:
                                    message.weapons[i] = 61;
                                    break;
                                case "KITAIN_CROSS_SPEAR":
                                case 62:
                                    message.weapons[i] = 62;
                                    break;
                                case "LIONS_ROAR":
                                case 63:
                                    message.weapons[i] = 63;
                                    break;
                                case "LITHIC_BLADE":
                                case 64:
                                    message.weapons[i] = 64;
                                    break;
                                case "LITHIC_SPEAR":
                                case 65:
                                    message.weapons[i] = 65;
                                    break;
                                case "LOST_PRAYER_TO_THE_SACRED_WINDS":
                                case 66:
                                    message.weapons[i] = 66;
                                    break;
                                case "LUXURIOUS_SEA_LORD":
                                case 67:
                                    message.weapons[i] = 67;
                                    break;
                                case "MAGIC_GUIDE":
                                case 68:
                                    message.weapons[i] = 68;
                                    break;
                                case "MAKHAIRA_AQUAMARINE":
                                case 69:
                                    message.weapons[i] = 69;
                                    break;
                                case "MAPPA_MARE":
                                case 70:
                                    message.weapons[i] = 70;
                                    break;
                                case "MEMORY_OF_DUST":
                                case 71:
                                    message.weapons[i] = 71;
                                    break;
                                case "MESSENGER":
                                case 72:
                                    message.weapons[i] = 72;
                                    break;
                                case "MISSIVE_WINDSPEAR":
                                case 73:
                                    message.weapons[i] = 73;
                                    break;
                                case "MISTSPLITTER_REFORGED":
                                case 74:
                                    message.weapons[i] = 74;
                                    break;
                                case "MITTERNACHTS_WALTZ":
                                case 75:
                                    message.weapons[i] = 75;
                                    break;
                                case "MOONPIERCER":
                                case 76:
                                    message.weapons[i] = 76;
                                    break;
                                case "MOUUNS_MOON":
                                case 77:
                                    message.weapons[i] = 77;
                                    break;
                                case "OATHSWORN_EYE":
                                case 78:
                                    message.weapons[i] = 78;
                                    break;
                                case "OLD_MERCS_PAL":
                                case 79:
                                    message.weapons[i] = 79;
                                    break;
                                case "OTHERWORLDLY_STORY":
                                case 80:
                                    message.weapons[i] = 80;
                                    break;
                                case "POCKET_GRIMOIRE":
                                case 81:
                                    message.weapons[i] = 81;
                                    break;
                                case "POLAR_STAR":
                                case 82:
                                    message.weapons[i] = 82;
                                    break;
                                case "PREDATOR":
                                case 83:
                                    message.weapons[i] = 83;
                                    break;
                                case "PRIMORDIAL_JADE_CUTTER":
                                case 84:
                                    message.weapons[i] = 84;
                                    break;
                                case "PRIMORDIAL_JADE_WINGED_SPEAR":
                                case 85:
                                    message.weapons[i] = 85;
                                    break;
                                case "PRIZED_ISSHIN_BLADE":
                                case 86:
                                    message.weapons[i] = 86;
                                    break;
                                case "PROTOTYPE_AMBER":
                                case 87:
                                    message.weapons[i] = 87;
                                    break;
                                case "PROTOTYPE_ARCHAIC":
                                case 88:
                                    message.weapons[i] = 88;
                                    break;
                                case "PROTOTYPE_CRESCENT":
                                case 89:
                                    message.weapons[i] = 89;
                                    break;
                                case "PROTOTYPE_RANCOUR":
                                case 90:
                                    message.weapons[i] = 90;
                                    break;
                                case "PROTOTYPE_STARGLITTER":
                                case 91:
                                    message.weapons[i] = 91;
                                    break;
                                case "RAINSLASHER":
                                case 92:
                                    message.weapons[i] = 92;
                                    break;
                                case "RAVEN_BOW":
                                case 93:
                                    message.weapons[i] = 93;
                                    break;
                                case "RECURVE_BOW":
                                case 94:
                                    message.weapons[i] = 94;
                                    break;
                                case "REDHORN_STONETHRESHER":
                                case 95:
                                    message.weapons[i] = 95;
                                    break;
                                case "ROYAL_BOW":
                                case 96:
                                    message.weapons[i] = 96;
                                    break;
                                case "ROYAL_GREATSWORD":
                                case 97:
                                    message.weapons[i] = 97;
                                    break;
                                case "ROYAL_GRIMOIRE":
                                case 98:
                                    message.weapons[i] = 98;
                                    break;
                                case "ROYAL_LONGSWORD":
                                case 99:
                                    message.weapons[i] = 99;
                                    break;
                                case "ROYAL_SPEAR":
                                case 100:
                                    message.weapons[i] = 100;
                                    break;
                                case "RUST":
                                case 101:
                                    message.weapons[i] = 101;
                                    break;
                                case "SACRIFICIAL_BOW":
                                case 102:
                                    message.weapons[i] = 102;
                                    break;
                                case "SACRIFICIAL_FRAGMENTS":
                                case 103:
                                    message.weapons[i] = 103;
                                    break;
                                case "SACRIFICIAL_GREATSWORD":
                                case 104:
                                    message.weapons[i] = 104;
                                    break;
                                case "SACRIFICIAL_SWORD":
                                case 105:
                                    message.weapons[i] = 105;
                                    break;
                                case "SAPWOOD_BLADE":
                                case 106:
                                    message.weapons[i] = 106;
                                    break;
                                case "SEASONED_HUNTERS_BOW":
                                case 107:
                                    message.weapons[i] = 107;
                                    break;
                                case "SERPENT_SPINE":
                                case 108:
                                    message.weapons[i] = 108;
                                    break;
                                case "SHARPSHOOTERS_OATH":
                                case 109:
                                    message.weapons[i] = 109;
                                    break;
                                case "SILVER_SWORD":
                                case 110:
                                    message.weapons[i] = 110;
                                    break;
                                case "SKYRIDER_GREATSWORD":
                                case 111:
                                    message.weapons[i] = 111;
                                    break;
                                case "SKYRIDER_SWORD":
                                case 112:
                                    message.weapons[i] = 112;
                                    break;
                                case "SKYWARD_ATLAS":
                                case 113:
                                    message.weapons[i] = 113;
                                    break;
                                case "SKYWARD_BLADE":
                                case 114:
                                    message.weapons[i] = 114;
                                    break;
                                case "SKYWARD_HARP":
                                case 115:
                                    message.weapons[i] = 115;
                                    break;
                                case "SKYWARD_PRIDE":
                                case 116:
                                    message.weapons[i] = 116;
                                    break;
                                case "SKYWARD_SPINE":
                                case 117:
                                    message.weapons[i] = 117;
                                    break;
                                case "SLINGSHOT":
                                case 118:
                                    message.weapons[i] = 118;
                                    break;
                                case "SNOW_TOMBED_STARSILVER":
                                case 119:
                                    message.weapons[i] = 119;
                                    break;
                                case "SOLAR_PEARL":
                                case 120:
                                    message.weapons[i] = 120;
                                    break;
                                case "SONG_OF_BROKEN_PINES":
                                case 121:
                                    message.weapons[i] = 121;
                                    break;
                                case "STAFF_OF_HOMA":
                                case 122:
                                    message.weapons[i] = 122;
                                    break;
                                case "STAFF_OF_THE_SCARLET_SANDS":
                                case 123:
                                    message.weapons[i] = 123;
                                    break;
                                case "SUMMIT_SHAPER":
                                case 124:
                                    message.weapons[i] = 124;
                                    break;
                                case "SWORD_OF_DESCENSION":
                                case 125:
                                    message.weapons[i] = 125;
                                    break;
                                case "THE_ALLEY_FLASH":
                                case 126:
                                    message.weapons[i] = 126;
                                    break;
                                case "THE_BELL":
                                case 127:
                                    message.weapons[i] = 127;
                                    break;
                                case "THE_BLACK_SWORD":
                                case 128:
                                    message.weapons[i] = 128;
                                    break;
                                case "THE_CATCH":
                                case 129:
                                    message.weapons[i] = 129;
                                    break;
                                case "THE_FLUTE":
                                case 130:
                                    message.weapons[i] = 130;
                                    break;
                                case "THE_STRINGLESS":
                                case 131:
                                    message.weapons[i] = 131;
                                    break;
                                case "THE_UNFORGED":
                                case 132:
                                    message.weapons[i] = 132;
                                    break;
                                case "THE_VIRIDESCENT_HUNT":
                                case 133:
                                    message.weapons[i] = 133;
                                    break;
                                case "THE_WIDSITH":
                                case 134:
                                    message.weapons[i] = 134;
                                    break;
                                case "THRILLING_TALES_OF_DRAGON_SLAYERS":
                                case 135:
                                    message.weapons[i] = 135;
                                    break;
                                case "THUNDERING_PULSE":
                                case 136:
                                    message.weapons[i] = 136;
                                    break;
                                case "TOUKABOU_SHIGURE":
                                case 137:
                                    message.weapons[i] = 137;
                                    break;
                                case "TRAVELERS_HANDY_SWORD":
                                case 138:
                                    message.weapons[i] = 138;
                                    break;
                                case "TULAYTULLAHS_REMEMBRANCE":
                                case 139:
                                    message.weapons[i] = 139;
                                    break;
                                case "TWIN_NEPHRITE":
                                case 140:
                                    message.weapons[i] = 140;
                                    break;
                                case "VORTEX_VANQUISHER":
                                case 141:
                                    message.weapons[i] = 141;
                                    break;
                                case "WANDERING_EVENSTAR":
                                case 142:
                                    message.weapons[i] = 142;
                                    break;
                                case "WASTER_GREATSWORD":
                                case 143:
                                    message.weapons[i] = 143;
                                    break;
                                case "WAVEBREAKERS_FIN":
                                case 144:
                                    message.weapons[i] = 144;
                                    break;
                                case "WHITEBLIND":
                                case 145:
                                    message.weapons[i] = 145;
                                    break;
                                case "WHITE_IRON_GREATSWORD":
                                case 146:
                                    message.weapons[i] = 146;
                                    break;
                                case "WHITE_TASSEL":
                                case 147:
                                    message.weapons[i] = 147;
                                    break;
                                case "WINDBLUME_ODE":
                                case 148:
                                    message.weapons[i] = 148;
                                    break;
                                case "WINE_AND_SONG":
                                case 149:
                                    message.weapons[i] = 149;
                                    break;
                                case "WOLFS_GRAVESTONE":
                                case 150:
                                    message.weapons[i] = 150;
                                    break;
                                case "XIPHOS_MOONLIGHT":
                                case 151:
                                    message.weapons[i] = 151;
                                    break;
                                case "LIGHT_OF_FOLIAR_INCISION":
                                case 152:
                                    message.weapons[i] = 152;
                                    break;
                                }
                        }
                        if (object.suits) {
                            if (!Array.isArray(object.suits))
                                throw TypeError(".io.leishi.genshin.proto.Build.suits: array expected");
                            message.suits = [];
                            for (var i = 0; i < object.suits.length; ++i) {
                                if (typeof object.suits[i] !== "object")
                                    throw TypeError(".io.leishi.genshin.proto.Build.suits: object expected");
                                message.suits[i] = $root.io.leishi.genshin.proto.Suit.fromObject(object.suits[i]);
                            }
                        }
                        if (object.flowerAttributes) {
                            if (!Array.isArray(object.flowerAttributes))
                                throw TypeError(".io.leishi.genshin.proto.Build.flowerAttributes: array expected");
                            message.flowerAttributes = [];
                            for (var i = 0; i < object.flowerAttributes.length; ++i)
                                switch (object.flowerAttributes[i]) {
                                default:
                                    if (typeof object.flowerAttributes[i] === "number") {
                                        message.flowerAttributes[i] = object.flowerAttributes[i];
                                        break;
                                    }
                                case "ATTRIBUTE_TYPE_UNSPECIFIED":
                                case 0:
                                    message.flowerAttributes[i] = 0;
                                    break;
                                case "HP":
                                case 1:
                                    message.flowerAttributes[i] = 1;
                                    break;
                                case "ATK":
                                case 2:
                                    message.flowerAttributes[i] = 2;
                                    break;
                                case "DEF":
                                case 3:
                                    message.flowerAttributes[i] = 3;
                                    break;
                                case "ELEMENTAL_MASTERY":
                                case 4:
                                    message.flowerAttributes[i] = 4;
                                    break;
                                case "ENERGY_RECHARGE":
                                case 5:
                                    message.flowerAttributes[i] = 5;
                                    break;
                                case "HP_PERCENT":
                                case 6:
                                    message.flowerAttributes[i] = 6;
                                    break;
                                case "ATK_PERCENT":
                                case 7:
                                    message.flowerAttributes[i] = 7;
                                    break;
                                case "DEF_PERCENT":
                                case 8:
                                    message.flowerAttributes[i] = 8;
                                    break;
                                case "CRIT_RATE":
                                case 9:
                                    message.flowerAttributes[i] = 9;
                                    break;
                                case "CRIT_DAMAGE":
                                case 10:
                                    message.flowerAttributes[i] = 10;
                                    break;
                                case "HEALING_BONUS":
                                case 11:
                                    message.flowerAttributes[i] = 11;
                                    break;
                                case "ANEMO_DAMAGE_BONUS":
                                case 12:
                                    message.flowerAttributes[i] = 12;
                                    break;
                                case "CRYO_DAMAGE_BONUS":
                                case 13:
                                    message.flowerAttributes[i] = 13;
                                    break;
                                case "DENDRO_DAMAGE_BONUS":
                                case 14:
                                    message.flowerAttributes[i] = 14;
                                    break;
                                case "ELECTRO_DAMAGE_BONUS":
                                case 15:
                                    message.flowerAttributes[i] = 15;
                                    break;
                                case "GEO_DAMAGE_BONUS":
                                case 16:
                                    message.flowerAttributes[i] = 16;
                                    break;
                                case "HYDRO_DAMAGE_BONUS":
                                case 17:
                                    message.flowerAttributes[i] = 17;
                                    break;
                                case "PHYSICAL_DAMAGE_BONUS":
                                case 18:
                                    message.flowerAttributes[i] = 18;
                                    break;
                                case "PYRO_DAMAGE_BONUS":
                                case 19:
                                    message.flowerAttributes[i] = 19;
                                    break;
                                }
                        }
                        if (object.plumeAttributes) {
                            if (!Array.isArray(object.plumeAttributes))
                                throw TypeError(".io.leishi.genshin.proto.Build.plumeAttributes: array expected");
                            message.plumeAttributes = [];
                            for (var i = 0; i < object.plumeAttributes.length; ++i)
                                switch (object.plumeAttributes[i]) {
                                default:
                                    if (typeof object.plumeAttributes[i] === "number") {
                                        message.plumeAttributes[i] = object.plumeAttributes[i];
                                        break;
                                    }
                                case "ATTRIBUTE_TYPE_UNSPECIFIED":
                                case 0:
                                    message.plumeAttributes[i] = 0;
                                    break;
                                case "HP":
                                case 1:
                                    message.plumeAttributes[i] = 1;
                                    break;
                                case "ATK":
                                case 2:
                                    message.plumeAttributes[i] = 2;
                                    break;
                                case "DEF":
                                case 3:
                                    message.plumeAttributes[i] = 3;
                                    break;
                                case "ELEMENTAL_MASTERY":
                                case 4:
                                    message.plumeAttributes[i] = 4;
                                    break;
                                case "ENERGY_RECHARGE":
                                case 5:
                                    message.plumeAttributes[i] = 5;
                                    break;
                                case "HP_PERCENT":
                                case 6:
                                    message.plumeAttributes[i] = 6;
                                    break;
                                case "ATK_PERCENT":
                                case 7:
                                    message.plumeAttributes[i] = 7;
                                    break;
                                case "DEF_PERCENT":
                                case 8:
                                    message.plumeAttributes[i] = 8;
                                    break;
                                case "CRIT_RATE":
                                case 9:
                                    message.plumeAttributes[i] = 9;
                                    break;
                                case "CRIT_DAMAGE":
                                case 10:
                                    message.plumeAttributes[i] = 10;
                                    break;
                                case "HEALING_BONUS":
                                case 11:
                                    message.plumeAttributes[i] = 11;
                                    break;
                                case "ANEMO_DAMAGE_BONUS":
                                case 12:
                                    message.plumeAttributes[i] = 12;
                                    break;
                                case "CRYO_DAMAGE_BONUS":
                                case 13:
                                    message.plumeAttributes[i] = 13;
                                    break;
                                case "DENDRO_DAMAGE_BONUS":
                                case 14:
                                    message.plumeAttributes[i] = 14;
                                    break;
                                case "ELECTRO_DAMAGE_BONUS":
                                case 15:
                                    message.plumeAttributes[i] = 15;
                                    break;
                                case "GEO_DAMAGE_BONUS":
                                case 16:
                                    message.plumeAttributes[i] = 16;
                                    break;
                                case "HYDRO_DAMAGE_BONUS":
                                case 17:
                                    message.plumeAttributes[i] = 17;
                                    break;
                                case "PHYSICAL_DAMAGE_BONUS":
                                case 18:
                                    message.plumeAttributes[i] = 18;
                                    break;
                                case "PYRO_DAMAGE_BONUS":
                                case 19:
                                    message.plumeAttributes[i] = 19;
                                    break;
                                }
                        }
                        if (object.sandsAttributes) {
                            if (!Array.isArray(object.sandsAttributes))
                                throw TypeError(".io.leishi.genshin.proto.Build.sandsAttributes: array expected");
                            message.sandsAttributes = [];
                            for (var i = 0; i < object.sandsAttributes.length; ++i)
                                switch (object.sandsAttributes[i]) {
                                default:
                                    if (typeof object.sandsAttributes[i] === "number") {
                                        message.sandsAttributes[i] = object.sandsAttributes[i];
                                        break;
                                    }
                                case "ATTRIBUTE_TYPE_UNSPECIFIED":
                                case 0:
                                    message.sandsAttributes[i] = 0;
                                    break;
                                case "HP":
                                case 1:
                                    message.sandsAttributes[i] = 1;
                                    break;
                                case "ATK":
                                case 2:
                                    message.sandsAttributes[i] = 2;
                                    break;
                                case "DEF":
                                case 3:
                                    message.sandsAttributes[i] = 3;
                                    break;
                                case "ELEMENTAL_MASTERY":
                                case 4:
                                    message.sandsAttributes[i] = 4;
                                    break;
                                case "ENERGY_RECHARGE":
                                case 5:
                                    message.sandsAttributes[i] = 5;
                                    break;
                                case "HP_PERCENT":
                                case 6:
                                    message.sandsAttributes[i] = 6;
                                    break;
                                case "ATK_PERCENT":
                                case 7:
                                    message.sandsAttributes[i] = 7;
                                    break;
                                case "DEF_PERCENT":
                                case 8:
                                    message.sandsAttributes[i] = 8;
                                    break;
                                case "CRIT_RATE":
                                case 9:
                                    message.sandsAttributes[i] = 9;
                                    break;
                                case "CRIT_DAMAGE":
                                case 10:
                                    message.sandsAttributes[i] = 10;
                                    break;
                                case "HEALING_BONUS":
                                case 11:
                                    message.sandsAttributes[i] = 11;
                                    break;
                                case "ANEMO_DAMAGE_BONUS":
                                case 12:
                                    message.sandsAttributes[i] = 12;
                                    break;
                                case "CRYO_DAMAGE_BONUS":
                                case 13:
                                    message.sandsAttributes[i] = 13;
                                    break;
                                case "DENDRO_DAMAGE_BONUS":
                                case 14:
                                    message.sandsAttributes[i] = 14;
                                    break;
                                case "ELECTRO_DAMAGE_BONUS":
                                case 15:
                                    message.sandsAttributes[i] = 15;
                                    break;
                                case "GEO_DAMAGE_BONUS":
                                case 16:
                                    message.sandsAttributes[i] = 16;
                                    break;
                                case "HYDRO_DAMAGE_BONUS":
                                case 17:
                                    message.sandsAttributes[i] = 17;
                                    break;
                                case "PHYSICAL_DAMAGE_BONUS":
                                case 18:
                                    message.sandsAttributes[i] = 18;
                                    break;
                                case "PYRO_DAMAGE_BONUS":
                                case 19:
                                    message.sandsAttributes[i] = 19;
                                    break;
                                }
                        }
                        if (object.gobletAttributes) {
                            if (!Array.isArray(object.gobletAttributes))
                                throw TypeError(".io.leishi.genshin.proto.Build.gobletAttributes: array expected");
                            message.gobletAttributes = [];
                            for (var i = 0; i < object.gobletAttributes.length; ++i)
                                switch (object.gobletAttributes[i]) {
                                default:
                                    if (typeof object.gobletAttributes[i] === "number") {
                                        message.gobletAttributes[i] = object.gobletAttributes[i];
                                        break;
                                    }
                                case "ATTRIBUTE_TYPE_UNSPECIFIED":
                                case 0:
                                    message.gobletAttributes[i] = 0;
                                    break;
                                case "HP":
                                case 1:
                                    message.gobletAttributes[i] = 1;
                                    break;
                                case "ATK":
                                case 2:
                                    message.gobletAttributes[i] = 2;
                                    break;
                                case "DEF":
                                case 3:
                                    message.gobletAttributes[i] = 3;
                                    break;
                                case "ELEMENTAL_MASTERY":
                                case 4:
                                    message.gobletAttributes[i] = 4;
                                    break;
                                case "ENERGY_RECHARGE":
                                case 5:
                                    message.gobletAttributes[i] = 5;
                                    break;
                                case "HP_PERCENT":
                                case 6:
                                    message.gobletAttributes[i] = 6;
                                    break;
                                case "ATK_PERCENT":
                                case 7:
                                    message.gobletAttributes[i] = 7;
                                    break;
                                case "DEF_PERCENT":
                                case 8:
                                    message.gobletAttributes[i] = 8;
                                    break;
                                case "CRIT_RATE":
                                case 9:
                                    message.gobletAttributes[i] = 9;
                                    break;
                                case "CRIT_DAMAGE":
                                case 10:
                                    message.gobletAttributes[i] = 10;
                                    break;
                                case "HEALING_BONUS":
                                case 11:
                                    message.gobletAttributes[i] = 11;
                                    break;
                                case "ANEMO_DAMAGE_BONUS":
                                case 12:
                                    message.gobletAttributes[i] = 12;
                                    break;
                                case "CRYO_DAMAGE_BONUS":
                                case 13:
                                    message.gobletAttributes[i] = 13;
                                    break;
                                case "DENDRO_DAMAGE_BONUS":
                                case 14:
                                    message.gobletAttributes[i] = 14;
                                    break;
                                case "ELECTRO_DAMAGE_BONUS":
                                case 15:
                                    message.gobletAttributes[i] = 15;
                                    break;
                                case "GEO_DAMAGE_BONUS":
                                case 16:
                                    message.gobletAttributes[i] = 16;
                                    break;
                                case "HYDRO_DAMAGE_BONUS":
                                case 17:
                                    message.gobletAttributes[i] = 17;
                                    break;
                                case "PHYSICAL_DAMAGE_BONUS":
                                case 18:
                                    message.gobletAttributes[i] = 18;
                                    break;
                                case "PYRO_DAMAGE_BONUS":
                                case 19:
                                    message.gobletAttributes[i] = 19;
                                    break;
                                }
                        }
                        if (object.circletAttributes) {
                            if (!Array.isArray(object.circletAttributes))
                                throw TypeError(".io.leishi.genshin.proto.Build.circletAttributes: array expected");
                            message.circletAttributes = [];
                            for (var i = 0; i < object.circletAttributes.length; ++i)
                                switch (object.circletAttributes[i]) {
                                default:
                                    if (typeof object.circletAttributes[i] === "number") {
                                        message.circletAttributes[i] = object.circletAttributes[i];
                                        break;
                                    }
                                case "ATTRIBUTE_TYPE_UNSPECIFIED":
                                case 0:
                                    message.circletAttributes[i] = 0;
                                    break;
                                case "HP":
                                case 1:
                                    message.circletAttributes[i] = 1;
                                    break;
                                case "ATK":
                                case 2:
                                    message.circletAttributes[i] = 2;
                                    break;
                                case "DEF":
                                case 3:
                                    message.circletAttributes[i] = 3;
                                    break;
                                case "ELEMENTAL_MASTERY":
                                case 4:
                                    message.circletAttributes[i] = 4;
                                    break;
                                case "ENERGY_RECHARGE":
                                case 5:
                                    message.circletAttributes[i] = 5;
                                    break;
                                case "HP_PERCENT":
                                case 6:
                                    message.circletAttributes[i] = 6;
                                    break;
                                case "ATK_PERCENT":
                                case 7:
                                    message.circletAttributes[i] = 7;
                                    break;
                                case "DEF_PERCENT":
                                case 8:
                                    message.circletAttributes[i] = 8;
                                    break;
                                case "CRIT_RATE":
                                case 9:
                                    message.circletAttributes[i] = 9;
                                    break;
                                case "CRIT_DAMAGE":
                                case 10:
                                    message.circletAttributes[i] = 10;
                                    break;
                                case "HEALING_BONUS":
                                case 11:
                                    message.circletAttributes[i] = 11;
                                    break;
                                case "ANEMO_DAMAGE_BONUS":
                                case 12:
                                    message.circletAttributes[i] = 12;
                                    break;
                                case "CRYO_DAMAGE_BONUS":
                                case 13:
                                    message.circletAttributes[i] = 13;
                                    break;
                                case "DENDRO_DAMAGE_BONUS":
                                case 14:
                                    message.circletAttributes[i] = 14;
                                    break;
                                case "ELECTRO_DAMAGE_BONUS":
                                case 15:
                                    message.circletAttributes[i] = 15;
                                    break;
                                case "GEO_DAMAGE_BONUS":
                                case 16:
                                    message.circletAttributes[i] = 16;
                                    break;
                                case "HYDRO_DAMAGE_BONUS":
                                case 17:
                                    message.circletAttributes[i] = 17;
                                    break;
                                case "PHYSICAL_DAMAGE_BONUS":
                                case 18:
                                    message.circletAttributes[i] = 18;
                                    break;
                                case "PYRO_DAMAGE_BONUS":
                                case 19:
                                    message.circletAttributes[i] = 19;
                                    break;
                                }
                        }
                        if (object.subAttributes) {
                            if (!Array.isArray(object.subAttributes))
                                throw TypeError(".io.leishi.genshin.proto.Build.subAttributes: array expected");
                            message.subAttributes = [];
                            for (var i = 0; i < object.subAttributes.length; ++i) {
                                if (typeof object.subAttributes[i] !== "object")
                                    throw TypeError(".io.leishi.genshin.proto.Build.subAttributes: object expected");
                                message.subAttributes[i] = $root.io.leishi.genshin.proto.Attribute.fromObject(object.subAttributes[i]);
                            }
                        }
                        return message;
                    };

                    /**
                     * Creates a plain object from a Build message. Also converts values to other types if specified.
                     * @function toObject
                     * @memberof io.leishi.genshin.proto.Build
                     * @static
                     * @param {io.leishi.genshin.proto.Build} message Build
                     * @param {$protobuf.IConversionOptions} [options] Conversion options
                     * @returns {Object.<string,*>} Plain object
                     */
                    Build.toObject = function toObject(message, options) {
                        if (!options)
                            options = {};
                        var object = {};
                        if (options.arrays || options.defaults) {
                            object.weapons = [];
                            object.suits = [];
                            object.flowerAttributes = [];
                            object.plumeAttributes = [];
                            object.sandsAttributes = [];
                            object.gobletAttributes = [];
                            object.circletAttributes = [];
                            object.subAttributes = [];
                        }
                        if (options.defaults) {
                            object.name = "";
                            object.character = options.enums === String ? "CHARACTER_UNSPECIFIED" : 0;
                        }
                        if (message.name != null && message.hasOwnProperty("name"))
                            object.name = message.name;
                        if (message.character != null && message.hasOwnProperty("character"))
                            object.character = options.enums === String ? $root.io.leishi.genshin.proto.Character[message.character] === undefined ? message.character : $root.io.leishi.genshin.proto.Character[message.character] : message.character;
                        if (message.weapons && message.weapons.length) {
                            object.weapons = [];
                            for (var j = 0; j < message.weapons.length; ++j)
                                object.weapons[j] = options.enums === String ? $root.io.leishi.genshin.proto.Weapon[message.weapons[j]] === undefined ? message.weapons[j] : $root.io.leishi.genshin.proto.Weapon[message.weapons[j]] : message.weapons[j];
                        }
                        if (message.suits && message.suits.length) {
                            object.suits = [];
                            for (var j = 0; j < message.suits.length; ++j)
                                object.suits[j] = $root.io.leishi.genshin.proto.Suit.toObject(message.suits[j], options);
                        }
                        if (message.flowerAttributes && message.flowerAttributes.length) {
                            object.flowerAttributes = [];
                            for (var j = 0; j < message.flowerAttributes.length; ++j)
                                object.flowerAttributes[j] = options.enums === String ? $root.io.leishi.genshin.proto.AttributeType[message.flowerAttributes[j]] === undefined ? message.flowerAttributes[j] : $root.io.leishi.genshin.proto.AttributeType[message.flowerAttributes[j]] : message.flowerAttributes[j];
                        }
                        if (message.plumeAttributes && message.plumeAttributes.length) {
                            object.plumeAttributes = [];
                            for (var j = 0; j < message.plumeAttributes.length; ++j)
                                object.plumeAttributes[j] = options.enums === String ? $root.io.leishi.genshin.proto.AttributeType[message.plumeAttributes[j]] === undefined ? message.plumeAttributes[j] : $root.io.leishi.genshin.proto.AttributeType[message.plumeAttributes[j]] : message.plumeAttributes[j];
                        }
                        if (message.sandsAttributes && message.sandsAttributes.length) {
                            object.sandsAttributes = [];
                            for (var j = 0; j < message.sandsAttributes.length; ++j)
                                object.sandsAttributes[j] = options.enums === String ? $root.io.leishi.genshin.proto.AttributeType[message.sandsAttributes[j]] === undefined ? message.sandsAttributes[j] : $root.io.leishi.genshin.proto.AttributeType[message.sandsAttributes[j]] : message.sandsAttributes[j];
                        }
                        if (message.gobletAttributes && message.gobletAttributes.length) {
                            object.gobletAttributes = [];
                            for (var j = 0; j < message.gobletAttributes.length; ++j)
                                object.gobletAttributes[j] = options.enums === String ? $root.io.leishi.genshin.proto.AttributeType[message.gobletAttributes[j]] === undefined ? message.gobletAttributes[j] : $root.io.leishi.genshin.proto.AttributeType[message.gobletAttributes[j]] : message.gobletAttributes[j];
                        }
                        if (message.circletAttributes && message.circletAttributes.length) {
                            object.circletAttributes = [];
                            for (var j = 0; j < message.circletAttributes.length; ++j)
                                object.circletAttributes[j] = options.enums === String ? $root.io.leishi.genshin.proto.AttributeType[message.circletAttributes[j]] === undefined ? message.circletAttributes[j] : $root.io.leishi.genshin.proto.AttributeType[message.circletAttributes[j]] : message.circletAttributes[j];
                        }
                        if (message.subAttributes && message.subAttributes.length) {
                            object.subAttributes = [];
                            for (var j = 0; j < message.subAttributes.length; ++j)
                                object.subAttributes[j] = $root.io.leishi.genshin.proto.Attribute.toObject(message.subAttributes[j], options);
                        }
                        return object;
                    };

                    /**
                     * Converts this Build to JSON.
                     * @function toJSON
                     * @memberof io.leishi.genshin.proto.Build
                     * @instance
                     * @returns {Object.<string,*>} JSON object
                     */
                    Build.prototype.toJSON = function toJSON() {
                        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                    };

                    /**
                     * Gets the default type url for Build
                     * @function getTypeUrl
                     * @memberof io.leishi.genshin.proto.Build
                     * @static
                     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns {string} The default type url
                     */
                    Build.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                        if (typeUrlPrefix === undefined) {
                            typeUrlPrefix = "type.googleapis.com";
                        }
                        return typeUrlPrefix + "/io.leishi.genshin.proto.Build";
                    };

                    return Build;
                })();

                proto.SetCombo = (function() {

                    /**
                     * Properties of a SetCombo.
                     * @memberof io.leishi.genshin.proto
                     * @interface ISetCombo
                     * @property {io.leishi.genshin.proto.Set|null} [set] SetCombo set
                     * @property {number|null} [count] SetCombo count
                     */

                    /**
                     * Constructs a new SetCombo.
                     * @memberof io.leishi.genshin.proto
                     * @classdesc Represents a SetCombo.
                     * @implements ISetCombo
                     * @constructor
                     * @param {io.leishi.genshin.proto.ISetCombo=} [properties] Properties to set
                     */
                    function SetCombo(properties) {
                        if (properties)
                            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                                if (properties[keys[i]] != null)
                                    this[keys[i]] = properties[keys[i]];
                    }

                    /**
                     * SetCombo set.
                     * @member {io.leishi.genshin.proto.Set} set
                     * @memberof io.leishi.genshin.proto.SetCombo
                     * @instance
                     */
                    SetCombo.prototype.set = 0;

                    /**
                     * SetCombo count.
                     * @member {number} count
                     * @memberof io.leishi.genshin.proto.SetCombo
                     * @instance
                     */
                    SetCombo.prototype.count = 0;

                    /**
                     * Creates a new SetCombo instance using the specified properties.
                     * @function create
                     * @memberof io.leishi.genshin.proto.SetCombo
                     * @static
                     * @param {io.leishi.genshin.proto.ISetCombo=} [properties] Properties to set
                     * @returns {io.leishi.genshin.proto.SetCombo} SetCombo instance
                     */
                    SetCombo.create = function create(properties) {
                        return new SetCombo(properties);
                    };

                    /**
                     * Encodes the specified SetCombo message. Does not implicitly {@link io.leishi.genshin.proto.SetCombo.verify|verify} messages.
                     * @function encode
                     * @memberof io.leishi.genshin.proto.SetCombo
                     * @static
                     * @param {io.leishi.genshin.proto.ISetCombo} message SetCombo message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    SetCombo.encode = function encode(message, writer) {
                        if (!writer)
                            writer = $Writer.create();
                        if (message.set != null && Object.hasOwnProperty.call(message, "set"))
                            writer.uint32(/* id 1, wireType 0 =*/8).int32(message.set);
                        if (message.count != null && Object.hasOwnProperty.call(message, "count"))
                            writer.uint32(/* id 2, wireType 0 =*/16).int32(message.count);
                        return writer;
                    };

                    /**
                     * Encodes the specified SetCombo message, length delimited. Does not implicitly {@link io.leishi.genshin.proto.SetCombo.verify|verify} messages.
                     * @function encodeDelimited
                     * @memberof io.leishi.genshin.proto.SetCombo
                     * @static
                     * @param {io.leishi.genshin.proto.ISetCombo} message SetCombo message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    SetCombo.encodeDelimited = function encodeDelimited(message, writer) {
                        return this.encode(message, writer).ldelim();
                    };

                    /**
                     * Decodes a SetCombo message from the specified reader or buffer.
                     * @function decode
                     * @memberof io.leishi.genshin.proto.SetCombo
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @param {number} [length] Message length if known beforehand
                     * @returns {io.leishi.genshin.proto.SetCombo} SetCombo
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    SetCombo.decode = function decode(reader, length) {
                        if (!(reader instanceof $Reader))
                            reader = $Reader.create(reader);
                        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.io.leishi.genshin.proto.SetCombo();
                        while (reader.pos < end) {
                            var tag = reader.uint32();
                            switch (tag >>> 3) {
                            case 1: {
                                    message.set = reader.int32();
                                    break;
                                }
                            case 2: {
                                    message.count = reader.int32();
                                    break;
                                }
                            default:
                                reader.skipType(tag & 7);
                                break;
                            }
                        }
                        return message;
                    };

                    /**
                     * Decodes a SetCombo message from the specified reader or buffer, length delimited.
                     * @function decodeDelimited
                     * @memberof io.leishi.genshin.proto.SetCombo
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @returns {io.leishi.genshin.proto.SetCombo} SetCombo
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    SetCombo.decodeDelimited = function decodeDelimited(reader) {
                        if (!(reader instanceof $Reader))
                            reader = new $Reader(reader);
                        return this.decode(reader, reader.uint32());
                    };

                    /**
                     * Verifies a SetCombo message.
                     * @function verify
                     * @memberof io.leishi.genshin.proto.SetCombo
                     * @static
                     * @param {Object.<string,*>} message Plain object to verify
                     * @returns {string|null} `null` if valid, otherwise the reason why it is not
                     */
                    SetCombo.verify = function verify(message) {
                        if (typeof message !== "object" || message === null)
                            return "object expected";
                        if (message.set != null && message.hasOwnProperty("set"))
                            switch (message.set) {
                            default:
                                return "set: enum value expected";
                            case 0:
                            case 1:
                            case 2:
                            case 3:
                            case 4:
                            case 5:
                            case 6:
                            case 7:
                            case 8:
                            case 9:
                            case 10:
                            case 11:
                            case 12:
                            case 13:
                            case 14:
                            case 15:
                            case 16:
                            case 17:
                            case 18:
                            case 19:
                            case 20:
                            case 21:
                            case 22:
                            case 23:
                            case 24:
                            case 25:
                            case 26:
                            case 27:
                            case 28:
                            case 29:
                            case 30:
                            case 31:
                            case 32:
                            case 33:
                            case 34:
                            case 35:
                            case 36:
                            case 37:
                            case 38:
                            case 39:
                            case 40:
                                break;
                            }
                        if (message.count != null && message.hasOwnProperty("count"))
                            if (!$util.isInteger(message.count))
                                return "count: integer expected";
                        return null;
                    };

                    /**
                     * Creates a SetCombo message from a plain object. Also converts values to their respective internal types.
                     * @function fromObject
                     * @memberof io.leishi.genshin.proto.SetCombo
                     * @static
                     * @param {Object.<string,*>} object Plain object
                     * @returns {io.leishi.genshin.proto.SetCombo} SetCombo
                     */
                    SetCombo.fromObject = function fromObject(object) {
                        if (object instanceof $root.io.leishi.genshin.proto.SetCombo)
                            return object;
                        var message = new $root.io.leishi.genshin.proto.SetCombo();
                        switch (object.set) {
                        default:
                            if (typeof object.set === "number") {
                                message.set = object.set;
                                break;
                            }
                            break;
                        case "SET_UNSPECIFIED":
                        case 0:
                            message.set = 0;
                            break;
                        case "ARCHAIC_PETRA":
                        case 1:
                            message.set = 1;
                            break;
                        case "BERSERKER":
                        case 2:
                            message.set = 2;
                            break;
                        case "BLIZZARD_STRAYER":
                        case 3:
                            message.set = 3;
                            break;
                        case "BLOODSTAINED_CHIVALRY":
                        case 4:
                            message.set = 4;
                            break;
                        case "BRAVE_HEART":
                        case 5:
                            message.set = 5;
                            break;
                        case "CRIMSON_WITCH_OF_FLAMES":
                        case 6:
                            message.set = 6;
                            break;
                        case "DEEPWOOD_MEMORIES":
                        case 7:
                            message.set = 7;
                            break;
                        case "DEFENDERS_WILL":
                        case 8:
                            message.set = 8;
                            break;
                        case "DESERT_PAVILION_CHRONICLE":
                        case 9:
                            message.set = 9;
                            break;
                        case "ECHOES_OF_AN_OFFERING":
                        case 10:
                            message.set = 10;
                            break;
                        case "EMBLEM_OF_SEVERED_FATE":
                        case 11:
                            message.set = 11;
                            break;
                        case "FLOWER_OF_PARADISE_LOST":
                        case 12:
                            message.set = 12;
                            break;
                        case "GAMBLER":
                        case 13:
                            message.set = 13;
                            break;
                        case "GILDED_DREAMS":
                        case 14:
                            message.set = 14;
                            break;
                        case "GLADIATORS_FINALE":
                        case 15:
                            message.set = 15;
                            break;
                        case "HEART_OF_DEPTH":
                        case 16:
                            message.set = 16;
                            break;
                        case "HUSK_OF_OPULENT_DREAMS":
                        case 17:
                            message.set = 17;
                            break;
                        case "INSTRUCTOR":
                        case 18:
                            message.set = 18;
                            break;
                        case "LAVAWALKER":
                        case 19:
                            message.set = 19;
                            break;
                        case "MAIDEN_BELOVED":
                        case 20:
                            message.set = 20;
                            break;
                        case "MARTIAL_ARTIST":
                        case 21:
                            message.set = 21;
                            break;
                        case "NOBLESSE_OBLIGE":
                        case 22:
                            message.set = 22;
                            break;
                        case "OCEAN_HUED_CLAM":
                        case 23:
                            message.set = 23;
                            break;
                        case "PALE_FLAME":
                        case 24:
                            message.set = 24;
                            break;
                        case "PRAYERS_FOR_DESTINY":
                        case 25:
                            message.set = 25;
                            break;
                        case "PRAYERS_FOR_ILLUMINATION":
                        case 26:
                            message.set = 26;
                            break;
                        case "PRAYERS_FOR_WISDOM":
                        case 27:
                            message.set = 27;
                            break;
                        case "PRAYERS_TO_SPRINGTIME":
                        case 28:
                            message.set = 28;
                            break;
                        case "RESOLUTION_OF_SOJOURNER":
                        case 29:
                            message.set = 29;
                            break;
                        case "RETRACING_BOLIDE":
                        case 30:
                            message.set = 30;
                            break;
                        case "SCHOLAR":
                        case 31:
                            message.set = 31;
                            break;
                        case "SHIMENAWAS_REMINISCENCE":
                        case 32:
                            message.set = 32;
                            break;
                        case "TENACITY_OF_THE_MILLELITH":
                        case 33:
                            message.set = 33;
                            break;
                        case "THE_EXILE":
                        case 34:
                            message.set = 34;
                            break;
                        case "THUNDERING_FURY":
                        case 35:
                            message.set = 35;
                            break;
                        case "THUNDERSOOTHER":
                        case 36:
                            message.set = 36;
                            break;
                        case "TINY_MIRACLE":
                        case 37:
                            message.set = 37;
                            break;
                        case "VERMILLION_HEREAFTER":
                        case 38:
                            message.set = 38;
                            break;
                        case "VIRIDESCENT_VENERER":
                        case 39:
                            message.set = 39;
                            break;
                        case "WANDERERS_TROUPE":
                        case 40:
                            message.set = 40;
                            break;
                        }
                        if (object.count != null)
                            message.count = object.count | 0;
                        return message;
                    };

                    /**
                     * Creates a plain object from a SetCombo message. Also converts values to other types if specified.
                     * @function toObject
                     * @memberof io.leishi.genshin.proto.SetCombo
                     * @static
                     * @param {io.leishi.genshin.proto.SetCombo} message SetCombo
                     * @param {$protobuf.IConversionOptions} [options] Conversion options
                     * @returns {Object.<string,*>} Plain object
                     */
                    SetCombo.toObject = function toObject(message, options) {
                        if (!options)
                            options = {};
                        var object = {};
                        if (options.defaults) {
                            object.set = options.enums === String ? "SET_UNSPECIFIED" : 0;
                            object.count = 0;
                        }
                        if (message.set != null && message.hasOwnProperty("set"))
                            object.set = options.enums === String ? $root.io.leishi.genshin.proto.Set[message.set] === undefined ? message.set : $root.io.leishi.genshin.proto.Set[message.set] : message.set;
                        if (message.count != null && message.hasOwnProperty("count"))
                            object.count = message.count;
                        return object;
                    };

                    /**
                     * Converts this SetCombo to JSON.
                     * @function toJSON
                     * @memberof io.leishi.genshin.proto.SetCombo
                     * @instance
                     * @returns {Object.<string,*>} JSON object
                     */
                    SetCombo.prototype.toJSON = function toJSON() {
                        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                    };

                    /**
                     * Gets the default type url for SetCombo
                     * @function getTypeUrl
                     * @memberof io.leishi.genshin.proto.SetCombo
                     * @static
                     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns {string} The default type url
                     */
                    SetCombo.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                        if (typeUrlPrefix === undefined) {
                            typeUrlPrefix = "type.googleapis.com";
                        }
                        return typeUrlPrefix + "/io.leishi.genshin.proto.SetCombo";
                    };

                    return SetCombo;
                })();

                proto.Suit = (function() {

                    /**
                     * Properties of a Suit.
                     * @memberof io.leishi.genshin.proto
                     * @interface ISuit
                     * @property {Array.<io.leishi.genshin.proto.ISetCombo>|null} [setCombos] Suit setCombos
                     */

                    /**
                     * Constructs a new Suit.
                     * @memberof io.leishi.genshin.proto
                     * @classdesc Represents a Suit.
                     * @implements ISuit
                     * @constructor
                     * @param {io.leishi.genshin.proto.ISuit=} [properties] Properties to set
                     */
                    function Suit(properties) {
                        this.setCombos = [];
                        if (properties)
                            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                                if (properties[keys[i]] != null)
                                    this[keys[i]] = properties[keys[i]];
                    }

                    /**
                     * Suit setCombos.
                     * @member {Array.<io.leishi.genshin.proto.ISetCombo>} setCombos
                     * @memberof io.leishi.genshin.proto.Suit
                     * @instance
                     */
                    Suit.prototype.setCombos = $util.emptyArray;

                    /**
                     * Creates a new Suit instance using the specified properties.
                     * @function create
                     * @memberof io.leishi.genshin.proto.Suit
                     * @static
                     * @param {io.leishi.genshin.proto.ISuit=} [properties] Properties to set
                     * @returns {io.leishi.genshin.proto.Suit} Suit instance
                     */
                    Suit.create = function create(properties) {
                        return new Suit(properties);
                    };

                    /**
                     * Encodes the specified Suit message. Does not implicitly {@link io.leishi.genshin.proto.Suit.verify|verify} messages.
                     * @function encode
                     * @memberof io.leishi.genshin.proto.Suit
                     * @static
                     * @param {io.leishi.genshin.proto.ISuit} message Suit message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    Suit.encode = function encode(message, writer) {
                        if (!writer)
                            writer = $Writer.create();
                        if (message.setCombos != null && message.setCombos.length)
                            for (var i = 0; i < message.setCombos.length; ++i)
                                $root.io.leishi.genshin.proto.SetCombo.encode(message.setCombos[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                        return writer;
                    };

                    /**
                     * Encodes the specified Suit message, length delimited. Does not implicitly {@link io.leishi.genshin.proto.Suit.verify|verify} messages.
                     * @function encodeDelimited
                     * @memberof io.leishi.genshin.proto.Suit
                     * @static
                     * @param {io.leishi.genshin.proto.ISuit} message Suit message or plain object to encode
                     * @param {$protobuf.Writer} [writer] Writer to encode to
                     * @returns {$protobuf.Writer} Writer
                     */
                    Suit.encodeDelimited = function encodeDelimited(message, writer) {
                        return this.encode(message, writer).ldelim();
                    };

                    /**
                     * Decodes a Suit message from the specified reader or buffer.
                     * @function decode
                     * @memberof io.leishi.genshin.proto.Suit
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @param {number} [length] Message length if known beforehand
                     * @returns {io.leishi.genshin.proto.Suit} Suit
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    Suit.decode = function decode(reader, length) {
                        if (!(reader instanceof $Reader))
                            reader = $Reader.create(reader);
                        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.io.leishi.genshin.proto.Suit();
                        while (reader.pos < end) {
                            var tag = reader.uint32();
                            switch (tag >>> 3) {
                            case 1: {
                                    if (!(message.setCombos && message.setCombos.length))
                                        message.setCombos = [];
                                    message.setCombos.push($root.io.leishi.genshin.proto.SetCombo.decode(reader, reader.uint32()));
                                    break;
                                }
                            default:
                                reader.skipType(tag & 7);
                                break;
                            }
                        }
                        return message;
                    };

                    /**
                     * Decodes a Suit message from the specified reader or buffer, length delimited.
                     * @function decodeDelimited
                     * @memberof io.leishi.genshin.proto.Suit
                     * @static
                     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                     * @returns {io.leishi.genshin.proto.Suit} Suit
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    Suit.decodeDelimited = function decodeDelimited(reader) {
                        if (!(reader instanceof $Reader))
                            reader = new $Reader(reader);
                        return this.decode(reader, reader.uint32());
                    };

                    /**
                     * Verifies a Suit message.
                     * @function verify
                     * @memberof io.leishi.genshin.proto.Suit
                     * @static
                     * @param {Object.<string,*>} message Plain object to verify
                     * @returns {string|null} `null` if valid, otherwise the reason why it is not
                     */
                    Suit.verify = function verify(message) {
                        if (typeof message !== "object" || message === null)
                            return "object expected";
                        if (message.setCombos != null && message.hasOwnProperty("setCombos")) {
                            if (!Array.isArray(message.setCombos))
                                return "setCombos: array expected";
                            for (var i = 0; i < message.setCombos.length; ++i) {
                                var error = $root.io.leishi.genshin.proto.SetCombo.verify(message.setCombos[i]);
                                if (error)
                                    return "setCombos." + error;
                            }
                        }
                        return null;
                    };

                    /**
                     * Creates a Suit message from a plain object. Also converts values to their respective internal types.
                     * @function fromObject
                     * @memberof io.leishi.genshin.proto.Suit
                     * @static
                     * @param {Object.<string,*>} object Plain object
                     * @returns {io.leishi.genshin.proto.Suit} Suit
                     */
                    Suit.fromObject = function fromObject(object) {
                        if (object instanceof $root.io.leishi.genshin.proto.Suit)
                            return object;
                        var message = new $root.io.leishi.genshin.proto.Suit();
                        if (object.setCombos) {
                            if (!Array.isArray(object.setCombos))
                                throw TypeError(".io.leishi.genshin.proto.Suit.setCombos: array expected");
                            message.setCombos = [];
                            for (var i = 0; i < object.setCombos.length; ++i) {
                                if (typeof object.setCombos[i] !== "object")
                                    throw TypeError(".io.leishi.genshin.proto.Suit.setCombos: object expected");
                                message.setCombos[i] = $root.io.leishi.genshin.proto.SetCombo.fromObject(object.setCombos[i]);
                            }
                        }
                        return message;
                    };

                    /**
                     * Creates a plain object from a Suit message. Also converts values to other types if specified.
                     * @function toObject
                     * @memberof io.leishi.genshin.proto.Suit
                     * @static
                     * @param {io.leishi.genshin.proto.Suit} message Suit
                     * @param {$protobuf.IConversionOptions} [options] Conversion options
                     * @returns {Object.<string,*>} Plain object
                     */
                    Suit.toObject = function toObject(message, options) {
                        if (!options)
                            options = {};
                        var object = {};
                        if (options.arrays || options.defaults)
                            object.setCombos = [];
                        if (message.setCombos && message.setCombos.length) {
                            object.setCombos = [];
                            for (var j = 0; j < message.setCombos.length; ++j)
                                object.setCombos[j] = $root.io.leishi.genshin.proto.SetCombo.toObject(message.setCombos[j], options);
                        }
                        return object;
                    };

                    /**
                     * Converts this Suit to JSON.
                     * @function toJSON
                     * @memberof io.leishi.genshin.proto.Suit
                     * @instance
                     * @returns {Object.<string,*>} JSON object
                     */
                    Suit.prototype.toJSON = function toJSON() {
                        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                    };

                    /**
                     * Gets the default type url for Suit
                     * @function getTypeUrl
                     * @memberof io.leishi.genshin.proto.Suit
                     * @static
                     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns {string} The default type url
                     */
                    Suit.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                        if (typeUrlPrefix === undefined) {
                            typeUrlPrefix = "type.googleapis.com";
                        }
                        return typeUrlPrefix + "/io.leishi.genshin.proto.Suit";
                    };

                    return Suit;
                })();

                /**
                 * WeaponType enum.
                 * @name io.leishi.genshin.proto.WeaponType
                 * @enum {number}
                 * @property {number} WEAPON_TYPE_UNSPECIFIED=0 WEAPON_TYPE_UNSPECIFIED value
                 * @property {number} BOW=1 BOW value
                 * @property {number} CLAYMORE=2 CLAYMORE value
                 * @property {number} CATALYST=3 CATALYST value
                 * @property {number} POLEARM=4 POLEARM value
                 * @property {number} SWORD=5 SWORD value
                 */
                proto.WeaponType = (function() {
                    var valuesById = {}, values = Object.create(valuesById);
                    values[valuesById[0] = "WEAPON_TYPE_UNSPECIFIED"] = 0;
                    values[valuesById[1] = "BOW"] = 1;
                    values[valuesById[2] = "CLAYMORE"] = 2;
                    values[valuesById[3] = "CATALYST"] = 3;
                    values[valuesById[4] = "POLEARM"] = 4;
                    values[valuesById[5] = "SWORD"] = 5;
                    return values;
                })();

                /**
                 * Weapon enum.
                 * @name io.leishi.genshin.proto.Weapon
                 * @enum {number}
                 * @property {number} WEAPON_UNSPECIFIED=0 WEAPON_UNSPECIFIED value
                 * @property {number} AKUOUMARU=1 AKUOUMARU value
                 * @property {number} ALLEY_HUNTER=2 ALLEY_HUNTER value
                 * @property {number} AMENOMA_KAGEUCHI=3 AMENOMA_KAGEUCHI value
                 * @property {number} AMOS_BOW=4 AMOS_BOW value
                 * @property {number} APPRENTICES_NOTES=5 APPRENTICES_NOTES value
                 * @property {number} AQUA_SIMULACRA=6 AQUA_SIMULACRA value
                 * @property {number} AQUILA_FAVONIA=7 AQUILA_FAVONIA value
                 * @property {number} A_THOUSAND_FLOATING_DREAMS=8 A_THOUSAND_FLOATING_DREAMS value
                 * @property {number} BEGINNERS_PROTECTOR=9 BEGINNERS_PROTECTOR value
                 * @property {number} BLACKCLIFF_AGATE=10 BLACKCLIFF_AGATE value
                 * @property {number} BLACKCLIFF_LONGSWORD=11 BLACKCLIFF_LONGSWORD value
                 * @property {number} BLACKCLIFF_POLE=12 BLACKCLIFF_POLE value
                 * @property {number} BLACKCLIFF_SLASHER=13 BLACKCLIFF_SLASHER value
                 * @property {number} BLACKCLIFF_WARBOW=14 BLACKCLIFF_WARBOW value
                 * @property {number} BLACK_TASSEL=15 BLACK_TASSEL value
                 * @property {number} BLOODTAINTED_GREATSWORD=16 BLOODTAINTED_GREATSWORD value
                 * @property {number} CALAMITY_QUELLER=17 CALAMITY_QUELLER value
                 * @property {number} CINNABAR_SPINDLE=18 CINNABAR_SPINDLE value
                 * @property {number} COMPOUND_BOW=19 COMPOUND_BOW value
                 * @property {number} COOL_STEEL=20 COOL_STEEL value
                 * @property {number} CRESCENT_PIKE=21 CRESCENT_PIKE value
                 * @property {number} DARK_IRON_SWORD=22 DARK_IRON_SWORD value
                 * @property {number} DEATHMATCH=23 DEATHMATCH value
                 * @property {number} DEBATE_CLUB=24 DEBATE_CLUB value
                 * @property {number} DODOCO_TALES=25 DODOCO_TALES value
                 * @property {number} DRAGONS_BANE=26 DRAGONS_BANE value
                 * @property {number} DRAGONSPINE_SPEAR=27 DRAGONSPINE_SPEAR value
                 * @property {number} DULL_BLADE=28 DULL_BLADE value
                 * @property {number} ELEGY_FOR_THE_END=29 ELEGY_FOR_THE_END value
                 * @property {number} EMERALD_ORB=30 EMERALD_ORB value
                 * @property {number} END_OF_THE_LINE=31 END_OF_THE_LINE value
                 * @property {number} ENGULFING_LIGHTNING=32 ENGULFING_LIGHTNING value
                 * @property {number} EVERLASTING_MOONGLOW=33 EVERLASTING_MOONGLOW value
                 * @property {number} EYE_OF_PERCEPTION=34 EYE_OF_PERCEPTION value
                 * @property {number} FADING_TWILIGHT=35 FADING_TWILIGHT value
                 * @property {number} FAVONIUS_CODEX=36 FAVONIUS_CODEX value
                 * @property {number} FAVONIUS_GREATSWORD=37 FAVONIUS_GREATSWORD value
                 * @property {number} FAVONIUS_LANCE=38 FAVONIUS_LANCE value
                 * @property {number} FAVONIUS_SWORD=39 FAVONIUS_SWORD value
                 * @property {number} FAVONIUS_WARBOW=40 FAVONIUS_WARBOW value
                 * @property {number} FERROUS_SHADOW=41 FERROUS_SHADOW value
                 * @property {number} FESTERING_DESIRE=42 FESTERING_DESIRE value
                 * @property {number} FILLET_BLADE=43 FILLET_BLADE value
                 * @property {number} FOREST_REGALIA=44 FOREST_REGALIA value
                 * @property {number} FREEDOM_SWORN=45 FREEDOM_SWORN value
                 * @property {number} FROSTBEARER=46 FROSTBEARER value
                 * @property {number} FRUIT_OF_FULFILLMENT=47 FRUIT_OF_FULFILLMENT value
                 * @property {number} HAKUSHIN_RING=48 HAKUSHIN_RING value
                 * @property {number} HALBERD=49 HALBERD value
                 * @property {number} HAMAYUMI=50 HAMAYUMI value
                 * @property {number} HARAN_GEPPAKU_FUTSU=51 HARAN_GEPPAKU_FUTSU value
                 * @property {number} HARBINGER_OF_DAWN=52 HARBINGER_OF_DAWN value
                 * @property {number} HUNTERS_BOW=53 HUNTERS_BOW value
                 * @property {number} HUNTERS_PATH=54 HUNTERS_PATH value
                 * @property {number} IRON_POINT=55 IRON_POINT value
                 * @property {number} IRON_STING=56 IRON_STING value
                 * @property {number} KAGOTSURUBE_ISSHIN=57 KAGOTSURUBE_ISSHIN value
                 * @property {number} KAGURAS_VERITY=58 KAGURAS_VERITY value
                 * @property {number} KATSURAGIKIRI_NAGAMASA=59 KATSURAGIKIRI_NAGAMASA value
                 * @property {number} KEY_OF_KHAJ_NISUT=60 KEY_OF_KHAJ_NISUT value
                 * @property {number} KINGS_SQUIRE=61 KINGS_SQUIRE value
                 * @property {number} KITAIN_CROSS_SPEAR=62 KITAIN_CROSS_SPEAR value
                 * @property {number} LIONS_ROAR=63 LIONS_ROAR value
                 * @property {number} LITHIC_BLADE=64 LITHIC_BLADE value
                 * @property {number} LITHIC_SPEAR=65 LITHIC_SPEAR value
                 * @property {number} LOST_PRAYER_TO_THE_SACRED_WINDS=66 LOST_PRAYER_TO_THE_SACRED_WINDS value
                 * @property {number} LUXURIOUS_SEA_LORD=67 LUXURIOUS_SEA_LORD value
                 * @property {number} MAGIC_GUIDE=68 MAGIC_GUIDE value
                 * @property {number} MAKHAIRA_AQUAMARINE=69 MAKHAIRA_AQUAMARINE value
                 * @property {number} MAPPA_MARE=70 MAPPA_MARE value
                 * @property {number} MEMORY_OF_DUST=71 MEMORY_OF_DUST value
                 * @property {number} MESSENGER=72 MESSENGER value
                 * @property {number} MISSIVE_WINDSPEAR=73 MISSIVE_WINDSPEAR value
                 * @property {number} MISTSPLITTER_REFORGED=74 MISTSPLITTER_REFORGED value
                 * @property {number} MITTERNACHTS_WALTZ=75 MITTERNACHTS_WALTZ value
                 * @property {number} MOONPIERCER=76 MOONPIERCER value
                 * @property {number} MOUUNS_MOON=77 MOUUNS_MOON value
                 * @property {number} OATHSWORN_EYE=78 OATHSWORN_EYE value
                 * @property {number} OLD_MERCS_PAL=79 OLD_MERCS_PAL value
                 * @property {number} OTHERWORLDLY_STORY=80 OTHERWORLDLY_STORY value
                 * @property {number} POCKET_GRIMOIRE=81 POCKET_GRIMOIRE value
                 * @property {number} POLAR_STAR=82 POLAR_STAR value
                 * @property {number} PREDATOR=83 PREDATOR value
                 * @property {number} PRIMORDIAL_JADE_CUTTER=84 PRIMORDIAL_JADE_CUTTER value
                 * @property {number} PRIMORDIAL_JADE_WINGED_SPEAR=85 PRIMORDIAL_JADE_WINGED_SPEAR value
                 * @property {number} PRIZED_ISSHIN_BLADE=86 PRIZED_ISSHIN_BLADE value
                 * @property {number} PROTOTYPE_AMBER=87 PROTOTYPE_AMBER value
                 * @property {number} PROTOTYPE_ARCHAIC=88 PROTOTYPE_ARCHAIC value
                 * @property {number} PROTOTYPE_CRESCENT=89 PROTOTYPE_CRESCENT value
                 * @property {number} PROTOTYPE_RANCOUR=90 PROTOTYPE_RANCOUR value
                 * @property {number} PROTOTYPE_STARGLITTER=91 PROTOTYPE_STARGLITTER value
                 * @property {number} RAINSLASHER=92 RAINSLASHER value
                 * @property {number} RAVEN_BOW=93 RAVEN_BOW value
                 * @property {number} RECURVE_BOW=94 RECURVE_BOW value
                 * @property {number} REDHORN_STONETHRESHER=95 REDHORN_STONETHRESHER value
                 * @property {number} ROYAL_BOW=96 ROYAL_BOW value
                 * @property {number} ROYAL_GREATSWORD=97 ROYAL_GREATSWORD value
                 * @property {number} ROYAL_GRIMOIRE=98 ROYAL_GRIMOIRE value
                 * @property {number} ROYAL_LONGSWORD=99 ROYAL_LONGSWORD value
                 * @property {number} ROYAL_SPEAR=100 ROYAL_SPEAR value
                 * @property {number} RUST=101 RUST value
                 * @property {number} SACRIFICIAL_BOW=102 SACRIFICIAL_BOW value
                 * @property {number} SACRIFICIAL_FRAGMENTS=103 SACRIFICIAL_FRAGMENTS value
                 * @property {number} SACRIFICIAL_GREATSWORD=104 SACRIFICIAL_GREATSWORD value
                 * @property {number} SACRIFICIAL_SWORD=105 SACRIFICIAL_SWORD value
                 * @property {number} SAPWOOD_BLADE=106 SAPWOOD_BLADE value
                 * @property {number} SEASONED_HUNTERS_BOW=107 SEASONED_HUNTERS_BOW value
                 * @property {number} SERPENT_SPINE=108 SERPENT_SPINE value
                 * @property {number} SHARPSHOOTERS_OATH=109 SHARPSHOOTERS_OATH value
                 * @property {number} SILVER_SWORD=110 SILVER_SWORD value
                 * @property {number} SKYRIDER_GREATSWORD=111 SKYRIDER_GREATSWORD value
                 * @property {number} SKYRIDER_SWORD=112 SKYRIDER_SWORD value
                 * @property {number} SKYWARD_ATLAS=113 SKYWARD_ATLAS value
                 * @property {number} SKYWARD_BLADE=114 SKYWARD_BLADE value
                 * @property {number} SKYWARD_HARP=115 SKYWARD_HARP value
                 * @property {number} SKYWARD_PRIDE=116 SKYWARD_PRIDE value
                 * @property {number} SKYWARD_SPINE=117 SKYWARD_SPINE value
                 * @property {number} SLINGSHOT=118 SLINGSHOT value
                 * @property {number} SNOW_TOMBED_STARSILVER=119 SNOW_TOMBED_STARSILVER value
                 * @property {number} SOLAR_PEARL=120 SOLAR_PEARL value
                 * @property {number} SONG_OF_BROKEN_PINES=121 SONG_OF_BROKEN_PINES value
                 * @property {number} STAFF_OF_HOMA=122 STAFF_OF_HOMA value
                 * @property {number} STAFF_OF_THE_SCARLET_SANDS=123 STAFF_OF_THE_SCARLET_SANDS value
                 * @property {number} SUMMIT_SHAPER=124 SUMMIT_SHAPER value
                 * @property {number} SWORD_OF_DESCENSION=125 SWORD_OF_DESCENSION value
                 * @property {number} THE_ALLEY_FLASH=126 THE_ALLEY_FLASH value
                 * @property {number} THE_BELL=127 THE_BELL value
                 * @property {number} THE_BLACK_SWORD=128 THE_BLACK_SWORD value
                 * @property {number} THE_CATCH=129 THE_CATCH value
                 * @property {number} THE_FLUTE=130 THE_FLUTE value
                 * @property {number} THE_STRINGLESS=131 THE_STRINGLESS value
                 * @property {number} THE_UNFORGED=132 THE_UNFORGED value
                 * @property {number} THE_VIRIDESCENT_HUNT=133 THE_VIRIDESCENT_HUNT value
                 * @property {number} THE_WIDSITH=134 THE_WIDSITH value
                 * @property {number} THRILLING_TALES_OF_DRAGON_SLAYERS=135 THRILLING_TALES_OF_DRAGON_SLAYERS value
                 * @property {number} THUNDERING_PULSE=136 THUNDERING_PULSE value
                 * @property {number} TOUKABOU_SHIGURE=137 TOUKABOU_SHIGURE value
                 * @property {number} TRAVELERS_HANDY_SWORD=138 TRAVELERS_HANDY_SWORD value
                 * @property {number} TULAYTULLAHS_REMEMBRANCE=139 TULAYTULLAHS_REMEMBRANCE value
                 * @property {number} TWIN_NEPHRITE=140 TWIN_NEPHRITE value
                 * @property {number} VORTEX_VANQUISHER=141 VORTEX_VANQUISHER value
                 * @property {number} WANDERING_EVENSTAR=142 WANDERING_EVENSTAR value
                 * @property {number} WASTER_GREATSWORD=143 WASTER_GREATSWORD value
                 * @property {number} WAVEBREAKERS_FIN=144 WAVEBREAKERS_FIN value
                 * @property {number} WHITEBLIND=145 WHITEBLIND value
                 * @property {number} WHITE_IRON_GREATSWORD=146 WHITE_IRON_GREATSWORD value
                 * @property {number} WHITE_TASSEL=147 WHITE_TASSEL value
                 * @property {number} WINDBLUME_ODE=148 WINDBLUME_ODE value
                 * @property {number} WINE_AND_SONG=149 WINE_AND_SONG value
                 * @property {number} WOLFS_GRAVESTONE=150 WOLFS_GRAVESTONE value
                 * @property {number} XIPHOS_MOONLIGHT=151 XIPHOS_MOONLIGHT value
                 * @property {number} LIGHT_OF_FOLIAR_INCISION=152 LIGHT_OF_FOLIAR_INCISION value
                 */
                proto.Weapon = (function() {
                    var valuesById = {}, values = Object.create(valuesById);
                    values[valuesById[0] = "WEAPON_UNSPECIFIED"] = 0;
                    values[valuesById[1] = "AKUOUMARU"] = 1;
                    values[valuesById[2] = "ALLEY_HUNTER"] = 2;
                    values[valuesById[3] = "AMENOMA_KAGEUCHI"] = 3;
                    values[valuesById[4] = "AMOS_BOW"] = 4;
                    values[valuesById[5] = "APPRENTICES_NOTES"] = 5;
                    values[valuesById[6] = "AQUA_SIMULACRA"] = 6;
                    values[valuesById[7] = "AQUILA_FAVONIA"] = 7;
                    values[valuesById[8] = "A_THOUSAND_FLOATING_DREAMS"] = 8;
                    values[valuesById[9] = "BEGINNERS_PROTECTOR"] = 9;
                    values[valuesById[10] = "BLACKCLIFF_AGATE"] = 10;
                    values[valuesById[11] = "BLACKCLIFF_LONGSWORD"] = 11;
                    values[valuesById[12] = "BLACKCLIFF_POLE"] = 12;
                    values[valuesById[13] = "BLACKCLIFF_SLASHER"] = 13;
                    values[valuesById[14] = "BLACKCLIFF_WARBOW"] = 14;
                    values[valuesById[15] = "BLACK_TASSEL"] = 15;
                    values[valuesById[16] = "BLOODTAINTED_GREATSWORD"] = 16;
                    values[valuesById[17] = "CALAMITY_QUELLER"] = 17;
                    values[valuesById[18] = "CINNABAR_SPINDLE"] = 18;
                    values[valuesById[19] = "COMPOUND_BOW"] = 19;
                    values[valuesById[20] = "COOL_STEEL"] = 20;
                    values[valuesById[21] = "CRESCENT_PIKE"] = 21;
                    values[valuesById[22] = "DARK_IRON_SWORD"] = 22;
                    values[valuesById[23] = "DEATHMATCH"] = 23;
                    values[valuesById[24] = "DEBATE_CLUB"] = 24;
                    values[valuesById[25] = "DODOCO_TALES"] = 25;
                    values[valuesById[26] = "DRAGONS_BANE"] = 26;
                    values[valuesById[27] = "DRAGONSPINE_SPEAR"] = 27;
                    values[valuesById[28] = "DULL_BLADE"] = 28;
                    values[valuesById[29] = "ELEGY_FOR_THE_END"] = 29;
                    values[valuesById[30] = "EMERALD_ORB"] = 30;
                    values[valuesById[31] = "END_OF_THE_LINE"] = 31;
                    values[valuesById[32] = "ENGULFING_LIGHTNING"] = 32;
                    values[valuesById[33] = "EVERLASTING_MOONGLOW"] = 33;
                    values[valuesById[34] = "EYE_OF_PERCEPTION"] = 34;
                    values[valuesById[35] = "FADING_TWILIGHT"] = 35;
                    values[valuesById[36] = "FAVONIUS_CODEX"] = 36;
                    values[valuesById[37] = "FAVONIUS_GREATSWORD"] = 37;
                    values[valuesById[38] = "FAVONIUS_LANCE"] = 38;
                    values[valuesById[39] = "FAVONIUS_SWORD"] = 39;
                    values[valuesById[40] = "FAVONIUS_WARBOW"] = 40;
                    values[valuesById[41] = "FERROUS_SHADOW"] = 41;
                    values[valuesById[42] = "FESTERING_DESIRE"] = 42;
                    values[valuesById[43] = "FILLET_BLADE"] = 43;
                    values[valuesById[44] = "FOREST_REGALIA"] = 44;
                    values[valuesById[45] = "FREEDOM_SWORN"] = 45;
                    values[valuesById[46] = "FROSTBEARER"] = 46;
                    values[valuesById[47] = "FRUIT_OF_FULFILLMENT"] = 47;
                    values[valuesById[48] = "HAKUSHIN_RING"] = 48;
                    values[valuesById[49] = "HALBERD"] = 49;
                    values[valuesById[50] = "HAMAYUMI"] = 50;
                    values[valuesById[51] = "HARAN_GEPPAKU_FUTSU"] = 51;
                    values[valuesById[52] = "HARBINGER_OF_DAWN"] = 52;
                    values[valuesById[53] = "HUNTERS_BOW"] = 53;
                    values[valuesById[54] = "HUNTERS_PATH"] = 54;
                    values[valuesById[55] = "IRON_POINT"] = 55;
                    values[valuesById[56] = "IRON_STING"] = 56;
                    values[valuesById[57] = "KAGOTSURUBE_ISSHIN"] = 57;
                    values[valuesById[58] = "KAGURAS_VERITY"] = 58;
                    values[valuesById[59] = "KATSURAGIKIRI_NAGAMASA"] = 59;
                    values[valuesById[60] = "KEY_OF_KHAJ_NISUT"] = 60;
                    values[valuesById[61] = "KINGS_SQUIRE"] = 61;
                    values[valuesById[62] = "KITAIN_CROSS_SPEAR"] = 62;
                    values[valuesById[63] = "LIONS_ROAR"] = 63;
                    values[valuesById[64] = "LITHIC_BLADE"] = 64;
                    values[valuesById[65] = "LITHIC_SPEAR"] = 65;
                    values[valuesById[66] = "LOST_PRAYER_TO_THE_SACRED_WINDS"] = 66;
                    values[valuesById[67] = "LUXURIOUS_SEA_LORD"] = 67;
                    values[valuesById[68] = "MAGIC_GUIDE"] = 68;
                    values[valuesById[69] = "MAKHAIRA_AQUAMARINE"] = 69;
                    values[valuesById[70] = "MAPPA_MARE"] = 70;
                    values[valuesById[71] = "MEMORY_OF_DUST"] = 71;
                    values[valuesById[72] = "MESSENGER"] = 72;
                    values[valuesById[73] = "MISSIVE_WINDSPEAR"] = 73;
                    values[valuesById[74] = "MISTSPLITTER_REFORGED"] = 74;
                    values[valuesById[75] = "MITTERNACHTS_WALTZ"] = 75;
                    values[valuesById[76] = "MOONPIERCER"] = 76;
                    values[valuesById[77] = "MOUUNS_MOON"] = 77;
                    values[valuesById[78] = "OATHSWORN_EYE"] = 78;
                    values[valuesById[79] = "OLD_MERCS_PAL"] = 79;
                    values[valuesById[80] = "OTHERWORLDLY_STORY"] = 80;
                    values[valuesById[81] = "POCKET_GRIMOIRE"] = 81;
                    values[valuesById[82] = "POLAR_STAR"] = 82;
                    values[valuesById[83] = "PREDATOR"] = 83;
                    values[valuesById[84] = "PRIMORDIAL_JADE_CUTTER"] = 84;
                    values[valuesById[85] = "PRIMORDIAL_JADE_WINGED_SPEAR"] = 85;
                    values[valuesById[86] = "PRIZED_ISSHIN_BLADE"] = 86;
                    values[valuesById[87] = "PROTOTYPE_AMBER"] = 87;
                    values[valuesById[88] = "PROTOTYPE_ARCHAIC"] = 88;
                    values[valuesById[89] = "PROTOTYPE_CRESCENT"] = 89;
                    values[valuesById[90] = "PROTOTYPE_RANCOUR"] = 90;
                    values[valuesById[91] = "PROTOTYPE_STARGLITTER"] = 91;
                    values[valuesById[92] = "RAINSLASHER"] = 92;
                    values[valuesById[93] = "RAVEN_BOW"] = 93;
                    values[valuesById[94] = "RECURVE_BOW"] = 94;
                    values[valuesById[95] = "REDHORN_STONETHRESHER"] = 95;
                    values[valuesById[96] = "ROYAL_BOW"] = 96;
                    values[valuesById[97] = "ROYAL_GREATSWORD"] = 97;
                    values[valuesById[98] = "ROYAL_GRIMOIRE"] = 98;
                    values[valuesById[99] = "ROYAL_LONGSWORD"] = 99;
                    values[valuesById[100] = "ROYAL_SPEAR"] = 100;
                    values[valuesById[101] = "RUST"] = 101;
                    values[valuesById[102] = "SACRIFICIAL_BOW"] = 102;
                    values[valuesById[103] = "SACRIFICIAL_FRAGMENTS"] = 103;
                    values[valuesById[104] = "SACRIFICIAL_GREATSWORD"] = 104;
                    values[valuesById[105] = "SACRIFICIAL_SWORD"] = 105;
                    values[valuesById[106] = "SAPWOOD_BLADE"] = 106;
                    values[valuesById[107] = "SEASONED_HUNTERS_BOW"] = 107;
                    values[valuesById[108] = "SERPENT_SPINE"] = 108;
                    values[valuesById[109] = "SHARPSHOOTERS_OATH"] = 109;
                    values[valuesById[110] = "SILVER_SWORD"] = 110;
                    values[valuesById[111] = "SKYRIDER_GREATSWORD"] = 111;
                    values[valuesById[112] = "SKYRIDER_SWORD"] = 112;
                    values[valuesById[113] = "SKYWARD_ATLAS"] = 113;
                    values[valuesById[114] = "SKYWARD_BLADE"] = 114;
                    values[valuesById[115] = "SKYWARD_HARP"] = 115;
                    values[valuesById[116] = "SKYWARD_PRIDE"] = 116;
                    values[valuesById[117] = "SKYWARD_SPINE"] = 117;
                    values[valuesById[118] = "SLINGSHOT"] = 118;
                    values[valuesById[119] = "SNOW_TOMBED_STARSILVER"] = 119;
                    values[valuesById[120] = "SOLAR_PEARL"] = 120;
                    values[valuesById[121] = "SONG_OF_BROKEN_PINES"] = 121;
                    values[valuesById[122] = "STAFF_OF_HOMA"] = 122;
                    values[valuesById[123] = "STAFF_OF_THE_SCARLET_SANDS"] = 123;
                    values[valuesById[124] = "SUMMIT_SHAPER"] = 124;
                    values[valuesById[125] = "SWORD_OF_DESCENSION"] = 125;
                    values[valuesById[126] = "THE_ALLEY_FLASH"] = 126;
                    values[valuesById[127] = "THE_BELL"] = 127;
                    values[valuesById[128] = "THE_BLACK_SWORD"] = 128;
                    values[valuesById[129] = "THE_CATCH"] = 129;
                    values[valuesById[130] = "THE_FLUTE"] = 130;
                    values[valuesById[131] = "THE_STRINGLESS"] = 131;
                    values[valuesById[132] = "THE_UNFORGED"] = 132;
                    values[valuesById[133] = "THE_VIRIDESCENT_HUNT"] = 133;
                    values[valuesById[134] = "THE_WIDSITH"] = 134;
                    values[valuesById[135] = "THRILLING_TALES_OF_DRAGON_SLAYERS"] = 135;
                    values[valuesById[136] = "THUNDERING_PULSE"] = 136;
                    values[valuesById[137] = "TOUKABOU_SHIGURE"] = 137;
                    values[valuesById[138] = "TRAVELERS_HANDY_SWORD"] = 138;
                    values[valuesById[139] = "TULAYTULLAHS_REMEMBRANCE"] = 139;
                    values[valuesById[140] = "TWIN_NEPHRITE"] = 140;
                    values[valuesById[141] = "VORTEX_VANQUISHER"] = 141;
                    values[valuesById[142] = "WANDERING_EVENSTAR"] = 142;
                    values[valuesById[143] = "WASTER_GREATSWORD"] = 143;
                    values[valuesById[144] = "WAVEBREAKERS_FIN"] = 144;
                    values[valuesById[145] = "WHITEBLIND"] = 145;
                    values[valuesById[146] = "WHITE_IRON_GREATSWORD"] = 146;
                    values[valuesById[147] = "WHITE_TASSEL"] = 147;
                    values[valuesById[148] = "WINDBLUME_ODE"] = 148;
                    values[valuesById[149] = "WINE_AND_SONG"] = 149;
                    values[valuesById[150] = "WOLFS_GRAVESTONE"] = 150;
                    values[valuesById[151] = "XIPHOS_MOONLIGHT"] = 151;
                    values[valuesById[152] = "LIGHT_OF_FOLIAR_INCISION"] = 152;
                    return values;
                })();

                return proto;
            })();

            return genshin;
        })();

        return leishi;
    })();

    return io;
})();

module.exports = $root;
