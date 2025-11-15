import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

interface CampaignSetVM {
  index: number;
  account: string;
  campaignType: string;
  make: string;
  model?: string;
  campaignRegional?: string;
  availableMakes: string[];
  availableModels: string[];
  showModelField: boolean;
  showRegionalField: boolean;
}

@Component({
  selector: 'app-campaign-build',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './campaign-build.html',
  styleUrls: ['./campaign-build.css'],
})
export class CampaignBuild implements OnInit {
  // private readonly API_BASE = 'http://localhost:8056';
  private readonly API_BASE = 'https://datteamwork.com:8066';
  // private readonly API_BASE = 'https://tagbees.com:8066';

  activeTab: 'generator' | 'editor' = 'generator';

  // Forms
  generatorForm!: FormGroup;
  editorForm!: FormGroup;

  // Dropdown data
  accounts: string[] = [];
  campaignTypes: string[] = [];
  makes: string[] = [];
  models: string[] = [];
  customerIds: string[] = [];

  // Dynamic Campaign Sets
  dynamicCampaignSets: CampaignSetVM[] = [];
  campaignSetCounter = 1;

  // UI
  isLoading = false;
  loadingText = 'Processing...';
  alertMessage = '';
  alertType: 'success' | 'error' | 'info' = 'info';
  showModelField = false;
  showRegionalField = false;
  showResults = false;
  showDownloadBtn = false;

  // Editor custom toggles/values
  showCustomAccount = false;
  showCustomCustomerID = false;
  showCustomCampaignType = false;
  showCustomMake = false;
  showCustomModel = false;
  customAccountValue = '';
  customCustomerIDValue = '';
  customCampaignTypeValue = '';
  customMakeValue = '';
  customModelValue = '';

  // Results
  currentCampaignData: any[] = [];
  currentSummary: any = {};
  currentKeywords: any[] = [];
  resultColumns: string[] = [];
  headlines = Array.from({ length: 6 }, (_, i) => i + 1);

  trackByString = (_: number, v: string) => v;
  trackByIndex = (i: number) => i;

  private normAccount = (row: any): string => String(row?.AccountName ?? row?.Account ?? "").trim() || "Unknown";
  private normCampaign = (row: any): string => String(row?.Campaign ?? "").trim() || "Unknown";
  private normAdGroup = (row: any): string => String(row?.["Ad Group"] ?? row?.AdGroup ?? row?.ad_group ?? "").trim();

  private groupAccountCampaign<T extends Record<string, any>>(
    rows: T[]
  ): Record<string, Record<string, T[]>> {
    const out: Record<string, Record<string, T[]>> = {};
    for (const r of rows) {
      const acc = this.normAccount(r);
      const cmp = this.normCampaign(r);
      (out[acc] ||= {});
      (out[acc][cmp] ||= []);
      out[acc][cmp].push(r);
    }
    return out;
  }

  private buildViews() {
    // 1) Build Account → Campaign → Ads[]
    this.groupedByAccountCampaign = this.groupAccountCampaign(this.currentCampaignData || []);

    // 2) Cache keys for *ngFor
    this.accountKeys = Object.keys(this.groupedByAccountCampaign).sort();
    this.campaignKeysByAccount = {};
    for (const acc of this.accountKeys) {
      this.campaignKeysByAccount[acc] = Object.keys(this.groupedByAccountCampaign[acc]).sort();
    }

    // 3) OPTIONAL: split keywords by Account & Campaign
    //    We infer account via overlap of Ad Groups present in that account+campaign's Ads.
    this.keywordsByAccountCampaign = {};
    for (const acc of this.accountKeys) {
      this.keywordsByAccountCampaign[acc] = {};
      for (const cmp of this.campaignKeysByAccount[acc]) {
        const ads = this.groupedByAccountCampaign[acc][cmp];
        const adGroupSet = new Set<string>(ads.map((r) => this.normAdGroup(r)).filter(Boolean));

        const filtered = (this.currentKeywords || []).filter((k) => {
          const kCampaign = String(k.Campaign ?? "").trim();
          const kAg = String(k["Ad group"] ?? k.ad_group ?? "").trim();
          // Must match campaign AND be in an Ad Group that exists under (acc, cmp)
          return kCampaign === cmp && (kAg ? adGroupSet.has(kAg) : false);
        });

        this.keywordsByAccountCampaign[acc][cmp] = filtered;
      }
    }
  }

