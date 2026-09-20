/*
 * QR Code generator library (TypeScript)
 *
 * Copyright (c) Project Nayuki. (MIT License)
 * https://www.nayuki.io/page/qr-code-generator-library
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 * - The above copyright notice and this permission notice shall be included in
 *   all copies or substantial portions of the Software.
 * - The Software is provided "as is", without warranty of any kind, express or
 *   implied, including but not limited to the warranties of merchantability,
 *   fitness for a particular purpose and noninfringement. In no event shall the
 *   authors or copyright holders be liable for any claim, damages or other
 *   liability, whether in an action of contract, tort or otherwise, arising from,
 *   out of or in connection with the Software or the use or other dealings in the
 *   Software.
 */

type bit = number;
type byte = number;
type int = number;

/*---- Public helper constants ----*/

/*
 * The error correction level in a QR Code symbol.
 */
export const QrCodeEcc = {
  LOW: { ordinal: 0, formatBits: 1 } as const, // The QR Code can tolerate about  7% erroneous codewords
  MEDIUM: { ordinal: 1, formatBits: 0 } as const, // The QR Code can tolerate about 15% erroneous codewords
  QUARTILE: { ordinal: 2, formatBits: 3 } as const, // The QR Code can tolerate about 25% erroneous codewords
  HIGH: { ordinal: 3, formatBits: 2 } as const, // The QR Code can tolerate about 30% erroneous codewords
} as const;

export type QrCodeEccValue = (typeof QrCodeEcc)[keyof typeof QrCodeEcc];

/*
 * Describes how a segment's data bits are interpreted.
 */
export const QrSegmentMode = {
  NUMERIC: { modeBits: 0x1, numBitsCharCount: [10, 12, 14] as const },
  ALPHANUMERIC: { modeBits: 0x2, numBitsCharCount: [9, 11, 13] as const },
  BYTE: { modeBits: 0x4, numBitsCharCount: [8, 16, 16] as const },
  KANJI: { modeBits: 0x8, numBitsCharCount: [8, 10, 12] as const },
  ECI: { modeBits: 0x7, numBitsCharCount: [0, 0, 0] as const },
} as const;

export type QrSegmentModeValue = (typeof QrSegmentMode)[keyof typeof QrSegmentMode];

function numCharCountBits(mode: QrSegmentModeValue, ver: int): int {
  return mode.numBitsCharCount[Math.floor((ver + 7) / 17)];
}

/*---- QR Code result type ----*/

/*
 * A QR Code symbol, which is a type of two-dimension barcode.
 * Invented by Denso Wave and described in the ISO/IEC 18004 standard.
 * Represents an immutable square grid of black and white cells.
 */
export interface QrCode {
  /** The version number of this QR Code, between 1 and 40 (inclusive). */
  readonly version: int;
  /** The error correction level used in this QR Code. */
  readonly errorCorrectionLevel: QrCodeEccValue;
  /** The width and height of this QR Code, measured in modules, between 21 and 177 (inclusive). */
  readonly size: int;
  /** The index of the mask pattern used in this QR Code, between 0 and 7 (inclusive). */
  readonly mask: int;
  /** The modules of this QR Code (false = white, true = black). */
  readonly modules: boolean[][];
}

/*---- QR Code factory function (mid level) ----*/

