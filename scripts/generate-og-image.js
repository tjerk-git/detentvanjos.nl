const { Jimp } = require('jimp');
const fs = require('fs');
const path = require('path');

async function main() {
  // Extract the embedded PNG from the SVG
  const svgContent = fs.readFileSync(path.resolve(__dirname, '../public/img/logo.svg'), 'utf8');
  const match = svgContent.match(/xlink:href="data:image\/png;base64,([^"]+)"/);
  if (!match) throw new Error('Could not find embedded PNG in SVG');
  const logoPngBuffer = Buffer.from(match[1], 'base64');

  const W = 1200;
  const H = 630;
  const logoSize = 420;

  // Load logo PNG from buffer
  const logo = await Jimp.fromBuffer(logoPngBuffer);
  logo.resize({ w: logoSize, h: logoSize });

  // Create orange background and composite logo centered
  const bg = await Jimp.fromBuffer(
    await new Jimp({ width: W, height: H, color: 0xf68953ff }).getBuffer('image/png')
  );

  const x = Math.floor((W - logoSize) / 2);
  const y = Math.floor((H - logoSize) / 2);
  bg.composite(logo, x, y);

  const out = path.resolve(__dirname, '../public/img/og-image.png');
  await bg.write(out);
  const size = fs.statSync(out).size;
  console.log(`Written: ${out} (${(size / 1024).toFixed(1)} KB)`);
}

main().catch(err => { console.error(err); process.exit(1); });
