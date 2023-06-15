import ParseBoy from "./parseBoy";
import processing from "./libs/processing";

const parser = {
  parseToJSON: function (path: any, type: any, cbAfterParse: any) {
    const objParseBoy = new ParseBoy();
    if (type === "url") {
      processing.runUrl(path, (preppedFile: any, error: any) => {
        return objParseBoy.parseUrl(preppedFile, (parsedResume) =>
          cbAfterParse(parsedResume, error)
        );
      });
    } else {
      processing.runFile(path, (preppedFile, error) => {
        objParseBoy.parseFile(preppedFile, (parsedResume) =>
          cbAfterParse(parsedResume, error)
        );
      });
    }
  },
  parseToFile: function (path, type, savePath, cbAfterParse) {
    const objParseBoy = new ParseBoy();
    const storeFile = (preppedFile, Resume, savePath, cbAfterParse) => {
      objParseBoy.storeResume(preppedFile, Resume, savePath, function (err) {
        if (err) {
          console.log("Resume " + preppedFile.name + " errored", err);
          return cbAfterParse(null, "Resume " + preppedFile.name + " errored");
        }
        console.log("Resume " + preppedFile.name + " saved");
        return cbAfterParse(preppedFile.name);
      });
    };

    if (type === "url") {
      processing.runUrl(path, (preppedFile) => {
        if (preppedFile) {
          objParseBoy.parseUrl(preppedFile, (resume) =>
            storeFile(
              new processing.PreparedFile(path.split("/").pop(), preppedFile),
              resume,
              savePath,
              cbAfterParse
            )
          );
        }
      });
    } else {
      processing.runFile(path, (preppedFile) => {
        if (preppedFile) {
          objParseBoy.parseFile(preppedFile, (resume) =>
            storeFile(preppedFile, resume, savePath, cbAfterParse)
          );
        }
      });
    }
  },
};

export default parser;
