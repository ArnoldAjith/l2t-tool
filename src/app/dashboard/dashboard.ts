import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

// child tool components
import { KeywordCheck } from '../keyword-check/keyword-check';
import { ZeroActiveAds } from '../zero-active-ads/zero-active-ads';
import { ZeroActiveKeywords } from '../zero-active-keywords/zero-active-keywords';
import { IncentiveAutomation } from '../incentive-automation/incentive-automation';
import { Dsr } from '../dsr/dsr';
import { DisapprovedAds } from '../disapproved-ads/disapproved-ads';
import { AdcopyCheck } from '../adcopy-check/adcopy-check';
import { Sqr } from '../sqr/sqr';
import { CampaignBuild } from '../campaign-build/campaign-build';
import { ZeroActiveAdGroup } from '../zero-active-ad-group/zero-active-ad-group';
import { WowConversion } from '../wow-conversion/wow-conversion';
import { TopConversion } from '../top-conversion/top-conversion';
import { ExpiredSitesLink } from '../expired-sites-link/expired-sites-link';
import { ConversionCheck } from '../conversion-check/conversion-check';
import { CampaignWithNoTrackingTempl } from '../campaign-with-no-tracking-templ/campaign-with-no-tracking-templ';
import { AlertWhenActiveCampaignBudget } from '../alert-when-active-campaign-budget/alert-when-active-campaign-budget';
import { CheckForCampaignsRunningOn } from '../check-for-campaigns-running-on/check-for-campaigns-running-on';
import { BidStrategies } from '../bid-strategies/bid-strategies';
import { LanguageSetting } from '../language-setting/language-setting';
import { LocationSettings } from '../location-settings/location-settings';
import { LabelChecks } from '../label-checks/label-checks';
import { ImageExtensionCheck } from '../image-extension-check/image-extension-check';
import { ImpressionCheck } from '../impression-check/impression-check';
import { L2tDeviation } from '../l2t-deviation/l2t-deviation';
import { NegativeKeywords } from '../negative-keywords/negative-keywords';
import { UrlChecker } from '../url-checker/url-checker';
import { SystemLogs } from "../system-logs/system-logs";
import { GeoTargetingConsistency } from '../geo-targeting-consistency/geo-targeting-consistency';
import { LanguageTargetingAccuracy } from '../language-targeting-accuracy/language-targeting-accuracy';
import { MissingEssentialExtensions } from '../missing-essential-extensions/missing-essential-extensions';
import { SeasonalCampaignReadiness } from '../seasonal-campaign-readiness/seasonal-campaign-readiness';
import { BudgetAllocationEfficiency } from '../budget-allocation-efficiency/budget-allocation-efficiency';
import { DayOfWeekOptimization } from '../day-of-week-optimization/day-of-week-optimization';
import { GeoSegmentationOpportunities } from '../geo-segmentation-opportunities/geo-segmentation-opportunities';
import { DeviceSegmentationOpportunities } from '../device-segmentation-opportunities/device-segmentation-opportunities';
import { SearchPartnersPerformance } from '../search-partners-performance/search-partners-performance';
import { AudiencePerformanceInsights } from '../audience-performance-insights/audience-performance-insights';
import { ExpiredAdOffersRunning } from '../expired-ad-offers-running/expired-ad-offers-running';
import { ActiveAdGroupsWithNoAdCopy } from '../active-ad-groups-with-no-ad-copy/active-ad-groups-with-no-ad-copy';
import { DisapprovedAdsOrExtensions } from '../disapproved-ads-or-extensions/disapproved-ads-or-extensions';
import { LandingPageHealth } from '../landing-page-health/landing-page-health';
import { AdCopyBrandComplianceSpelling } from '../ad-copy-brand-compliance-spelling/ad-copy-brand-compliance-spelling';
import { OffensiveLanguageDetection } from '../offensive-language-detection/offensive-language-detection';
import { PmaxAssetEngagement } from '../pmax-asset-engagement/pmax-asset-engagement';
import { PmaxAssetGroupCoverage } from '../pmax-asset-group-coverage/pmax-asset-group-coverage';
import { ActiveAdGroupsWithNoKeywords } from '../active-ad-groups-with-no-keywords/active-ad-groups-with-no-keywords';
import { HighSpendNonConvertingQueries } from '../high-spend-non-converting-queries/high-spend-non-converting-queries';
import { KeywordAdCopyMismatch } from '../keyword-ad-copy-mismatch/keyword-ad-copy-mismatch';
import { KeywordLandingPageMismatch } from '../keyword-landing-page-mismatch/keyword-landing-page-mismatch';
import { HighRoasSearchTermsMissingInKeywordSet } from '../high-roas-search-terms-missing-in-keyword-set/high-roas-search-terms-missing-in-keyword-set';
import { KeywordConflictsDetection } from '../keyword-conflicts-detection/keyword-conflicts-detection';
import { DuplicateKeywordsDetection } from '../duplicate-keywords-detection/duplicate-keywords-detection';
import { ConversionTracking } from '../conversion-tracking/conversion-tracking';
import { ConversionActionWithNoConversions } from '../conversion-action-with-no-conversions/conversion-action-with-no-conversions';



