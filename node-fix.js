const fs = require('fs');
const path = require('path');

console.log('⚙️ Sửa lỗi tương thích Node.js v22.x với React Scripts...');

// Tạo thư mục và file nếu chưa tồn tại
function ensureDirectoryExistence(filePath) {
  const dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  ensureDirectoryExistence(dirname);
  fs.mkdirSync(dirname);
}

// File 1: buildChildren.js
const buildChildrenPath = path.join(
  __dirname, 
  'node_modules', 
  '@babel', 
  'types', 
  'lib', 
  'builders', 
  'react', 
  'buildChildren.js'
);

const buildChildrenContent = `"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = buildChildren;

var _generated = require("../../validators/generated");

var _cleanJSXElementLiteralChild = require("../../utils/react/cleanJSXElementLiteralChild");

function buildChildren(node) {
  const elements = [];

  for (let i = 0; i < node.children.length; i++) {
    const child = node.children[i];

    if ((0, _generated.isJSXText)(child)) {
      const cleanChild = (0, _cleanJSXElementLiteralChild.default)(child, true);
      if (cleanChild !== undefined) elements.push(cleanChild);
      continue;
    }

    if ((0, _generated.isJSXExpressionContainer)(child)) {
      if ((0, _generated.isJSXEmptyExpression)(child.expression)) {
        continue;
      }

      elements.push(child.expression);
      continue;
    }

    if ((0, _generated.isJSXFragment)(child) || (0, _generated.isJSXElement)(child)) {
      elements.push(child);
      continue;
    }

    if ((0, _generated.isJSXSpreadChild)(child)) {
      elements.push(child.expression);
      continue;
    }

    elements.push(child);
  }

  return elements;
}`;

// File 2: cleanJSXElementLiteralChild.js
const cleanJSXPath = path.join(
  __dirname, 
  'node_modules', 
  '@babel', 
  'types', 
  'lib', 
  'utils', 
  'react', 
  'cleanJSXElementLiteralChild.js'
);

const cleanJSXContent = `"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = cleanJSXElementLiteralChild;

var _generated = require("../../builders/generated");

function cleanJSXElementLiteralChild(child, isLast) {
  const lines = child.value.split(/\\r\\n|\\n|\\r/);
  let lastNonEmptyLine = 0;

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].match(/[^ \\t]/)) {
      lastNonEmptyLine = i;
    }
  }

  let str = "";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const isFirstLine = i === 0;
    const isLastLine = i === lines.length - 1;
    const isLastNonEmptyLine = i === lastNonEmptyLine;
    let trimmedLine = line.replace(/\\t/g, " ");

    if (!isFirstLine) {
      trimmedLine = trimmedLine.replace(/^[ ]+/, "");
    }

    if (!isLastLine) {
      trimmedLine = trimmedLine.replace(/[ ]+$/, "");
    }

    if (trimmedLine) {
      if (!isLastNonEmptyLine && !isLastLine && /^[ ]*$/.test(lines[i + 1])) {
        trimmedLine += " ";
      }

      str += trimmedLine;
    }

    if (!isLastLine) str += "\\n";
  }

  if (isLast && str === "\\n") return null;
  return str !== "" ? (0, _generated.stringLiteral)(str) : null;
}`;

// Tạo các file
ensureDirectoryExistence(buildChildrenPath);
fs.writeFileSync(buildChildrenPath, buildChildrenContent);

ensureDirectoryExistence(cleanJSXPath);
fs.writeFileSync(cleanJSXPath, cleanJSXContent);

console.log('✅ Đã tạo các file thiếu. Thử chạy "npm start" lại.'); 