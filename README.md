# DeployerDock: A Self-Hosted Deployment Platform
<img width="1440" height="900" alt="Screenshot 2025-07-12 at 4 40 34 PM" src="https://github.com/user-attachments/assets/d98a37e5-da45-469c-8933-555f0aec2766" />

----------

DeployerDock is a full-stack, self-hosted deployment system. It allows users to deploy frontend sites directly from a Git repository by running containerized builds, storing output on S3, and serving via a custom reverse proxy.

## Features

- Direct deployments using Git URL - no extra setup needed
- Dockerized build server for isolated builds
- Static file hosting on S3 or S3-compatible storage
- Reverse proxy for routing requests like `project-id.localhost:8000`
- Dedicated log server for real-time build logs
- Modular architecture and monorepo-ready
  

### Flow:

1. The Next.js frontend accepts a Git URL and other details.
2. The Next.js server spins up a Docker container(build-server) which clones the repo, and builds the project.
3. Output files (e.g., `index.html`, `style.css`, `assets/`) are uploaded to an S3 bucket.
4. A local reverse proxy (port `8000`) maps requests to the appropriate output using the project ID.
5. A separate logs server streams the build process logs back to the frontend.

## Repository Structure

- build-server         # Docker Image - build handler
- deployerdock-web     # Next.js frontend UI and api handling
- logs-server          # Real-time log stream server
- s3-reverse-proxy     # Custom proxy to route project access via hostname

## Getting Started (Local Development)

### Prerequisites

- Docker
- Node.js (v16+)
- AWS CLI or mock S3 (e.g., LocalStack)

### 1. Clone the Repository

```bash
git clone https://github.com/pushpitjain2006/DeployerDockV2.git
cd deployerdockV2
```

2. Build and Run the Build Server

```bash
cd build-server
docker build -t build-server
docker run -p 9090:9090 build-server
```
3. Run the Logs Server

```bash
cd ../logs-server
npm install
node index.js
```
4. Start the Frontend
```bash
cd ../deployerdock-web
npm install
npm run dev
```
5. Start the Reverse Proxy
```bash
cd ../s3-reverse-proxy
npm install
node index.js
```
6. Access the Platform
- Open your browser at http://localhost:3000

Example Flow
- Populate the .env files
- Input GitHub URL: https://github.com/you/repo
- Login into the system
- The build output is saved to S3: bucketName/_outputs/{project-id}/index.html
- The reverse proxy serves it at: http://project-id.localhost:8000

Tech Stack
- Frontend: Next.js (React)
- Build Logic: Docker + Node.js
- Logs: Custom Node.js server (WebSocket i.e. Socket.io)
- Hosting: AWS S3 (or compatible alternatives)
- Reverse Proxy: Custom-built Node.js server using http-proxy library

## Live Demo

[![Watch the demo](https://img.youtube.com/vi/ltTyHbw4h4Y/0.jpg)](https://www.youtube.com/watch?v=ltTyHbw4h4Y)
> Click the image above to watch a walkthrough of **DeployerDock**.

Credits

Built by Pushpit jain – inspired by Vercel’s architecture and deployment flow and [Piyush bhaiya](https://www.youtube.com/@piyushgargdev).
