# APT Detection System - Technical Documentation

## System Architecture

### Data Flow Pipeline
```
Windows Endpoints (Sysmon) ──→ Winlogbeat ──→ Logstash ──→ Elasticsearch ──→ Kibana
Network Devices (Zeek)     ──→ Filebeat   ──→ Logstash ──→ Elasticsearch ──→ Kibana
```

### Component Details

#### Elasticsearch Configuration
- **Index Strategy**: Daily rolling indices with ILM policies
- **Sharding**: 1 shard per index for optimal performance
- **Replication**: 1 replica for high availability
- **Compression**: Best compression codec for storage efficiency
- **Retention**: 90-day lifecycle with hot/warm/cold tiers

#### Logstash Processing
- **Sysmon Pipeline**: Event categorization, threat scoring, MITRE mapping
- **Zeek Pipeline**: Network anomaly detection, GeoIP enrichment
- **Enrichment**: Real-time threat intelligence integration
- **Performance**: Multi-pipeline architecture for parallel processing

#### Detection Rules Engine
- **Rule Types**: Query-based, threshold-based, ML anomaly detection
- **Scoring**: Risk-based scoring (1-10 scale) with severity mapping
- **Correlation**: Cross-source event correlation for attack chains
- **False Positive Reduction**: Whitelisting and baseline learning

## MITRE ATT&CK Coverage

### Covered Techniques
| Tactic | Technique ID | Technique Name | Detection Method |
|--------|--------------|----------------|------------------|
| Discovery | T1046 | Network Service Scanning | Zeek connection analysis |
| Credential Access | T1003.001 | LSASS Memory | Sysmon process access |
| Execution | T1059.001 | PowerShell | Command line analysis |
| Lateral Movement | T1047 | WMI | Process creation patterns |
| Persistence | T1547.001 | Registry Run Keys | Registry modifications |
| Exfiltration | T1048.003 | DNS Tunneling | DNS query analysis |

### Detection Logic

#### Port Scanning Detection
```
Network connections with:
- State: REJ (rejected)
- Multiple destinations from single source
- Common service ports (22,80,443,445,3389)
- External source IPs
```

#### Credential Dumping Detection  
```
Process access events with:
- Target: lsass.exe
- Access rights: 0x1010, 0x1038, 0x143a
- Exclude: System processes
- Score: 8/10 (High severity)
```

#### PowerShell Abuse Detection
```
Process creation with:
- Image: powershell.exe
- Arguments: -enc, -hidden, IEX, DownloadString
- Base64 patterns
- Score: 7/10 (High severity)
```

## Performance Specifications

### Resource Requirements
| Component | CPU | Memory | Storage | Network |
|-----------|-----|--------|---------|---------|
| Elasticsearch | 4 cores | 8GB | 500GB SSD | 1Gbps |
| Logstash | 2 cores | 4GB | 50GB | 1Gbps |
| Kibana | 2 cores | 4GB | 20GB | 100Mbps |

### Throughput Metrics
- **Log Ingestion**: 10,000 events/second sustained
- **Query Performance**: <2 second dashboard refresh
- **Detection Latency**: <30 seconds average
- **Storage Growth**: ~50GB/day for 1000 endpoints

### Scalability Patterns
- **Horizontal**: Add Elasticsearch data nodes
- **Vertical**: Increase JVM heap size
- **Distributed**: Multi-datacenter deployment
- **Caching**: Hot data in memory tier

## Security Implementation

### Authentication & Authorization
- **Elasticsearch**: Built-in users and roles
- **Kibana**: SAML/LDAP integration support  
- **API Access**: API key authentication
- **Audit Logging**: All access logged and monitored

### Network Security
- **TLS Encryption**: All inter-node communication
- **Network Segmentation**: Dedicated VLAN for log traffic  
- **Firewall Rules**: Minimal required port access
- **VPN Access**: Secure remote administration

### Data Protection
- **Encryption at Rest**: Elasticsearch encrypted storage
- **Field-Level Security**: Sensitive data masking
- **Retention Policies**: Automated data lifecycle
- **Backup Strategy**: Regular snapshots with offsite storage