interface ToolItem {
  title: string;
  image: string;
  toolkit: string;
  icon?: string;
  subheader: string;
  subheader1: string; // Font Awesome class (without 'fas')
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    KeywordCheck,
    ZeroActiveAds,
    ZeroActiveKeywords,
    IncentiveAutomation,
    Dsr,
    DisapprovedAds,
    AdcopyCheck,
    Sqr,
    CampaignBuild,
    ZeroActiveAdGroup,
    WowConversion,
    TopConversion,
    ExpiredSitesLink,
    ConversionCheck,
    CampaignWithNoTrackingTempl,
    AlertWhenActiveCampaignBudget,
    CheckForCampaignsRunningOn,
    BidStrategies,
    LanguageSetting,
    LocationSettings,
    LabelChecks,
    ImageExtensionCheck,
    ImpressionCheck,
    L2tDeviation,
    NegativeKeywords,
    UrlChecker,
    SystemLogs,
    GeoTargetingConsistency,
    LanguageTargetingAccuracy,
    MissingEssentialExtensions,
    SeasonalCampaignReadiness,
    BudgetAllocationEfficiency,
    DayOfWeekOptimization,
    GeoSegmentationOpportunities,
    DeviceSegmentationOpportunities,
    AudiencePerformanceInsights,
    SearchPartnersPerformance,
    ExpiredAdOffersRunning,
    ActiveAdGroupsWithNoAdCopy,
    DisapprovedAdsOrExtensions,
    LandingPageHealth,
    AdCopyBrandComplianceSpelling,
    OffensiveLanguageDetection,
    PmaxAssetEngagement,
    PmaxAssetGroupCoverage,
    ActiveAdGroupsWithNoKeywords,
    HighSpendNonConvertingQueries,
    KeywordAdCopyMismatch,
    KeywordLandingPageMismatch,
    HighRoasSearchTermsMissingInKeywordSet,
    KeywordConflictsDetection,
    DuplicateKeywordsDetection,
    ConversionActionWithNoConversions,
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
})
export class Dashboard implements OnInit, OnDestroy {
  constructor(private router: Router) { }

  // Mobile detection (used to show global toggle & backdrop)
  isMobile = false;

  // Mobile tab state
  mobileTab: 'Campaign' | 'Keyword' = 'Campaign';

  // Main selection states
  selectedTool: string = 'Adcopy Checker';
  selectedToolKit: string = 'Campaign';
  selectedAutomationTitle: string = '';
  selectedScriptTitle: string = '';

  // Sidebar state
  isSidebarCollapsed: boolean = false;

  userInitial: string | null = null;

  // User session data
  username: string | null = null;
  image: string | null = null;
  role: string | null = null;

