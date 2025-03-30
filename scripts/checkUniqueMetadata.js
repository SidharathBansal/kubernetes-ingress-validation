const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const RED = '\x1b[31m';
const GREEN = "\x1b[32m";
const RESET = '\x1b[0m';
const BLUE = '\x1b[34m';
const YELLOW = '\x1b[33m';

const directoryPath = path.join(__dirname, "../ingress");

function checkUniqueMetadata() {
    const metadataMap = new Map();
    const hostPathMap = new Map();
    const serviceMap = new Map(); 
    const errors = [];

    readYamlFiles(directoryPath, metadataMap, hostPathMap, serviceMap, errors);

    if (errors.length > 0) {
        console.error(`${RED}Validation failed with the following errors:${RESET}\n`);
        errors.forEach(error => console.error(error));
        console.log(`Total Errors: ${errors.length}`)
        process.exit(1);
    } else {
        console.log(`${GREEN}Validation passed: All combinations are unique.${RESET}`);
        process.exit(0);
    }
}

function readYamlFiles(dir, metadataMap, hostPathMap, serviceMap, errors) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            readYamlFiles(filePath, metadataMap, hostPathMap, serviceMap, errors);
        } else if (path.extname(file) === '.yaml' || path.extname(file) === '.yml') {
            const fileContent = fs.readFileSync(filePath, 'utf8');
            const data = yaml.loadAll(fileContent);

            data.forEach(manifest => {
                const { name, namespace } = manifest.metadata;
                const key = `${name}-${namespace}`;

                // Check for duplicate name and namespace
                if (metadataMap.has(key)) {
                    const previousFilePath = metadataMap.get(key);
                    errors.push(`${RED}Duplicate ${BLUE}Name${RED} and ${BLUE}Namespace${RED} combination found in:\n\n${RED}Duplicate Metadata:${RESET}\n- ${BLUE} Name: ${YELLOW}${name}${RESET}\n- ${BLUE} Namespace: ${YELLOW}${namespace}\n\nFile 1:${RESET} ${filePath}\n${YELLOW}File 2:${RESET} ${previousFilePath}\n`);
                } else {
                    metadataMap.set(key, filePath);
                }

                // Check for duplicate service names, namespaces, and paths
                if (manifest.spec && manifest.spec.rules) {
                    manifest.spec.rules.forEach(rule => {
                        const host = rule.host;
                        rule.http.paths.forEach(pathObj => {
                            const path = pathObj.path;
                            const hostPathKey = `${host}-${path}`;

                            if (hostPathMap.has(hostPathKey)) {
                                const previousFile = hostPathMap.get(hostPathKey);
                                errors.push(`${RED}Duplicate path ${BLUE}'${path}'${RED} found for host ${BLUE}'${host}'${RED} in:\n${YELLOW}File 1:${RESET} ${previousFile}\n${YELLOW}File 2:${RESET} ${filePath}\n`);
                            } else {
                                hostPathMap.set(hostPathKey, filePath);
                            }

                            // Check for unique service names with namespace and path
                            const serviceName = pathObj.backend.service.name;
                            const serviceKey = `${serviceName}-${namespace}-${host}`;

                            if (serviceMap.has(serviceKey)) {
                                const previousServiceFile = serviceMap.get(serviceKey);
                                errors.push(`${RED}Duplicate service ${BLUE}'${serviceName}'${RED} with path ${BLUE}'${path}'${RED} found in:\n${YELLOW}File 1:${RESET} ${previousServiceFile}\n${YELLOW}File 2:${RESET} ${filePath}\n`);
                            } else {
                                serviceMap.set(serviceKey, filePath);
                            }
                        });
                    });
                }
            });
        }
    }
}

checkUniqueMetadata();