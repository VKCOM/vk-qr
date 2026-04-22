export type QrOptions = {
  /**
   * Size of QR code
   * @default 128
   */
  qrSize?: number | undefined;

  /**
   * Class name of root SVG element
   */
  className?: string | undefined;

  /**
   * Show VK logo in center of QR code
   * @default false
   */
  isShowLogo?: boolean | undefined;

  /**
   * Show QR background
   * @default false
   */
  isShowBackground?: boolean | undefined;

  /**
   * QR code background HEX color. Works if `isShowBackground` is enabled.
   * @default "#ffffff"
   */
  backgroundColor?: string | undefined;

  /**
   * QR code HEX color
   */
  foregroundColor?: string | undefined;

  /**
   * Color of logo
   * @default "#000000"
   */
  logoColor?: string | undefined;

  /**
   * Reference to logo as a reference IRI
   */
  logoData?: string | null | undefined;

  /**
   * SVG elements id postfix
   */
  suffix?: string | undefined;

  /**
   * ECC Level
   */
  ecc?: number | undefined;

  /**
   * Custom INC_TILE_SIZE
   */
  incTileSize?: number | undefined;
};

type NotUndefined<T> = { [k in keyof T]-?: Exclude<T[k], undefined> };

export type RequiredQrOptions = NotUndefined<QrOptions>;
