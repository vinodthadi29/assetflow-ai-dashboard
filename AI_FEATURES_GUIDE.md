# AI-Native ERP Features Guide

## Overview

AssetFlow now includes advanced AI-powered features that transform it from a standard asset management system into an intelligent, proactive operations center. These features leverage machine learning and natural language processing to provide actionable insights and automated recommendations.

## Features

### 1. AI Operations Center

**Location**: Dashboard home screen  
**What It Does**: Displays real-time, AI-generated alerts and recommendations based on your asset data.

#### Key Insights Generated:

- **Idle Assets Warning**: Identifies assets unused for 90+ days
- **Maintenance Due Alerts**: Flags maintenance tasks due within 7 days
- **Cost Optimization Opportunities**: Calculates potential savings from better allocation
- **Booking Conflicts**: Detects overlapping resource reservations
- **Department Efficiency Anomalies**: Identifies operational imbalances
- **Predictive Failures**: Forecasts maintenance needs based on patterns

#### Insight Types:

- 🔴 **Warnings** (High Impact): Critical issues requiring immediate attention
- 🟢 **Opportunities** (High Impact): Cost-saving and optimization recommendations
- 🔵 **Recommendations** (Medium Impact): Process improvements and best practices
- 🟣 **Forecasts** (Medium Impact): Predictive insights for future planning

#### How to Use:

1. Each insight displays on the dashboard with a confidence score (0-100%)
2. Click to expand and see detailed action items
3. Each action item shows the expected business impact
4. Click "Take Action" to execute the recommended workflow
5. Insights refresh every 5 minutes automatically

---

### 2. Smart Analytics Dashboard

**Location**: Below AI Operations Center on dashboard  
**What It Does**: Provides comprehensive business metrics beyond basic inventory counts.

#### Key Metrics:

**Asset ROI**
- Calculates return on investment for your asset portfolio
- Based on utilization rate and allocation patterns
- Shows trend vs previous period

**Annual Idle Cost**
- Quantifies the financial impact of underutilized assets
- Includes maintenance, depreciation, and opportunity costs
- Helps justify reallocation initiatives

**Maintenance Forecast**
- Predicts maintenance costs for the next 30 days
- Based on historical patterns and asset age
- Enables budget planning

**Carbon Savings**
- Environmental impact of optimized asset allocation
- Measured in CO2 equivalent
- Demonstrates sustainability impact

**Department Efficiency Scores**
- Compares operational efficiency across departments
- 0-100% scale where 100% is optimal
- Identifies best practices and improvement areas

#### Business Intelligence:

The metrics automatically calculate:
- Utilization rates by asset type
- Cost per asset per month
- Maintenance trend analysis
- Allocation density metrics
- Carbon footprint reduction

---

### 3. Intelligent Command Palette

**Activation**: Press `Cmd+K` (or `Ctrl+K` on Windows/Linux)  
**What It Does**: Natural language command interface for power users and executives.

#### Example Commands:

```
"Show me idle assets"
"Generate Q2 report"
"Which department wastes resources?"
"Book Meeting Room A tomorrow"
"Allocate MacBook to Rahul"
"Show audit discrepancies"
"What's my cost savings potential?"
"Schedule maintenance for laptop AF-102"
```

#### How It Works:

1. Type your query in natural language
2. The AI interprets your intent
3. Relevant results appear instantly
4. Press Enter to execute actions
5. The system confirms completion

---

### 4. AI Copilot Chat

**Activation**: Floating button in bottom-right corner  
**What It Does**: Conversational AI assistant for asset management queries.

#### Capabilities:

- Answer questions about assets ("Where is laptop AF-102?")
- Generate reports ("Show me maintenance expenses for Q2")
- Execute actions ("Approve allocation request #123")
- Provide insights ("What's my biggest cost optimization opportunity?")
- Suggest actions ("Should I retire printer AF-205?")

#### Example Conversations:

**User**: "Which assets are idle?"  
**AI**: "I found 12 assets with no activity in 90 days. The top 3 are: Printer AF-031, Monitor AF-156, Desk AF-289. Would you like me to create a reallocation plan?"

**User**: "Show me cost optimization opportunities"  
**AI**: "Your asset utilization is 68%, below the optimal 80%. By reallocating idle assets, you could save ₹2.4L annually. Shall I create a detailed optimization report?"

---

## API Endpoints

### Get Operational Insights

```
GET /api/ai/insights
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "insights": [
    {
      "type": "warning",
      "title": "⚠️ 12 Assets Idle for 90+ Days",
      "description": "...",
      "impact": "high",
      "confidence": 0.95,
      "actionItems": [...]
    }
  ],
  "timestamp": "2024-07-12T10:30:00Z"
}
```

### Get Business Metrics

```
GET /api/ai/metrics
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "metrics": {
    "assetROI": 82.5,
    "idleCost": 240000,
    "maintenanceForecast": 15000,
    "carbonSavings": 2500,
    "departmentEfficiency": {
      "Engineering": 85,
      "HR": 72,
      "Operations": 78
    }
  },
  "timestamp": "2024-07-12T10:30:00Z"
}
```

