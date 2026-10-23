// Pix "copia e cola" estático (BR Code, padrão do Banco Central). Sem valor fixo: quem doa escolhe.
// Só usa a chave, o nome e a cidade que o dono do site informa; nada é enviado a terceiros.

// CRC-16/CCITT-FALSE (poly 0x1021, início 0xFFFF), exigido no fim do código.
export function crc16(s: string): string {
  let crc = 0xffff;
  for (let i = 0; i < s.length; i++) {
    crc ^= s.charCodeAt(i) << 8;
    for (let b = 0; b < 8; b++) crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

const field = (id: string, value: string) => id + String(value.length).padStart(2, "0") + value;

// Nome e cidade: sem acentos, maiúsculas, tamanho máximo do padrão (25 e 15)
const clean = (s: string, max: number) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^A-Za-z0-9 ]/g, "").toUpperCase().trim().slice(0, max);

export function pixPayload({ key, name, city }: { key: string; name: string; city: string }): string {
  const body =
    field("00", "01") +
    field("26", field("00", "br.gov.bcb.pix") + field("01", key.trim())) +
    field("52", "0000") +
    field("53", "986") +
    field("58", "BR") +
    field("59", clean(name, 25) || "DOACAO") +
    field("60", clean(city, 15) || "BRASIL") +
    field("62", field("05", "***")) +
    "6304";
  return body + crc16(body);
}
