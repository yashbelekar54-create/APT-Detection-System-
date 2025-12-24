# APT Detection System - Complete Setup Guide

## Overview
This Advanced Persistent Threat (APT) detection system uses the ELK Stack (Elasticsearch, Logstash, Kibana) to provide real-time monitoring and alerting for sophisticated cyber threats. The system implements behavior-based detection rules mapped to the MITRE ATT&CK framework.

## Architecture Components
- **Data Sources**: Sysmon (Windows endpoint monitoring), Zeek (network traffic analysis)
- **Collection**: Filebeat/Winlogbeat for log shipping
- **Processing**: Logstash with custom parsing and enrichment
- **Storage**: Elasticsearch with optimized index templates
- **Analysis**: Kibana dashboards with ML-powered threat detection
- **Response**: Automated alerting and incident response workflows

## Quick Start with Docker

### Prerequisites
- Docker and Docker Compose installed
- At least 4GB RAM available for containers
- Ports 5601, 9200, 5044 available

### Deployment
```bash
# Clone the repository or download files
git clone <repository-url> apt-detection
cd apt-detection

# Start the entire stack
docker-compose up -d

# Wait for services to start (2-3 minutes)
docker-compose logs -f

# Access Kibana at http://localhost:5601
# Access Elasticsearch at http://localhost:9200
```

### Load Configuration
```bash
# Load Elasticsearch index templates
curl -X PUT "localhost:9200/_index_template/sysmon-template" \
  -H "Content-Type: application/json" -d @sysmon-template.json

curl -X PUT "localhost:9200/_index_template/zeek-template" \
  -H "Content-Type: application/json" -d @zeek-template.json

# Load ILM policy
curl -X PUT "localhost:9200/_ilm/policy/apt-detection-policy" \
  -H "Content-Type: application/json" -d @apt-detection-ilm-policy.json

# Import Kibana dashboard
curl -X POST "localhost:5601/api/saved_objects/_import" \
  -H "kbn-xsrf: true" -H "Content-Type: application/json" \
  --form file=@kibana_apt_dashboard.json
```

## Manual Installation

### 1. Elasticsearch Setup
```bash
# Install Elasticsearch 8.x
wget -qO - https://artifacts.elastic.co/GPG-KEY-elasticsearch | sudo apt-key add -
echo "deb https://artifacts.elastic.co/packages/8.x/apt stable main" | \
  sudo tee /etc/apt/sources.list.d/elastic-8.x.list

sudo apt update && sudo apt install elasticsearch

# Configure memory settings
echo "-Xms2g\n-Xmx2g" | sudo tee -a /etc/elasticsearch/jvm.options

# Start service
sudo systemctl enable elasticsearch
sudo systemctl start elasticsearch

# Verify installation
curl -X GET "localhost:9200/"
```

### 2. Logstash Setup
```bash
# Install Logstash
sudo apt install logstash

# Copy configuration files
sudo mkdir -p /etc/logstash/conf.d
sudo cp sysmon_logstash.conf /etc/logstash/conf.d/
sudo cp zeek_logstash.conf /etc/logstash/conf.d/

# Create templates directory
sudo mkdir -p /etc/logstash/templates
sudo cp *-template.json /etc/logstash/templates/

# Configure JVM memory
echo "-Xms1g\n-Xmx1g" | sudo tee -a /etc/logstash/jvm.options

# Start service
sudo systemctl enable logstash
sudo systemctl start logstash
```

### 3. Kibana Setup
```bash
# Install Kibana
sudo apt install kibana

# Configure Kibana
sudo tee /etc/kibana/kibana.yml > /dev/null <<EOF
server.host: "0.0.0.0"
elasticsearch.hosts: ["http://localhost:9200"]
server.name: "apt-detection"
EOF

# Start service
sudo systemctl enable kibana
sudo systemctl start kibana
```

### 4. Data Sources Configuration

#### Windows Endpoints (Sysmon)
```powershell
# Download Sysmon
Invoke-WebRequest -Uri "https://download.sysinternals.com/files/Sysmon.zip" \
  -OutFile "Sysmon.zip"
Expand-Archive Sysmon.zip -DestinationPath "C:\Tools\Sysmon"

# Install with comprehensive configuration
C:\Tools\Sysmon\sysmon.exe -accepteula -i

# Configure Winlogbeat
$winlogbeatConfig = @"
winlogbeat.event_logs:
  - name: Microsoft-Windows-Sysmon/Operational
    processors:
      - add_tags:
          tags: [sysmon, windows]

output.logstash:
  hosts: ["<LOGSTASH_HOST>:5044"]

processors:
  - add_host_metadata: ~
"@

$winlogbeatConfig | Out-File -FilePath "C:\ProgramData\Elastic\Beats\winlogbeat\winlogbeat.yml"

# Start Winlogbeat service
Start-Service winlogbeat
```

