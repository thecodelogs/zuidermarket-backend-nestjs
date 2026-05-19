const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function getControllerFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getControllerFiles(filePath, fileList);
    } else if (filePath.endsWith('.controller.ts')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const files = getControllerFiles(path.join(__dirname, 'src'));

for (const file of files) {
  let content = fs.readFileSync(file, 'utf-8');
  
  if (!content.includes('AuthGuard')) {
    continue;
  }
  
  // Check if we need to add the import
  if (!content.includes('ApiBearerAuth')) {
    // Find the last import
    const importRegex = /import .* from '.*';\n/g;
    let match;
    let lastImportIndex = 0;
    while ((match = importRegex.exec(content)) !== null) {
      lastImportIndex = match.index + match[0].length;
    }
    
    if (lastImportIndex > 0) {
      content = content.slice(0, lastImportIndex) + "import { ApiBearerAuth } from '@nestjs/swagger';\n" + content.slice(lastImportIndex);
    } else {
      content = "import { ApiBearerAuth } from '@nestjs/swagger';\n" + content;
    }
  }

  // 1. Check for class-level guard
  const controllerRegex = /(@Controller\([^)]*\))/g;
  const useGuardsRegex = /@UseGuards\([^)]*AuthGuard[^)]*\)/g;
  
  const controllerMatch = controllerRegex.exec(content);
  if (controllerMatch) {
    const controllerIndex = controllerMatch.index;
    
    // Check if there is an AuthGuard before @Controller
    let hasClassLevelGuard = false;
    let guardMatch;
    useGuardsRegex.lastIndex = 0;
    while ((guardMatch = useGuardsRegex.exec(content)) !== null) {
      if (guardMatch.index < controllerIndex) {
        // make sure it's not local auth guard
        if (!guardMatch[0].includes("'local'")) {
            hasClassLevelGuard = true;
        }
      }
    }
    
    if (hasClassLevelGuard && !content.includes('@ApiBearerAuth()\n@Controller')) {
      content = content.replace(controllerMatch[0], `@ApiBearerAuth()\n${controllerMatch[0]}`);
    } else {
      // 2. Method-level guards
      // Find all @UseGuards that contain AuthGuard(NOT local) and are placed inside the class
      let match;
      useGuardsRegex.lastIndex = 0;
      let replacements = [];
      while ((match = useGuardsRegex.exec(content)) !== null) {
        if (match.index > controllerIndex && !match[0].includes("'local'")) {
          // Check if @ApiBearerAuth is already above it
          const previousText = content.slice(Math.max(0, match.index - 50), match.index);
          if (!previousText.includes('@ApiBearerAuth')) {
            replacements.push({
              index: match.index,
              length: match[0].length,
              text: `@ApiBearerAuth()\n    ${match[0]}`
            });
          }
        }
      }
      
      // Apply replacements backwards
      for (let i = replacements.length - 1; i >= 0; i--) {
        const rep = replacements[i];
        content = content.slice(0, rep.index) + rep.text + content.slice(rep.index + rep.length); 
      }
    }
  }

  fs.writeFileSync(file, content);
}

console.log('Done processing controllers');
