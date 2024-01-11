export type QrOptions = {
  /**
   * Size of QR code
   * @default 128
   */
  qrSize?: number;

  /**
   * Class name of root SVG element
   */
  className?: string;

  /**
   * Show VK logo in center of QR code
   * @default false
   */
  isShowLogo?: boolean;

  /**
   * Show QR background
   * @default false
   */
  isShowBackground?: boolean;

  /**
   * QR code background HEX color. Works if `isShowBackground` is enabled.
   * @default "#ffffff"
   */
  backgroundColor?: string;

  /**
   * QR code HEX color
   */
  foregroundColor?: string;

  /**
   * Color of logo
   * @default "#000000"
   */
  logoColor?: string;

  /**
   * Reference to logo as a reference IRI
   */
  logoData?: string | null;

  /**
   * SVG elements id postfix
   */
  suffix?: string;

  /**
   * ECC Level
   */
  ecc?: number

  /**
   * Custom INC_TILE_SIZE
   */
  incTileSize?: number
};