// Returns a QR Code representing the given segments with the given encoding parameters.
// The smallest possible QR Code version within the given range is automatically
// chosen for the output. Iff boostEcl is true, then the ECC level of the result
// may be higher than the ecl argument if it can be done without increasing the
// version. The mask number is either between 0 to 7 (inclusive) to force that
// mask, or -1 to automatically choose an appropriate mask (which may be slow).
// This function allows the user to create a custom sequence of segments that switches
// between modes (such as alphanumeric and byte) to encode text in less space.
// This is a mid-level API; the high-level API is encodeText() and encodeBinary().
export function encodeSegments(
  segs: QrSegment[],
  ecl: QrCodeEccValue,
  minVersion: int = 1,
  maxVersion: int = 40,
  mask: int = -1,
  boostEcl: boolean = true,
): QrCode {
  if (
    !(MIN_VERSION <= minVersion && minVersion <= maxVersion && maxVersion <= MAX_VERSION) ||
    mask < -1 ||
    mask > 7
  )
    throw 'Invalid value';

  // Find the minimal version number to use
  let version: int;
  let dataUsedBits: int;
  for (version = minVersion; ; version++) {
    const dataCapacityBits: int = getNumDataCodewords(version, ecl) * 8; // Number of data bits available
    const usedBits: number = getTotalBits(segs, version);
    if (usedBits <= dataCapacityBits) {
      dataUsedBits = usedBits;
      break; // This version number is found to be suitable
    }
    if (version >= maxVersion)
      // All versions in the range could not fit the given data
      throw 'Data too long';
  }

  // Increase the error correction level while the data still fits in the current version number
  let finalEcl = ecl;
  for (const newEcl of [QrCodeEcc.MEDIUM, QrCodeEcc.QUARTILE, QrCodeEcc.HIGH]) {
    // From low to high
    if (boostEcl && dataUsedBits <= getNumDataCodewords(version, newEcl) * 8) finalEcl = newEcl;
  }

  // Concatenate all segments to create the data bit string
  const bb = createBitBuffer();
  for (const seg of segs) {
    bb.appendBits(seg.mode.modeBits, 4);
    bb.appendBits(seg.numChars, numCharCountBits(seg.mode, version));
    for (const b of seg.getData()) bb.array.push(b);
  }
  if (bb.array.length !== dataUsedBits) throw 'Assertion error';

  // Add terminator and pad up to a byte if applicable
  const dataCapacityBits: int = getNumDataCodewords(version, finalEcl) * 8;
  if (bb.array.length > dataCapacityBits) throw 'Assertion error';
  bb.appendBits(0, Math.min(4, dataCapacityBits - bb.array.length));
  bb.appendBits(0, (8 - (bb.array.length % 8)) % 8);
  if (bb.array.length % 8 !== 0) throw 'Assertion error';

  // Pad with alternating bytes until data capacity is reached
  for (let padByte = 0xec; bb.array.length < dataCapacityBits; padByte ^= 0xec ^ 0x11)
    bb.appendBits(padByte, 8);

  // Pack bits into bytes in big endian
  const dataCodewords: byte[] = [];
  while (dataCodewords.length * 8 < bb.array.length) dataCodewords.push(0);
  bb.array.forEach((b: bit, i: int) => {
    dataCodewords[i >>> 3] |= b << (7 - (i & 7));
  });

  // Create the QR Code object
  return createQrCode(version, finalEcl, dataCodewords, mask);
}

/*---- Private QR Code creation function ----*/

