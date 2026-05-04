const fs = require('fs');

const TEAMS = [
  ['MEX','Mexico'], ['RSA','South Africa'], ['KOR','South Korea'], ['CZE','Czech Republic'],
  ['CAN','Canada'], ['BIH','Bosnia & Herz.'], ['QAT','Qatar'], ['SUI','Switzerland'],
  ['BRA','Brazil'], ['MAR','Morocco'], ['HAI','Haiti'], ['SCO','Scotland'],
  ['USA','United States'], ['PAR','Paraguay'], ['AUS','Australia'], ['TUR','Turkey'],
  ['GER','Germany'], ['CUW','Curacao'], ['CIV','Ivory Coast'], ['ECU','Ecuador'],
  ['NED','Netherlands'], ['JPN','Japan'], ['SWE','Sweden'], ['TUN','Tunisia'],
  ['BEL','Belgium'], ['EGY','Egypt'], ['IRN','Iran'], ['NZL','New Zealand'],
  ['ESP','Spain'], ['CPV','Cape Verde'], ['KSA','Saudi Arabia'], ['URU','Uruguay'],
  ['FRA','France'], ['SEN','Senegal'], ['IRQ','Iraq'], ['NOR','Norway'],
  ['ARG','Argentina'], ['ALG','Algeria'], ['AUT','Austria'], ['JOR','Jordan'],
  ['POR','Portugal'], ['COD','DR Congo'], ['UZB','Uzbekistan'], ['COL','Colombia'],
  ['ENG','England'], ['CRO','Croatia'], ['GHA','Ghana'], ['PAN','Panama']
];

let md = `# Checklist de Figuritas por Selección\n\n`;
md += `> [!WARNING]\n> **Nota sobre el Escáner OCR:** Los resultados mostrados anteriormente fueron producto de un error de lectura. El motor extrajo solo números (ej. "10") asumiendo una numeración global del 1 al 980, sin saber si era el "10" de México, Argentina o Brasil. Para que el escáner funcione con este formato, requiere el motor de visión con referencias de imágenes, no solo OCR.\n\n`;

md += `## FWC - FIFA World Cup\n`;
md += `\`${Array.from({length: 20}, (_, i) => `FWC-${i}`).join(', ')}\`\n\n`;

for (const [prefix, country] of TEAMS) {
    md += `## ${prefix} - ${country}\n`;
    md += `\`${Array.from({length: 20}, (_, i) => `${prefix}-${i+1}`).join(', ')}\`\n\n`;
}

md += `## CC - Coca-Cola\n`;
md += `\`${Array.from({length: 12}, (_, i) => `CC-${i+1}`).join(', ')}\`\n\n`;

fs.writeFileSync('C:/Users/crist/.gemini/antigravity/brain/ca5d7e63-014f-4ac6-a50b-e216b0f267ec/scan_report.md', md);
