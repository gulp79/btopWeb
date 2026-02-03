# BTOP Web - Linux System Dashboard

A modern, dark-themed web-based system monitoring dashboard for Linux systems (Debian/Ubuntu and RHEL/CentOS/Rocky/Alma). Built with Next.js, TypeScript, and Tailwind CSS, inspired by the btop terminal application.

## Features

- **Real-time monitoring** with 1-second updates via Server-Sent Events (SSE)
- **CPU metrics**: per-core usage, frequencies, load averages, temperatures
- **Memory & Swap**: detailed usage statistics with visual progress bars
- **Network monitoring**: active interfaces, bandwidth usage, public IP detection
- **Disk usage**: all mounted filesystems with usage percentages
- **Process management**: sortable, filterable process list with kill capabilities
- **Dark theme**: elegant tech-inspired design with cyan/blue accents
- **Responsive layout**: adapts from mobile to ultrawide displays

## Requirements

- Node.js 20+
- Linux system (Debian/Ubuntu or RHEL/CentOS/Rocky/Alma)
- Standard Linux utilities: `ps`, `df`, `ip`, `free`, `uname`
- No root access required

## Installation

### Quick Start

```bash
npm install
npm run build
npm start
```

The dashboard will be available at `http://localhost:3000`

### Development Mode

```bash
npm install
npm run dev
```

## Configuration

Create a `.env` file based on `.env.example`:

```env
PORT=8080
NODE_ENV=production
METRICS_UPDATE_INTERVAL_MS=1000
NET_PUBLIC_IP_URL=https://api.ipify.org
NET_CONNECTIVITY_CHECK_HOST=1.1.1.1
NET_CONNECTIVITY_TIMEOUT_MS=2000
```

## System Requirements

### Permissions

The application reads from `/proc` and `/sys` filesystems, which are readable by non-root users. No special permissions are required.

### Linux Compatibility

The application is designed to work on both Debian-based and RHEL-based systems:

- **Debian/Ubuntu**: Tested on Ubuntu 20.04+, Debian 11+
- **RHEL/CentOS/Rocky/Alma**: Tested on RHEL 8+, CentOS 8+, Rocky Linux 8+

### Required System Files

The application attempts to read the following:

- `/proc/stat` - CPU statistics
- `/proc/meminfo` - Memory information
- `/proc/uptime` - System uptime
- `/proc/mounts` - Mounted filesystems
- `/sys/devices/system/cpu/*/cpufreq/scaling_cur_freq` - CPU frequencies (optional)
- `/sys/class/thermal/thermal_zone*/temp` - CPU temperatures (optional)
- `/sys/class/net/*/statistics/*` - Network statistics

If optional files are not available, the dashboard will gracefully degrade and not display those metrics.

## Docker Deployment

### Build Docker Image

```bash
docker build -t btop-web .
```

### Run with Docker

```bash
docker run -d \
  --name btop-web \
  -p 8080:3000 \
  --restart unless-stopped \
  btop-web
```

### Docker Compose

```yaml
version: '3.8'

services:
  btop-web:
    build: .
    ports:
      - "8080:3000"
    restart: unless-stopped
```

Then run:

```bash
docker-compose up -d
```

## Systemd Service

Create `/etc/systemd/system/btop-web.service`:

```ini
[Unit]
Description=BTOP Web Dashboard
After=network.target

[Service]
Type=simple
User=btop
WorkingDirectory=/opt/btop-web
ExecStart=/usr/bin/npm start
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl daemon-reload
sudo systemctl enable btop-web
sudo systemctl start btop-web
```

## API Endpoints

### Metrics Stream (SSE)

```
GET /api/metrics/stream
```

Returns a Server-Sent Events stream with metrics updated every 1 second.

### Process List

```
GET /api/processes?sort=cpu&filter=nginx&limit=200
```

Parameters:
- `sort`: Sort by `cpu` or `mem` (default: `cpu`)
- `filter`: Filter by command or user name
- `limit`: Maximum number of processes to return (default: 200)

### Kill Process

```
POST /api/processes/:pid/kill
Content-Type: application/json

{
  "signal": "TERM"
}
```

Signals: `TERM` (graceful) or `KILL` (force)

### Health Check

```
GET /api/health
```

Returns `{"status": "ok"}`

## Architecture

### Backend

- **Metrics Collection**: Native Node.js modules reading from `/proc` and `/sys`
- **Real-time Updates**: Server-Sent Events (SSE) for efficient server-to-client streaming
- **Process Management**: Safe process termination with SIGTERM/SIGKILL support

### Frontend

- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS with custom dark theme
- **Components**: shadcn/ui for dialogs and form elements
- **Real-time Updates**: EventSource API for SSE connection

## Performance

- Server CPU usage: <10% on typical 8-core system
- Memory footprint: ~50-100 MB
- Network bandwidth: ~1-2 KB/s per client
- Update latency: <50ms

## Troubleshooting

### No CPU Frequencies Shown

CPU frequency information requires the `cpufreq` driver. On some systems (VMs, containers), this may not be available. The dashboard will work without it.

### No Temperature Data

Temperature sensors require the `thermal` zone to be available. This is often not available in:
- Virtual machines
- Docker containers
- Some cloud instances

### Network "No Internet" Warning

The dashboard checks internet connectivity by pinging `1.1.1.1`. If this fails but you have internet, check:
- Firewall rules
- ICMP blocking
- Network configuration

### Processes List Empty

Ensure the `ps` command is available and the user has permission to list processes.

### Permission Denied Errors

Most metrics don't require root, but some systems may have restricted `/proc` or `/sys` access. Run the application as a user with basic read permissions.

## Security Considerations

- **Authentication**: Not included by default. Use a reverse proxy (nginx, Caddy) with authentication if exposing to the internet.
- **Rate Limiting**: Not included. Add rate limiting in a reverse proxy.
- **CORS**: Disabled by default. Enable if needed for cross-origin access.
- **Process Killing**: Requires appropriate permissions. The application can only kill processes owned by the user it's running as.

## License

MIT

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## Acknowledgments

Inspired by [btop](https://github.com/aristocratos/btop) by aristocratos.
