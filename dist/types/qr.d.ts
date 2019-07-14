declare type bit = number;
declare type byte = number;
declare type int = number;
export declare class QrCode {
    readonly version: int;
    readonly errorCorrectionLevel: QrCode.Ecc;
    readonly mask: int;
    static encodeText(text: string, ecl: QrCode.Ecc): QrCode;
    static encodeBinary(data: Array<byte>, ecl: QrCode.Ecc): QrCode;
    static encodeSegments(segs: Array<QrSegment>, ecl: QrCode.Ecc, minVersion?: int, maxVersion?: int, mask?: int, boostEcl?: boolean): QrCode;
    readonly size: int;
    readonly modules: Array<Array<boolean>>;
    private readonly isFunction;
    constructor(version: int, errorCorrectionLevel: QrCode.Ecc, dataCodewords: Array<byte>, mask: int);
    getModule(x: int, y: int): boolean;
    drawCanvas(scale: int, border: int, canvas: HTMLCanvasElement): void;
    toSvgString(border: int): string;
    private drawFunctionPatterns;
    private drawFormatBits;
    private drawVersion;
    private drawFinderPattern;
    private drawAlignmentPattern;
    private setFunctionModule;
    private addEccAndInterleave;
    private drawCodewords;
    private applyMask;
    private getPenaltyScore;
    private getAlignmentPatternPositions;
    private static getNumRawDataModules;
    private static getNumDataCodewords;
    private static addRunToHistory;
    private static hasFinderLikePattern;
    static readonly MIN_VERSION: int;
    static readonly MAX_VERSION: int;
    private static readonly PENALTY_N1;
    private static readonly PENALTY_N2;
    private static readonly PENALTY_N3;
    private static readonly PENALTY_N4;
    private static readonly ECC_CODEWORDS_PER_BLOCK;
    private static readonly NUM_ERROR_CORRECTION_BLOCKS;
}
export declare class QrSegment {
    readonly mode: QrSegment.Mode;
    readonly numChars: int;
    private readonly bitData;
    static makeBytes(data: Array<byte>): QrSegment;
    static makeNumeric(digits: string): QrSegment;
    static makeAlphanumeric(text: string): QrSegment;
    static makeSegments(text: string): Array<QrSegment>;
    static makeEci(assignVal: int): QrSegment;
    constructor(mode: QrSegment.Mode, numChars: int, bitData: Array<bit>);
    getData(): Array<bit>;
    static getTotalBits(segs: Array<QrSegment>, version: int): number;
    private static toUtf8ByteArray;
    static readonly NUMERIC_REGEX: RegExp;
    static readonly ALPHANUMERIC_REGEX: RegExp;
    private static readonly ALPHANUMERIC_CHARSET;
}
export declare namespace QrCode {
    type int = number;
    class Ecc {
        readonly ordinal: int;
        readonly formatBits: int;
        static readonly LOW: Ecc;
        static readonly MEDIUM: Ecc;
        static readonly QUARTILE: Ecc;
        static readonly HIGH: Ecc;
        private constructor();
    }
}
export declare namespace QrSegment {
    type int = number;
    class Mode {
        readonly modeBits: int;
        private readonly numBitsCharCount;
        static readonly NUMERIC: Mode;
        static readonly ALPHANUMERIC: Mode;
        static readonly BYTE: Mode;
        static readonly KANJI: Mode;
        static readonly ECI: Mode;
        private constructor();
        numCharCountBits(ver: int): int;
    }
}
export {};