---

## Implementation Details

### Insight Generation Logic

The AI Operations Center continuously analyzes:

1. **Asset Utilization**
   - Allocation history and patterns
   - Booking frequency and duration
   - Last activity timestamp
   - Seasonal trends

2. **Maintenance Patterns**
   - Historical maintenance records
   - Asset age and depreciation curves
   - Failure rate predictions
   - Preventive maintenance schedules

3. **Cost Analysis**
   - Purchase and maintenance costs
   - Depreciation calculations
   - Utilization multipliers
   - Opportunity costs

4. **Operational Efficiency**
   - Department-level metrics
   - Resource distribution variance
   - Cross-department utilization
   - Collaboration patterns

### Confidence Scoring

Each insight includes a confidence score (0-100%):
- **90-100%**: High confidence, act immediately
- **75-89%**: Medium-high confidence, review and plan
- **60-74%**: Medium confidence, monitor and prepare
- **Below 60%**: Low confidence, gather more data

### Impact Levels

- **High**: Potential cost savings >₹1L or critical operational issues
- **Medium**: Potential cost savings ₹50K-₹1L or notable operational improvements
- **Low**: Potential cost savings <₹50K or minor optimizations

---

## Best Practices

### For Executives:

1. **Review Dashboard Daily**: Check AI Operations Center each morning
2. **Track Metrics Trends**: Monitor ROI and efficiency scores weekly
3. **Act on High-Impact Alerts**: Approve reallocation and maintenance recommendations
4. **Use Command Palette**: Quick access to critical information

### For Operations Managers:

1. **Expand All Insights**: Review detailed action items before execution
2. **Validate Recommendations**: Cross-check AI suggestions with on-ground reality
3. **Track Outcomes**: Monitor success of implemented recommendations
4. **Feedback Loop**: Provide corrections to improve AI accuracy

### For Asset Managers:

1. **Act on Maintenance Forecasts**: Schedule preventive maintenance proactively
2. **Execute Reallocations**: Implement reallocation plans during low-activity periods
3. **Document Outcomes**: Log results of taken actions for AI learning
4. **Regular Audits**: Verify asset locations match allocations

---

## Customization & Tuning

### Configuration Options

In `lib/ai-insights.ts`, adjust these parameters:

```typescript
// Idle asset threshold (days)
const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)

// Maintenance forecast window (days)
const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

// Utilization threshold for cost optimization alerts
const utilizationThreshold = 60 // percent

// Annual savings multiplier
const savingsMultiplier = 0.15 // 15%
```

### Adding Custom Insights

Create new insight generators:

```typescript
export async function generateCustomInsight(): Promise<AssetInsight> {
  // Your analysis logic
  return {
    type: 'recommendation',
    title: 'Your Insight Title',
    description: 'Detailed description',
    impact: 'high',
    confidence: 0.85,
    actionItems: [
      { action: 'Action 1', impact: 'Impact description' },
    ],
  }
}

// Add to generateOperationsInsights()
```

---

## Troubleshooting

### Insights Not Updating

1. **Check Auth Token**: Verify valid JWT token in localStorage
2. **Verify Database**: Ensure Prisma schema is migrated
3. **Check Logs**: Review `/tmp/dev.log` for errors
4. **Restart**: Kill and restart the dev server

### Metrics Show Zero Values

1. **Populate Data**: Ensure assets, allocations, and bookings exist
2. **Check Dates**: Verify asset and booking dates are recent
3. **Validate Schema**: Run `pnpm prisma migrate dev`

### AI Chat Not Responding

1. **Check API Key**: Verify `ANTHROPIC_API_KEY` is set
2. **Network**: Ensure internet connection for API calls
3. **Rate Limit**: Wait if too many requests in short time
4. **Error Logs**: Check browser console for detailed errors

---

## Future Enhancements

### Phase 2 (v1.1):

- **Predictive Scheduling**: AI recommends optimal booking times
- **Anomaly Detection**: Real-time alerts for unusual patterns
- **ML Training**: System learns from your decisions
- **Custom KPIs**: Define metrics specific to your business

### Phase 3 (v1.2):

- **Digital Twin**: 3D visualization of office and asset locations
- **Recommendation Confidence**: Explainable AI showing decision factors
- **Automated Actions**: Approve recommendations in batches
- **Executive Dashboard**: Simplified view for C-level executives

### Phase 4 (v1.3):

- **Generative Reports**: AI creates narrative business reports
- **Natural Language Actions**: "Move all laptops to engineering"
- **Predictive Budgeting**: AI forecasts next year's costs
- **Cross-System Integration**: Connect with procurement and HR

---

## Support & Resources

**Documentation**: See DOCUMENTATION_INDEX.md  
**API Reference**: See QUICK_REFERENCE.md  
**Troubleshooting**: See PRODUCTION_HARDENING_REPORT.md  
**Architecture**: Check PHASE_IMPLEMENTATION_SUMMARY.md

---

*AssetFlow AI Features v1.0 - Production Ready*  
*Last Updated: July 12, 2026*