// Creates a new QR Code with the given version number,
// error correction level, data codeword bytes, and mask number.
function createQrCode(
  version: int,
  errorCorrectionLevel: QrCodeEccValue,
  dataCodewords: byte[],
  mask: int,
): QrCode {
  // Check scalar arguments
  if (version < MIN_VERSION || version > MAX_VERSION) throw 'Version value out of range';
  if (mask < -1 || mask > 7) throw 'Mask value out of range';
  const size = version * 4 + 17;

  // Initialize both grids to be size*size arrays of Boolean false
  const row: boolean[] = [];
  for (let i = 0; i < size; i++) row.push(false);
  const modules: boolean[][] = [];
  const isFunction: boolean[][] = [];
  for (let i = 0; i < size; i++) {
    modules.push(row.slice()); // Initially all white
    isFunction.push(row.slice());
  }

  // Helper to set function module
  const setFunctionModule = (x: int, y: int, isBlack: boolean): void => {
    modules[y][x] = isBlack;
    isFunction[y][x] = true;
  };

  // Draw horizontal and vertical timing patterns
  for (let i = 0; i < size; i++) {
    setFunctionModule(6, i, i % 2 === 0);
    setFunctionModule(i, 6, i % 2 === 0);
  }

  // Draw 3 finder patterns (all corners except bottom right; overwrites some timing modules)
  const drawFinderPattern = (x: int, y: int): void => {
    for (let dy = -4; dy <= 4; dy++) {
      for (let dx = -4; dx <= 4; dx++) {
        const dist: int = Math.max(Math.abs(dx), Math.abs(dy)); // Chebyshev/infinity norm
        const xx: int = x + dx;
        const yy: int = y + dy;
        if (0 <= xx && xx < size && 0 <= yy && yy < size)
          setFunctionModule(xx, yy, dist !== 2 && dist !== 4);
      }
    }
  };
  drawFinderPattern(3, 3);
  drawFinderPattern(size - 4, 3);
  drawFinderPattern(3, size - 4);

  // Draw numerous alignment patterns
  const alignPatPos: int[] = getAlignmentPatternPositions(version, size);
  const numAlign: int = alignPatPos.length;
  for (let i = 0; i < numAlign; i++) {
    for (let j = 0; j < numAlign; j++) {
      // Don't draw on the three finder corners
      if (
        !(
          (i === 0 && j === 0) ||
          (i === 0 && j === numAlign - 1) ||
          (i === numAlign - 1 && j === 0)
        )
      ) {
        const drawAlignmentPattern = (x: int, y: int): void => {
          for (let dy = -2; dy <= 2; dy++) {
            for (let dx = -2; dx <= 2; dx++)
              setFunctionModule(x + dx, y + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
          }
        };
        drawAlignmentPattern(alignPatPos[i], alignPatPos[j]);
      }
    }
  }

  // Draw configuration data
  const drawFormatBits = (ecl: QrCodeEccValue, msk: int): void => {
    // Calculate error correction code and pack bits
    const data: int = (ecl.formatBits << 3) | msk; // errCorrLvl is uint2, mask is uint3
    let rem: int = data;
    for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
    const bits = ((data << 10) | rem) ^ 0x5412; // uint15
    if (bits >>> 15 !== 0) throw 'Assertion error';

    // Draw first copy
    for (let i = 0; i <= 5; i++) setFunctionModule(8, i, getBit(bits, i));
    setFunctionModule(8, 7, getBit(bits, 6));
    setFunctionModule(8, 8, getBit(bits, 7));
    setFunctionModule(7, 8, getBit(bits, 8));
    for (let i = 9; i < 15; i++) setFunctionModule(14 - i, 8, getBit(bits, i));

    // Draw second copy
    for (let i = 0; i < 8; i++) setFunctionModule(size - 1 - i, 8, getBit(bits, i));
    for (let i = 8; i < 15; i++) setFunctionModule(8, size - 15 + i, getBit(bits, i));
    setFunctionModule(8, size - 8, true); // Always black
  };
  drawFormatBits(errorCorrectionLevel, 0); // Dummy mask value; overwritten later

  // Draw version
  if (version >= 7) {
    // Calculate error correction code and pack bits
    let rem: int = version; // version is uint6, in the range [7, 40]
    for (let i = 0; i < 12; i++) rem = (rem << 1) ^ ((rem >>> 11) * 0x1f25);
    const bits: int = (version << 12) | rem; // uint18
    if (bits >>> 18 !== 0) throw 'Assertion error';

    // Draw two copies
    for (let i = 0; i < 18; i++) {
      const color: boolean = getBit(bits, i);
      const a: int = size - 11 + (i % 3);
      const b: int = Math.floor(i / 3);
      setFunctionModule(a, b, color);
      setFunctionModule(b, a, color);
    }
  }

  // Compute ECC, draw modules
  const allCodewords: byte[] = addEccAndInterleave(version, errorCorrectionLevel, dataCodewords);

  // Draw codewords
  if (allCodewords.length !== Math.floor(getNumRawDataModules(version) / 8))
    throw 'Invalid argument';
  let bitIndex: int = 0; // Bit index into the data
  // Do the funny zigzag scan
  for (let right = size - 1; right >= 1; right -= 2) {
    // Index of right column in each column pair
    if (right === 6) right = 5;
    for (let vert = 0; vert < size; vert++) {
      // Vertical counter
      for (let j = 0; j < 2; j++) {
        const x: int = right - j; // Actual x coordinate
        const upward: boolean = ((right + 1) & 2) === 0;
        const y: int = upward ? size - 1 - vert : vert; // Actual y coordinate
        if (!isFunction[y][x] && bitIndex < allCodewords.length * 8) {
          modules[y][x] = getBit(allCodewords[bitIndex >>> 3], 7 - (bitIndex & 7));
          bitIndex++;
        }
        // If this QR Code has any remainder bits (0 to 7), they were assigned as
        // 0/false/white by the constructor and are left unchanged by this method
      }
    }
  }
  if (bitIndex !== allCodewords.length * 8) throw 'Assertion error';

  // Do masking
  let finalMask = mask;
  if (finalMask === -1) {
    // Automatically choose best mask
    let minPenalty: int = 1000000000;
    for (let i = 0; i < 8; i++) {
      applyMask(modules, isFunction, size, i);
      drawFormatBits(errorCorrectionLevel, i);
      const penalty: int = getPenaltyScore(modules, size);
      if (penalty < minPenalty) {
        finalMask = i;
        minPenalty = penalty;
      }
      applyMask(modules, isFunction, size, i); // Undoes the mask due to XOR
    }
  }
  if (finalMask < 0 || finalMask > 7) throw 'Assertion error';
  applyMask(modules, isFunction, size, finalMask);
  // Redraw format bits with final mask
  // We need to update format bits, but modules are already set
  // So we need to redraw them
  {
    const data: int = (errorCorrectionLevel.formatBits << 3) | finalMask;
    let rem: int = data;
    for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
    const bits = ((data << 10) | rem) ^ 0x5412;
    if (bits >>> 15 !== 0) throw 'Assertion error';
    for (let i = 0; i <= 5; i++) modules[i][8] = getBit(bits, i);
    modules[7][8] = getBit(bits, 6);
    modules[8][8] = getBit(bits, 7);
    modules[8][7] = getBit(bits, 8);
    for (let i = 9; i < 15; i++) modules[8][14 - i] = getBit(bits, i);
    for (let i = 0; i < 8; i++) modules[8][size - 1 - i] = getBit(bits, i);
    for (let i = 8; i < 15; i++) modules[size - 15 + i][8] = getBit(bits, i);
    modules[size - 8][8] = true; // Always black
  }

  return {
    version,
    errorCorrectionLevel,
    size,
    mask: finalMask,
    modules,
  };
}

/*---- Private helper functions ----*/

// Returns an ascending list of positions of alignment patterns for this version number.
// Each position is in the range [0,177), and are used on both the x and y axes.
function getAlignmentPatternPositions(version: int, size: int): int[] {
  if (version === 1) return [];
  else {
    const numAlign: int = Math.floor(version / 7) + 2;
    const step: int = version === 32 ? 26 : Math.ceil((size - 13) / (numAlign * 2 - 2)) * 2;
    const result: int[] = [6];
    for (let pos = size - 7; result.length < numAlign; pos -= step) result.splice(1, 0, pos);
    return result;
  }
}

// XORs the codeword modules in this QR Code with the given mask pattern.
// The function modules must be marked and the codeword bits must be drawn
// before masking. Due to the arithmetic of XOR, calling applyMask() with
// the same mask value a second time will undo the mask. A final well-formed
// QR Code needs exactly one (not zero, two, etc.) mask applied.
function applyMask(modules: boolean[][], isFunction: boolean[][], size: int, mask: int): void {
  if (mask < 0 || mask > 7) throw 'Mask value out of range';
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let invert: boolean;
      switch (mask) {
        case 0:
          invert = (x + y) % 2 === 0;
          break;
        case 1:
          invert = y % 2 === 0;
          break;
        case 2:
          invert = x % 3 === 0;
          break;
        case 3:
          invert = (x + y) % 3 === 0;
          break;
        case 4:
          invert = (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0;
          break;
        case 5:
          invert = ((x * y) % 2) + ((x * y) % 3) === 0;
          break;
        case 6:
          invert = (((x * y) % 2) + ((x * y) % 3)) % 2 === 0;
          break;
        case 7:
          invert = (((x + y) % 2) + ((x * y) % 3)) % 2 === 0;
          break;
        default:
          throw 'Assertion error';
      }
      if (!isFunction[y][x] && invert) modules[y][x] = !modules[y][x];
    }
  }
}

