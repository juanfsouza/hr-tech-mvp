const fs = require('fs');
const path = require('path');

const apiSrc = path.join(__dirname, 'apps/api/src');
const interfacesDir = path.join(apiSrc, 'interfaces');

const mapping = {
  'analyze-candidate-input.interface.ts': 'modules/ai/application/interfaces',
  'authenticated-user.interface.ts': 'shared/infrastructure/http/interfaces',
  'big-five-scores.interface.ts': 'modules/tests/domain/interfaces',
  'candidate-props.interface.ts': 'modules/candidates/domain/interfaces',
  'collaborator-props.interface.ts': 'modules/collaborators/domain/interfaces',
  'company-address.interface.ts': 'modules/companies/domain/interfaces',
  'company-context.interface.ts': 'modules/companies/domain/interfaces',
  'company-props.interface.ts': 'modules/companies/domain/interfaces',
  'complete-test-input.interface.ts': 'modules/tests/application/interfaces',
  'complete-test-output.interface.ts': 'modules/tests/application/interfaces',
  'create-candidate-input.interface.ts': 'modules/candidates/application/interfaces',
  'create-collaborator-input.interface.ts': 'modules/collaborators/application/interfaces',
  'create-collaborator-output.interface.ts': 'modules/collaborators/application/interfaces',
  'create-company-input.interface.ts': 'modules/companies/application/interfaces',
  'create-company-output.interface.ts': 'modules/companies/application/interfaces',
  'create-job-input.interface.ts': 'modules/jobs/application/interfaces',
  'create-test-session-input.interface.ts': 'modules/tests/application/interfaces',
  'create-test-session-output.interface.ts': 'modules/tests/application/interfaces',
  'disc-question-block.interface.ts': 'modules/tests/domain/interfaces',
  'disc-question-choice.interface.ts': 'modules/tests/domain/interfaces',
  'disc-result.interface.ts': 'modules/tests/domain/interfaces',
  'embedding-result.interface.ts': 'modules/ai/application/interfaces',
  'enneagram-pair-answer.interface.ts': 'modules/tests/domain/interfaces',
  'enneagram-question-pair.interface.ts': 'modules/tests/domain/interfaces',
  'enneagram-result.interface.ts': 'modules/tests/domain/interfaces',
  'generate-jd-input.interface.ts': 'modules/ai/application/interfaces',
  'get-company-output.interface.ts': 'modules/companies/application/interfaces',
  'get-session-output.interface.ts': 'modules/tests/application/interfaces',
  'icandidate-repository.interface.ts': 'modules/candidates/domain/repositories',
  'icollaborator-repository.interface.ts': 'modules/collaborators/domain/repositories',
  'icompany-repository.interface.ts': 'modules/companies/domain/repositories',
  'ihash-service.interface.ts': 'modules/auth/application/interfaces',
  'ijob-repository.interface.ts': 'modules/jobs/domain/repositories',
  'ipip-item-response.interface.ts': 'modules/tests/domain/interfaces',
  'ipip-question.interface.ts': 'modules/tests/domain/interfaces',
  'itest-repository.interface.ts': 'modules/tests/domain/repositories',
  'itoken-repository.interface.ts': 'modules/auth/domain/repositories',
  'iuser-repository.interface.ts': 'modules/users/domain/repositories',
  'job-props.interface.ts': 'modules/jobs/domain/interfaces',
  'list-candidates-by-job-input.interface.ts': 'modules/candidates/application/interfaces',
  'list-jobs-input.interface.ts': 'modules/jobs/application/interfaces',
  'match-analysis-input.interface.ts': 'modules/match/application/interfaces',
  'match-analysis-output.interface.ts': 'modules/match/application/interfaces',
  'match-result.interface.ts': 'modules/match/domain/interfaces',
  'org-chart-node.interface.ts': 'modules/collaborators/application/interfaces',
  'paginated-result.interface.ts': 'shared/domain/interfaces',
  'pagination-params.interface.ts': 'shared/domain/interfaces',
  'psych-profile-data.interface.ts': 'modules/tests/domain/interfaces',
  'refresh-token-input.interface.ts': 'modules/auth/application/interfaces',
  'refresh-token-output.interface.ts': 'modules/auth/application/interfaces',
  'save-progress-input.interface.ts': 'modules/tests/application/interfaces',
  'save-response-input.interface.ts': 'modules/tests/application/interfaces',
  'save-token-input.interface.ts': 'modules/auth/application/interfaces',
  'send-email-input.interface.ts': 'shared/application/interfaces',
  'sixteen-presult.interface.ts': 'modules/tests/domain/interfaces',
  'stored-token.interface.ts': 'modules/auth/domain/interfaces',
  'test-session-props.interface.ts': 'modules/tests/domain/interfaces',
  'update-onboarding-input.interface.ts': 'modules/companies/application/interfaces',
  'update-onboarding-output.interface.ts': 'modules/companies/application/interfaces'
};

// 1. Move files
for (const [file, destRelative] of Object.entries(mapping)) {
  const srcFile = path.join(interfacesDir, file);
  if (fs.existsSync(srcFile)) {
    const destDir = path.join(apiSrc, destRelative);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    const destFile = path.join(destDir, file);
    fs.renameSync(srcFile, destFile);
    console.log(`Moved ${file} to ${destRelative}`);
  }
}

// 2. Update imports
function getAllFiles(dirPath, arrayOfFiles) {
  files = fs.readdirSync(dirPath);
  arrayOfFiles = arrayOfFiles || [];
  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      arrayOfFiles.push(path.join(dirPath, "/", file));
    }
  });
  return arrayOfFiles;
}

const allTsFiles = getAllFiles(apiSrc);

allTsFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let hasChanges = false;

  for (const [interfaceFile, destRelative] of Object.entries(mapping)) {
    const baseName = interfaceFile.replace('.ts', '');
    
    // Replace `@/interfaces/xyz` with `@/destRelative/xyz`
    const searchRegex1 = new RegExp(`@/interfaces/${baseName}`, 'g');
    if (searchRegex1.test(content)) {
      content = content.replace(searchRegex1, `@/${destRelative}/${baseName}`);
      hasChanges = true;
    }

    // Replace relative paths like `../interfaces/xyz` or `../../interfaces/xyz` 
    // We will just replace them with the absolute `@/...` alias to avoid computing relative paths.
    const searchRegex2 = new RegExp(`['"](\\.\\./)+interfaces/${baseName}['"]`, 'g');
    if (searchRegex2.test(content)) {
      content = content.replace(searchRegex2, `'@/${destRelative}/${baseName}'`);
      hasChanges = true;
    }
  }

  if (hasChanges) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated imports in ${file}`);
  }
});

console.log('Refactoring complete.');
