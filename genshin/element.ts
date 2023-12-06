/* eslint-disable */

export const protobufPackage = "io.leishi.genshin.proto";

export enum Element {
  ELEMENT_UNSPECIFIED = 0,
  ANEMO = 1,
  CRYO = 2,
  ELECTRO = 3,
  GEO = 4,
  HYDRO = 5,
  PHYSICAL = 6,
  PYRO = 7,
  DENDRO = 8,
  UNRECOGNIZED = -1,
}

export function elementFromJSON(object: any): Element {
  switch (object) {
    case 0:
    case "ELEMENT_UNSPECIFIED":
      return Element.ELEMENT_UNSPECIFIED;
    case 1:
    case "ANEMO":
      return Element.ANEMO;
    case 2:
    case "CRYO":
      return Element.CRYO;
    case 3:
    case "ELECTRO":
      return Element.ELECTRO;
    case 4:
    case "GEO":
      return Element.GEO;
    case 5:
    case "HYDRO":
      return Element.HYDRO;
    case 6:
    case "PHYSICAL":
      return Element.PHYSICAL;
    case 7:
    case "PYRO":
      return Element.PYRO;
    case 8:
    case "DENDRO":
      return Element.DENDRO;
    case -1:
    case "UNRECOGNIZED":
    default:
      return Element.UNRECOGNIZED;
  }
}

export function elementToJSON(object: Element): string {
  switch (object) {
    case Element.ELEMENT_UNSPECIFIED:
      return "ELEMENT_UNSPECIFIED";
    case Element.ANEMO:
      return "ANEMO";
    case Element.CRYO:
      return "CRYO";
    case Element.ELECTRO:
      return "ELECTRO";
    case Element.GEO:
      return "GEO";
    case Element.HYDRO:
      return "HYDRO";
    case Element.PHYSICAL:
      return "PHYSICAL";
    case Element.PYRO:
      return "PYRO";
    case Element.DENDRO:
      return "DENDRO";
    case Element.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}
