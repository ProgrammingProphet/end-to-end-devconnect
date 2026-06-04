# DevConnect - Developer Collaboration Platform

A full-stack MERN application for developer collaboration and task management, deployed on AWS with Kubernetes.

## Features

- User authentication (JWT-based)
- Project management
- Task management with drag-and-drop board
- Team collaboration
- Comments on tasks
- Priority and status tracking

## Tech Stack

- **Frontend**: React.js
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Containerization**: Docker
- **Orchestration**: Kubernetes
- **CI**: GitHub Actions
- **Infrastructure**: AWS (EC2, ECR, Route53)
- **Monitoring**: Prometheus, Grafana

## Local Development

1. Clone the repository
2. Install dependencies:

   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```

devconnect.local
api.devconnect.local
grafana.local
argocd.local

Fix 1 (Recommended): Put the entry in the Windows hosts file

If your browser runs on Windows (Chrome/Edge), it uses the Windows hosts file, not WSL’s.

Edit as Administrator:

C:\Windows\System32\drivers\etc\hosts

Add:

127.0.0.1 devconnect.local

Then open:

<http://devconnect.local:8082>
Fix 2: Prevent WSL from overwriting /etc/hosts

WSL regenerates /etc/hosts automatically (you saw that comment at the top).

Create or edit:

/etc/wsl.conf

Add:

[network]
generateHosts = false

Then restart WSL:

wsl --shutdown

Start WSL again, and keep your custom entry:

127.0.0.1 devconnect.local