// Calculates and returns the penalty score based on state of this QR Code's current modules.
// This is used by the automatic mask choice algorithm to find the mask pattern that yields the lowest score.
function getPenaltyScore(modules: boolean[][], size: int): int {
  let result: int = 0;

  // Adjacent modules in row having same color, and finder-like patterns
  for (let y = 0; y < size; y++) {
    const runHistory = [0, 0, 0, 0, 0, 0, 0];
    let color = false;
    let runX = 0;
    for (let x = 0; x < size; x++) {
      if (modules[y][x] === color) {
        runX++;
        if (runX === 5) result += PENALTY_N1;
        else if (runX > 5) result++;
      } else {
        addRunToHistory(runX, runHistory);
        if (!color && hasFinderLikePattern(runHistory)) result += PENALTY_N3;
        color = modules[y][x];
        runX = 1;
      }
    }
    addRunToHistory(runX, runHistory);
    if (color) addRunToHistory(0, runHistory); // Dummy run of white
    if (hasFinderLikePattern(runHistory)) result += PENALTY_N3;
  }
  // Adjacent modules in column having same color, and finder-like patterns
  for (let x = 0; x < size; x++) {
    const runHistory = [0, 0, 0, 0, 0, 0, 0];
    let color = false;
    let runY = 0;
    for (let y = 0; y < size; y++) {
      if (modules[y][x] === color) {
        runY++;
        if (runY === 5) result += PENALTY_N1;
        else if (runY > 5) result++;
      } else {
        addRunToHistory(runY, runHistory);
        if (!color && hasFinderLikePattern(runHistory)) result += PENALTY_N3;
        color = modules[y][x];
        runY = 1;
      }
    }
    addRunToHistory(runY, runHistory);
    if (color) addRunToHistory(0, runHistory); // Dummy run of white
    if (hasFinderLikePattern(runHistory)) result += PENALTY_N3;
  }

  // 2*2 blocks of modules having same color
  for (let y = 0; y < size - 1; y++) {
    for (let x = 0; x < size - 1; x++) {
      const color: boolean = modules[y][x];
      if (
        color === modules[y][x + 1] &&
        color === modules[y + 1][x] &&
        color === modules[y + 1][x + 1]
      )
        result += PENALTY_N2;
    }
  }

  // Balance of black and white modules
  let black: int = 0;
  for (const row of modules) {
    for (const color of row) {
      if (color) black++;
    }
  }
  const total: int = size * size; // Note that size is odd, so black/total != 1/2
  // Compute the smallest integer k >= 0 such that (45-5k)% <= black/total <= (55+5k)%
  const k: int = Math.ceil(Math.abs(black * 20 - total * 10) / total) - 1;
  result += k * PENALTY_N4;
  return result;
}

