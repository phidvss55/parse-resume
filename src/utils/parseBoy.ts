import _ from "underscore";
import parser from "./libs/parser";

/**
 * ParseBoy class.
 */
class ParseBoy {
  /**
   * Parse a file.
   * @param PreparedFile - The prepared file object.
   * @param cbGetResume - The callback function to receive the parsed resume.
   */
  parseFile(PreparedFile: any, cbGetResume: any): void {
    console.log(`I'm working with "${PreparedFile.name}" now`);
    parser.parse(PreparedFile, cbGetResume);
  }

  /**
   * Parse data from a URL.
   * @param PreparedData - The prepared data object.
   * @param cbGetResume - The callback function to receive the parsed resume.
   */
  parseUrl(PreparedData: any, cbGetResume: any): void {
    console.log("I'm working with file buffer now");
    parser.parse(
      {
        raw: PreparedData,
      },
      cbGetResume
    );
  }

  /**
   * Store a resume.
   * @param PreparedFile - The prepared file object.
   * @param Resume - The resume object to store.
   * @param path - The path to store the resume.
   * @param cbOnSaved - The callback function called when the resume is saved.
   */
  storeResume(
    PreparedFile: any,
    Resume: any,
    path: string,
    cbOnSaved: any
  ): void {
    PreparedFile.addResume(Resume);

    if (!_.isFunction(cbOnSaved)) {
      return console.error("cbOnSaved should be a function");
    }
    PreparedFile.saveResume(path, cbOnSaved);
  }
}

export default ParseBoy;
