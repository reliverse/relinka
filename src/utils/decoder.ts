/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
import { Buffer } from "safe-buffer";

/**
 * Checks if the given encoding is a valid Buffer encoding.
 * Uses Buffer.isEncoding if available, otherwise falls back to a custom implementation.
 * @param encoding - The encoding to check.
 * @returns True if the encoding is valid, false otherwise.
 */
const isEncoding: (encoding: BufferEncoding | string) => boolean =
  Buffer.isEncoding ||
  function (encoding: BufferEncoding | string): boolean {
    const enc = String(encoding).toLowerCase();
    switch (enc) {
      case "hex":
      case "utf8":
      case "utf-8":
      case "ascii":
      case "binary":
      case "base64":
      case "ucs2":
      case "ucs-2":
      case "utf16le":
      case "utf-16le":
      case "raw":
        return true;
      default:
        return false;
    }
  };

/**
 * Normalizes the given encoding to a standard form.
 * @param enc - The encoding to normalize.
 * @returns The normalized encoding or undefined if invalid.
 */
function _normalizeEncoding(
  enc?: BufferEncoding | string,
): BufferEncoding | undefined {
  if (!enc) {
    return "utf8";
  }
  let retried = false;
  let encoding = String(enc);

  while (true) {
    switch (encoding) {
      case "utf8":
      case "utf-8":
        return "utf8";
      case "ucs2":
      case "ucs-2":
      case "utf16le":
      case "utf-16le":
        return "utf16le";
      case "latin1":
      case "binary":
        return "latin1";
      case "base64":
      case "ascii":
      case "hex":
        return encoding as BufferEncoding;
      default:
        if (retried) {
          return undefined;
        }
        encoding = encoding.toLowerCase();
        retried = true;
    }
  }
}

/**
 * Normalizes the encoding and validates it.
 * @param enc - The encoding to normalize.
 * @returns The normalized encoding.
 * @throws Error if the encoding is unknown.
 */
function normalizeEncoding(enc?: BufferEncoding | string): BufferEncoding {
  const nenc = _normalizeEncoding(enc);
  if (
    typeof nenc !== "string" &&
    (Buffer.isEncoding === isEncoding || !isEncoding(enc))
  ) {
    throw new Error("Unknown encoding: " + enc);
  }
  return nenc || (enc as BufferEncoding);
}

/**
 * StringDecoder provides an interface for efficiently splitting a series of
 * buffers into a series of JS strings without breaking apart multi-byte
 * characters.
 */
export class StringDecoder {
  encoding: BufferEncoding;
  lastNeed: number;
  lastTotal: number;
  lastChar: Buffer;
  fillLast?: (buf: Buffer) => string | undefined;
  text?: (buf: Buffer, start: number) => string;
  endFn?: (buf?: Buffer) => string;
  writeFn: (buf: Buffer) => string;

  constructor(encoding?: BufferEncoding | string) {
    this.encoding = normalizeEncoding(encoding);
    let nb: number;

    switch (this.encoding) {
      case "utf16le":
        this.text = utf16Text;
        this.endFn = utf16End;
        nb = 4;
        break;
      case "utf8":
        this.fillLast = utf8FillLast;
        nb = 4;
        break;
      case "base64":
        this.text = base64Text;
        this.endFn = base64End;
        nb = 3;
        break;
      default:
        this.writeFn = simpleWrite;
        this.endFn = simpleEnd;
        return;
    }

    this.lastNeed = 0;
    this.lastTotal = 0;
    this.lastChar = Buffer.allocUnsafe(nb);
    this.writeFn = this.write.bind(this);
  }

  /**
   * Writes the buffer and returns the decoded string.
   * @param buf - The buffer to write.
   * @returns The decoded string.
   */
  write(buf: Buffer): string {
    if (buf.length === 0) {
      return "";
    }
    let r: string | undefined;
    let i: number;

    if (this.lastNeed) {
      r = this.fillLast(buf);
      if (r === undefined) {
        return "";
      }
      i = this.lastNeed;
      this.lastNeed = 0;
    } else {
      i = 0;
    }

    if (i < buf.length) {
      return r
        ? r + (this.text ? this.text(buf, i) : "")
        : this.text
          ? this.text(buf, i)
          : "";
    }

    return r || "";
  }

