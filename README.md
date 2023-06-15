# Resume Parser

A package that using to parse the data from pdf of resume to json or file

## Installation

`npm install parse-resume --save`

## Usage

```
const ResumeParser = require('parse-resume');

// From file
const resume = new ResumeParser("./files/resume.doc");


// From URL
const resume = new ResumeParser("https://writing.colostate.edu/guides/documents/resume/functionalSample.pdf");

//Convert to JSON Object
  resume.parseToJSON()
  .then(data => {
    console.log('Yay! ', data);
  })
  .catch(error => {
    console.error(error);
  });

//Save to JSON File
resume.parseToFile('converted') //output subdirectory
  .then(file => {
    console.log('Yay! ', file);
  })
  .catch(error => {
    console.error(error);
  });
```

At this moment application will work fine, but! By default it supports only `.TXT` and `.HTML` text formats. For better performance you should install at least support of `.PDF` (and `.DOC`). Here is instructions, how to do it from [textract README](https://github.com/dbashford/textract#requirements) file:

## Comments

This is just a package was rebuild from an available library [link](https://github.com/umairnadeem/resume-parser). I has made some refactor for running well on typescript.
Just put your rule according to existing and following main principles and enjoy!