// Inserts the given value to the front of the given array, which shifts over the
// existing values and deletes the last value. A helper function for getPenaltyScore().
function addRunToHistory(run: int, history: int[]): void {
  history.pop();
  history.unshift(run);
}

// Tests whether the given run history has the pattern of ratio 1:1:3:1:1 in the middle, and
// surrounded by at least 4 on either or both ends. A helper function for getPenaltyScore().
// Must only be called immediately after a run of white modules has ended.
function hasFinderLikePattern(runHistory: int[]): boolean {
  const n: int = runHistory[1];
  return (
    n > 0 &&
    runHistory[2] === n &&
    runHistory[4] === n &&
    runHistory[5] === n &&
    runHistory[3] === n * 3 &&
    Math.max(runHistory[0], runHistory[6]) >= n * 4
  );
}

// Returns a new byte string representing the given data with the appropriate error correction
// codewords appended to it, based on this object's version and error correction level.
function addEccAndInterleave(version: int, ecl: QrCodeEccValue, data: byte[]): byte[] {
  if (data.length !== getNumDataCodewords(version, ecl)) throw 'Invalid argument';

  // Calculate parameter numbers
  const numBlocks: int = NUM_ERROR_CORRECTION_BLOCKS[ecl.ordinal][version];
  const blockEccLen: int = ECC_CODEWORDS_PER_BLOCK[ecl.ordinal][version];
  const rawCodewords: int = Math.floor(getNumRawDataModules(version) / 8);
  const numShortBlocks: int = numBlocks - (rawCodewords % numBlocks);
  const shortBlockLen: int = Math.floor(rawCodewords / numBlocks);

  // Split data into blocks and append ECC to each block
  const blocks: byte[][] = [];
  const rs = createReedSolomonGenerator(blockEccLen);
  for (let i = 0, k = 0; i < numBlocks; i++) {
    const dat: byte[] = data.slice(
      k,
      k + shortBlockLen - blockEccLen + (i < numShortBlocks ? 0 : 1),
    );
    k += dat.length;
    const ecc: byte[] = rs.getRemainder(dat);
    if (i < numShortBlocks) dat.push(0);
    blocks.push(dat.concat(ecc));
  }

  // Interleave (not concatenate) the bytes from every block into a single sequence
  const result: byte[] = [];
  for (let i = 0; i < blocks[0].length; i++) {
    for (let j = 0; j < blocks.length; j++) {
      // Skip the padding byte in short blocks
      if (i !== shortBlockLen - blockEccLen || j >= numShortBlocks) result.push(blocks[j][i]);
    }
  }
  if (result.length !== rawCodewords) throw 'Assertion error';
  return result;
}