  /**
   * Ends the decoding and returns any remaining characters.
   * @param buf - Optional buffer to write before ending.
   * @returns The final decoded string.
   */
  end(buf?: Buffer): string {
    const result = this.endFn?.(buf) ?? "";
    return result;
  }
}

/**
 * Fills the last incomplete multi-byte character.
 * @param buf - The buffer containing the remaining bytes.
 * @returns The completed character or undefined if incomplete.
 */
function utf8FillLast(this: StringDecoder, buf: Buffer): string | undefined {
  const p = this.lastTotal - this.lastNeed;
  const r = utf8CheckExtraBytes(this, buf, p);
  if (r !== undefined) {
    return r;
  }

  if (this.lastNeed <= buf.length) {
    buf.copy(this.lastChar, p, 0, this.lastNeed);
    return this.lastChar.toString(this.encoding, 0, this.lastTotal);
  }

  buf.copy(this.lastChar, p, 0, buf.length);
  this.lastNeed -= buf.length;
}

/**
 * Returns only complete characters in a Buffer for UTF-8 encoding.
 * @param buf - The buffer to decode.
 * @param i - The starting index.
 * @returns The decoded string.
 */
function utf8Text(this: StringDecoder, buf: Buffer, i: number): string {
  const total = utf8CheckIncomplete(this, buf, i);
  if (!this.lastNeed) {
    return buf.toString("utf8", i);
  }

  this.lastTotal = total;
  const end = buf.length - (total - this.lastNeed);
  buf.copy(this.lastChar, 0, end);
  return buf.toString("utf8", i, end);
}

/**
 * Ends the UTF-8 decoding process.
 * @param buf - Optional buffer to write before ending.
 * @returns The final decoded string.
 */
function utf8End(this: StringDecoder, buf?: Buffer): string {
  const r = buf?.length ? this.write(buf) : "";
  if (this.lastNeed) {
    return r + "\ufffd";
  }
  return r;
}

/**
 * Checks the type of a UTF-8 byte.
 * @param byte - The byte to check.
 * @returns The type indicator.
 */
function utf8CheckByte(byte: number): number {
  if (byte <= 0x7f) {
    return 0;
  } else if (byte >> 5 === 0x06) {
    return 2;
  } else if (byte >> 4 === 0x0e) {
    return 3;
  } else if (byte >> 3 === 0x1e) {
    return 4;
  }
  return byte >> 6 === 0x02 ? -1 : -2;
}

/**
 * Checks for incomplete multi-byte UTF-8 characters at the end of the buffer.
 * @param self - The StringDecoder instance.
 * @param buf - The buffer to check.
 * @param i - The starting index.
 * @returns The number of bytes needed or 0 if complete.
 */
function utf8CheckIncomplete(
  self: StringDecoder,
  buf: Buffer,
  i: number,
): number {
  let j = buf.length - 1;
  if (j < i) {
    return 0;
  }

  let nb = utf8CheckByte(buf[j]);
  if (nb >= 0) {
    if (nb > 0) {
      self.lastNeed = nb - 1;
    }
    return nb;
  }

  if (--j < i || nb === -2) {
    return 0;
  }
  nb = utf8CheckByte(buf[j]);
  if (nb >= 0) {
    if (nb > 0) {
      self.lastNeed = nb - 2;
    }
    return nb;
  }

  if (--j < i || nb === -2) {
    return 0;
  }
  nb = utf8CheckByte(buf[j]);
  if (nb >= 0) {
    if (nb > 0) {
      if (nb === 2) {
        nb = 0;
      } else {
        self.lastNeed = nb - 3;
      }
    }
    return nb;
  }

  return 0;
}

