(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = global || self, global.qrCodeGenerator = factory());
}(this, function () { 'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */

    var __assign = function() {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };

    var MULTI = 1;
    var QR_BORDER = 7;
    var TILE_SIZE = 96 * MULTI;
    var INC_TILE_SIZE = 96 * MULTI;
    var SMALL_QR_SIZE = 25;
    /**
     * Returns the color of the module (pixel) at the given coordinates, which is false
     * for white or true for black. The top left corner has the coordinates (x=0, y=0).
     * If the given coordinates are out of bounds, then false (white) is returned.
     */
    var getPixel = function (x, y, size, modules, isLogoShowed) {
        if (x < QR_BORDER && y < QR_BORDER) {
            return false;
        }
        if (x >= size - QR_BORDER && y < QR_BORDER) {
            return false;
        }
        if (x < QR_BORDER && y >= size - QR_BORDER) {
            return false;
        }
        if (isLogoShowed) {
            var imageTiles = QR_BORDER + 2;
            if (size <= SMALL_QR_SIZE) {
                imageTiles--;
            }
            var paddingTiles = (size - QR_BORDER * 2 - imageTiles) / 2 - 1;
            if (size <= SMALL_QR_SIZE) {
                paddingTiles++;
            }
            if (x > QR_BORDER + paddingTiles &&
                x < size - QR_BORDER - paddingTiles - 1 &&
                y > QR_BORDER + paddingTiles &&
                y < size - QR_BORDER - paddingTiles - 1) {
                return false;
            }
            return 0 <= x && x < size && 0 <= y && y < size && modules[y][x];
        }
        return modules[y] && modules[y][x];
    };
    var getNeighbors = function (x, y, size, modules, isLogoShowed) {
        if (isLogoShowed === void 0) { isLogoShowed = true; }
        return ({
            l: getPixel(x - 1, y, size, modules, isLogoShowed),
            r: getPixel(x + 1, y, size, modules, isLogoShowed),
            t: getPixel(x, y - 1, size, modules, isLogoShowed),
            b: getPixel(x, y + 1, size, modules, isLogoShowed),
            current: getPixel(x, y, size, modules, isLogoShowed)
        });
    };
    /**
     * Converts QrCode instance to SVG code
     * @param qrCode QrCode instance
     * @param options Convertation options
     */
    var convertSegmentsToSvgString = function (qrCode, options) {
        if (typeof options.qrSize !== 'number') {
            throw new Error('Size should be a number');
        }
        if (typeof options.className !== 'string') {
            throw new Error('Classname should be a string');
        }
        var _2 = 2 * MULTI;
        var _12_7 = 12.7 * MULTI;
        var _12_8 = 12.8 * MULTI;
        var _14_7 = 14.7 * MULTI;
        var _14_8 = 14.8 * MULTI;
        var _15_9 = 15.9 * MULTI;
        var _28_6 = 28.6 * MULTI;
        var _30_5 = 30.5 * MULTI;
        var _84_7 = 84.7776815 * MULTI;
        var _87_3 = 87.3 * MULTI;
        var _71_4 = 71.4 * MULTI;
        var _42_9 = 42.9 * MULTI;
        var _87_2 = 87.2 * MULTI;
        var _85_2 = 85.2 * MULTI;
        var _85_3 = 85.3 * MULTI;
        var _69_5 = 69.5 * MULTI;
        var _98 = 98 * MULTI;
        var _100 = 100 * MULTI;
        var parts = [];
        var leftPadding = 0;
        var topPadding = 0;
        var xCoord = 0;
        var yCoord = 0;
        for (var y = 0; y < qrCode.size; y++) {
            leftPadding = 0;
            for (var x = 0; x < qrCode.size; x++) {
                xCoord = x + leftPadding;
                leftPadding += TILE_SIZE;
                yCoord = y + topPadding;
                var neighbors = getNeighbors(x, y, qrCode.size, qrCode.modules, options.isShowLogo);
                var path = '';
                var selector = '';
                if (neighbors.current) {
                    selector = !selector && !neighbors.l && !neighbors.r && !neighbors.t && !neighbors.b ? 'empty' : '';
                    selector = (!selector && neighbors.l && neighbors.r) || (neighbors.t && neighbors.b) ? 'rect' : '';
                    if (!selector) {
                        selector += neighbors.l ? 'l' : neighbors.r ? 'r' : '';
                        selector += neighbors.t ? 't' : neighbors.b ? 'b' : '';
                        if (!selector) {
                            selector = 'empty';
                        }
                    }
                }
                else {
                    selector =
                        !selector &&
                            neighbors.l &&
                            neighbors.t &&
                            getPixel(x - 1, y - 1, qrCode.size, qrCode.modules, options.isShowLogo)
                            ? 'n_lt'
                            : '';
                    selector =
                        !selector &&
                            neighbors.l &&
                            neighbors.b &&
                            getPixel(x - 1, y + 1, qrCode.size, qrCode.modules, options.isShowLogo)
                            ? 'n_lb'
                            : '';
                    selector =
                        !selector &&
                            neighbors.r &&
                            neighbors.t &&
                            getPixel(x + 1, y - 1, qrCode.size, qrCode.modules, options.isShowLogo)
                            ? 'n_rt'
                            : '';
                    selector =
                        !selector &&
                            neighbors.r &&
                            neighbors.b &&
                            getPixel(x + 1, y + 1, qrCode.size, qrCode.modules, options.isShowLogo)
                            ? 'n_rb'
                            : '';
                }
                if (!selector) {
                    continue;
                }
                path = "<use xlink:href=\"#" + selector + "-" + options.suffix + "\"/>";
                parts.push("<g transform=\"translate(" + xCoord + "," + yCoord + ")\">" + path + "</g>");
            }
            topPadding += TILE_SIZE;
        }
        var scale = '';
        var position = ((qrCode.size - QR_BORDER * 3) / 2) * TILE_SIZE + TILE_SIZE * QR_BORDER - 10;
        if (qrCode.size <= SMALL_QR_SIZE) {
            scale = 'scale(0.85)';
            position += 50;
        }
        var pointPosition = (qrCode.size - QR_BORDER) * INC_TILE_SIZE;
        parts.push("<use fill-rule=\"evenodd\" transform=\"translate(0,0)\" xlink:href=\"#point-" + options.suffix + "\"/>");
        parts.push("<use fill-rule=\"evenodd\" transform=\"translate(" + pointPosition + ",0)\" xlink:href=\"#point-" + options.suffix + "\"/>");
        parts.push("<use fill-rule=\"evenodd\" transform=\"translate(0," + pointPosition + ")\" xlink:href=\"#point-" + options.suffix + "\"/>");
        if (options.isShowLogo) {
            if (!options.logoData) {
                parts.push("\n        <use style=\"width: 750px; height: 750px;\" width=\"750\" height=\"750\" \n          fill=\"none\" \n          fill-rule=\"evenodd\" \n          transform=\"translate(" + position + "," + position + ") " + scale + "\" xlink:href=\"#vk_logo-" + options.suffix + "\"\n        />\n      ");
            }
            else {
                parts.push("\n        <image \n          preserveAspectRatio=\"xMidYMid slice\" clip-path=\"url(#logo-mask-" + options.suffix + ")\"\n          style=\"width: 750px; height: 750px;\" width=\"750\" height=\"750\" \n          transform=\"translate(" + position + "," + position + ") " + scale + "\" \n          xlink:href=\"" + options.logoData + "\" \n        />\n      ");
            }
        }
        var backgroundSize = 99 * qrCode.size;
        var qrBackground = '';
        var qrTransform = 'translate(0,0)';
        if (options.isShowBackground) {
            var qrScale = (options.qrSize - 20 * 2) / options.qrSize; // 0.756972112
            var padding = (backgroundSize / options.qrSize) * 21;
            var radius = Math.ceil(backgroundSize / (options.qrSize / 36)); // 7.11111111 = 256px/36px radius
            qrBackground = "\n      <rect \n        x=\"0\" \n        width=\"" + backgroundSize + "\" \n        height=\"" + backgroundSize + "\" \n        rx=\"" + radius + "\" \n        fill=\"" + options.backgroundColor + "\"\n      />";
            qrTransform = "translate(" + padding + ", " + padding + ") scale(" + qrScale + ")";
        }
        // eslint-disable-next-line
        var oneSide = "M0,0 L66,0 C" + _84_7 + ",-3.44940413e-15 " + _100 + ",15.2223185 " + _100 + ",34 L" + _100 + ",66 C" + _100 + "," + _84_7 + " " + _84_7 + "," + _100 + " 66," + _100 + " L0," + _100 + " L0,0 Z";
        var twoSides = "M0,0 L" + _100 + ",0 L" + _100 + ",66 C" + _100 + "," + _84_7 + " " + _84_7 + "," + _100 + " 66," + _100 + " L0," + _100 + " L0,0 Z";
        return "\n  <svg \n    version=\"1.1\" \n    viewBox=\"0 0 " + backgroundSize + " " + backgroundSize + "\" \n    width=\"" + options.qrSize + "px\" \n    height=\"" + options.qrSize + "px\"\n    " + (options.className ? "class=\"" + options.className + "\"" : '') + " \n    xml:space=\"preserve\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\"\n  >\n    <defs>\n      <rect id=\"rect-" + options.suffix + "\" width=\"100\" height=\"100\" fill=\"" + options.foregroundColor + "\"/>\n      <path \n        id=\"empty-" + options.suffix + "\" \n        d=\"M0," + _28_6 + "v" + _42_9 + "C0," + _87_3 + "," + _12_8 + "," + _100 + "," + _28_6 + "," + _100 + "h" + _42_9 + "c" + _15_9 + ",0," + _28_6 + "-" + _12_8 + "," + _28_6 + "-" + _28_6 + "V" + _28_6 + "C" + _100 + "," + _12_7 + "," + _87_2 + ",0," + _71_4 + ",0H" + _28_6 + " C" + _12_8 + ",0,0," + _12_8 + ",0," + _28_6 + "z\"\n        fill=\"" + options.foregroundColor + "\"\n      />\n      <path id=\"b-" + options.suffix + "\" d=\"" + oneSide + "\" transform=\"rotate(-90 50 50)\" fill=\"" + options.foregroundColor + "\"/>\n      <path id=\"r-" + options.suffix + "\" d=\"" + oneSide + "\" transform=\"rotate(-180 50 50)\" fill=\"" + options.foregroundColor + "\"/>\n      <path id=\"l-" + options.suffix + "\" d=\"" + oneSide + "\" fill=\"" + options.foregroundColor + "\"/>\n      <path id=\"t-" + options.suffix + "\" d=\"" + oneSide + "\" transform=\"rotate(90 50 50)\" fill=\"" + options.foregroundColor + "\"/>\n      <path id=\"l-" + options.suffix + "\" d=\"" + twoSides + "\" transform=\"rotate(-90 50 50)\" fill=\"" + options.foregroundColor + "\"/>\n      <path id=\"lt-" + options.suffix + "\" d=\"" + twoSides + "\" fill=\"" + options.foregroundColor + "\"/>\n      <path id=\"lb-" + options.suffix + "\" d=\"" + twoSides + "\" transform=\"rotate(-90 50 50)\" fill=\"" + options.foregroundColor + "\"/>\n      <path id=\"rb-" + options.suffix + "\" d=\"" + twoSides + "\" transform=\"rotate(-180 50 50)\" fill=\"" + options.foregroundColor + "\"/>\n      <path id=\"rt-" + options.suffix + "\" d=\"" + twoSides + "\" transform=\"rotate(90 50 50)\" fill=\"" + options.foregroundColor + "\"/>\n      <path \n        id=\"n_lt-" + options.suffix + "\" \n        d=\"M" + _30_5 + "," + _2 + "V0H0v" + _30_5 + "h" + _2 + "C" + _2 + "," + _14_7 + "," + _14_8 + "," + _2 + "," + _30_5 + "," + _2 + "z\" \n        fill=\"" + options.foregroundColor + "\"\n      />\n      <path \n        id=\"n_lb-" + options.suffix + "\"\n        d=\"M" + _2 + "," + _69_5 + "H0V" + _100 + "h" + _30_5 + "v-" + _2 + "C" + _14_7 + "," + _98 + "," + _2 + "," + _85_2 + "," + _2 + "," + _69_5 + "z\" \n        fill=\"" + options.foregroundColor + "\"\n      />\n      <path \n        id=\"n_rt-" + options.suffix + "\" \n        d=\"M" + _98 + "," + _30_5 + "h" + _2 + "V0H" + _69_5 + "v" + _2 + "C" + _85_3 + "," + _2 + "," + _98 + "," + _14_8 + "," + _98 + "," + _30_5 + "z\" \n        fill=\"" + options.foregroundColor + "\"\n      />\n      <path id=\"n_rb-" + options.suffix + "\" \n        d=\"M" + _69_5 + "," + _98 + "v" + _2 + "H" + _100 + "V" + _69_5 + "h-" + _2 + "C" + _98 + "," + _85_3 + "," + _85_2 + "," + _98 + "," + _69_5 + "," + _98 + "z\" \n        fill=\"" + options.foregroundColor + "\"\n      />\n      <path \n        id=\"point-" + options.suffix + "\" \n        fill=\"" + options.foregroundColor + "\"\n        d=\"M600.001786,457.329333 L600.001786,242.658167 C600.001786,147.372368 587.039517,124.122784 581.464617,118.535383 C575.877216,112.960483 552.627632,99.9982143 457.329333,99.9982143 L242.670667,99.9982143 C147.372368,99.9982143 124.122784,112.960483 118.547883,118.535383 C112.972983,124.122784 99.9982143,147.372368 99.9982143,242.658167 L99.9982143,457.329333 C99.9982143,552.627632 112.972983,575.877216 118.547883,581.464617 C124.122784,587.027017 147.372368,600.001786 242.670667,600.001786 L457.329333,600.001786 C552.627632,600.001786 575.877216,587.027017 581.464617,581.464617 C587.039517,575.877216 600.001786,552.627632 600.001786,457.329333 Z M457.329333,0 C653.338333,0 700,46.6616668 700,242.658167 C700,438.667167 700,261.332833 700,457.329333 C700,653.338333 653.338333,700 457.329333,700 C261.332833,700 438.667167,700 242.670667,700 C46.6616668,700 0,653.338333 0,457.329333 C0,261.332833 0,352.118712 0,242.658167 C0,46.6616668 46.6616668,0 242.670667,0 C438.667167,0 261.332833,0 457.329333,0 Z M395.996667,200 C480.004166,200 500,220.008332 500,303.990835 C500,387.998334 500,312.001666 500,395.996667 C500,479.991668 480.004166,500 395.996667,500 C312.001666,500 387.998334,500 304.003333,500 C220.008332,500 200,479.991668 200,395.996667 C200,312.001666 200,350.906061 200,303.990835 C200,220.008332 220.008332,200 304.003333,200 C387.998334,200 312.001666,200 395.996667,200 Z\" \n      />\n      <g id=\"vk_logo-" + options.suffix + "\">\n        <path \n          fill=\"" + options.logoColor + "\" \n          d=\"M253.066667,0 C457.466667,0 272.533333,0 476.933333,0 C681.333333,0 730,48.6666667 730,253.066667 C730,457.466667 730,272.533333 730,476.933333 C730,681.333333 681.333333,730 476.933333,730 C272.533333,730 457.466667,730 253.066667,730 C48.6666667,730 0,681.333333 0,476.933333 C0,272.533333 0,367.206459 0,253.066667 C0,48.6666667 48.6666667,0 253.066667,0 Z\"/><path fill=\"#FFF\" d=\"M597.816744,251.493445 C601.198942,240.214758 597.816746,231.927083 581.719678,231.927083 L528.490512,231.927083 C514.956087,231.927083 508.716524,239.08642 505.332448,246.981031 C505.332448,246.981031 478.263599,312.960647 439.917002,355.818719 C427.510915,368.224806 421.871102,372.172112 415.10389,372.172112 C411.720753,372.172112 406.822917,368.224806 406.822917,356.947057 L406.822917,251.493445 C406.822917,237.95902 402.895137,231.927083 391.615512,231.927083 L307.969678,231.927083 C299.511836,231.927083 294.425223,238.208719 294.425223,244.162063 C294.425223,256.99245 313.597583,259.951287 315.573845,296.043086 L315.573845,374.428788 C315.573845,391.614583 312.470184,394.730425 305.702972,394.730425 C287.658011,394.730425 243.763595,328.456052 217.730151,252.620844 C212.628223,237.881107 207.511068,231.927083 193.907178,231.927083 L140.678012,231.927083 C125.469678,231.927083 122.427826,239.08642 122.427826,246.981031 C122.427826,261.079625 140.473725,331.006546 206.452402,423.489903 C250.437874,486.648674 312.410515,520.885417 368.803012,520.885417 C402.638134,520.885417 406.823845,513.28125 406.823845,500.183098 L406.823845,452.447917 C406.823845,437.239583 410.029185,434.204421 420.743703,434.204421 C428.638315,434.204421 442.172739,438.151727 473.753063,468.603713 C509.843923,504.694573 515.79398,520.885417 536.094678,520.885417 L589.323845,520.885417 C604.532178,520.885417 612.136345,513.28125 607.749619,498.274853 C602.949226,483.318593 585.717788,461.619053 562.853283,435.89599 C550.446258,421.234166 531.837128,405.444943 526.197316,397.548454 C518.302704,387.399043 520.558441,382.88663 526.197316,373.864619 C526.197316,373.864619 591.049532,282.508661 597.816744,251.493445 Z\"\n        />\n      </g>\n      <clipPath id=\"logo-mask-" + options.suffix + "\">\n        <rect x=\"0\" y=\"0\" width=\"750\" height=\"750\" />\n      </clipPath>\n    </defs>\n\n    " + qrBackground + "\n\n    <g transform=\"" + qrTransform + "\">\n      " + parts.join('\n') + "\n    </g>\n  </svg>";
    };

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
    /*---- QR Code symbol class ----*/
    /*
     * A QR Code symbol, which is a type of two-dimension barcode.
     * Invented by Denso Wave and described in the ISO/IEC 18004 standard.
     * Instances of this class represent an immutable square grid of black and white cells.
     * The class provides static factory functions to create a QR Code from text or binary data.
     * The class covers the QR Code Model 2 specification, supporting all versions (sizes)
     * from 1 to 40, all 4 error correction levels, and 4 character encoding modes.
     *
     * Ways to create a QR Code object:
     * - High level: Take the payload data and call QrCode.encodeText() or QrCode.encodeBinary().
     * - Mid level: Custom-make the list of segments and call QrCode.encodeSegments().
     * - Low level: Custom-make the array of data codeword bytes (including
     *   segment headers and final padding, excluding error correction codewords),
     *   supply the appropriate version number, and call the QrCode() constructor.
     * (Note that all ways require supplying the desired error correction level.)
     */
    var QrCode = /** @class */ (function () {
        /*-- Constructor (low level) and fields --*/
        // Creates a new QR Code with the given version number,
        // error correction level, data codeword bytes, and mask number.
        // This is a low-level API that most users should not use directly.
        // A mid-level API is the encodeSegments() function.
        function QrCode(
        // The version number of this QR Code, which is between 1 and 40 (inclusive).
        // This determines the size of this barcode.
        version, 
        // The error correction level used in this QR Code.
        errorCorrectionLevel, dataCodewords, 
        // The index of the mask pattern used in this QR Code, which is between 0 and 7 (inclusive).
        // Even if a QR Code is created with automatic masking requested (mask = -1),
        // the resulting object still has a mask value between 0 and 7.
        mask) {
            this.version = version;
            this.errorCorrectionLevel = errorCorrectionLevel;
            this.mask = mask;
            // The modules of this QR Code (false = white, true = black).
            // Immutable after constructor finishes. Accessed through getModule().
            this.modules = [];
            // Indicates function modules that are not subjected to masking. Discarded when constructor finishes.
            this.isFunction = [];
            // Check scalar arguments
            if (version < QrCode.MIN_VERSION || version > QrCode.MAX_VERSION)
                throw 'Version value out of range';
            if (mask < -1 || mask > 7)
                throw 'Mask value out of range';
            this.size = version * 4 + 17;
            // Initialize both grids to be size*size arrays of Boolean false
            var row = [];
            for (var i = 0; i < this.size; i++)
                row.push(false);
            for (var i = 0; i < this.size; i++) {
                this.modules.push(row.slice()); // Initially all white
                this.isFunction.push(row.slice());
            }
            // Compute ECC, draw modules
            this.drawFunctionPatterns();
            var allCodewords = this.addEccAndInterleave(dataCodewords);
            this.drawCodewords(allCodewords);
            // Do masking
            if (mask == -1) {
                // Automatically choose best mask
                var minPenalty = 1000000000;
                for (var i = 0; i < 8; i++) {
                    this.applyMask(i);
                    this.drawFormatBits(i);
                    var penalty = this.getPenaltyScore();
                    if (penalty < minPenalty) {
                        mask = i;
                        minPenalty = penalty;
                    }
                    this.applyMask(i); // Undoes the mask due to XOR
                }
            }
            if (mask < 0 || mask > 7)
                throw 'Assertion error';
            this.mask = mask;
            this.applyMask(mask); // Apply the final choice of mask
            this.drawFormatBits(mask); // Overwrite old format bits
            this.isFunction = [];
        }
        /*-- Static factory functions (high level) --*/
        // Returns a QR Code representing the given Unicode text string at the given error correction level.
        // As a conservative upper bound, this function is guaranteed to succeed for strings that have 738 or fewer
        // Unicode code points (not UTF-16 code units) if the low error correction level is used. The smallest possible
        // QR Code version is automatically chosen for the output. The ECC level of the result may be higher than the
        // ecl argument if it can be done without increasing the version.
        QrCode.encodeText = function (text, ecl) {
            var segs = QrSegment.makeSegments(text);
            return QrCode.encodeSegments(segs, ecl);
        };
        // Returns a QR Code representing the given binary data at the given error correction level.
        // This function always encodes using the binary segment mode, not any text mode. The maximum number of
        // bytes allowed is 2953. The smallest possible QR Code version is automatically chosen for the output.
        // The ECC level of the result may be higher than the ecl argument if it can be done without increasing the version.
        QrCode.encodeBinary = function (data, ecl) {
            var seg = QrSegment.makeBytes(data);
            return QrCode.encodeSegments([seg], ecl);
        };
        /*-- Static factory functions (mid level) --*/
        // Returns a QR Code representing the given segments with the given encoding parameters.
        // The smallest possible QR Code version within the given range is automatically
        // chosen for the output. Iff boostEcl is true, then the ECC level of the result
        // may be higher than the ecl argument if it can be done without increasing the
        // version. The mask number is either between 0 to 7 (inclusive) to force that
        // mask, or -1 to automatically choose an appropriate mask (which may be slow).
        // This function allows the user to create a custom sequence of segments that switches
        // between modes (such as alphanumeric and byte) to encode text in less space.
        // This is a mid-level API; the high-level API is encodeText() and encodeBinary().
        QrCode.encodeSegments = function (segs, ecl, minVersion, maxVersion, mask, boostEcl) {
            if (minVersion === void 0) { minVersion = 1; }
            if (maxVersion === void 0) { maxVersion = 40; }
            if (mask === void 0) { mask = -1; }
            if (boostEcl === void 0) { boostEcl = true; }
            if (!(QrCode.MIN_VERSION <= minVersion && minVersion <= maxVersion && maxVersion <= QrCode.MAX_VERSION) ||
                mask < -1 ||
                mask > 7)
                throw 'Invalid value';
            // Find the minimal version number to use
            var version;
            var dataUsedBits;
            for (version = minVersion;; version++) {
                var dataCapacityBits_1 = QrCode.getNumDataCodewords(version, ecl) * 8; // Number of data bits available
                var usedBits = QrSegment.getTotalBits(segs, version);
                if (usedBits <= dataCapacityBits_1) {
                    dataUsedBits = usedBits;
                    break; // This version number is found to be suitable
                }
                if (version >= maxVersion)
                    // All versions in the range could not fit the given data
                    throw 'Data too long';
            }
            // Increase the error correction level while the data still fits in the current version number
            for (var _i = 0, _a = [QrCode.Ecc.MEDIUM, QrCode.Ecc.QUARTILE, QrCode.Ecc.HIGH]; _i < _a.length; _i++) {
                var newEcl = _a[_i];
                // From low to high
                if (boostEcl && dataUsedBits <= QrCode.getNumDataCodewords(version, newEcl) * 8)
                    ecl = newEcl;
            }
            // Concatenate all segments to create the data bit string
            var bb = new BitBuffer();
            for (var _b = 0, segs_1 = segs; _b < segs_1.length; _b++) {
                var seg = segs_1[_b];
                bb.appendBits(seg.mode.modeBits, 4);
                bb.appendBits(seg.numChars, seg.mode.numCharCountBits(version));
                for (var _c = 0, _d = seg.getData(); _c < _d.length; _c++) {
                    var b = _d[_c];
                    bb.array.push(b);
                }
            }
            if (bb.array.length != dataUsedBits)
                throw 'Assertion error';
            // Add terminator and pad up to a byte if applicable
            var dataCapacityBits = QrCode.getNumDataCodewords(version, ecl) * 8;
            if (bb.array.length > dataCapacityBits)
                throw 'Assertion error';
            bb.appendBits(0, Math.min(4, dataCapacityBits - bb.array.length));
            bb.appendBits(0, (8 - (bb.array.length % 8)) % 8);
            if (bb.array.length % 8 != 0)
                throw 'Assertion error';
            // Pad with alternating bytes until data capacity is reached
            for (var padByte = 0xec; bb.array.length < dataCapacityBits; padByte ^= 0xec ^ 0x11)
                bb.appendBits(padByte, 8);
            // Pack bits into bytes in big endian
            var dataCodewords = [];
            while (dataCodewords.length * 8 < bb.array.length)
                dataCodewords.push(0);
            bb.array.forEach(function (b, i) { return (dataCodewords[i >>> 3] |= b << (7 - (i & 7))); });
            // Create the QR Code object
            return new QrCode(version, ecl, dataCodewords, mask);
        };
        /*-- Accessor methods --*/
        // Returns the color of the module (pixel) at the given coordinates, which is false
        // for white or true for black. The top left corner has the coordinates (x=0, y=0).
        // If the given coordinates are out of bounds, then false (white) is returned.
        QrCode.prototype.getModule = function (x, y) {
            return 0 <= x && x < this.size && 0 <= y && y < this.size && this.modules[y][x];
        };
        /*-- Public instance methods --*/
        // Draws this QR Code, with the given module scale and border modules, onto the given HTML
        // canvas element. The canvas's width and height is resized to (this.size + border * 2) * scale.
        // The drawn image is be purely black and white, and fully opaque.
        // The scale must be a positive integer and the border must be a non-negative integer.
        QrCode.prototype.drawCanvas = function (scale, border, canvas) {
            if (scale <= 0 || border < 0)
                throw 'Value out of range';
            var width = (this.size + border * 2) * scale;
            canvas.width = width;
            canvas.height = width;
            var ctx = canvas.getContext('2d');
            for (var y = -border; y < this.size + border; y++) {
                for (var x = -border; x < this.size + border; x++) {
                    ctx.fillStyle = this.getModule(x, y) ? '#000000' : '#FFFFFF';
                    ctx.fillRect((x + border) * scale, (y + border) * scale, scale, scale);
                }
            }
        };
        // Returns a string of SVG code for an image depicting this QR Code, with the given number
        // of border modules. The string always uses Unix newlines (\n), regardless of the platform.
        QrCode.prototype.toSvgString = function (border) {
            if (border < 0)
                throw 'Border must be non-negative';
            var parts = [];
            for (var y = 0; y < this.size; y++) {
                for (var x = 0; x < this.size; x++) {
                    if (this.getModule(x, y))
                        parts.push("M" + (x + border) + "," + (y + border) + "h1v1h-1z");
                }
            }
            return "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<!DOCTYPE svg PUBLIC \"-//W3C//DTD SVG 1.1//EN\" \"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd\">\n<svg xmlns=\"http://www.w3.org/2000/svg\" version=\"1.1\" viewBox=\"0 0 " + (this.size + border * 2) + " " + (this.size +
                border * 2) + "\" stroke=\"none\">\n\t<rect width=\"100%\" height=\"100%\" fill=\"#FFFFFF\"/>\n\t<path d=\"" + parts.join(' ') + "\" fill=\"#000000\"/>\n</svg>\n";
        };
        /*-- Private helper methods for constructor: Drawing function modules --*/
        // Reads this object's version field, and draws and marks all function modules.
        QrCode.prototype.drawFunctionPatterns = function () {
            // Draw horizontal and vertical timing patterns
            for (var i = 0; i < this.size; i++) {
                this.setFunctionModule(6, i, i % 2 == 0);
                this.setFunctionModule(i, 6, i % 2 == 0);
            }
            // Draw 3 finder patterns (all corners except bottom right; overwrites some timing modules)
            this.drawFinderPattern(3, 3);
            this.drawFinderPattern(this.size - 4, 3);
            this.drawFinderPattern(3, this.size - 4);
            // Draw numerous alignment patterns
            var alignPatPos = this.getAlignmentPatternPositions();
            var numAlign = alignPatPos.length;
            for (var i = 0; i < numAlign; i++) {
                for (var j = 0; j < numAlign; j++) {
                    // Don't draw on the three finder corners
                    if (!((i == 0 && j == 0) || (i == 0 && j == numAlign - 1) || (i == numAlign - 1 && j == 0)))
                        this.drawAlignmentPattern(alignPatPos[i], alignPatPos[j]);
                }
            }
            // Draw configuration data
            this.drawFormatBits(0); // Dummy mask value; overwritten later in the constructor
            this.drawVersion();
        };
        // Draws two copies of the format bits (with its own error correction code)
        // based on the given mask and this object's error correction level field.
        QrCode.prototype.drawFormatBits = function (mask) {
            // Calculate error correction code and pack bits
            var data = (this.errorCorrectionLevel.formatBits << 3) | mask; // errCorrLvl is uint2, mask is uint3
            var rem = data;
            for (var i = 0; i < 10; i++)
                rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
            var bits = ((data << 10) | rem) ^ 0x5412; // uint15
            if (bits >>> 15 != 0)
                throw 'Assertion error';
            // Draw first copy
            for (var i = 0; i <= 5; i++)
                this.setFunctionModule(8, i, getBit(bits, i));
            this.setFunctionModule(8, 7, getBit(bits, 6));
            this.setFunctionModule(8, 8, getBit(bits, 7));
            this.setFunctionModule(7, 8, getBit(bits, 8));
            for (var i = 9; i < 15; i++)
                this.setFunctionModule(14 - i, 8, getBit(bits, i));
            // Draw second copy
            for (var i = 0; i < 8; i++)
                this.setFunctionModule(this.size - 1 - i, 8, getBit(bits, i));
            for (var i = 8; i < 15; i++)
                this.setFunctionModule(8, this.size - 15 + i, getBit(bits, i));
            this.setFunctionModule(8, this.size - 8, true); // Always black
        };
        // Draws two copies of the version bits (with its own error correction code),
        // based on this object's version field, iff 7 <= version <= 40.
        QrCode.prototype.drawVersion = function () {
            if (this.version < 7)
                return;
            // Calculate error correction code and pack bits
            var rem = this.version; // version is uint6, in the range [7, 40]
            for (var i = 0; i < 12; i++)
                rem = (rem << 1) ^ ((rem >>> 11) * 0x1f25);
            var bits = (this.version << 12) | rem; // uint18
            if (bits >>> 18 != 0)
                throw 'Assertion error';
            // Draw two copies
            for (var i = 0; i < 18; i++) {
                var color = getBit(bits, i);
                var a = this.size - 11 + (i % 3);
                var b = Math.floor(i / 3);
                this.setFunctionModule(a, b, color);
                this.setFunctionModule(b, a, color);
            }
        };
        // Draws a 9*9 finder pattern including the border separator,
        // with the center module at (x, y). Modules can be out of bounds.
        QrCode.prototype.drawFinderPattern = function (x, y) {
            for (var dy = -4; dy <= 4; dy++) {
                for (var dx = -4; dx <= 4; dx++) {
                    var dist = Math.max(Math.abs(dx), Math.abs(dy)); // Chebyshev/infinity norm
                    var xx = x + dx;
                    var yy = y + dy;
                    if (0 <= xx && xx < this.size && 0 <= yy && yy < this.size)
                        this.setFunctionModule(xx, yy, dist != 2 && dist != 4);
                }
            }
        };
        // Draws a 5*5 alignment pattern, with the center module
        // at (x, y). All modules must be in bounds.
        QrCode.prototype.drawAlignmentPattern = function (x, y) {
            for (var dy = -2; dy <= 2; dy++) {
                for (var dx = -2; dx <= 2; dx++)
                    this.setFunctionModule(x + dx, y + dy, Math.max(Math.abs(dx), Math.abs(dy)) != 1);
            }
        };
        // Sets the color of a module and marks it as a function module.
        // Only used by the constructor. Coordinates must be in bounds.
        QrCode.prototype.setFunctionModule = function (x, y, isBlack) {
            this.modules[y][x] = isBlack;
            this.isFunction[y][x] = true;
        };
        /*-- Private helper methods for constructor: Codewords and masking --*/
        // Returns a new byte string representing the given data with the appropriate error correction
        // codewords appended to it, based on this object's version and error correction level.
        QrCode.prototype.addEccAndInterleave = function (data) {
            var ver = this.version;
            var ecl = this.errorCorrectionLevel;
            if (data.length != QrCode.getNumDataCodewords(ver, ecl))
                throw 'Invalid argument';
            // Calculate parameter numbers
            var numBlocks = QrCode.NUM_ERROR_CORRECTION_BLOCKS[ecl.ordinal][ver];
            var blockEccLen = QrCode.ECC_CODEWORDS_PER_BLOCK[ecl.ordinal][ver];
            var rawCodewords = Math.floor(QrCode.getNumRawDataModules(ver) / 8);
            var numShortBlocks = numBlocks - (rawCodewords % numBlocks);
            var shortBlockLen = Math.floor(rawCodewords / numBlocks);
            // Split data into blocks and append ECC to each block
            var blocks = [];
            var rs = new ReedSolomonGenerator(blockEccLen);
            for (var i = 0, k = 0; i < numBlocks; i++) {
                var dat = data.slice(k, k + shortBlockLen - blockEccLen + (i < numShortBlocks ? 0 : 1));
                k += dat.length;
                var ecc = rs.getRemainder(dat);
                if (i < numShortBlocks)
                    dat.push(0);
                blocks.push(dat.concat(ecc));
            }
            // Interleave (not concatenate) the bytes from every block into a single sequence
            var result = [];
            for (var i = 0; i < blocks[0].length; i++) {
                for (var j = 0; j < blocks.length; j++) {
                    // Skip the padding byte in short blocks
                    if (i != shortBlockLen - blockEccLen || j >= numShortBlocks)
                        result.push(blocks[j][i]);
                }
            }
            if (result.length != rawCodewords)
                throw 'Assertion error';
            return result;
        };
        // Draws the given sequence of 8-bit codewords (data and error correction) onto the entire
        // data area of this QR Code. Function modules need to be marked off before this is called.
        QrCode.prototype.drawCodewords = function (data) {
            if (data.length != Math.floor(QrCode.getNumRawDataModules(this.version) / 8))
                throw 'Invalid argument';
            var i = 0; // Bit index into the data
            // Do the funny zigzag scan
            for (var right = this.size - 1; right >= 1; right -= 2) {
                // Index of right column in each column pair
                if (right == 6)
                    right = 5;
                for (var vert = 0; vert < this.size; vert++) {
                    // Vertical counter
                    for (var j = 0; j < 2; j++) {
                        var x = right - j; // Actual x coordinate
                        var upward = ((right + 1) & 2) == 0;
                        var y = upward ? this.size - 1 - vert : vert; // Actual y coordinate
                        if (!this.isFunction[y][x] && i < data.length * 8) {
                            this.modules[y][x] = getBit(data[i >>> 3], 7 - (i & 7));
                            i++;
                        }
                        // If this QR Code has any remainder bits (0 to 7), they were assigned as
                        // 0/false/white by the constructor and are left unchanged by this method
                    }
                }
            }
            if (i != data.length * 8)
                throw 'Assertion error';
        };
        // XORs the codeword modules in this QR Code with the given mask pattern.
        // The function modules must be marked and the codeword bits must be drawn
        // before masking. Due to the arithmetic of XOR, calling applyMask() with
        // the same mask value a second time will undo the mask. A final well-formed
        // QR Code needs exactly one (not zero, two, etc.) mask applied.
        QrCode.prototype.applyMask = function (mask) {
            if (mask < 0 || mask > 7)
                throw 'Mask value out of range';
            for (var y = 0; y < this.size; y++) {
                for (var x = 0; x < this.size; x++) {
                    var invert = void 0;
                    switch (mask) {
                        case 0:
                            invert = (x + y) % 2 == 0;
                            break;
                        case 1:
                            invert = y % 2 == 0;
                            break;
                        case 2:
                            invert = x % 3 == 0;
                            break;
                        case 3:
                            invert = (x + y) % 3 == 0;
                            break;
                        case 4:
                            invert = (Math.floor(x / 3) + Math.floor(y / 2)) % 2 == 0;
                            break;
                        case 5:
                            invert = ((x * y) % 2) + ((x * y) % 3) == 0;
                            break;
                        case 6:
                            invert = (((x * y) % 2) + ((x * y) % 3)) % 2 == 0;
                            break;
                        case 7:
                            invert = (((x + y) % 2) + ((x * y) % 3)) % 2 == 0;
                            break;
                        default:
                            throw 'Assertion error';
                    }
                    if (!this.isFunction[y][x] && invert)
                        this.modules[y][x] = !this.modules[y][x];
                }
            }
        };
        // Calculates and returns the penalty score based on state of this QR Code's current modules.
        // This is used by the automatic mask choice algorithm to find the mask pattern that yields the lowest score.
        QrCode.prototype.getPenaltyScore = function () {
            var result = 0;
            // Adjacent modules in row having same color, and finder-like patterns
            for (var y = 0; y < this.size; y++) {
                var runHistory = [0, 0, 0, 0, 0, 0, 0];
                var color = false;
                var runX = 0;
                for (var x = 0; x < this.size; x++) {
                    if (this.modules[y][x] == color) {
                        runX++;
                        if (runX == 5)
                            result += QrCode.PENALTY_N1;
                        else if (runX > 5)
                            result++;
                    }
                    else {
                        QrCode.addRunToHistory(runX, runHistory);
                        if (!color && QrCode.hasFinderLikePattern(runHistory))
                            result += QrCode.PENALTY_N3;
                        color = this.modules[y][x];
                        runX = 1;
                    }
                }
                QrCode.addRunToHistory(runX, runHistory);
                if (color)
                    QrCode.addRunToHistory(0, runHistory); // Dummy run of white
                if (QrCode.hasFinderLikePattern(runHistory))
                    result += QrCode.PENALTY_N3;
            }
            // Adjacent modules in column having same color, and finder-like patterns
            for (var x = 0; x < this.size; x++) {
                var runHistory = [0, 0, 0, 0, 0, 0, 0];
                var color = false;
                var runY = 0;
                for (var y = 0; y < this.size; y++) {
                    if (this.modules[y][x] == color) {
                        runY++;
                        if (runY == 5)
                            result += QrCode.PENALTY_N1;
                        else if (runY > 5)
                            result++;
                    }
                    else {
                        QrCode.addRunToHistory(runY, runHistory);
                        if (!color && QrCode.hasFinderLikePattern(runHistory))
                            result += QrCode.PENALTY_N3;
                        color = this.modules[y][x];
                        runY = 1;
                    }
                }
                QrCode.addRunToHistory(runY, runHistory);
                if (color)
                    QrCode.addRunToHistory(0, runHistory); // Dummy run of white
                if (QrCode.hasFinderLikePattern(runHistory))
                    result += QrCode.PENALTY_N3;
            }
            // 2*2 blocks of modules having same color
            for (var y = 0; y < this.size - 1; y++) {
                for (var x = 0; x < this.size - 1; x++) {
                    var color = this.modules[y][x];
                    if (color == this.modules[y][x + 1] && color == this.modules[y + 1][x] && color == this.modules[y + 1][x + 1])
                        result += QrCode.PENALTY_N2;
                }
            }
            // Balance of black and white modules
            var black = 0;
            for (var _i = 0, _a = this.modules; _i < _a.length; _i++) {
                var row = _a[_i];
                for (var _b = 0, row_1 = row; _b < row_1.length; _b++) {
                    var color = row_1[_b];
                    if (color)
                        black++;
                }
            }
            var total = this.size * this.size; // Note that size is odd, so black/total != 1/2
            // Compute the smallest integer k >= 0 such that (45-5k)% <= black/total <= (55+5k)%
            var k = Math.ceil(Math.abs(black * 20 - total * 10) / total) - 1;
            result += k * QrCode.PENALTY_N4;
            return result;
        };
        /*-- Private helper functions --*/
        // Returns an ascending list of positions of alignment patterns for this version number.
        // Each position is in the range [0,177), and are used on both the x and y axes.
        // This could be implemented as lookup table of 40 variable-length lists of integers.
        QrCode.prototype.getAlignmentPatternPositions = function () {
            if (this.version == 1)
                return [];
            else {
                var numAlign = Math.floor(this.version / 7) + 2;
                var step = this.version == 32 ? 26 : Math.ceil((this.size - 13) / (numAlign * 2 - 2)) * 2;
                var result = [6];
                for (var pos = this.size - 7; result.length < numAlign; pos -= step)
                    result.splice(1, 0, pos);
                return result;
            }
        };
        // Returns the number of data bits that can be stored in a QR Code of the given version number, after
        // all function modules are excluded. This includes remainder bits, so it might not be a multiple of 8.
        // The result is in the range [208, 29648]. This could be implemented as a 40-entry lookup table.
        QrCode.getNumRawDataModules = function (ver) {
            if (ver < QrCode.MIN_VERSION || ver > QrCode.MAX_VERSION)
                throw 'Version number out of range';
            var result = (16 * ver + 128) * ver + 64;
            if (ver >= 2) {
                var numAlign = Math.floor(ver / 7) + 2;
                result -= (25 * numAlign - 10) * numAlign - 55;
                if (ver >= 7)
                    result -= 36;
            }
            return result;
        };
        // Returns the number of 8-bit data (i.e. not error correction) codewords contained in any
        // QR Code of the given version number and error correction level, with remainder bits discarded.
        // This stateless pure function could be implemented as a (40*4)-cell lookup table.
        QrCode.getNumDataCodewords = function (ver, ecl) {
            return (Math.floor(QrCode.getNumRawDataModules(ver) / 8) -
                QrCode.ECC_CODEWORDS_PER_BLOCK[ecl.ordinal][ver] * QrCode.NUM_ERROR_CORRECTION_BLOCKS[ecl.ordinal][ver]);
        };
        // Inserts the given value to the front of the given array, which shifts over the
        // existing values and deletes the last value. A helper function for getPenaltyScore().
        QrCode.addRunToHistory = function (run, history) {
            history.pop();
            history.unshift(run);
        };
        // Tests whether the given run history has the pattern of ratio 1:1:3:1:1 in the middle, and
        // surrounded by at least 4 on either or both ends. A helper function for getPenaltyScore().
        // Must only be called immediately after a run of white modules has ended.
        QrCode.hasFinderLikePattern = function (runHistory) {
            var n = runHistory[1];
            return (n > 0 &&
                runHistory[2] == n &&
                runHistory[4] == n &&
                runHistory[5] == n &&
                runHistory[3] == n * 3 &&
                Math.max(runHistory[0], runHistory[6]) >= n * 4);
        };
        /*-- Constants and tables --*/
        // The minimum version number supported in the QR Code Model 2 standard.
        QrCode.MIN_VERSION = 1;
        // The maximum version number supported in the QR Code Model 2 standard.
        QrCode.MAX_VERSION = 40;
        // For use in getPenaltyScore(), when evaluating which mask is best.
        QrCode.PENALTY_N1 = 3;
        QrCode.PENALTY_N2 = 3;
        QrCode.PENALTY_N3 = 40;
        QrCode.PENALTY_N4 = 10;
        QrCode.ECC_CODEWORDS_PER_BLOCK = [
            /* eslint-disable */
            // Version: (note that index 0 is for padding, and is set to an illegal value)
            //0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40    Error correction level
            // prettier-ignore
            [-1, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30, 28, 28, 28, 28, 30, 30, 26, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
            // prettier-ignore
            [-1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28],
            // prettier-ignore
            [-1, 13, 22, 18, 26, 18, 24, 18, 22, 20, 24, 28, 26, 24, 20, 30, 24, 28, 28, 26, 30, 28, 30, 30, 30, 30, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
            // prettier-ignore
            [-1, 17, 28, 22, 16, 22, 28, 26, 26, 24, 28, 24, 28, 22, 24, 24, 30, 28, 28, 26, 28, 30, 24, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30] // High
            /* eslint-enable */
        ];
        QrCode.NUM_ERROR_CORRECTION_BLOCKS = [
            /* eslint-disable */
            // Version: (note that index 0 is for padding, and is set to an illegal value)
            //0, 1, 2, 3, 4, 5, 6, 7, 8, 9,10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40    Error correction level
            // prettier-ignore
            [-1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9, 9, 10, 12, 12, 12, 13, 14, 15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25],
            // prettier-ignore
            [-1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49],
            // prettier-ignore
            [-1, 1, 1, 2, 2, 4, 4, 6, 6, 8, 8, 8, 10, 12, 16, 12, 17, 16, 18, 21, 20, 23, 23, 25, 27, 29, 34, 34, 35, 38, 40, 43, 45, 48, 51, 53, 56, 59, 62, 65, 68],
            // prettier-ignore
            [-1, 1, 1, 2, 4, 4, 4, 5, 6, 8, 8, 11, 11, 16, 16, 18, 16, 19, 21, 25, 25, 25, 34, 30, 32, 35, 37, 40, 42, 45, 48, 51, 54, 57, 60, 63, 66, 70, 74, 77, 81] // High
            /* eslint-enable */
        ];
        return QrCode;
    }());
    // Returns true iff the i'th bit of x is set to 1.
    function getBit(x, i) {
        return ((x >>> i) & 1) != 0;
    }
    /*---- Data segment class ----*/
    /*
     * A segment of character/binary/control data in a QR Code symbol.
     * Instances of this class are immutable.
     * The mid-level way to create a segment is to take the payload data
     * and call a static factory function such as QrSegment.makeNumeric().
     * The low-level way to create a segment is to custom-make the bit buffer
     * and call the QrSegment() constructor with appropriate values.
     * This segment class imposes no length restrictions, but QR Codes have restrictions.
     * Even in the most favorable conditions, a QR Code can only hold 7089 characters of data.
     * Any segment longer than this is meaningless for the purpose of generating QR Codes.
     */
    var QrSegment = /** @class */ (function () {
        /*-- Constructor (low level) and fields --*/
        // Creates a new QR Code segment with the given attributes and data.
        // The character count (numChars) must agree with the mode and the bit buffer length,
        // but the constraint isn't checked. The given bit buffer is cloned and stored.
        function QrSegment(
        // The mode indicator of this segment.
        mode, 
        // The length of this segment's unencoded data. Measured in characters for
        // numeric/alphanumeric/kanji mode, bytes for byte mode, and 0 for ECI mode.
        // Always zero or positive. Not the same as the data's bit length.
        numChars, 
        // The data bits of this segment. Accessed through getData().
        bitData) {
            this.mode = mode;
            this.numChars = numChars;
            this.bitData = bitData;
            if (numChars < 0)
                throw 'Invalid argument';
            this.bitData = bitData.slice(); // Make defensive copy
        }
        /*-- Static factory functions (mid level) --*/
        // Returns a segment representing the given binary data encoded in
        // byte mode. All input byte arrays are acceptable. Any text string
        // can be converted to UTF-8 bytes and encoded as a byte mode segment.
        QrSegment.makeBytes = function (data) {
            var bb = new BitBuffer();
            for (var _i = 0, data_1 = data; _i < data_1.length; _i++) {
                var b = data_1[_i];
                bb.appendBits(b, 8);
            }
            return new QrSegment(QrSegment.Mode.BYTE, data.length, bb.array);
        };
        // Returns a segment representing the given string of decimal digits encoded in numeric mode.
        QrSegment.makeNumeric = function (digits) {
            if (!this.NUMERIC_REGEX.test(digits))
                throw 'String contains non-numeric characters';
            var bb = new BitBuffer();
            for (var i = 0; i < digits.length;) {
                // Consume up to 3 digits per iteration
                var n = Math.min(digits.length - i, 3);
                bb.appendBits(parseInt(digits.substr(i, n), 10), n * 3 + 1);
                i += n;
            }
            return new QrSegment(QrSegment.Mode.NUMERIC, digits.length, bb.array);
        };
        // Returns a segment representing the given text string encoded in alphanumeric mode.
        // The characters allowed are: 0 to 9, A to Z (uppercase only), space,
        // dollar, percent, asterisk, plus, hyphen, period, slash, colon.
        QrSegment.makeAlphanumeric = function (text) {
            if (!this.ALPHANUMERIC_REGEX.test(text))
                throw 'String contains unencodable characters in alphanumeric mode';
            var bb = new BitBuffer();
            var i;
            for (i = 0; i + 2 <= text.length; i += 2) {
                // Process groups of 2
                var temp = QrSegment.ALPHANUMERIC_CHARSET.indexOf(text.charAt(i)) * 45;
                temp += QrSegment.ALPHANUMERIC_CHARSET.indexOf(text.charAt(i + 1));
                bb.appendBits(temp, 11);
            }
            if (i < text.length)
                // 1 character remaining
                bb.appendBits(QrSegment.ALPHANUMERIC_CHARSET.indexOf(text.charAt(i)), 6);
            return new QrSegment(QrSegment.Mode.ALPHANUMERIC, text.length, bb.array);
        };
        // Returns a new mutable list of zero or more segments to represent the given Unicode text string.
        // The result may use various segment modes and switch modes to optimize the length of the bit stream.
        QrSegment.makeSegments = function (text) {
            // Select the most efficient segment encoding automatically
            if (text == '')
                return [];
            else if (this.NUMERIC_REGEX.test(text))
                return [QrSegment.makeNumeric(text)];
            else if (this.ALPHANUMERIC_REGEX.test(text))
                return [QrSegment.makeAlphanumeric(text)];
            else
                return [QrSegment.makeBytes(QrSegment.toUtf8ByteArray(text))];
        };
        // Returns a segment representing an Extended Channel Interpretation
        // (ECI) designator with the given assignment value.
        QrSegment.makeEci = function (assignVal) {
            var bb = new BitBuffer();
            if (assignVal < 0)
                throw 'ECI assignment value out of range';
            else if (assignVal < 1 << 7)
                bb.appendBits(assignVal, 8);
            else if (assignVal < 1 << 14) {
                bb.appendBits(2, 2);
                bb.appendBits(assignVal, 14);
            }
            else if (assignVal < 1000000) {
                bb.appendBits(6, 3);
                bb.appendBits(assignVal, 21);
            }
            else
                throw 'ECI assignment value out of range';
            return new QrSegment(QrSegment.Mode.ECI, 0, bb.array);
        };
        /*-- Methods --*/
        // Returns a new copy of the data bits of this segment.
        QrSegment.prototype.getData = function () {
            return this.bitData.slice(); // Make defensive copy
        };
        // (Package-private) Calculates and returns the number of bits needed to encode the given segments at
        // the given version. The result is infinity if a segment has too many characters to fit its length field.
        QrSegment.getTotalBits = function (segs, version) {
            var result = 0;
            for (var _i = 0, segs_2 = segs; _i < segs_2.length; _i++) {
                var seg = segs_2[_i];
                var ccbits = seg.mode.numCharCountBits(version);
                if (seg.numChars >= 1 << ccbits)
                    return Infinity; // The segment's length doesn't fit the field's bit width
                result += 4 + ccbits + seg.bitData.length;
            }
            return result;
        };
        // Returns a new array of bytes representing the given string encoded in UTF-8.
        QrSegment.toUtf8ByteArray = function (str) {
            str = encodeURI(str);
            var result = [];
            for (var i = 0; i < str.length; i++) {
                if (str.charAt(i) != '%')
                    result.push(str.charCodeAt(i));
                else {
                    result.push(parseInt(str.substr(i + 1, 2), 16));
                    i += 2;
                }
            }
            return result;
        };
        /*-- Constants --*/
        // Describes precisely all strings that are encodable in numeric mode. To test
        // whether a string s is encodable: let ok: boolean = NUMERIC_REGEX.test(s);
        // A string is encodable iff each character is in the range 0 to 9.
        QrSegment.NUMERIC_REGEX = /^[0-9]*$/;
        // Describes precisely all strings that are encodable in alphanumeric mode. To test
        // whether a string s is encodable: let ok: boolean = ALPHANUMERIC_REGEX.test(s);
        // A string is encodable iff each character is in the following set: 0 to 9, A to Z
        // (uppercase only), space, dollar, percent, asterisk, plus, hyphen, period, slash, colon.
        QrSegment.ALPHANUMERIC_REGEX = /^[A-Z0-9 $%*+.\/:-]*$/;
        // The set of all legal characters in alphanumeric mode,
        // where each character value maps to the index in the string.
        QrSegment.ALPHANUMERIC_CHARSET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:';
        return QrSegment;
    }());
    /*---- Private helper classes ----*/
    /*
     * Computes the Reed-Solomon error correction codewords for a sequence of data codewords
     * at a given degree. Objects are immutable, and the state only depends on the degree.
     * This class exists because each data block in a QR Code shares the same the divisor polynomial.
     */
    var ReedSolomonGenerator = /** @class */ (function () {
        // Creates a Reed-Solomon ECC generator for the given degree. This could be implemented
        // as a lookup table over all possible parameter values, instead of as an algorithm.
        function ReedSolomonGenerator(degree) {
            // Coefficients of the divisor polynomial, stored from highest to lowest power, excluding the leading term which
            // is always 1. For example the polynomial x^3 + 255x^2 + 8x + 93 is stored as the uint8 array {255, 8, 93}.
            this.coefficients = [];
            if (degree < 1 || degree > 255)
                throw 'Degree out of range';
            var coefs = this.coefficients;
            // Start with the monomial x^0
            for (var i = 0; i < degree - 1; i++)
                coefs.push(0);
            coefs.push(1);
            // Compute the product polynomial (x - r^0) * (x - r^1) * (x - r^2) * ... * (x - r^{degree-1}),
            // drop the highest term, and store the rest of the coefficients in order of descending powers.
            // Note that r = 0x02, which is a generator element of this field GF(2^8/0x11D).
            var root = 1;
            for (var i = 0; i < degree; i++) {
                // Multiply the current product by (x - r^i)
                for (var j = 0; j < coefs.length; j++) {
                    coefs[j] = ReedSolomonGenerator.multiply(coefs[j], root);
                    if (j + 1 < coefs.length)
                        coefs[j] ^= coefs[j + 1];
                }
                root = ReedSolomonGenerator.multiply(root, 0x02);
            }
        }
        // Computes and returns the Reed-Solomon error correction codewords for the given
        // sequence of data codewords. The returned object is always a new byte array.
        // This method does not alter this object's state (because it is immutable).
        ReedSolomonGenerator.prototype.getRemainder = function (data) {
            // Compute the remainder by performing polynomial division
            var result = this.coefficients.map(function (_) { return 0; });
            var _loop_1 = function (b) {
                var factor = b ^ result.shift();
                result.push(0);
                this_1.coefficients.forEach(function (coef, i) { return (result[i] ^= ReedSolomonGenerator.multiply(coef, factor)); });
            };
            var this_1 = this;
            for (var _i = 0, data_2 = data; _i < data_2.length; _i++) {
                var b = data_2[_i];
                _loop_1(b);
            }
            return result;
        };
        // Returns the product of the two given field elements modulo GF(2^8/0x11D). The arguments and result
        // are unsigned 8-bit integers. This could be implemented as a lookup table of 256*256 entries of uint8.
        ReedSolomonGenerator.multiply = function (x, y) {
            if (x >>> 8 != 0 || y >>> 8 != 0)
                throw 'Byte out of range';
            // Russian peasant multiplication
            var z = 0;
            for (var i = 7; i >= 0; i--) {
                z = (z << 1) ^ ((z >>> 7) * 0x11d);
                z ^= ((y >>> i) & 1) * x;
            }
            if (z >>> 8 != 0)
                throw 'Assertion error';
            return z;
        };
        return ReedSolomonGenerator;
    }());
    /*
     * An appendable sequence of bits (0s and 1s). Mainly used by QrSegment.
     * The implicit constructor creates an empty bit buffer (length 0).
     */
    var BitBuffer = /** @class */ (function () {
        function BitBuffer() {
            this.array = [];
        }
        // Appends the given number of low-order bits of the given value
        // to this buffer. Requires 0 <= len <= 31 and 0 <= val < 2^len.
        BitBuffer.prototype.appendBits = function (val, len) {
            if (len < 0 || len > 31 || val >>> len != 0)
                throw 'Value out of range';
            for (var i = len - 1; i >= 0; i-- // Append bit by bit
            )
                this.array.push((val >>> i) & 1);
        };
        return BitBuffer;
    }());
    /*---- Public helper enumeration ----*/
    (function (QrCode) {
        /*
         * The error correction level in a QR Code symbol. Immutable.
         */
        var Ecc = /** @class */ (function () {
            /*-- Constructor and fields --*/
            function Ecc(
            // In the range 0 to 3 (unsigned 2-bit integer).
            ordinal, 
            // (Package-private) In the range 0 to 3 (unsigned 2-bit integer).
            formatBits) {
                this.ordinal = ordinal;
                this.formatBits = formatBits;
            }
            /*-- Constants --*/
            Ecc.LOW = new Ecc(0, 1); // The QR Code can tolerate about  7% erroneous codewords
            Ecc.MEDIUM = new Ecc(1, 0); // The QR Code can tolerate about 15% erroneous codewords
            Ecc.QUARTILE = new Ecc(2, 3); // The QR Code can tolerate about 25% erroneous codewords
            Ecc.HIGH = new Ecc(3, 2); // The QR Code can tolerate about 30% erroneous codewords
            return Ecc;
        }());
        QrCode.Ecc = Ecc;
    })(QrCode || (QrCode = {}));
    /*---- Public helper enumeration ----*/
    (function (QrSegment) {
        /*
         * Describes how a segment's data bits are interpreted. Immutable.
         */
        var Mode = /** @class */ (function () {
            /*-- Constructor and fields --*/
            function Mode(
            // The mode indicator bits, which is a uint4 value (range 0 to 15).
            modeBits, 
            // Number of character count bits for three different version ranges.
            numBitsCharCount) {
                this.modeBits = modeBits;
                this.numBitsCharCount = numBitsCharCount;
            }
            /*-- Method --*/
            // (Package-private) Returns the bit width of the character count field for a segment in
            // this mode in a QR Code at the given version number. The result is in the range [0, 16].
            Mode.prototype.numCharCountBits = function (ver) {
                return this.numBitsCharCount[Math.floor((ver + 7) / 17)];
            };
            /*-- Constants --*/
            Mode.NUMERIC = new Mode(0x1, [10, 12, 14]);
            Mode.ALPHANUMERIC = new Mode(0x2, [9, 11, 13]);
            Mode.BYTE = new Mode(0x4, [8, 16, 16]);
            Mode.KANJI = new Mode(0x8, [8, 10, 12]);
            Mode.ECI = new Mode(0x7, [0, 0, 0]);
            return Mode;
        }());
        QrSegment.Mode = Mode;
    })(QrSegment || (QrSegment = {}));

    /** Default width and height of QR code */
    var DEFAULT_SIZE = 128;
    /** Default background color of QR code*/
    var BACKGROUND_COLOR_DEFAULT = '#ffffff';
    /** Default foreground color */
    var FOREGROUND_COLOR_DEFAULT = '#000000';
    /** Default logo color */
    var LOGO_COLOR_DEFAULT = '#4680c2';
    /**
     * Implementation
     */
    function createQR(text, qrSizeOrOptions, classNameLegacy, legacyOptions) {
        if (typeof text !== 'string') {
            throw new TypeError('Enter text for encoding');
        }
        // Legacy interface resolve
        var options = __assign({}, (typeof qrSizeOrOptions === 'object' && qrSizeOrOptions !== null ? qrSizeOrOptions : {}), (typeof legacyOptions === 'object' && legacyOptions !== null ? legacyOptions : {}), { qrSize: typeof qrSizeOrOptions === 'object' && qrSizeOrOptions !== null && typeof qrSizeOrOptions.qrSize === 'number'
                ? qrSizeOrOptions.qrSize
                : qrSizeOrOptions, className: typeof qrSizeOrOptions === 'object' && qrSizeOrOptions !== null && typeof qrSizeOrOptions.className === 'string'
                ? qrSizeOrOptions.className
                : classNameLegacy });
        // Fallback undefined options
        var fallbackOptions = {
            qrSize: typeof options.qrSize === 'number' ? options.qrSize : DEFAULT_SIZE,
            className: typeof options.className === 'string' ? options.className : classNameLegacy || '',
            isShowLogo: !!options.isShowLogo || false,
            isShowBackground: !!options.isShowBackground || false,
            foregroundColor: typeof options.foregroundColor === 'string' ? options.foregroundColor : FOREGROUND_COLOR_DEFAULT,
            backgroundColor: typeof options.backgroundColor === 'string' ? options.backgroundColor : BACKGROUND_COLOR_DEFAULT,
            logoColor: typeof options.logoColor === 'string' ? options.logoColor : LOGO_COLOR_DEFAULT,
            suffix: options.suffix ? options.suffix.toString() : '0',
            logoData: typeof options.logoData === 'string' ? options.logoData : null
        };
        // Code generation
        var segments = QrSegment.makeSegments(text);
        var qrCode = QrCode.encodeSegments(segments, QrCode.Ecc.QUARTILE, 1, 40, -1, true);
        var svgCode = convertSegmentsToSvgString(qrCode, fallbackOptions);
        return svgCode;
    }
    var index = {
        createQR: createQR
    };

    return index;

}));
