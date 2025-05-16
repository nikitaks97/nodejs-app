# Node.js Static Website Project

## Overview
This project is a simple static website server built with Node.js. It serves HTML, CSS, JavaScript, and image files from a `public` directory. The project is containerized with Docker and ready for deployment to Kubernetes (k3s, Docker Desktop, or cloud providers). It includes automated testing and a CI/CD pipeline using GitHub Actions.

---

## Project Structure

```
nodejs-app/
├── Dockerfile
├── index.js
├── k8s-deployment.yaml
├── k8s-service.yaml
├── package.json
├── README.md
├── public/
│   ├── index.html
│   └── assets/
│       ├── main.js
│       └── style.css
└── test/
    └── index.test.js
```

---

## 1. Application Code (`index.js`)
- **Purpose:** Serves static files and handles HTTP requests.
- **How it works:**
  - Serves `public/index.html` for `/` and `/index.html` requests.
  - Serves static assets (CSS, JS, images) from `public/assets/`.
  - Returns 404 for unknown routes.
  - Listens on port `3002` (configurable in the code).

---

## 2. Static Files (`public/`)
- **index.html:** The homepage of your website.
- **assets/:** Folder for CSS, JS, and images.

---

## 3. Testing (`test/index.test.js`)
- **Framework:** Mocha (run with `npm test`).
- **Tests:**
  - Checks that the homepage loads and contains the expected HTML.
  - Checks that a 404 is returned for unknown pages.
- **How to run:**
  ```sh
  npm install
  npm test
  ```

---

## 4. Dockerization (`Dockerfile`)
- **Purpose:** Containerizes the Node.js app for consistent deployment.
- **Key steps:**
  - Uses `node:20-alpine` as the base image.
  - Copies app files and installs dependencies.
  - Exposes port `3002`.
  - Starts the app with `CMD ["node", "index.js"]`.
- **How to build and run locally:**
  ```sh
  docker build -t nodejs-app:latest .
  docker run -p 3002:3002 nodejs-app:latest
  ```

---

## 5. Kubernetes Deployment
- **`k8s-deployment.yaml`:**
  - Deploys the app as a pod.
  - Sets the container port to `3002`.
- **`k8s-service.yaml`:**
  - Exposes the app using a `NodePort` service on port `30080`.
  - Maps external port `30080` to internal port `3002`.
- **How to deploy:**
  ```sh
  kubectl apply -f k8s-deployment.yaml
  kubectl apply -f k8s-service.yaml
  ```
- **How to access:**
  - In Docker Desktop: http://localhost:30080/
  - In k3s/EC2: http://<EC2-IP>:30080/

---

## 6. CI/CD Pipeline (`.github/workflows/nodejs.yml`)
- **Purpose:** Automates testing, Docker build, image push, and Kubernetes deployment.
- **Key steps:**
  1. Checks out code.
  2. Installs dependencies and runs tests.
  3. Builds and pushes Docker image to Docker Hub.
  4. Sets up `kubectl` and applies Kubernetes manifests.
- **Secrets required:**
  - `DOCKERHUB_USERNAME` and `DOCKERHUB_TOKEN` for Docker Hub authentication.
  - `KUBECONFIG` for Kubernetes cluster access.

---

## 7. NPM Scripts (`package.json`)
- **start:** Runs the app (`node index.js`).
- **build:** Outputs a message (no build step needed for static site).
- **test:** Runs Mocha tests.

---

## 8. How to Run Locally
1. Install dependencies:
   ```sh
   npm install
   ```
2. Start the server:
   ```sh
   npm start
   ```
3. Visit http://localhost:3002/ in your browser.

---

## 9. How to Test
```sh
npm test
```

---

## 10. How to Build and Run with Docker
```sh
docker build -t nodejs-app:latest .
docker run -p 3002:3002 nodejs-app:latest
```

---

## 11. How to Deploy to Kubernetes
```sh
kubectl apply -f k8s-deployment.yaml
kubectl apply -f k8s-service.yaml
```
- Access the app at http://localhost:30080/ (Docker Desktop) or http://<Node-IP>:30080/ (cloud).

---

## 12. Troubleshooting
- **App not accessible:**
  - Check pod and service status: `kubectl get pods`, `kubectl get services`
  - Check logs: `kubectl logs <pod-name>`
  - Ensure ports match in `index.js`, Dockerfile, and Kubernetes YAMLs.
  - Try port-forwarding: `kubectl port-forward service/nodejs-app-service 30080:3002`

---

## 13. Customization
- Edit `public/index.html` and files in `public/assets/` to change your website content and style.
- Add more routes or features in `index.js` as needed.

---

## 14. Contribution & License
- Fork, clone, and submit pull requests for improvements.
- Licensed under ISC (see `package.json`).

---

## 15. Contact
For questions or support, open an issue in the repository.
