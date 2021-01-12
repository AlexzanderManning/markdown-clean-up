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
const { type } = require("os");

// const file = fs.readFileSync("./testFile.md").toString("utf-8");


// const pattern = /(##.+|^#\s.+)/;
// const text = file.split(/(##.+|#\s.+)/);

//*Split string into sections
//*Create objects for each Main section
//*Put subsections in Main sections.
//*Get each section and subsection into its own object.

class Section {
  constructor(title) {
    this.subSectionTitle = title;
    this.name = (() => {
      let name = this.subSectionTitle.match(/([^#\r\n]+)/)[0];
      name = name.substring(1)
      return name;
    })();
  }
}



class ParseFile {
  constructor(inputFile, outputName = 'output.md') {
    this.file = fs.readFileSync(inputFile).toString("utf-8");
    //Matches each Section and each subsection.
    this.pattern = /(##.+|^#\s.+)/;
    this.outputName = outputName;
  }

  parseSections = (file) => {
    const sections = [];
    for (let i = 0; i < file.length; i++) {
      //If section is reached Make section
      if (file[i].match(/(##.+|#\s.+)/)) {
        let section = new Section(file[i]);
        section.type = this.determineSectionType(file[i]);
        if(section.type === 'Page Header'){
          //get introductory content
          //if Subsection is reached
          //get that content
          //break when new Section header is reached
        }else if(section.type === 'Section Header'){
          //get introductory content
          //if Subsection is reached
            //get that content
            //break when new Section header is reached
        }else if(section.type === 'Subsection'){

        }

        
        sections.push(section);
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

  gatherContent = (arr, i) => {
    for (let j = i + 1; j < arr.length; j++) {
      let content = "";

      if (!arr[j].match(/(##.+|^#\s.+)/)) {
        content += arr[j];
      } else {
        break;
      }
      return content;
    }
  };

  parse(){
    //Split File by section
     const text = this.file.split(/(##.+|#\s.+)/);
     const parsedFile = this.parseSections(text);

     return parsedFile
  }
}

// const gatherContent = (sectionType, arr, i) => {
//   switch(sectionType){
//     case 'Section Header':
//       content = new Section()
//     default:
//     let content = gatherSubSectionContent(arr, i)
//     return content;
//   }
// }

// console.log(parseFile(text));

const fileParser = new ParseFile("./testFile.md");

console.log(fileParser.parse());