  campaign: ToolItem[] = [
    { title: 'Campaign Build', subheader: 'Campaign', subheader1: 'Build', image: '', toolkit: 'Campaign', icon: '' },
    { title: 'Zero Active Ad Group', subheader: 'Zero Active', subheader1: 'Ad Group', image: '', toolkit: 'Campaign', icon: '' },
    { title: 'Location Settings Checker', subheader: 'Location', subheader1: 'Checker', image: '', toolkit: 'Campaign', icon: '' },
    { title: 'Language Settings Checker', subheader: 'Language', subheader1: 'Checker', image: '', toolkit: 'Campaign', icon: '' },
    { title: 'Label Checker', subheader: 'Label', subheader1: 'Checker', image: '', toolkit: 'Campaign', icon: '' },
    { title: 'Geo Targeting Consistency', subheader: 'Geo', subheader1: 'Targeting Consistency', image: '', toolkit: 'Bid Management', icon: '' },
    { title: 'Language Targeting Accuracy', subheader: 'Language', subheader1: 'Targeting Accuracy', image: '', toolkit: 'Campaign', icon: '' },
    { title: 'Missing Essential Extensions', subheader: 'Missing', subheader1: 'Essential Extensions', image: '', toolkit: 'Campaign', icon: '' },
    { title: 'Seasonal Campaign Readiness', subheader: 'Seasonal', subheader1: 'Campaign Readiness', image: '', toolkit: 'Campaign', icon: '' },
    { title: 'Search Partners Performance Insights', subheader: 'Search Partners', subheader1: 'Performance Insights', image: '', toolkit: 'Campaign', icon: '' },
    { title: 'Audience Performance Insights', subheader: 'Audience', subheader1: 'Performance Insights', image: '', toolkit: 'Campaign', icon: '' },
  ]

  keyword: ToolItem[] = [
    { title: 'Keywords Checker', subheader: 'Keywords', subheader1: 'Checker', image: '', toolkit: 'Keyword', icon: '' },
    { title: 'Negative Keywords', subheader: 'Negative', subheader1: 'Keywords', image: '', toolkit: 'Keyword', icon: '' },
    { title: 'Zero Active Keywords', subheader: 'Zero Active', subheader1: 'Keywords', image: '', toolkit: 'Keyword', icon: '' },
    { title: 'Active Ad Groups with no Keywords', subheader: 'Active Ad Groups', subheader1: 'with no Keywords', image: '', toolkit: 'Keyword', icon: '' },
    { title: 'High-Spend Non-Converting Queries', subheader: 'High-Spend', subheader1: 'Non-Converting Queries', image: '', toolkit: 'Keyword', icon: '' },
    { title: 'Keyword / Ad Copy Mismatch', subheader: 'Keyword / Ad Copy', subheader1: 'Mismatch', image: '', toolkit: 'Keyword', icon: '' },
    { title: 'Keyword / Landing Page Mismatch', subheader: 'Keyword / Landing', subheader1: 'Page Mismatch', image: '', toolkit: 'Keyword', icon: '' },
    { title: 'High-ROAS Search Terms Missing in Keyword Set', subheader: 'High-ROAS', subheader1: 'Search Terms Missing in Keyword Set', image: '', toolkit: 'Keyword', icon: '' },
    { title: 'Keyword Conflicts Detection', subheader: 'Keyword', subheader1: 'Conflicts Detection', image: '', toolkit: 'Keyword', icon: '' },
    { title: 'Duplicate Keywords Detection', subheader: 'Duplicate', subheader1: 'Keywords Detection', image: '', toolkit: 'Keyword', icon: '' },
  ]

