# Node.js Static Website Project — Full Documentation

This document provides a comprehensive, step-by-step explanation of every file, command, and process used to develop, test, build, run, containerize, and deploy this Node.js static website project. It is designed for both beginners and experienced developers.

---

## 1. Project Structure & Purpose

```
nodejs-app/
├── Dockerfile                # Docker build instructions
├── index.js                  # Main Node.js server
├── k8s-deployment.yaml       # Kubernetes deployment manifest
├── k8s-service.yaml          # Kubernetes service manifest
├── package.json              # Project metadata, dependencies, scripts
├── README.md                 # Project summary
├── documentation.md          # This detailed documentation
├── public/                   # Static website files
│   ├── index.html            # Homepage
│   └── assets/               # CSS, JS, images
│       ├── main.js
│       └── style.css
└── test/
    └── index.test.js         # Automated tests
```

**Goal:**
- Serve a static website using Node.js.
- Containerize the app for portability.
- Deploy to Kubernetes (k3s, Docker Desktop, or cloud).
- Automate testing and deployment with CI/CD.

---

## 2. Application Source Code (`index.js`)

- **Purpose:** Implements a basic HTTP server using Node.js core modules (`http`, `fs`, `path`).
- **How it works:**
  - Listens on port `3002` (changeable in the code).
  - Serves `public/index.html` for `/` and `/index.html` requests.
  - Serves static assets (CSS, JS, images) from `public/assets/`.
  - Returns a 404 error for unknown routes.
- **Key Concepts:**
  - Uses `fs.readFile` to read files asynchronously.
  - Detects content type based on file extension for correct browser rendering.
  - Modular and easily extensible for more routes or features.

---

## 3. Static Files (`public/`)

- **index.html:** The homepage. You can edit this file to change the main content of your website.
- **assets/:** Contains static resources:
  - `style.css`: Stylesheet for your site.
  - `main.js`: Client-side JavaScript.
  - Images (e.g., `.png`, `.jpg`, `.svg`).

---

## 4. Project Configuration (`package.json`)

- **Purpose:** Defines project metadata, dependencies, and scripts.
- **Key Sections:**
  - `name`, `version`, `description`: Project info.
  - `scripts`: Shortcuts for common tasks:
    - `start`: Runs the server (`node index.js`).
    - `build`: Outputs a message (no build step needed for static site).
    - `test`: Runs Mocha tests.
  - `devDependencies`: Lists `mocha` for testing.
- **How to use:**
  - Install dependencies: `npm install`
  - Start app: `npm start`
  - Run tests: `npm test`
  - Build (no-op): `npm run build`

---

## 5. Automated Testing (`test/index.test.js`)

- **Framework:** Mocha (installed as a dev dependency).
- **Purpose:** Ensures the server responds as expected.
- **Test Cases:**
  - Homepage returns expected HTML (checks for `<title>` tag).
  - Unknown page returns 404 and 'Page Not Found'.
- **How to run:**
  ```sh
  npm install      # Installs dependencies (including Mocha)
  npm test         # Runs all tests in test/
  ```
- **How it works:**
  - Starts the server on a test port.
  - Makes HTTP requests to the server and checks responses.
  - Shuts down the server after tests.

---

## 6. Dockerization (`Dockerfile`)

- **Purpose:** Packages the app and its dependencies into a portable container image.
- **Key Instructions:**
  - `FROM node:20-alpine`: Uses a lightweight Node.js image.
  - `WORKDIR /app`: Sets working directory.
  - `COPY ...`: Copies code and static files.
  - `RUN npm install --production`: Installs only production dependencies.
  - `EXPOSE 3002`: Exposes port 3002 for the app.
  - `CMD ["node", "index.js"]`: Starts the server.
- **How to build and run locally:**
  ```sh
  docker build -t nodejs-app:latest .
  docker run -p 3002:3002 nodejs-app:latest
  ```
  - `docker build ...` creates the image.
  - `docker run ...` starts the container and maps port 3002.

