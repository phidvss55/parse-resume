import parseIt from "../utils/parseIt";

class ResumeParser {
  public type: string;
  public path: string;
  public data: any;
  public file: any;

  constructor(fileObj: any) {
    if (!fileObj) {
      throw new Error("A file path or URL is required");
    }

    if (
      typeof fileObj === "string" &&
      (fileObj.startsWith("http") || fileObj.startsWith("https"))
    ) {
      this.type = "url";
      this.path = fileObj;
    } else {
      this.type = "file";
      this.file = fileObj;
      this.path = fileObj.path;
    }

    this.data = null;
  }

  parseToJSON() {
    return new Promise((resolve, reject) => {
      if (this.data) {
        return resolve(this.data);
      }

      parseIt.parseToJSON(this.file, this.type, (file, error) => {
        if (error) {
          return reject(error);
        }
        this.data = file;
        return resolve(file);
      });
    });
  }

  parseToFile(outputPath) {
    return new Promise((resolve, reject) => {
      if (!outputPath) {
        reject("Missing ouput path");
      }

      parseIt.parseToFile(this.file, this.type, outputPath, (file, error) => {
        if (error) {
          return reject(error);
        }
        this.data = file;
        return resolve(file);
      });
    });
  }
}

export default ResumeParser;