  // Constants
  modelRequiredTypes = ['MODEL'];
  regionalCampaignTypes = ['REGIONAL', 'REGIONAL MAKE', 'REGIONAL MODEL', 'LOCAL'];

  groupedByAccountCampaign: Record<string, Record<string, any[]>> | null = null;
  accountKeys: string[] = [];
  campaignKeysByAccount: Record<string, string[]> = {};

  keywordsByAccountCampaign: Record<string, Record<string, any[]>> = {};

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.initializeForms();
  }

  ngOnInit(): void {
    this.loadInitialData();
  }

  // ---------- Helpers ----------
  private url(path: string): string {
    // Always call Flask server directly (CORS already configured there)
    return `${this.API_BASE}${path}`;
  }

  private isModelShownFor(type?: string): boolean {
    if (!type) return false;
    const upper = type.toUpperCase();
    return this.modelRequiredTypes.includes(upper) || ['SERVICE', 'USED'].includes(upper);
  }

  private isRegionalShownFor(type?: string): boolean {
    if (!type) return false;
    const upper = type.toUpperCase();
    return this.regionalCampaignTypes.some(t => upper.includes(t));
  }

  // ---------- Forms ----------
  initializeForms(): void {
    this.generatorForm = this.fb.group({
      account: ['', Validators.required],
      campaignType: ['', Validators.required],
      make: [{ value: '', disabled: true }, Validators.required],
      model: [{ value: '', disabled: true }],
      campaignRegional: ['']
    });

    this.editorForm = this.fb.group({
      account: ['', Validators.required],
      customerID: ['', Validators.required],
      campaignType: ['', Validators.required],
      make: ['', Validators.required],
      model: [''],
      dealerCity: [''],
      campaign: [''],
      adGroup: [''],
      finalURL: [''],
      headline1: [''],
      headline2: [''],
      headline3: [''],
      headline4: [''],
      headline5: [''],
      headline6: [''],
      description1: [''],
      description2: [''],
      path1: [''],
      path2: [''],
      labels: [''],
      keyword: [''],
    });

    this.setupFormListeners();
  }

  setupFormListeners(): void {
    this.generatorForm.get('account')?.valueChanges.subscribe(() => this.onAccountChange());
    this.generatorForm.get('campaignType')?.valueChanges.subscribe(() => this.onCampaignTypeChange());
    this.generatorForm.get('make')?.valueChanges.subscribe(() => this.onMakeChange());

    this.editorForm.get('account')?.valueChanges.subscribe(v => (this.showCustomAccount = v === '__custom__'));
    this.editorForm.get('customerID')?.valueChanges.subscribe(v => (this.showCustomCustomerID = v === '__custom__'));
    this.editorForm.get('campaignType')?.valueChanges.subscribe(v => (this.showCustomCampaignType = v === '__custom__'));
    this.editorForm.get('make')?.valueChanges.subscribe(v => (this.showCustomMake = v === '__custom__'));
    this.editorForm.get('model')?.valueChanges.subscribe(v => (this.showCustomModel = v === '__custom__'));
  }

  // ---------- Initial Data ----------
  async loadInitialData(): Promise<void> {
    try {
      // Single call that exists in Flask to fetch all dropdowns
      const res = await firstValueFrom(this.http.get<any>(this.url('/get_all_dropdowns')));
      this.accounts = res.accounts || [];
      this.customerIds = res.customer_ids || [];
      this.makes = res.makes || [];
      this.models = res.models || [];
      this.campaignTypes = res.campaign_types || [];
    } catch (e: any) {
      this.showAlert(`Failed to load dropdowns: ${e?.message || e}`, 'error');
    }
  }

  switchTab(tab: 'generator' | 'editor'): void {
    this.activeTab = tab;
    this.clearAlert();
  }

  // ---------- Generator Tab ----------
  async onAccountChange() {
    const makeCtrl = this.generatorForm.get('make')!;
    const modelCtrl = this.generatorForm.get('model')!;

    this.makes = [];
    makeCtrl.disable({ emitEvent: false });
    modelCtrl.disable({ emitEvent: false });
    makeCtrl.reset('');
    modelCtrl.reset('');

    const account = this.generatorForm.get('account')?.value;
    if (!account) return;

    try {
      const makes = await firstValueFrom(
        this.http.get<string[]>(this.url(`/get_makes/${encodeURIComponent(account)}`))
      );
      this.makes = makes || [];
      makeCtrl.enable({ emitEvent: false });   // ✅ enable via control, not template
    } catch {
      this.showAlert('Error loading makes', 'error');
    }
  }

  onCampaignTypeChange() {
    const campaignType = this.generatorForm.get('campaignType')?.value as string;
    const modelCtrl = this.generatorForm.get('model')!;

    this.showModelField = this.isModelShownFor(campaignType);
    this.showRegionalField = this.isRegionalShownFor(campaignType);

    if (this.showModelField) {
      modelCtrl.enable({ emitEvent: false });
      if (this.generatorForm.get('make')?.value) this.loadModels();
    } else {
      modelCtrl.reset('');
      modelCtrl.disable({ emitEvent: false });
    }
  }

  async onMakeChange(): Promise<void> {
    if (this.showModelField) {
      await this.loadModels();
    }
  }

  async loadModels() {
    const modelCtrl = this.generatorForm.get('model')!;
    const campaignType = this.generatorForm.get('campaignType')?.value;
    const make = this.generatorForm.get('make')?.value;
    if (!campaignType || !make) return;

    modelCtrl.disable({ emitEvent: false });
    try {
      const isSvcOrUsed = ['SERVICE', 'USED'].includes(String(campaignType).toUpperCase());
      const endpoint = isSvcOrUsed
        ? this.url(`/get_models_for_dropdown/${encodeURIComponent(make)}`)
        : this.url(`/get_models/${encodeURIComponent(campaignType)}/${encodeURIComponent(make)}`);

      this.models = await firstValueFrom(this.http.get<string[]>(endpoint)) || [];
      modelCtrl.enable({ emitEvent: false });
    } catch {
      this.showAlert('Error loading models', 'error');
    }
  }

  addCampaignSet(): void {
    const newSet: CampaignSetVM = {
      index: this.campaignSetCounter++,
      account: this.generatorForm.get('account')?.value || '',
      campaignType: '',
      make: '',
      model: '',
      campaignRegional: '',
      availableMakes: [...this.makes],
      availableModels: [],
      showModelField: false,
      showRegionalField: false,
    };
    this.dynamicCampaignSets.push(newSet);
  }

  removeCampaignSet(idx: number): void {
    this.dynamicCampaignSets.splice(idx, 1);
  }

  async onDynamicAccountChange(index: number): Promise<void> {
    const set = this.dynamicCampaignSets[index];
    set.availableMakes = [];
    set.make = '';
    set.model = '';

    if (!set.account) return;

    try {
      const makes = await firstValueFrom(
        this.http.get<string[]>(this.url(`/get_makes/${encodeURIComponent(set.account)}`))
      );
      set.availableMakes = makes || [];
    } catch {
      this.showAlert('Error loading makes', 'error');
    }
  }

  onDynamicCampaignTypeChange(index: number): void {
    const set = this.dynamicCampaignSets[index];
    set.showModelField = this.isModelShownFor(set.campaignType);
    set.showRegionalField = this.isRegionalShownFor(set.campaignType);
    if (!set.showModelField) set.model = '';

    if (set.showModelField && set.make) {
      this.loadDynamicModels(index);
    }
  }

  async onDynamicMakeChange(index: number): Promise<void> {
    const set = this.dynamicCampaignSets[index];
    if (set.showModelField) {
      await this.loadDynamicModels(index);
    }
  }

  async loadDynamicModels(index: number): Promise<void> {
    const set = this.dynamicCampaignSets[index];
    if (!set.campaignType || !set.make) return;

    try {
      const isServiceOrUsed = ['SERVICE', 'USED'].includes(set.campaignType.toUpperCase());
      const endpoint = isServiceOrUsed
        ? this.url(`/get_models_for_dropdown/${encodeURIComponent(set.make)}`)
        : this.url(`/get_models/${encodeURIComponent(set.campaignType)}/${encodeURIComponent(set.make)}`);

      const models = await firstValueFrom(this.http.get<string[]>(endpoint));
      set.availableModels = models || [];
    } catch {
      this.showAlert('Error loading models', 'error');
    }
  }