// Returns the number of data bits that can be stored in a QR Code of the given version number, after
// all function modules are excluded. This includes remainder bits, so it might not be a multiple of 8.
// The result is in the range [208, 29648]. This could be implemented as a 40-entry lookup table.
function getNumRawDataModules(ver: int): int {
  if (ver < MIN_VERSION || ver > MAX_VERSION) throw 'Version number out of range';
  let result: int = (16 * ver + 128) * ver + 64;
  if (ver >= 2) {
    const numAlign: int = Math.floor(ver / 7) + 2;
    result -= (25 * numAlign - 10) * numAlign - 55;
    if (ver >= 7) result -= 36;
  }
  return result;
}

// Returns the number of 8-bit data (i.e. not error correction) codewords contained in any
// QR Code of the given version number and error correction level, with remainder bits discarded.
// This stateless pure function could be implemented as a (40*4)-cell lookup table.
function getNumDataCodewords(ver: int, ecl: QrCodeEccValue): int {
  return (
    Math.floor(getNumRawDataModules(ver) / 8) -
    ECC_CODEWORDS_PER_BLOCK[ecl.ordinal][ver] * NUM_ERROR_CORRECTION_BLOCKS[ecl.ordinal][ver]
  );
}

// Returns true iff the i'th bit of x is set to 1.
function getBit(x: int, i: int): boolean {
  return ((x >>> i) & 1) !== 0;
}

/*---- Data segment type and factory functions ----*/

/*
 * A segment of character/binary/control data in a QR Code symbol.
 * The mid-level way to create a segment is to take the payload data
 * and call a factory function such as makeNumeric().
 * The low-level way to create a segment is to custom-make the bit buffer
 * and call createQrSegment() with appropriate values.
 * This segment imposes no length restrictions, but QR Codes have restrictions.
 * Even in the most favorable conditions, a QR Code can only hold 7089 characters of data.
 * Any segment longer than this is meaningless for the purpose of generating QR Codes.
 */
export interface QrSegment {
  /** The mode indicator of this segment. */
  readonly mode: QrSegmentModeValue;
  /** The length of this segment's unencoded data. Measured in characters for
   * numeric/alphanumeric/kanji mode, bytes for byte mode, and 0 for ECI mode.
   * Always zero or positive. Not the same as the data's bit length.
   */
  readonly numChars: int;
  /** Returns a new copy of the data bits of this segment. */
  getData(): bit[];
}

// Creates a new QR Code segment with the given attributes and data.
// The character count (numChars) must agree with the mode and the bit buffer length,
// but the constraint isn't checked. The given bit buffer is cloned and stored.
function createQrSegment(mode: QrSegmentModeValue, numChars: int, bitData: bit[]): QrSegment {
  if (numChars < 0) throw 'Invalid argument';
  const data = bitData.slice(); // Make defensive copy
  return {
    mode,
    numChars,
    getData: () => data.slice(), // Make defensive copy
  };
}

// Returns a segment representing the given binary data encoded in
// byte mode. All input byte arrays are acceptable. Any text string
// can be converted to UTF-8 bytes and encoded as a byte mode segment.
function makeBytes(data: byte[]): QrSegment {
  const bb = createBitBuffer();
  for (const b of data) bb.appendBits(b, 8);
  return createQrSegment(QrSegmentMode.BYTE, data.length, bb.array);
}

// Returns a segment representing the given string of decimal digits encoded in numeric mode.
function makeNumeric(digits: string): QrSegment {
  if (!NUMERIC_REGEX.test(digits)) throw 'String contains non-numeric characters';
  const bb = createBitBuffer();
  for (let i = 0; i < digits.length; ) {
    // Consume up to 3 digits per iteration
    const n: int = Math.min(digits.length - i, 3);
    bb.appendBits(parseInt(digits.substr(i, n), 10), n * 3 + 1);
    i += n;
  }
  return createQrSegment(QrSegmentMode.NUMERIC, digits.length, bb.array);
}

