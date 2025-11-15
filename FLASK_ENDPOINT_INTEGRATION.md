# Flask Endpoint Integration Guide

## Overview
This document explains how to integrate Angular components with the Flask backend (PaidSearchAuditAgent) to run audits and display results.

## Complete Flow

The complete audit flow consists of 4 main steps:

### 1. Start Audit
**Endpoint:** `POST /api/fetch-single-check/{session_id}`

**Request Body:**
```json
{
  "account_id": "1234567890",
  "check_key": "audience",
  "start_date": "2024-01-01",
  "end_date": "2024-03-31"
}
```

**Response:**
```json
{
  "success": true,
  "mode": "file_based_single_check",
  "check_key": "audience",
  "check_name": "Audience Performance Insights",
  "account_id": "1234567890",
  "required_files": ["Audience Report", "Audience List"],
  "triggered": true
}
```

### 2. Poll for Status
**Endpoint:** `GET /api/processing-status/{session_id}`

**Response:**
```json
{
  "session_id": "abc-123",
  "file_processing": {
    "completion_percentage": 100,
    "is_complete": true,
    "completed_files": ["Audience Report", "Audience List"],
    "pending_files": []
  },
  "processing_status": {
    "completed": 1,
    "total_expected": 1,
    "percentage": 100,
    "is_complete": true,
    "is_timeout": false
  },
  "results_ready": true,
  "available_results": ["audience"]
}
```

**Polling Strategy:**
- Poll every 1 second
- Maximum 180 attempts (3 minutes)
- Check if `processing_status.is_complete === true` AND `check_key` is in `available_results`
- If timeout occurs but results are available, proceed to next step

### 3. Get Results
**Endpoint:** `GET /api/get-single-check-results/{session_id}/{check_key}`

**Response (Success):**
```json
{
  "success": true,
  "audit_id": "xyz789",
  "check_key": "audience",
  "message": "Results ready for audience"
}
```

**Response (Still Processing - HTTP 202):**
```json
{
  "success": false,
  "error": "Results not ready yet",
  "status": "processing",
  "check_key": "audience"
}
```

### 4. Fetch Check Details
**Endpoint:** `GET /api/audit/{audit_id}/check?key={check_key}`

**Response:**
```json
{
  "key": "audience",
  "name": "Audience Performance Insights",
  "impact": "High",
  "status": "Fail",
  "count": 5,
  "records": [
    {
      "campaign_name": "Campaign 1",
      "audience_name": "Audience A",
      "impressions": 1000,
      "clicks": 50
    }
  ],
  "special_description": "Optional description"
}
```

## Angular Component Pattern

### Required Properties
```typescript
// API Base URL
private readonly API_BASE_URL = 'https://deetaanalyticsllc.com:8053/api';

// Loading state
isProcessing: boolean = false;
processingProgress: number = 0;
processingMessage: string = '';

// Results state
auditResults: any = null;
showResults: boolean = false;
```

### Required Methods

1. **runAudit()** - Starts the audit
2. **pollForCheckCompletion(checkKey)** - Polls for completion
3. **getCheckResults(checkKey)** - Gets results when ready
4. **fetchCheckDetails(auditId, checkKey)** - Fetches detailed data
5. **resetAudit()** - Resets the form
6. **getStatusBadgeClass(status)** - Returns CSS class for status badge
7. **getImpactBadgeClass(impact)** - Returns CSS class for impact badge
8. **getRecordKeys(record)** - Extracts keys from record object
9. **formatColumnName(columnName)** - Formats column names for display
10. **formatValue(value)** - Formats values for display

### HTML Template Requirements

1. **Processing Status Section** - Shows progress bar and message
2. **Results Section** - Displays audit results in a table
3. **Button State** - Disable button during processing

## Available Check Keys

The following check keys are available in the Flask backend:

- `audience` - Audience Performance Insights
- `LandingPageHealth` - Landing Page Health
- `engagement` - PMAX Asset Engagement
- `offensive_language` - Offensive Language Detection
- `location_cpl` - Geo Segmentation Opportunities
- `budget` - Budget Allocation Efficiency
- `day_cpl` - Day of Week Optimization
- `hour_cpl` - Hour of Day Optimization
- `non_conv` - High Spend Non-Converting Queries
- `term_copy_mismatch` - Keyword Ad Copy Mismatch
- `term_lp_mismatch` - Keyword Landing Page Mismatch
- `missing_terms` - High ROAS Search Terms Missing
- `ppmax_group` - PMAX Asset Group Coverage
- `device_cpl` - Device Segmentation Opportunities
- `search_partners` - Search Partners Performance
- `keyword_conflicts` - Keyword Conflicts Detection
- `duplicate_keywords` - Duplicate Keywords Detection
- `geo_targeting` - Geo Targeting Consistency
- `lang` - Language Targeting Accuracy
- `expiry` - Expired Ad Offers Running
- `no_ad_copy` - Active Ad Groups with No Ad Copy
- `no_keywords` - Active Ad Groups with No Keywords
- `adStatus` - Disapproved Ads or Extensions
- `conversions` - Conversion Action with No Conversions
- `asset_type` - Missing Essential Extensions
- `events` - Campaign with No Tracking Template
- `compliance` - Ad Copy Brand Compliance Spelling

## Example Implementation

See `audience-performance-insights.ts` and `landing-page-health.ts` for complete implementations.

## Common Issues

1. **Results not appearing**: Make sure you're polling until `is_complete === true` and the check_key is in `available_results`
2. **202 Status Code**: This means results are still processing, continue polling
3. **Timeout**: If timeout occurs but results are available, proceed to fetch results
4. **Missing check_key**: Ensure the check_key matches exactly what's in the Flask backend registry

## Notes

- Authentication is handled separately (don't modify login/auth code)
- Account fetching is already implemented (don't modify account fetching code)
- All endpoints require the session_id from sessionStorage
- The API base URL should be consistent across all components

