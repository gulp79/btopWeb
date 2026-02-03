# BTOP Web - Quick Start Guide

## Getting Started in 3 Minutes

### Prerequisites

- Linux system (Debian/Ubuntu or RHEL/CentOS/Rocky/Alma)
- Node.js 20+
- Standard Linux utilities (ps, df, ip - already installed on most systems)

### Installation

1. **Install dependencies**

```bash
npm install
```

2. **Build the application**

```bash
npm run build
```

3. **Start the server**

```bash
npm start
```

4. **Open your browser**

Navigate to `http://localhost:3000`

## What You'll See

The dashboard displays real-time system metrics updated every second:

- **CPU Usage**: Total and per-core percentages, frequencies, load averages, temperatures
- **Memory**: Total, used, available, buffers, and cached memory
- **Swap**: Swap usage statistics
- **Network**: Active interface, IP address, bandwidth usage
- **Disks**: All mounted filesystems with usage percentages
- **Processes**: Live process list with sorting, filtering, and kill capabilities

## Quick Actions

### Filter Processes

Click in the search box in the Processes panel or press `f` to filter by process name or user.

### Sort Processes

Click the "CPU" or "MEM" buttons to sort processes by CPU or memory usage.

### Kill a Process

Click the skull icon next to any process to terminate it. Choose between:
- **SIGTERM** (graceful shutdown)
- **SIGKILL** (force kill)

## Development Mode

For development with hot-reload:

```bash
npm run dev
```

## Docker Quick Start

```bash
docker build -t btop-web .
docker run -d -p 8080:3000 --name btop-web btop-web
```

Then open `http://localhost:8080`

## Troubleshooting

### No data showing?

- Ensure you're running on a Linux system
- Check that `/proc` and `/sys` are mounted and readable
- Try running with: `npm run dev` to see detailed error messages

### "No Internet" warning?

The app checks connectivity by pinging `1.1.1.1`. This is normal if:
- Your firewall blocks ICMP
- You're behind a restrictive network
- You're in an isolated container

### No CPU frequencies or temperatures?

This is normal on:
- Virtual machines
- Docker containers
- Cloud instances

The dashboard will work fine without them.

## Next Steps

- Check out the full [README.md](./README.md) for detailed documentation
- Configure environment variables in `.env` (see `.env.example`)
- Set up as a system service using the provided `systemd/btop-web.service` file

## Support

For issues or questions:
1. Check the [README.md](./README.md) troubleshooting section
2. Review the metrics collection logs: `npm run dev`
3. Ensure all required Linux utilities are available

## Key Features

- **Real-time Updates**: 1-second refresh via Server-Sent Events
- **Zero Configuration**: Works out of the box on most Linux systems
- **No Root Required**: Runs as a regular user
- **Modern UI**: Dark theme with smooth animations
- **Cross-Distribution**: Works on Debian, Ubuntu, RHEL, CentOS, Rocky, Alma

Enjoy monitoring your Linux system with BTOP Web!