## Machine Learning Integration

### Anomaly Detection Jobs
1. **DNS Tunneling Detection**
   - Algorithm: Rare domain analysis
   - Features: Query length, entropy, frequency
   - Threshold: 95th percentile anomaly score

2. **Network Behavior Analysis**
   - Algorithm: LSTM for traffic patterns
   - Features: Connection volume, duration, ports
   - Threshold: 3 standard deviations

3. **User Behavior Analytics (UBA)**
   - Algorithm: Isolation Forest
   - Features: Login times, access patterns, geography
   - Threshold: 99th percentile anomaly score

### Model Training
- **Training Data**: 30 days historical baseline
- **Update Frequency**: Daily model refresh
- **Validation**: A/B testing with known attack data
- **Performance**: <5% false positive rate target

## API Integration

### Elasticsearch REST APIs
```bash
# Index health monitoring
GET /_cluster/health

# Search for threats
GET /sysmon-logs-*/_search
{
  "query": {
    "bool": {
      "must": [
        {"range": {"threat_score": {"gte": 7}}},
        {"range": {"@timestamp": {"gte": "now-1h"}}}
      ]
    }
  }
}

# Aggregation for dashboard
GET /zeek-logs-*/_search
{
  "aggs": {
    "threat_by_country": {
      "terms": {"field": "orig_geo.country_name"}
    }
  }
}
```

### Kibana Management APIs
```bash
# Export dashboard
GET /api/saved_objects/_export
{
  "type": ["dashboard", "visualization", "search"]
}

# Create detection rule
POST /api/detection_engine/rules
{
  "name": "Custom APT Rule",
  "type": "query", 
  "query": "threat_score:>=8"
}
```

## Development Guidelines

### Custom Rule Development
1. **Identify Use Case**: Define specific threat scenario
2. **Data Source Mapping**: Determine required log sources
3. **Query Development**: Build and test detection logic
4. **Threshold Tuning**: Minimize false positives
5. **MITRE Mapping**: Align with ATT&CK framework
6. **Documentation**: Document rule logic and maintenance

### Plugin Development
- **Logstash Filters**: Custom parsing and enrichment
- **Kibana Visualizations**: Domain-specific dashboards  
- **Elasticsearch Scripts**: Advanced scoring algorithms
- **Beat Processors**: Edge-side data transformation

### Testing Framework
- **Unit Tests**: Individual rule validation
- **Integration Tests**: End-to-end data flow
- **Performance Tests**: Load testing with synthetic data
- **Security Tests**: Penetration testing validation

## Troubleshooting Guide

### Common Performance Issues
1. **Slow Queries**
   - Check index mapping optimization
   - Review query complexity
   - Consider data modeling changes
   - Enable query caching

2. **High Memory Usage**
   - Tune JVM heap size
   - Optimize aggregation queries
   - Implement field data circuit breakers
   - Review shard allocation

3. **Ingestion Delays**
   - Check Logstash pipeline bottlenecks
   - Monitor queue depths
   - Scale processing threads
   - Optimize grok patterns

### Monitoring Commands
```bash
# Pipeline performance
curl -X GET "localhost:9600/_node/stats/pipelines?pretty"

# JVM metrics  
curl -X GET "localhost:9200/_nodes/stats/jvm?pretty"

# Index statistics
curl -X GET "localhost:9200/_cat/indices?v&s=store.size:desc"

# Slow query log
curl -X GET "localhost:9200/_nodes/stats/indices/search?pretty"
```

## Maintenance Procedures

### Daily Operations
- Monitor cluster health status
- Review detection rule performance  
- Check ingestion rates and delays
- Validate backup completion
- Review false positive reports

### Weekly Operations  
- Analyze detection coverage gaps
- Update threat intelligence feeds
- Review system performance metrics
- Conduct rule effectiveness analysis
- Update documentation changes

### Monthly Operations
- Security patch application
- Capacity planning review
- Detection rule optimization
- Performance baseline updates
- Disaster recovery testing

This technical documentation provides comprehensive implementation guidance for the APT detection system. Regular updates ensure alignment with emerging threats and technology improvements.