  adcopy: ToolItem[] = [
    { title: 'Adcopy Checker', subheader: 'Adcopy', subheader1: 'Checker', image: '', toolkit: 'Ad Copy', icon: '' },
    { title: 'Incentive Adcopy Checker', subheader: 'Incentive', subheader1: 'Ad Copies', image: '', toolkit: 'Ad Copy', icon: '' },
    { title: 'Disapproved Ads', subheader: 'Disapproved', subheader1: 'Ads', image: '', toolkit: 'Ad Copy', icon: '' },
    { title: 'Zero Active Ads', subheader: 'Zero Active', subheader1: 'Ads', image: '', toolkit: 'Ad Copy', icon: '' },
    { title: 'Broken Link Checker', subheader: 'Broken', subheader1: 'Link', image: '', toolkit: 'Ad Copy', icon: '' },
    { title: 'Expired Site Link', subheader: 'Expired', subheader1: 'Site Link', image: '', toolkit: 'Ad Copy', icon: '' },
    { title: 'Expired Ad Offers Running', subheader: 'Expired Ad', subheader1: 'Offers Running', image: '', toolkit: 'Ad Copy', icon: '' },
    { title: 'Active Ad Groups with no Ad Copy', subheader: 'Active Ad Groups', subheader1: 'with no Ad Copy', image: '', toolkit: 'Ad Copy', icon: '' },
    { title: 'Disapproved Ads or Extensions', subheader: 'Disapproved Ads', subheader1: 'or Extensions', image: '', toolkit: 'Ad Copy', icon: '' },
    { title: 'Landing Page Health Checker', subheader: 'Landing Page', subheader1: 'Health Checker', image: '', toolkit: 'Ad Copy', icon: '' },
    { title: 'Ad Copy Brand Compliance & Spelling', subheader: 'Ad Copy Brand', subheader1: 'Compliance & Spelling', image: '', toolkit: 'Ad Copy', icon: '' },
    { title: 'Offensive Language Detection', subheader: 'Offensive Language', subheader1: 'Detection', image: '', toolkit: 'Ad Copy', icon: '' },
    { title: 'PMax Asset Engagement Checker', subheader: 'PMax Asset', subheader1: 'Engagement Checker', image: '', toolkit: 'Ad Copy', icon: '' },
    { title: 'PMax Asset Group Coverage Checker', subheader: 'PMax Asset', subheader1: 'Group Coverage Checker', image: '', toolkit: 'Ad Copy', icon: '' },
  ]

  budgetManagement: ToolItem[] = [
    { title: 'Campaign Budget > $4500', subheader: 'Campaign Budget', subheader1: '> $4500', image: '', toolkit: 'Budget Management', icon: '' },
    { title: 'Zero Spend for 3 days', subheader: 'Zero Spend', subheader1: '(3 days) Checker', image: '', toolkit: 'Budget Management', icon: '' },
    { title: 'DSR Tracker', image: '', subheader: 'DSR', subheader1: 'Tracker', toolkit: 'Budget Management', icon: '' },
    { title: 'Deviation Tracker', subheader: 'Deviation', subheader1: 'Tracker', image: '', toolkit: 'Budget Management', icon: '' },
    { title: 'Budget Allocation Efficiency', subheader: 'Budget', subheader1: 'Allocation Efficiency', image: '', toolkit: 'Budget Management', icon: '' },
  ]

  bidmanagement: ToolItem[] = [
    { title: 'Conversion Checker', subheader: 'Conversion', subheader1: 'Checker', image: '', toolkit: 'Bid Management', icon: '' },
    { title: 'Conversion Tracking', subheader: 'Conversion', subheader1: 'Trackering', image: '', toolkit: 'Bid Management', icon: '' },
    { title: 'Day-Of-Week Optimization', subheader: 'Day-Of-Week', subheader1: 'Optimization', image: '', toolkit: 'Bid Management', icon: '' },
    { title: 'Geo Segmentation Opportunities', subheader: 'Geo', subheader1: 'Segmentation Opportunities', image: '', toolkit: 'Bid Management', icon: '' },
    { title: 'Device Segmentation Opportunities', subheader: 'Device', subheader1: 'Segmentation Opportunities', image: '', toolkit: 'Bid Management', icon: '' },
  ]

  log: ToolItem[] = [
    { title: 'System Logs', subheader: 'Logs', subheader1: 'Log', image: '', toolkit: 'Scripts', icon: '' },
  ]

  private descriptions: Record<string, string> = {
    'Adcopy Checker': 'Scan ad copy for policy issues and performance flags.',
    'Keywords Checker': 'Audit keyword coverage, match types, and conflicts.',
    'Incentive Adcopy Checker': 'Automate incentive setup and publishing.',
    'DSR Tracker': 'Daily sales report ingestion and trend tracking.',
    'SQR': 'Search Query Reports mining to expand/negative keywords.',
    'Campaign Build': 'Templated campaign creation with guardrails.',
    'Deviation Tracker': 'Track "Lead-to-Trade" deviation anomalies.',
    'Broken Link Checker': 'Check for broken or invalid URLs.',
    'Campaign Budget > $4000': 'Notify when budgets exceed thresholds.',
    'Conversion Checker': 'Validate conversion tracking health.',
    'Disapproved Ads': 'Find and summarize disapproved ads.',
    'Expired Site Link': 'Identify expired or broken sitelinks.',
    'Zero Spend for 3 days': 'Surface impression dips and anomalies.',
    'Label Checker': 'Ensure proper label hygiene and usage.',
    'Language Settings Checker': 'Detect wrong language settings.',
    'Location Settings Checker': 'Verify geo targeting accuracy.',
    'Zero Active Ads': 'Find ad groups with no active ads.',
    'Zero Active Ad Group': 'Find campaigns with empty ad groups.',
    'Zero Active Keywords': 'Find ad groups with no active keywords.',
    'Negative Keywords': 'Manage and audit negative keyword lists.',
  };

