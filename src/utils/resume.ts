import _ from "underscore";

export class Resume {
  parts: { [key: string]: any };

  constructor() {
    this.parts = {};
  }

  addKey(key: string, value: string) {
    value = value || "";
    value = value.trim();
    // reject falsy values
    if (value) {
      if (_.has(this.parts, key)) {
        value = this.parts[key] + value;
      }

      this.parts[key] = value;
    }
  }

  addObject(key: string, options: { [key: string]: any }) {
    if (!_.has(this.parts, key)) {
      this.parts[key] = {};
    }

    _.forEach(options, function (optionVal, optionName) {
      if (optionVal) {
        this.parts[key][optionName] = optionVal;
      }
    });
  }

  jsoned(): string {
    return JSON.stringify(this.parts);
  }
}

export default function createResume(): Resume {
  return new Resume();
}
