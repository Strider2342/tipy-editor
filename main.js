import fs from 'fs';
import readline from 'readline';

const { stdin, stdout } = process;

const filename = process.argv[2];

let textContent = '';

if (!filename) {
  console.error('Usage: node main.js <filename>');
  process.exit(1);
}

const save = () => {
  fs.writeFileSync(filename, textContent);
};

stdin.setRawMode(true);
readline.emitKeypressEvents(stdin);

stdin.on('keypress', (str, key) => {
  if (str) {
    textContent += str;
    stdout.write(str);
  }

  // save
  if (key.ctrl && key.name === 's') {
    save();
  }

  // exit
  if (key.ctrl && key.name === 'c') {
    process.exit();
  }
});