/**
 * Validates continuation bytes for UTF-8 encoding.
 * @param self - The StringDecoder instance.
 * @param buf - The buffer containing continuation bytes.
 * @param p - The position to start checking.
 * @returns The replacement character if invalid, otherwise undefined.
 */
function utf8CheckExtraBytes(
  self: StringDecoder,
  buf: Buffer,
  p: number,
): string | undefined {
  if ((buf[0] & 0xc0) !== 0x80) {
    self.lastNeed = 0;
    return "\ufffd";
  }
  if (self.lastNeed > 1 && buf.length > 1) {
    if ((buf[1] & 0xc0) !== 0x80) {
      self.lastNeed = 1;
      return "\ufffd";
    }
    if (self.lastNeed > 2 && buf.length > 2) {
      if ((buf[2] & 0xc0) !== 0x80) {
        self.lastNeed = 2;
        return "\ufffd";
      }
    }
  }
}

/**
 * Returns only complete characters in a Buffer for UTF-16LE encoding.
 * @param buf - The buffer to decode.
 * @param i - The starting index.
 * @returns The decoded string.
 */
function utf16Text(this: StringDecoder, buf: Buffer, i: number): string {
  if ((buf.length - i) % 2 === 0) {
    const r = buf.toString("utf16le", i);
    if (r) {
      const c = r.charCodeAt(r.length - 1);
      if (c >= 0xd800 && c <= 0xdbff) {
        this.lastNeed = 2;
        this.lastTotal = 4;
        this.lastChar[0] = buf[buf.length - 2];
        this.lastChar[1] = buf[buf.length - 1];
        return r.slice(0, -1);
      }
    }
    return r;
  }

  this.lastNeed = 1;
  this.lastTotal = 2;
  this.lastChar[0] = buf[buf.length - 1];
  return buf.toString("utf16le", i, buf.length - 1);
}

/**
 * Ends the UTF-16LE decoding process.
 * @param buf - Optional buffer to write before ending.
 * @returns The final decoded string.
 */
function utf16End(this: StringDecoder, buf?: Buffer): string {
  const r = buf?.length ? this.write(buf) : "";
  if (this.lastNeed) {
    const end = this.lastTotal - this.lastNeed;
    return r + this.lastChar.toString("utf16le", 0, end);
  }
  return r;
}

/**
 * Returns only complete characters in a Buffer for Base64 encoding.
 * @param buf - The buffer to decode.
 * @param i - The starting index.
 * @returns The decoded string.
 */
function base64Text(this: StringDecoder, buf: Buffer, i: number): string {
  const n = (buf.length - i) % 3;
  if (n === 0) {
    return buf.toString("base64", i);
  }

  this.lastNeed = 3 - n;
  this.lastTotal = 3;

  if (n === 1) {
    this.lastChar[0] = buf[buf.length - 1];
  } else {
    this.lastChar[0] = buf[buf.length - 2];
    this.lastChar[1] = buf[buf.length - 1];
  }

  return buf.toString("base64", i, buf.length - n);
}

/**
 * Ends the Base64 decoding process.
 * @param buf - Optional buffer to write before ending.
 * @returns The final decoded string.
 */
function base64End(this: StringDecoder, buf?: Buffer): string {
  const r = buf?.length ? this.write(buf) : "";
  if (this.lastNeed) {
    return r + this.lastChar.toString("base64", 0, 3 - this.lastNeed);
  }
  return r;
}

/**
 * Passes bytes through for single-byte encodings (e.g., ascii, latin1, hex).
 * @param buf - The buffer to decode.
 * @returns The decoded string.
 */
function simpleWrite(this: StringDecoder, buf: Buffer): string {
  return buf.toString(this.encoding);
}

/**
 * Ends the decoding process for single-byte encodings.
 * @param buf - Optional buffer to decode.
 * @returns The final decoded string.
 */
function simpleEnd(this: StringDecoder, buf?: Buffer): string {
  return buf?.length ? this.write(buf) : "";
}