// Returns a segment representing the given text string encoded in alphanumeric mode.
// The characters allowed are: 0 to 9, A to Z (uppercase only), space,
// dollar, percent, asterisk, plus, hyphen, period, slash, colon.
function makeAlphanumeric(text: string): QrSegment {
  if (!ALPHANUMERIC_REGEX.test(text))
    throw 'String contains unencodable characters in alphanumeric mode';
  const bb = createBitBuffer();
  let i: int;
  for (i = 0; i + 2 <= text.length; i += 2) {
    // Process groups of 2
    let temp: int = ALPHANUMERIC_CHARSET.indexOf(text.charAt(i)) * 45;
    temp += ALPHANUMERIC_CHARSET.indexOf(text.charAt(i + 1));
    bb.appendBits(temp, 11);
  }
  if (i < text.length)
    // 1 character remaining
    bb.appendBits(ALPHANUMERIC_CHARSET.indexOf(text.charAt(i)), 6);
  return createQrSegment(QrSegmentMode.ALPHANUMERIC, text.length, bb.array);
}

// Returns a new mutable list of zero or more segments to represent the given Unicode text string.
// The result may use various segment modes and switch modes to optimize the length of the bit stream.
export function makeSegments(text: string): QrSegment[] {
  // Select the most efficient segment encoding automatically
  if (text === '') return [];
  else if (NUMERIC_REGEX.test(text)) return [makeNumeric(text)];
  else if (ALPHANUMERIC_REGEX.test(text)) return [makeAlphanumeric(text)];
  else return [makeBytes(toUtf8ByteArray(text))];
}

// Calculates and returns the number of bits needed to encode the given segments at
// the given version. The result is infinity if a segment has too many characters to fit its length field.
function getTotalBits(segs: QrSegment[], version: int): number {
  let result: number = 0;
  for (const seg of segs) {
    const ccbits: int = numCharCountBits(seg.mode, version);
    if (seg.numChars >= 1 << ccbits) return Infinity; // The segment's length doesn't fit the field's bit width
    result += 4 + ccbits + seg.getData().length;
  }
  return result;
}

// Returns a new array of bytes representing the given string encoded in UTF-8.
function toUtf8ByteArray(str: string): byte[] {
  str = encodeURI(str);
  const result: byte[] = [];
  for (let i = 0; i < str.length; i++) {
    if (str.charAt(i) !== '%') result.push(str.charCodeAt(i));
    else {
      result.push(parseInt(str.substr(i + 1, 2), 16));
      i += 2;
    }
  }
  return result;
}

/*---- Private helper: BitBuffer ----*/

/*
 * An appendable sequence of bits (0s and 1s). Mainly used by QrSegment.
 */
interface BitBuffer {
  array: bit[];
  appendBits(val: int, len: int): void;
}

function createBitBuffer(): BitBuffer {
  const array: bit[] = [];
  return {
    array,
    appendBits(val: int, len: int): void {
      if (len < 0 || len > 31 || val >>> len !== 0) throw 'Value out of range';
      for (let i = len - 1; i >= 0; i--)
        // Append bit by bit
        array.push((val >>> i) & 1);
    },
  };
}

/*---- Private helper: ReedSolomonGenerator ----*/

/*
 * Computes the Reed-Solomon error correction codewords for a sequence of data codewords
 * at a given degree. Objects are immutable, and the state only depends on the degree.
 * This exists because each data block in a QR Code shares the same the divisor polynomial.
 */
interface ReedSolomonGenerator {
  getRemainder(data: byte[]): byte[];
}

function createReedSolomonGenerator(degree: int): ReedSolomonGenerator {
  if (degree < 1 || degree > 255) throw 'Degree out of range';
  const coefficients: byte[] = [];

  // Start with the monomial x^0
  for (let i = 0; i < degree - 1; i++) coefficients.push(0);
  coefficients.push(1);

  // Compute the product polynomial (x - r^0) * (x - r^1) * (x - r^2) * ... * (x - r^{degree-1}),
  // drop the highest term, and store the rest of the coefficients in order of descending powers.
  // Note that r = 0x02, which is a generator element of this field GF(2^8/0x11D).
  let root = 1;
  for (let i = 0; i < degree; i++) {
    // Multiply the current product by (x - r^i)
    for (let j = 0; j < coefficients.length; j++) {
      coefficients[j] = rsMultiply(coefficients[j], root);
      if (j + 1 < coefficients.length) coefficients[j] ^= coefficients[j + 1];
    }
    root = rsMultiply(root, 0x02);
  }

  return {
    getRemainder(data: byte[]): byte[] {
      // Compute the remainder by performing polynomial division
      const result: byte[] = coefficients.map(() => 0);
      for (const b of data) {
        const factor: byte = b ^ (result.shift() as byte);
        result.push(0);
        coefficients.forEach((coef, i) => {
          result[i] ^= rsMultiply(coef, factor);
        });
      }
      return result;
    },
  };
}

