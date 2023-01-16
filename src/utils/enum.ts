export const enumToIdx = (enumObj: any) =>
  Object.keys(enumObj)
    .filter((key) => !isNaN(Number(key)) && Number(key) > 0)
    .map((key) => Number(key));


export const enumToStringKey = (enumObj: any) =>
  Object.keys(enumObj)
    .filter((key) => isNaN(Number(key)))