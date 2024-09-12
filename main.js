import fs from 'fs';
import readline from 'readline';
import ansi from 'ansi-escapes';

const { stdin, stdout } = process;

const filename = process.argv[2];

const cursorPosition = { x: 0, y: 0 };

let contentBuffer = [''];

if (!filename) {
  console.error('Usage: node main.js <filename>');
  process.exit(1);
}

const save = () => {
  fs.writeFileSync(filename, contentBuffer.join(''));
};

const updateCursorPosition = () => {
  stdout.write(ansi.cursorHide);
  stdout.write(ansi.cursorTo(cursorPosition.x, cursorPosition.y));
  stdout.write(ansi.cursorShow);
};

const render = () => {
  contentBuffer.forEach((line) => {
    stdout.write(line);
  });
  stdout.write(ansi.cursorShow);
};

const init = () => {
  cursorPosition.x = 0;
  cursorPosition.y = 0;
  stdout.write(ansi.clearScreen);
  updateCursorPosition();
  render();
}

init();

stdin.setRawMode(true);
readline.emitKeypressEvents(stdin);

stdin.on('keypress', (str, key) => {
  if (key.ctrl) {
    // save
    if (key.ctrl && key.name === 's') {
      save();
    }

    // exit
    if (key.ctrl && key.name === 'c') {
      stdout.write(ansi.clearScreen);
      process.exit();
    }
  } else if (str) {
    contentBuffer[cursorPosition.y] += str;
    stdout.write(str);
    cursorPosition.x = Math.min(cursorPosition.x + 1, stdout.columns);
    updateCursorPosition();
  }

  if (key.name === 'return') {
    contentBuffer.push('');
    cursorPosition.y = Math.min(cursorPosition.y + 1, stdout.rows);
    cursorPosition.x = 0;
    updateCursorPosition();
  }
});