---

## 7. Kubernetes Deployment

- **Deployment (`k8s-deployment.yaml`):**
  - Deploys the Docker image as a pod.
  - Sets `containerPort: 3002` (must match app and Dockerfile).
- **Service (`k8s-service.yaml`):**
  - Exposes the pod using `NodePort`.
  - Maps external port 30080 to internal port 3002.
- **How to deploy:**
  ```sh
  kubectl apply -f k8s-deployment.yaml
  kubectl apply -f k8s-service.yaml
  ```
- **How to access:**
  - Docker Desktop: http://localhost:30080/
  - k3s/EC2: http://<EC2-IP>:30080/
- **Troubleshooting:**
  - Check pod/service status: `kubectl get pods`, `kubectl get services`
  - View logs: `kubectl logs <pod-name>`
  - Port-forward if NodePort is not working: `kubectl port-forward service/nodejs-app-service 30080:3002`

---

## 8. CI/CD Pipeline (`.github/workflows/nodejs.yml`)

- **Purpose:** Automates testing, Docker build, image push, and Kubernetes deployment on every push or pull request.
- **Key Steps:**
  1. Checks out code from GitHub.
  2. Installs dependencies and runs tests (`npm install`, `npm test`).
  3. Builds and pushes Docker image to Docker Hub.
  4. Sets up `kubectl` and applies Kubernetes manifests.
- **Secrets required:**
  - `DOCKERHUB_USERNAME` and `DOCKERHUB_TOKEN` for Docker Hub authentication.
  - `KUBECONFIG` for Kubernetes cluster access.
- **How to customize:**
  - Edit the workflow YAML to add more steps (e.g., linting, notifications).

---

### SonarQube Scan and Quality Gate (CI/CD)

- **SonarQube Scan:**
  - This step runs a static code analysis using SonarCloud (SonarQube cloud) as part of the CI/CD pipeline.
  - It is configured to use your SonarCloud project and organization by passing `sonar.projectKey` and `sonar.organization` as arguments.
  - These values are securely provided as GitHub secrets: `SONAR_PROJECT_KEY` and `SONAR_ORGANIZATION`.
  - The scan uploads code quality, security, and maintainability results to your SonarCloud dashboard.

- **SonarQube Quality Gate:**
  - This step enforces code quality by waiting for the SonarCloud analysis to complete and checking the project's Quality Gate status.
  - If the project does not meet the required quality standards (e.g., too many bugs, vulnerabilities, or code smells), the workflow fails and stops further deployment.
  - This ensures only code that passes your organization's quality standards is deployed.

- **Why these steps are important:**
  - They automate code quality checks and enforce standards as part of your CI/CD process.
  - They help catch issues early, before code is deployed to production.

- **How to configure:**
  - Make sure you have set the following GitHub repository secrets:
    - `SONAR_TOKEN`: Your SonarCloud token.
    - `SONAR_HOST_URL`: Should be `https://sonarcloud.io` for SonarCloud.
    - `SONAR_PROJECT_KEY`: Your SonarCloud project key.
    - `SONAR_ORGANIZATION`: Your SonarCloud organization key.
  - Disable "Automatic Analysis" in SonarCloud project settings to avoid conflicts with CI analysis.

- **Where to view results:**
  - The workflow will fail if the quality gate is not passed. Details are available in the GitHub Actions logs and on your SonarCloud dashboard.

- **Troubleshooting:**
  - If you see errors about missing properties, make sure all required secrets are set and referenced correctly.
  - If you see errors about "Automatic Analysis", disable it in SonarCloud as described above.

---

### Setting Up SonarQube Cloud (SonarCloud) for Your Project

Follow these steps to set up SonarCloud (the official SonarQube cloud service) and integrate it with your GitHub Actions workflow:

