/* 
GOALS
  -> Create a app that parses MD files and rearranges the sections in alphabetical order.
  -> Subsections are arranged in alphabetical order as well.

HOW
  -> * Read the file and convert it to string. *
  -> Process that string and split into sections.
  -> Reorganize the sections in a sorted manner.
  -> Recombine the sections into a single string.
  -> Write that Document to another file.

Data Structures
 -> Linked list or Array + Hashtables? 
 -> Is sorting an Linked list better than sorting an array?
  - The array methods in JS are robust vs no support for linked lists.

Format 
- Header is marked by a #
- Each Section is scored by ##  
- Each Subsubection is scored by ####
*/

const fs = require("fs");

class Section {
  constructor(title) {
    this.sectionTitle = title;
    this.name = (() => {
      // let name = this.subSectionTitle.match(/([^#\r\n]+)/)[0];
      //  name = name.substring(1)
       let name = this.sectionTitle;
      return name;
    })();
    this.content = '',
    this.subSections = [];
  }
}





class ParseFile {
  constructor(inputFile, outputName = "output.md") {
    this.file = fs.readFileSync(inputFile).toString("utf-8");
    //Matches each Section and each subsection.
    this.pattern = /(##.+|^#\s.+)/;
    this.outputName = outputName;
  }

  parseSections = (file) => {
    const sections = [];
    let sectionCount = -1;
    let subSection = false;
    let subSectionCount = -1;
    let sectionHeader = false;

    for (let i = 0; i < file.length; i++) {
      //Skip if blank space
      if (file[i] == "") {
        continue;
      }

      //If section is reached Make section
      if (file[i].match(/(##.+|#\s.+)/)) {
        let section = new Section(file[i]);
        section.type = this.determineSectionType(file[i]);
        //if subsection push to subsections
        if (section.type === "Subsection") {
          sectionHeader = false;
          sections[sectionCount].subSections.push(section);
          subSectionCount++;
          continue;
        }

        //If new Section Header create new section
        if (section.type === "Section Header" || section.type === "Page Header") {
          subSection = false;
          sectionCount++;
          subSectionCount = -1;
          sectionHeader = true;
          sections.push(section);
          continue;
        }
      }

      //Gather Subsection content.
      if (subSection === true) {
        sections[sectionCount].subSections[subSectionCount].content += file[i];
        continue;
      }
      //Gather Section Header Content.
      if (sectionHeader === true) {
        //fill section with content.
        sections[sectionCount].content += file[i];
        continue;
      }
    }

    return sections;
  };

  determineSectionType = (str) => {
    let type = "";

    if (str.match(/(^#\s.+)/)) {
      type = "Page Header";
      return type;
    } else if (str.match(/(^##\s.+)/)) {
      type = "Section Header";
      return type;
    } else if (str.match(/(^####\s.+)/)) {
      type = "Subsection";
      return type;
    } else {
      type = "Type Undetermined.";
      return type;
    }
  };

  parse() {
    //Split File by section
    const text = this.file.split(/(##.+|#\s.+)/);
    const parsedFile = this.parseSections(text);
    return parsedFile;
  }
}

const fileParser = new ParseFile("./testFile.md");

console.log(fileParser.parse());