  trackByTitle = (_: number, item: ToolItem) => item.title;

  onSignOut(): void {
    sessionStorage.clear();
    this.router.navigate(['/']);
  }

  ngOnInit(): void {
    this.username = sessionStorage.getItem('username');
    this.role = sessionStorage.getItem('role');
    this.userInitial = this.username ? this.username.charAt(0).toUpperCase() : null;
    if (!this.username) {
      this.router.navigate(['/login']);
      return;
    }

    if (this.campaign.length > 0) {
      this.selectedTool = this.campaign[0].title;
      this.selectedToolKit = this.campaign[0].toolkit;
    }

    this.checkScreenSize();

    window.addEventListener('resize', this.onResize);
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.onResize);
  }

  private onResize = () => {
    this.checkScreenSize();
  };

  private checkScreenSize(): void {
    this.isMobile = window.innerWidth <= 991.98;
    this.isSidebarCollapsed = this.isMobile ? true : false;
  }


  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  setMobileTab(tab: 'Campaign' | 'Keyword'): void {
    this.mobileTab = tab;
  }


  getToolDescription(title: string): string {
    return this.descriptions[title] ?? 'Select a tool to see its details.';
  }

  onSidebarAutomationClick(item: ToolItem): void {
    this.selectedTool = item.title;
    this.selectedToolKit = 'Campaign';
    this.selectedAutomationTitle = item.title;
    this.selectedScriptTitle = '';

    if (this.isMobile) this.isSidebarCollapsed = true;
  }

  onSidebarKeywordClick(item: ToolItem): void {
    this.selectedTool = item.title;
    this.selectedToolKit = 'Keyword';
    this.selectedScriptTitle = item.title;
    this.selectedAutomationTitle = ''; // Clear automation selection

    if (this.isMobile) this.isSidebarCollapsed = true;
  }

  onSidebarAdCopyClick(item: ToolItem): void {
    this.selectedTool = item.title;
    this.selectedToolKit = 'Ad Copy';
    this.selectedScriptTitle = item.title;
    this.selectedAutomationTitle = ''; // Clear automation selection

    if (this.isMobile) this.isSidebarCollapsed = true;
  }

  onSidebarBudgetManagementClick(item: ToolItem): void {
    this.selectedTool = item.title;
    this.selectedToolKit = 'Budget Management';
    this.selectedScriptTitle = item.title;
    this.selectedAutomationTitle = ''; // Clear automation selection

    if (this.isMobile) this.isSidebarCollapsed = true;
  }

  onSidebarBidManagementClick(item: ToolItem): void {
    this.selectedTool = item.title;
    this.selectedToolKit = 'Bid Management';
    this.selectedScriptTitle = item.title;
    this.selectedAutomationTitle = ''; // Clear automation selection

    if (this.isMobile) this.isSidebarCollapsed = true;
  }

  // Open native select picker
  openSelect(el: HTMLSelectElement): void {
    const anyEl = el as any;
    if (anyEl.showPicker) {
      anyEl.showPicker();
      return;
    }
    el.focus();
    el.click();
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
  }

  getSelectedToolDetails(): { subheader: string; subheader1: string } | null {
    const allTools = [
      ...this.campaign,
      ...this.adcopy,
      ...this.keyword,
      ...this.budgetManagement,
      ...this.bidmanagement,
    ];
    const selected = allTools.find(item => item.title === this.selectedTool);
    return selected ? { subheader: selected.subheader, subheader1: selected.subheader1 } : null;
  }

  // Helper to fully clear the current selection state
  private resetSelection(): void {
    this.selectedToolKit = '';
    this.selectedTool = '';
    this.selectedAutomationTitle = '';
    this.selectedScriptTitle = '';
  }
}