// Returns the product of the two given field elements modulo GF(2^8/0x11D). The arguments and result
// are unsigned 8-bit integers. This could be implemented as a lookup table of 256*256 entries of uint8.
function rsMultiply(x: byte, y: byte): byte {
  if (x >>> 8 !== 0 || y >>> 8 !== 0) throw 'Byte out of range';
  // Russian peasant multiplication
  let z: int = 0;
  for (let i = 7; i >= 0; i--) {
    z = (z << 1) ^ ((z >>> 7) * 0x11d);
    z ^= ((y >>> i) & 1) * x;
  }
  if (z >>> 8 !== 0) throw 'Assertion error';
  return z as byte;
}

/*---- Constants and tables ----*/

// The minimum version number supported in the QR Code Model 2 standard.
const MIN_VERSION: int = 1;
// The maximum version number supported in the QR Code Model 2 standard.
const MAX_VERSION: int = 40;

// For use in getPenaltyScore(), when evaluating which mask is best.
const PENALTY_N1: int = 3;
const PENALTY_N2: int = 3;
const PENALTY_N3: int = 40;
const PENALTY_N4: int = 10;

const ECC_CODEWORDS_PER_BLOCK: int[][] = [
  // Version: (note that index 0 is for padding, and is set to an illegal value)
  //0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40    Error correction level
  [
    -1, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30, 28, 28, 28, 28, 30,
    30, 26, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30,
  ], // Low
  [
    -1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28,
    28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28,
  ], // Medium
  [
    -1, 13, 22, 18, 26, 18, 24, 18, 22, 20, 24, 28, 26, 24, 20, 30, 24, 28, 28, 26, 30, 28, 30, 30,
    30, 30, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30,
  ], // Quartile
  [
    -1, 17, 28, 22, 16, 22, 28, 26, 26, 24, 28, 24, 28, 22, 24, 24, 30, 28, 28, 26, 28, 30, 24, 30,
    30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30,
  ], // High
];

const NUM_ERROR_CORRECTION_BLOCKS: int[][] = [
  // Version: (note that index 0 is for padding, and is set to an illegal value)
  //0, 1, 2, 3, 4, 5, 6, 7, 8, 9,10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40    Error correction level
  [
    -1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9, 9, 10, 12, 12, 12, 13, 14,
    15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25,
  ], // Low
  [
    -1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23,
    25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49,
  ], // Medium
  [
    -1, 1, 1, 2, 2, 4, 4, 6, 6, 8, 8, 8, 10, 12, 16, 12, 17, 16, 18, 21, 20, 23, 23, 25, 27, 29, 34,
    34, 35, 38, 40, 43, 45, 48, 51, 53, 56, 59, 62, 65, 68,
  ], // Quartile
  [
    -1, 1, 1, 2, 4, 4, 4, 5, 6, 8, 8, 11, 11, 16, 16, 18, 16, 19, 21, 25, 25, 25, 34, 30, 32, 35,
    37, 40, 42, 45, 48, 51, 54, 57, 60, 63, 66, 70, 74, 77, 81,
  ], // High
];

// Describes precisely all strings that are encodable in numeric mode. To test
// whether a string s is encodable: let ok: boolean = NUMERIC_REGEX.test(s);
// A string is encodable iff each character is in the range 0 to 9.
const NUMERIC_REGEX: RegExp = /^[0-9]*$/;

// Describes precisely all strings that are encodable in alphanumeric mode. To test
// whether a string s is encodable: let ok: boolean = ALPHANUMERIC_REGEX.test(s);
// A string is encodable iff each character is in the following set: 0 to 9, A to Z
// (uppercase only), space, dollar, percent, asterisk, plus, hyphen, period, slash, colon.
const ALPHANUMERIC_REGEX: RegExp = /^[A-Z0-9 $%*+./:-]*$/;

// The set of all legal characters in alphanumeric mode,
// where each character value maps to the index in the string.
const ALPHANUMERIC_CHARSET: string = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:';