async handleGeneratorSubmit() {
  if (!this.generatorForm.valid) {
    this.showAlert('Please fill all required fields.', 'error');
    return;
  }

  this.isLoading = true;
  this.loadingText = 'Generating campaigns...';
  this.showResults = false;
  this.clearAlert();

  try {
    const payloads: any[] = [];
    payloads.push(this.getGeneratorPayload(this.generatorForm));

    // Dynamic sets
    const validSets = this.dynamicCampaignSets.filter(s => s.account && s.make && s.campaignType);
    const missingModel = validSets.find(s => this.isModelShownFor(s.campaignType) && !s.model);
    if (missingModel) {
      this.showAlert('Please select a model for campaign sets that require it.', 'error');
      this.isLoading = false;
      return;
    }

    validSets.forEach(s => {
      payloads.push({
        account: s.account,
        make: s.make,
        campaign_type: s.campaignType,
        model: s.model || '',
        campaign_regional: s.campaignRegional || ''
      });
    });

    const results: any[] = [];
    for (const body of payloads) {
      const res = await firstValueFrom(this.http.post<any>(this.url('/generate_campaign'), body));
      if (!res?.success) throw new Error(res?.error || 'Campaign generation failed');
      results.push(res);
    }

    const combined = this.combineResults(results);
    this.currentCampaignData = combined.data;
    this.currentSummary = combined.summary;
    this.currentKeywords = combined.keywords;
    this.resultColumns = combined.columns;

    this.buildViews();

    // ✅ Now toggle results & download
    this.showResults = !!this.currentCampaignData?.length;
    this.showDownloadBtn = this.showResults;

    this.showAlert(`${results.length} campaigns generated successfully!`, 'success');
  } catch (e: any) {
    this.showAlert(`Error: ${e?.message || e}`, 'error');
  } finally {
    this.isLoading = false;
  }
}

  getCampaigns(acc: string): string[] {
    return this.campaignKeysByAccount?.[acc] ?? [];
  }

  getAds(acc: string, cmp: string): any[] {
    return this.groupedByAccountCampaign?.[acc]?.[cmp] ?? [];
  }

  getKeywords(acc: string, cmp: string): any[] {
    return this.keywordsByAccountCampaign?.[acc]?.[cmp] ?? [];
  }

  getAdsCount(acc: string, cmp: string): number {
    return this.getAds(acc, cmp).length;
  }

  getCell(row: any, column: string): any {
    return row?.[column] ?? '';
  }


  private getGeneratorPayload(form: FormGroup): any {
    return {
      account: form.get('account')?.value,
      make: form.get('make')?.value,
      campaign_type: form.get('campaignType')?.value,
      model: form.get('model')?.value || '',
      campaign_regional: form.get('campaignRegional')?.value || '',
    };
  }

  private combineResults(results: any[]): any {
    if (results.length === 0) return { data: [], summary: {}, keywords: [], columns: [] };
    if (results.length === 1) return results[0];

    const data: any[] = [];
    const keywords: any[] = [];
    let recordCount = 0;
    let keywordCount = 0;

    for (const r of results) {
      data.push(...(r.data || []));
      if (Array.isArray(r.keywords)) {
        keywords.push(...r.keywords);
        keywordCount += r.keywords.length;
      }
      recordCount += r.summary?.record_count || 0;
    }

    const summary = {
      ...results[0].summary,
      record_count: recordCount,
      keyword_count: keywordCount,
      multiple_campaigns: true,
    };

    return { data, summary, keywords, columns: results[0].columns || [] };
  }

  // ---------- Download ----------
  async handleDownload(): Promise<void> {
    if (!this.currentCampaignData?.length || !this.currentSummary) {
      this.showAlert('No data to download', 'error');
      return;
    }

    try {
      const resp = await firstValueFrom(
        this.http.post(this.url('/download_campaign'), {
          data: this.currentCampaignData,
          summary: this.currentSummary,
          keywords: this.currentKeywords,
        }, {
          observe: 'response',
          responseType: 'blob' as 'json',
        })
      ) as HttpResponse<Blob>;

      const blob = resp.body as Blob;
      const cd = resp.headers.get('Content-Disposition') || '';
      const match = /filename="?([^"]+)"?/.exec(cd);
      const filename = match?.[1] || 'campaigns.xlsx';

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();

      this.showAlert('Campaign downloaded successfully!', 'success');
    } catch (e: any) {
      this.showAlert(`Download error: ${e?.message || e}`, 'error');
    }
  }

  // ---------- Editor Tab ----------
  async handleEditorSubmit(): Promise<void> {
    if (!this.editorForm.valid) {
      this.showAlert('Please fill all required fields.', 'error');
      return;
    }

    this.isLoading = true;
    this.loadingText = 'Saving campaign...';
    this.clearAlert();

    try {
      const formData = this.collectEditorFormData();
      // Wire this to your Flask /save_campaign if desired:
      // const result = await firstValueFrom(this.http.post<any>(this.url('/save_campaign'), formData));
      const result = { success: true, message: 'Campaign saved successfully!', action: 'add' };

      if (result.success) {
        this.showAlert(result.message, 'success');
        if (result.action === 'add') this.resetEditorForm();
      } else {
        this.showAlert(result.message || 'Failed to save campaign', 'error');
      }
    } catch (e: any) {
      this.showAlert(`Error: ${e?.message || e}`, 'error');
    } finally {
      this.isLoading = false;
    }
  }

  collectEditorFormData(): any {
    const fv = this.editorForm.value as any;
    const data: any = {};

    data.Account = fv.account === '__custom__' ? this.customAccountValue : fv.account;
    data.CustomerID = fv.customerID === '__custom__' ? this.customCustomerIDValue : fv.customerID;
    data.CampaignType = fv.campaignType === '__custom__' ? this.customCampaignTypeValue : fv.campaignType;
    data.Make = fv.make === '__custom__' ? this.customMakeValue : fv.make;
    data.Model = fv.model === '__custom__' ? this.customModelValue : fv.model;

    Object.keys(fv).forEach(k => {
      if (!['account', 'customerID', 'campaignType', 'make', 'model'].includes(k) && fv[k]) {
        const key = k.charAt(0).toUpperCase() + k.slice(1);
        data[key] = fv[k];
      }
    });

    return data;
  }

  resetEditorForm(): void {
    this.editorForm.reset();
    this.showCustomAccount = false;
    this.showCustomCustomerID = false;
    this.showCustomCampaignType = false;
    this.showCustomMake = false;
    this.showCustomModel = false;
    this.customAccountValue = '';
    this.customCustomerIDValue = '';
    this.customCampaignTypeValue = '';
    this.customMakeValue = '';
    this.customModelValue = '';
  }

  // ---------- Alerts ----------
  showAlert(message: string, type: 'success' | 'error' | 'info'): void {
    this.alertMessage = message;
    this.alertType = type;
    if (type === 'success') {
      setTimeout(() => this.clearAlert(), 5000);
    }
  }

  clearAlert(): void {
    this.alertMessage = '';
  }
}
