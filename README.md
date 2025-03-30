# Ingress YAML Validation Script

## Overview
This repository contains a **PR validation script** designed to check Kubernetes Ingress YAML files for potential issues before merging changes into the `dev` or `prod` branches. The script ensures that ingress configurations remain **unique and conflict-free**, reducing the risk of deployment failures.

## Why This Matters
Duplicate or conflicting ingress configurations can lead to:
- **Service disruptions** due to overwritten ingress rules.
- **Misrouted traffic** causing unexpected application behavior.
- **Increased debugging time** due to hard-to-detect issues.

By integrating this validation into the CI/CD pipeline, teams can **automate quality checks** and **prevent costly production issues.**

---

## Features
✅ Checks for duplicate **metadata** (name & namespace combination).
✅ Ensures **host-path** combinations are unique.
✅ Validates **service name, namespace, and host** uniqueness.
✅ Blocks faulty PRs from being merged, preventing ingress conflicts.
✅ Provides **clear error messages** for quick resolution.

---

## Repository Structure
```
/ingress-validation
│── /scripts
│   ├── checkUniqueMetadata.js  # The validation script
│── /ingress
│   ├── example-ingress.yaml    # Sample ingress configuration
│── .azure-pipelines.yml        # Azure DevOps pipeline configuration
│── README.md                   # Documentation for setup and usage
```

---

## Installation & Usage
### 1. Clone the Repository
```sh
git clone https://github.com/your-org/ingress-validation.git
cd ingress-validation
```

### 2. Install Dependencies
Ensure Node.js is installed, then run:
```sh
npm install
```

### 3. Run the Validation Script Locally
```sh
node scripts/checkUniqueMetadata.js
```

### 4. Integrate with Azure DevOps Pipeline
- Add the script execution step to your **Azure DevOps pipeline**:
```yaml
tasks:
  - script: node scripts/checkUniqueMetadata.js
    displayName: 'Validate Ingress YAML Files'
```
- Configure it to run during PR validation to enforce ingress rules before merging.

---

## Example Output
### ✅ **Successful Validation**
```
Validation passed: All combinations are unique.
```

### ❌ **Validation Failure**
```
Validation failed with the following errors:
- Duplicate Name and Namespace combination found in:
  File 1: ingress/service1.yaml
  File 2: ingress/service2.yaml

Total Errors: 1
```

---

## Contributions
We welcome contributions! Please submit a PR if you have improvements or new features to add.

For any issues, create a GitHub issue or reach out to the maintainers.

---

## License
This project is licensed under the **MIT License**.

---

Happy coding! 🚀

