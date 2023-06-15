import _ from "underscore";
import * as fs from "fs";
import * as path from "path";
import * as textract from "textract";
import * as mime from "mime";
import { UPLOAD_PATH } from "../constants";

/**
 *
 * @param file
 * @param cbAfterProcessing
 */
function processFile(file, cbAfterProcessing) {
  extractTextFile(file, function (PreparedFile, error) {
    if (_.isFunction(cbAfterProcessing)) {
      if (error) {
        return cbAfterProcessing(null, error);
      }
      cbAfterProcessing(PreparedFile);
    } else {
      console.error("cbAfterProcessing should be a function");
      cbAfterProcessing(null, "cbAfterProcessing should be a function");
    }
  });
}

function processUrl(url, cbAfterProcessing) {
  extractTextUrl(url, function (data, error) {
    if (_.isFunction(cbAfterProcessing)) {
      if (error) {
        return cbAfterProcessing(null, error);
      }
      cbAfterProcessing(data);
    } else {
      console.error("cbAfterProcessing should be a function");
      cbAfterProcessing(null, "cbAfterProcessing should be a function");
    }
  });
}

/**
 *
 * @param data
 * @returns {string}
 */
function cleanTextByRows(data) {
  const rows = data.split("\n");
  const clearRows: any = [];
  let clearRow: any;

  for (let i = 0; i < rows.length; i++) {
    clearRow = cleanStr(rows[i]);
    if (clearRow) {
      clearRows.push(clearRow);
    }
  }

  return clearRows.join("\n") + "\n{end}";
}

/**
 *
 * @param file
 * @param cbAfterExtract
 */
function extractTextFile(file, cbAfterExtract) {
  textract.fromFileWithPath(
    file.path,
    { preserveLineBreaks: true },
    function (err, data) {
      if (err) {
        console.error(err);
        return cbAfterExtract(null, err);
      }

      if (_.isFunction(cbAfterExtract)) {
        data = cleanTextByRows(data);
        const File = new PreparedFile(file, data.replace(/^\s/gm, ""));
        cbAfterExtract(File);
      } else {
        console.error("cbAfterExtract should be a function");
        return cbAfterExtract(null, "cbAfterExtract should be a function");
      }
    }
  );
}

function extractTextUrl(url, cbAfterExtract) {
  console.log(url);
  textract.fromUrl(url, { preserveLineBreaks: true }, function (err, data) {
    if (err) {
      console.error(err);
      return cbAfterExtract(null, err);
    }
    if (_.isFunction(cbAfterExtract)) {
      data = cleanTextByRows(data);
      cbAfterExtract(data);
    } else {
      console.error("cbAfterExtract should be a function");
      return cbAfterExtract(null, "cbAfterExtract should be a function");
    }
  });
}

/**
 *
 * @param str
 * @returns {string}
 */
function cleanStr(str) {
  return str.replace(/\r?\n|\r|\t|\n/g, "").trim();
}

function PreparedFile(file: any, raw: any) {
  this.path = file;
  this.mime = mime.getType(file);
  this.ext = mime.getExtension(this.mime);
  this.raw = raw;
  this.name = path.basename(file.path);
}

/**
 *
 * @param Resume
 */
PreparedFile.prototype.addResume = function (Resume) {
  this.resume = Resume;
};

PreparedFile.prototype.saveResume = function (path, cbSavedResume) {
  path = path || __dirname;

  if (!_.isFunction(cbSavedResume)) {
    return console.error("cbSavedResume should be a function");
  }

  const parsed_path = process.cwd() + "/" + UPLOAD_PATH + "/" + path;
  if (!fs.existsSync(parsed_path)) {
    fs.mkdirSync(parsed_path);
  }

  if (fs.statSync(parsed_path).isDirectory() && this.resume) {
    const storedPath = parsed_path + "/" + this.name + ".json";
    console.log("this.resume", this.resume);
    fs.writeFile(storedPath, this.resume.jsoned(), cbSavedResume);
  }
};

export default {
  runFile: processFile,
  runUrl: processUrl,
  PreparedFile: PreparedFile,
};
