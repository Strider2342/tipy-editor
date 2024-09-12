import fs from 'fs';
import readline from 'readline';
import ansi from 'ansi-escapes';

const { stdin, stdout } = process;

const filename = process.argv[2];

const cursorPosition = { x: 0, y: 0 };

let contentBuffer = [''];
let screenOffset = 0;

if (!filename) {
  console.error('Usage: node main.js <filename>');
  process.exit(1);
}

const open = () => {
  contentBuffer = fs.readFileSync(filename, 'utf8')
  .split('\n')
  .map((line) => line + '\n');
};

const save = () => {
  fs.writeFileSync(filename, contentBuffer.join(''));
};

const updateCursorPosition = () => {
  stdout.write(ansi.cursorHide);
  stdout.write(ansi.cursorTo(cursorPosition.x, cursorPosition.y));
  stdout.write(ansi.cursorShow);
};

const render = () => {
  stdout.write(ansi.cursorHide);
  stdout.write(ansi.cursorSavePosition);
  stdout.write(ansi.clearScreen);
  stdout.write(ansi.cursorTo(0, 0));

  let start = screenOffset;
  let end = start + Math.min(contentBuffer.length - 1, stdout.rows - 1);

  let screenBuffer = [
    ...contentBuffer.slice(start, end),
    ...(new Array(stdout.rows - contentBuffer.slice(start, end).length - 1).fill('~\n')),
  ];

  screenBuffer.forEach((line) => {
    stdout.write(line);
  });

  stdout.write(ansi.cursorRestorePosition);
  stdout.write(ansi.cursorShow);
};

const init = () => {
  open();
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

    if (key.name === 'up') {
      if (screenOffset - 1 >= 0) {
        // TODO: update cursor position even if it's out of the screen
        screenOffset = screenOffset - 1;
        render();
      }
    }

    if (key.name === 'down') {
      if (screenOffset + 1 <= contentBuffer.length - 1) {
        // TODO: update cursor position even if it's out of the screen
        screenOffset = screenOffset + 1;
        render();
      }
    }
  } else {
    if (str) {
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

    if (key.name === 'home') {
      cursorPosition.x = 0;
      updateCursorPosition();
    }

    if (key.name === 'end') {
      cursorPosition.x = contentBuffer[cursorPosition.y].length - 1;
      updateCursorPosition();
    }

    if (key.name === 'up') {
      cursorPosition.y = Math.max(cursorPosition.y - 1, 0);
      cursorPosition.x = Math.min(cursorPosition.x, contentBuffer[cursorPosition.y].length - 1);
      updateCursorPosition();
    }

    if (key.name === 'down') {
      cursorPosition.y = Math.min(cursorPosition.y + 1, contentBuffer.length - 1);
      cursorPosition.x = Math.min(cursorPosition.x, contentBuffer[cursorPosition.y].length - 1);
      updateCursorPosition();
    }

    if (key.name === 'left') {
      cursorPosition.x = Math.max(cursorPosition.x - 1, 0);
      updateCursorPosition();
    }

    if (key.name === 'right') {
      cursorPosition.x = Math.min(cursorPosition.x + 1, contentBuffer[cursorPosition.y].length - 1);
      updateCursorPosition();
    }
  }
});
