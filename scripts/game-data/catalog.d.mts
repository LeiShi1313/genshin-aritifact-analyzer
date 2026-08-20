export interface GameDataSource {
  readonly id: string;
  readonly role: string;
  readonly version?: string;
  readonly revision?: string;
  readonly gameVersion?: string;
}

export interface CatalogStatResult {
  readonly ascension: number;
  readonly hp?: number;
  readonly attack?: number;
  readonly defense?: number;
  readonly specialized?: number;
}

export type CatalogStatFunction = (
  level: number,
  ascension: number
) => CatalogStatResult;

export interface CatalogIdentity {
  readonly key: string;
  readonly gameId: number;
  readonly name: string;
}

export interface CatalogProgression {
  readonly specializedStat: string | null;
  readonly stats: CatalogStatFunction;
}

export interface CharacterCatalogRecord extends CatalogIdentity {
  readonly sourceId?: string;
  readonly translations: Readonly<Record<string, string>>;
  readonly element: string;
  readonly weaponType: string;
  readonly rarity: number;
  readonly images: {
    readonly filenameIcon?: string;
    readonly filenameGachaSplash?: string;
    readonly iconUrls?: readonly string[];
    readonly gachaUrls?: readonly string[];
  };
  readonly progression: CatalogProgression & {
    readonly specializedStat: string;
  };
}

export interface WeaponCatalogRecord extends CatalogIdentity {
  readonly sourceId?: string;
  readonly translations: Readonly<Record<string, string>>;
  readonly weaponType: string;
  readonly rarity: number;
  readonly images: {
    readonly filenameIcon?: string;
    readonly filenameAwakenIcon?: string;
    readonly iconUrls?: readonly string[];
    readonly awakenUrls?: readonly string[];
  };
  readonly progression: CatalogProgression;
}

export interface ArtifactSetCatalogRecord extends CatalogIdentity {
  readonly sourceId?: string;
  readonly translations: Readonly<Record<string, string>>;
  readonly effects: {
    readonly twoPiece: string;
    readonly fourPiece: string;
  };
  readonly images: Readonly<Record<string, string>>;
  readonly imageUrls?: Readonly<Record<string, readonly string[]>>;
}

export interface GameDataProvider {
  readonly source: GameDataSource;
  readonly characters: readonly CharacterCatalogRecord[];
  readonly weapons: readonly WeaponCatalogRecord[];
  readonly artifactSets: readonly ArtifactSetCatalogRecord[];
}

export interface GameDataCatalog {
  readonly manifest: {
    readonly schemaVersion: 1;
    readonly gameVersion: string;
    readonly sources: readonly GameDataSource[];
  };
  readonly characters: readonly CharacterCatalogRecord[];
  readonly weapons: readonly WeaponCatalogRecord[];
  readonly artifactSets: readonly ArtifactSetCatalogRecord[];
}

export interface FallbackSnapshot {
  readonly schemaVersion: 1;
  readonly gameVersion: string;
  readonly sources: readonly GameDataSource[];
  readonly characters: readonly unknown[];
  readonly weapons: readonly unknown[];
  readonly artifactSets: readonly unknown[];
}

export function createGenshinDbProvider(options?: {
  readonly includeTranslations?: boolean;
}): GameDataProvider;

export function createGameDataCatalog(options?: {
  readonly fallbackSnapshot?: unknown;
  readonly includeTranslations?: boolean;
}): GameDataCatalog;

export function loadFallbackSnapshot(): FallbackSnapshot;
export function validateFallbackSnapshot(input: unknown): FallbackSnapshot;
export function mergeCatalogProviders(
  primaryInput: GameDataProvider,
  fallbackInput: GameDataProvider
): Omit<GameDataCatalog, "manifest"> & {
  readonly sources: readonly GameDataSource[];
};
