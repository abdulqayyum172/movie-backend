const ejs = require('ejs');
const path = require('path');

async function test() {
  try {
    const templatePath = path.join(__dirname, 'src', 'templates', 'welcome.ejs');
    const data = { username: 'Test', year: 2026, appUrl: 'http://localhost' };
    const html = await ejs.renderFile(templatePath, data);
    console.log('Render success, length:', html.length);
  } catch (err) {
    console.error('Render error:', err);
  }
}

test();