1. **Create a SonarCloud Account**
   - Go to [https://sonarcloud.io](https://sonarcloud.io) and sign up using your GitHub account.

2. **Create a New Project**
   - After logging in, click on **+** (plus) in the top right and select **Analyze new project**.
   - Choose your GitHub organization or personal account and select the repository you want to analyze.
   - Click **Set Up**.

3. **Generate a SonarCloud Token**
   - In SonarCloud, click your avatar (top right) > **My Account** > **Security**.
   - Under **Tokens**, enter a name (e.g., `github-actions`) and click **Generate**.
   - Copy the generated token. You will not be able to see it again!

4. **Add SonarCloud Secrets to GitHub**
   - Go to your GitHub repository > **Settings** > **Secrets and variables** > **Actions** > **New repository secret**.
   - Add the following secrets:
     - `SONAR_TOKEN`: Paste the token you generated in SonarCloud.
     - `SONAR_HOST_URL`: Set this to `https://sonarcloud.io`.

5. **Configure Your Workflow**
   - The provided GitHub Actions workflow already includes a SonarQube scan step using these secrets.
   - The scan will run automatically on every push or pull request.

6. **First Analysis**
   - Push a commit or trigger the workflow manually in GitHub Actions.
   - The SonarCloud scan will run and upload results to your SonarCloud dashboard.

7. **View Results**
   - Go to your project dashboard on [https://sonarcloud.io](https://sonarcloud.io) to see code quality, bugs, vulnerabilities, and code smells.

#### Troubleshooting
- If the scan fails, check the GitHub Actions logs for error messages.
- Make sure the secrets are named exactly as required (`SONAR_TOKEN`, `SONAR_HOST_URL`).
- Ensure your repository is public or your SonarCloud plan supports private repos.
- For more help, see the [SonarCloud documentation](https://docs.sonarcloud.io/).

---

### SonarQube Quality Gate

- **Purpose:** Enforces code quality standards by requiring the project to pass SonarQube's quality gate before continuing the CI/CD pipeline.
- **How it works:**
  - After the SonarQube scan step, the workflow runs the `sonarqube-quality-gate-action`.
  - This step waits for the analysis to complete and checks the quality gate status.
  - If the quality gate fails (e.g., due to too many bugs, vulnerabilities, or code smells), the workflow will fail and stop further deployment.
- **How to use:**
  - No extra configuration is needed if you followed the SonarCloud setup steps and have the scan step in your workflow.
  - You can customize your quality gate in the SonarCloud dashboard under your project settings.
- **Example workflow step:**
    ```yaml
    - name: SonarQube Quality Gate
      uses: SonarSource/sonarqube-quality-gate-action@v1.1.0
      with:
        scanMetadataReportFile: .scannerwork/report-task.txt
      env:
        SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
        SONAR_HOST_URL: ${{ secrets.SONAR_HOST_URL }}
    ```
- **Where to view results:**
  - The workflow will fail if the quality gate is not passed. Details are available in the GitHub Actions logs and on your SonarCloud dashboard.
- **Troubleshooting:**
  - If the step fails, review the quality gate conditions in SonarCloud and address any issues reported in the analysis.
  - Ensure the scan step runs before the quality gate step and that the `scanMetadataReportFile` path is correct.

---

## 9. Command Reference & Explanations

### Local Development

- `npm install` — Installs all dependencies listed in `package.json`.
  - **What it does:**
    - Reads the `package.json` file for a list of required packages (dependencies and devDependencies).
    - Downloads and installs these packages into the `node_modules/` directory.
    - Creates or updates a `package-lock.json` file to lock exact versions.
  - **When to use:**
    - After cloning the repository for the first time.
    - Whenever dependencies are added or updated in `package.json`.
    - If you delete `node_modules/` and need to reinstall packages.
  - **Example output:**
    ```sh
    $ npm install
    added 50 packages, and audited 50 packages in 2s
    found 0 vulnerabilities
    ```
  - **Troubleshooting:**
    - If you see errors, check for missing or incompatible Node.js versions, or issues in `package.json`.
    - Delete `node_modules/` and `package-lock.json` and run `npm install` again if problems persist.

- `npm start` — Runs the server locally on port 3002.
  - **What it does:**
    - Executes the `start` script defined in `package.json` (usually `node index.js`).
    - Starts the Node.js server, serving static files from the `public/` directory.
  - **When to use:**
    - To run the app locally for development or testing.
  - **Example output:**
    ```sh
    $ npm start
    Server running at http://localhost:3002/
    ```

- `npm test` — Runs Mocha tests in the `test/` directory.
  - **What it does:**
    - Executes the `test` script in `package.json` (usually `mocha`).
    - Runs all test files (e.g., `test/index.test.js`) using the Mocha testing framework.
    - Starts the server on a test port, sends HTTP requests, and checks responses.
    - Reports test results (pass/fail) in the terminal.
  - **When to use:**
    - After making code changes to verify nothing is broken.
    - Before committing or deploying code.
    - In CI/CD pipelines to ensure code quality.
  - **Example output:**
    ```sh
    $ npm test
      Server
        ✓ should return homepage HTML
        ✓ should return 404 for unknown page
    
    2 passing (100ms)
    ```
  - **Troubleshooting:**
    - If tests fail, read the error messages for clues.
    - Ensure the server is not already running on the test port.
    - Check for typos or logic errors in your code or tests.

- `npm run build` — Outputs a message (no build step needed).
  - **What it does:**
    - Runs the `build` script in `package.json` (currently just prints a message).
    - No actual build process is required for static sites.
  - **When to use:**
    - Not required for this project, but included for convention or future use.
  - **Example output:**
    ```sh
    $ npm run build
    No build step needed for static site.
    ```

### Docker
- `docker build -t nodejs-app:latest .` — Builds the Docker image from the Dockerfile.
- `docker run -p 3002:3002 nodejs-app:latest` — Runs the container and maps port 3002 on your machine to port 3002 in the container.

### Kubernetes
- `kubectl apply -f k8s-deployment.yaml` — Deploys the app pod.
- `kubectl apply -f k8s-service.yaml` — Exposes the app via NodePort.
- `kubectl get pods` — Lists running pods.
- `kubectl get services` — Lists services and their ports.
- `kubectl logs <pod-name>` — Shows logs for troubleshooting.
- `kubectl port-forward service/nodejs-app-service 30080:3002` — Forwards local port 30080 to service port 3002 (useful if NodePort is not working).

### CI/CD
- The GitHub Actions workflow automates all the above steps on every push or pull request.

---

## 10. Troubleshooting & Best Practices

- **App not accessible:**
  - Check pod and service status: `kubectl get pods`, `kubectl get services`
  - Check logs: `kubectl logs <pod-name>`
  - Ensure ports match in `index.js`, Dockerfile, and Kubernetes YAMLs.
  - Try port-forwarding if NodePort is not working.
- **Docker build issues:**
  - Ensure all files are copied in the Dockerfile.
  - Check for missing dependencies in `package.json`.
- **CI/CD failures:**
  - Check GitHub Actions logs for errors in build, test, or deploy steps.
- **Security:**
  - Never commit secrets or passwords to your repository.
  - Use environment variables and GitHub secrets for sensitive data.
- **Extensibility:**
  - Add more routes in `index.js` for dynamic content.
  - Add more tests in `test/` for better coverage.

---

## 11. Customization

- Edit `public/index.html` and files in `public/assets/` to change your website content and style.
- Add more routes or features in `index.js` as needed.
- Update Dockerfile and Kubernetes manifests for advanced deployment scenarios (e.g., scaling, environment variables).

---

## 12. Contribution & License

- Fork, clone, and submit pull requests for improvements.
- Licensed under ISC (see `package.json`).

---

## 13. Contact & Support

For questions or support, open an issue in the repository or contact the maintainer.

---

**End of Documentation**