#### Linux Network Monitoring (Zeek)
```bash
# Install Zeek
sudo apt update
sudo apt install zeek

# Configure Zeek for JSON output
echo "@load policy/tuning/json-logs.zeek" | \
  sudo tee -a /opt/zeek/share/zeek/site/local.zeek

# Configure network interface
sudo tee /opt/zeek/etc/node.cfg > /dev/null <<EOF
[zeek]
type=standalone
host=localhost
interface=eth0  # Adjust to your interface
EOF

# Start Zeek
sudo systemctl enable zeek
sudo systemctl start zeek

# Configure log rotation
echo "0 * * * * root /opt/zeek/bin/zeekctl cron" | sudo tee -a /etc/crontab
```

## Detection Rules Configuration

### Loading Detection Rules
```bash
# Create detection rules in Kibana
for category in reconnaissance credential_dumping lateral_movement persistence data_exfiltration powershell_abuse; do
  echo "Loading $category detection rules..."
  # Rules will be loaded through Kibana Security app
done
```

### Custom Rule Development
1. Navigate to Kibana → Security → Rules
2. Click "Create new rule"
3. Select "Custom query" or "Threshold"
4. Use provided rule templates from `apt_detection_rules.json`
5. Configure actions (email, Slack, etc.)

## Testing and Validation

### Running Test Suite
```bash
# Make test script executable
chmod +x test_apt_detection.sh

# Run comprehensive tests
./test_apt_detection.sh

# Monitor results in Kibana dashboard
# http://localhost:5601/app/dashboards#/view/apt-detection-dashboard
```

### Expected Test Results
- **Port Scanning**: Detection within 5 minutes, Medium severity
- **PowerShell Abuse**: Immediate detection, High severity  
- **DNS Tunneling**: Detection within 2 minutes, High severity
- **Credential Dumping**: Immediate detection, High severity
- **Lateral Movement**: Detection within 3 minutes, Medium severity

## Monitoring and Maintenance

### Performance Monitoring
```bash
# Check Elasticsearch cluster health
curl -X GET "localhost:9200/_cluster/health?pretty"

# Monitor index sizes
curl -X GET "localhost:9200/_cat/indices?v&s=store.size:desc"

# Check Logstash pipeline status
curl -X GET "localhost:9600/_node/stats/pipelines?pretty"
```

### Log Rotation and Retention
- Hot tier: 7 days (high performance)
- Warm tier: 30 days (compressed)  
- Cold tier: 90 days (minimal resources)
- Deletion: After 90 days

### Alerting Configuration
1. Configure SMTP settings in Kibana
2. Set up Slack webhook integration
3. Create PagerDuty service integration
4. Configure email templates for different severity levels

## Troubleshooting

### Common Issues
1. **High memory usage**: Increase JVM heap size
2. **Missing logs**: Check Filebeat/Winlogbeat configuration
3. **Detection delays**: Verify Logstash pipeline processing
4. **Dashboard errors**: Ensure index patterns are correct

### Debug Commands
```bash
# Check Elasticsearch logs
sudo tail -f /var/log/elasticsearch/elasticsearch.log

# Monitor Logstash processing
sudo tail -f /var/log/logstash/logstash-plain.log

# Verify Kibana connectivity  
curl -X GET "localhost:5601/api/status"
```

## Security Considerations
- Enable Elasticsearch authentication in production
- Configure TLS encryption between components
- Implement network segmentation for log sources
- Regular security updates for all components
- Monitor for false positives and tune rules accordingly

## Scaling Guidelines
- **Small deployment**: 1-2 nodes, <10GB/day logs
- **Medium deployment**: 3-5 nodes, 10-100GB/day logs  
- **Large deployment**: 5+ nodes, >100GB/day logs
- **Multi-datacenter**: Cross-cluster replication setup

## Files Overview
- `docker-compose.yml` - Complete containerized deployment
- `sysmon_logstash.conf` - Windows endpoint log processing
- `zeek_logstash.conf` - Network traffic log processing
- `*-template.json` - Elasticsearch index mappings
- `apt_detection_rules.json` - MITRE ATT&CK mapped detection rules
- `kibana_apt_dashboard.json` - Pre-built visualization dashboard
- `test_apt_detection.sh` - Automated testing suite
- `filebeat.yml` - Log shipping configuration

For additional support or customization, refer to the Elastic Stack documentation or community forums.
