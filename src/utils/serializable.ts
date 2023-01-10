export interface Serializable<T> {
    deserializeFromMona(input: string | Object): T;
    deserialize(input: string | Object): T;
    serialize(): string;
}
