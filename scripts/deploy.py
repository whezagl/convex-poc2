#!/usr/bin/env python3
"""
Convex POC - Deployment Orchestration Script

This script manages Docker Compose services for the Convex POC application.
It provides commands to start, stop, and monitor the Convex backend.

Usage:
    python scripts/deploy.py up      - Start services and wait for health check
    python scripts/deploy.py down    - Stop all services
    python scripts/deploy.py logs    - Show logs from all services
    python scripts/deploy.py status  - Show service status
    python scripts/deploy.py --help  - Show this help message
"""

import subprocess
import sys
import argparse
import time


def run_command(command, check=True, capture_output=False):
    """
    Run a shell command with error handling.

    Args:
        command: List of command arguments
        check: Whether to raise an exception on non-zero exit
        capture_output: Whether to capture stdout/stderr

    Returns:
        subprocess.CompletedProcess object
    """
    try:
        result = subprocess.run(
            command,
            check=check,
            text=True,
            capture_output=capture_output
        )
        return result
    except subprocess.CalledProcessError as e:
        if capture_output:
            print(f"Error: {e.stderr}", file=sys.stderr)
        raise
    except FileNotFoundError:
        print(f"Error: Command '{command[0]}' not found. Is it installed?", file=sys.stderr)
        sys.exit(1)


def check_backend_health(timeout=60):
    """
    Check if Convex backend is healthy by polling the /version endpoint.

    Args:
        timeout: Maximum time to wait in seconds

    Returns:
        bool: True if backend is healthy, False otherwise
    """
    print("Waiting for Convex backend to be ready...")

    # Try to import requests, handle gracefully if not available
    try:
        import requests
    except ImportError:
        print("Warning: 'requests' library not available. Skipping health check.")
        print("The backend may still be initializing. Check logs with:")
        print("  python scripts/deploy.py logs")
        return True

    start_time = time.time()
    max_retries = timeout

    for attempt in range(max_retries):
        try:
            response = requests.get(
                "http://localhost:3210/version",
                timeout=2
            )
            if response.status_code == 200:
                elapsed = time.time() - start_time
                print(f"✓ Convex backend is ready! (took {elapsed:.1f}s)")
                return True
        except requests.exceptions.RequestException:
            pass

        # Show progress dots
        if (attempt + 1) % 5 == 0:
            elapsed = time.time() - start_time
            print(f"  Still waiting... ({elapsed:.0f}s elapsed)")

        time.sleep(1)

    elapsed = time.time() - start_time
    print(f"⚠ Warning: Convex backend may not be fully initialized after {elapsed:.1f}s")
    print("  Check logs with: python scripts/deploy.py logs")
    print("  The backend may still be starting up in the background.")
    return False


def deploy():
    """Start Docker Compose services and wait for health check."""
    print("Starting Convex POC services...")

    try:
        # Start Docker Compose services
        result = run_command(
            ["docker-compose", "up", "-d"],
            capture_output=True
        )
        print(result.stdout)

        # Wait for Convex backend to be healthy
        check_backend_health(timeout=60)

        print("\n✓ Services started successfully!")
        print("\nAvailable endpoints:")
        print("  - Convex Backend:  http://localhost:3210")
        print("  - Convex Actions:  http://localhost:3211")
        print("  - Convex Dashboard: http://localhost:6791")
        print("\nNext steps:")
        print("  1. Generate admin key: npm run generate-admin-key")
        print("  2. Start React dev server: npm run dev")
        print("  3. Open browser: http://localhost:5173")

    except subprocess.CalledProcessError as e:
        print(f"✗ Failed to start services.", file=sys.stderr)
        print(f"  Check Docker Compose configuration: docker-compose config", file=sys.stderr)
        sys.exit(1)


def stop_services():
    """Stop all Docker Compose services."""
    print("Stopping Convex POC services...")

    try:
        result = run_command(
            ["docker-compose", "down"],
            capture_output=True
        )
        print(result.stdout)
        print("✓ Services stopped successfully.")

    except subprocess.CalledProcessError as e:
        print(f"✗ Failed to stop services.", file=sys.stderr)
        sys.exit(1)


def show_logs():
    """Show logs from all services with follow mode."""
    print("Showing logs from all services (Ctrl+C to exit)...")
    print("-" * 60)

    try:
        # Run logs in follow mode, don't capture output
        subprocess.run(
            ["docker-compose", "logs", "-f"],
            check=False
        )
    except KeyboardInterrupt:
        print("\n" + "-" * 60)
        print("Logs viewer stopped.")
    except FileNotFoundError:
        print("Error: docker-compose not found.", file=sys.stderr)
        sys.exit(1)


def show_status():
    """Show status of all services."""
    print("Checking service status...")
    print("-" * 60)

    try:
        result = run_command(
            ["docker-compose", "ps"],
            capture_output=True
        )
        print(result.stdout)

        # Check if services are running
        if "convex-server" in result.stdout and "convex-dashboard" in result.stdout:
            print("-" * 60)
            print("✓ Services are running.")
        else:
            print("-" * 60)
            print("⚠ Some services may not be running.")
            print("  Start services with: python scripts/deploy.py up")

    except subprocess.CalledProcessError as e:
        print(f"✗ Failed to check service status.", file=sys.stderr)
        sys.exit(1)


def main():
    """Main entry point for the deployment script."""
    parser = argparse.ArgumentParser(
        description="Convex POC - Deployment Orchestration Script",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s up      Start services and wait for health check
  %(prog)s down    Stop all services
  %(prog)s logs    Show logs from all services
  %(prog)s status  Show service status

Available commands:
  up      Start Docker Compose services and wait for Convex backend to be ready
  down    Stop and remove all Docker Compose services
  logs    Show logs from all services (follow mode)
  status  Show current status of all services
        """
    )

    parser.add_argument(
        "command",
        nargs="?",
        default="up",
        choices=["up", "down", "logs", "status"],
        help="Command to execute (default: up)"
    )

    args = parser.parse_args()

    # Execute the requested command
    if args.command == "up":
        deploy()
    elif args.command == "down":
        stop_services()
    elif args.command == "logs":
        show_logs()
    elif args.command == "status":
        show_status()


if __name__ == "__main__":
    main()
