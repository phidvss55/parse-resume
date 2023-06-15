import _ from "underscore";
import { Resume } from "../resume";
import dictionary from "../../directory";
import * as fs from "fs";
import { DATA_PARSE_PATH, UPLOAD_PATH } from "../constants";

const profilesWatcher = {
  inProgress: 0,
};

function makeRegExpFromDictionary() {
  const regularRules = {
    titles: {},
    profiles: <any[]>[],
    inline: {},
  };

  _.forEach(dictionary.titles, function (titles, key) {
    regularRules.titles[key] = [];
    _.forEach(titles, function (title: any) {
      regularRules.titles[key].push(title.toUpperCase());
      regularRules.titles[key].push(
        title[0].toUpperCase() + title.substr(1, title.length)
      );
    });
  });

  _.forEach(dictionary.profiles, function (profile: any) {
    let profileHandler: any;

    if (typeof profile !== "string") {
      profile = profile[0];
    }

    const profileExpr: string =
      "((?:https?://)?(?:www\\.)?" +
      profile.replace(".", "\\.") +
      "[/\\w \\.-]*)";
    if (_.isArray(profile)) {
      if (_.isFunction(profile[1])) {
        profileHandler = profile[1];
      }
      profile = profile[0];
    }

    if (_.isFunction(profileHandler)) {
      regularRules.profiles.push([profileExpr, profileHandler]);
    } else {
      regularRules.profiles.push(profileExpr);
    }
  });

  _.forEach(dictionary.inline, function (expr, name) {
    regularRules.inline[name] = expr + ":?[\\s]*(.*)";
  });

  return _.extend(dictionary, regularRules);
}

// dictionary is object, so it will be extended by reference
makeRegExpFromDictionary();

function parse(PreparedFile, cbReturnResume) {
  if (PreparedFile && !PreparedFile.raw) {
    cbReturnResume({ parts: {} }, { error: "Failed to parse" });
    return {};
  }
  const rawFileData = PreparedFile.raw;
  const resumeObj = new Resume();
  const rows = rawFileData.split("\n");
  let row: any;

  // save prepared file text (for debug)
  let parsed_path = process.cwd() + "/" + UPLOAD_PATH + "/" + DATA_PARSE_PATH;
  if (!fs.existsSync(parsed_path)) {
    fs.mkdirSync(parsed_path);
  }
  parsed_path = parsed_path + "/" + PreparedFile.name + ".txt";
  fs.writeFile(parsed_path, rawFileData, { flag: "a+" }, (err) =>
    console.log("err", err)
  );

  // 1 parse regulars
  parseDictionaryRegular(rawFileData, resumeObj);

  for (let i = 0; i < rows.length; i++) {
    row = rows[i];

    // 2 parse profiles
    row = rows[i] = parseDictionaryProfiles(row, resumeObj);
    // 3 parse titles
    parseDictionaryTitles(resumeObj, rows, i);
    parseDictionaryInline(resumeObj, row);
  }

  if (_.isFunction(cbReturnResume)) {
    // wait until download and handle internet profile
    let i = 0;
    const checkTimer = setInterval(function () {
      i++;
      if (profilesWatcher.inProgress === 0 || i > 5) {
        //if (profilesWatcher.inProgress === 0) {
        cbReturnResume(resumeObj);
        clearInterval(checkTimer);
      }
    }, 200);
  } else {
    return console.error("cbReturnResume should be a function");
  }
}

/**
 * Make text from @rowNum index of @allRows to the end of @allRows
 * @param rowNum
 * @param allRows
 * @returns {string}
 */
function restoreTextByRows(rowNum, allRows) {
  rowNum = rowNum - 1;
  const rows: any[] = [];

  do {
    rows.push(allRows[rowNum]);
    rowNum++;
  } while (rowNum < allRows.length);

  return rows.join("\n");
}

/**
 * Count words in string
 * @param str
 * @returns {Number}
 */
function countWords(str) {
  return str.split(" ").length;
}

/**
 *
 * @param Resume
 * @param row
 */
function parseDictionaryInline(Resume, row) {
  let find;

  _.forEach(dictionary.inline, function (expression, key) {
    find = new RegExp(expression).exec(row);
    if (find) {
      Resume.addKey(key.toLowerCase(), find[1]);
    }
  });
}

/**
 *
 * @param data
 * @param Resume
 */
function parseDictionaryRegular(data, Resume) {
  const regularDictionary = dictionary.regular;
  let find: any;

  _.forEach(regularDictionary, function (expressions, key) {
    _.forEach(expressions, function (expression) {
      find = new RegExp(expression).exec(data);
      if (find) {
        Resume.addKey(key.toLowerCase(), find[0]);
      }
    });
  });
}

/**
 *
 * @param Resume
 * @param rows
 * @param rowIdx
 */
function parseDictionaryTitles(Resume, rows, rowIdx) {
  let allTitles = _.flatten(_.toArray(dictionary.titles)).join("|");
  let searchExpression = "";
  let ruleExpression: any;
  let isRuleFound: any;
  let result;

  const row = rows[rowIdx];

  _.forEach(dictionary.titles, function (expressions, key) {
    expressions = expressions || [];
    // means, that titled row is less than 5 words
    if (countWords(row) <= 5) {
      _.forEach(expressions, function (expression) {
        ruleExpression = new RegExp(expression);
        isRuleFound = ruleExpression.test(row);

        if (isRuleFound) {
          allTitles = _.without(allTitles.split("|"), key).join("|");
          searchExpression =
            "(?:" + expression + ")((.*\n)+?)(?:" + allTitles + "|{end})";
          // restore remaining text to search in relevant part of text
          result = new RegExp(searchExpression, "gm").exec(
            restoreTextByRows(rowIdx, rows)
          );

          if (result) {
            Resume.addKey(key, result[1]);
          }
        }
      });
    }
  });
}

/**
 *
 * @param row
 * @param Resume
 * @returns {*}
 */
function parseDictionaryProfiles(row, Resume) {
  const regularDictionary = dictionary.profiles;
  let find: any;
  let modifiedRow = row;

  _.forEach(regularDictionary, function (expression: any) {
    let expressionHandler;

    if (_.isArray(expression)) {
      if (_.isFunction(expression[1])) {
        expressionHandler = expression[1];
      }
      expression = expression[0];
    }

    find = new RegExp(expression).exec(row);
    if (find) {
      Resume.addKey("profiles", find[0] + "\n");
      modifiedRow = row.replace(find[0], "");
      if (_.isFunction(expressionHandler)) {
        profilesWatcher.inProgress++;
        expressionHandler(find[0], Resume, profilesWatcher);
      }
    }
  });

  return modifiedRow;
}

export default {
  parse,
};
