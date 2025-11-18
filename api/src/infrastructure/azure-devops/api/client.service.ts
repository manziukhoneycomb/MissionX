import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import {
    AzureDevOpsWorkItem,
    CreateWorkItemRequest,
    UpdateWorkItemRequest,
    WorkItemBatch,
    WorkItemBatchResponse,
    WorkItemQueryResult,
    ProjectReference,
    AzureDevOpsApiError,
    WorkItemTypeCategory,
} from './interfaces/work-item.interface';

@Injectable()
export class AzureDevOpsApiClient {
    private readonly logger = new Logger(AzureDevOpsApiClient.name);
    private readonly baseUrl = 'https://dev.azure.com';
    private readonly apiVersion = '7.1-preview.3';
    private axiosInstance: AxiosInstance;
    private rateLimitRequests = 0;
    private rateLimitWindow = Date.now();
    private readonly maxRequestsPerMinute = 200;

    constructor() {
        this.axiosInstance = axios.create({
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        this.setupInterceptors();
    }

    private setupInterceptors(): void {
        this.axiosInstance.interceptors.request.use(
            (config) => {
                this.checkRateLimit();
                this.logger.debug(`Making request to: ${config.url}`);
                return config;
            },
            (error) => {
                this.logger.error('Request interceptor error:', error);
                return Promise.reject(error);
            },
        );

        this.axiosInstance.interceptors.response.use(
            (response) => {
                this.logger.debug(`Response received: ${response.status}`);
                return response;
            },
            (error) => {
                this.logger.error('Response interceptor error:', error.response?.data || error.message);
                return Promise.reject(this.handleApiError(error));
            },
        );
    }

    private checkRateLimit(): void {
        const now = Date.now();
        const windowSize = 60000; // 1 minute

        if (now - this.rateLimitWindow > windowSize) {
            this.rateLimitRequests = 0;
            this.rateLimitWindow = now;
        }

        if (this.rateLimitRequests >= this.maxRequestsPerMinute) {
            const waitTime = windowSize - (now - this.rateLimitWindow);
            throw new HttpException(
                `Rate limit exceeded. Please wait ${Math.ceil(waitTime / 1000)} seconds.`,
                HttpStatus.TOO_MANY_REQUESTS,
            );
        }

        this.rateLimitRequests++;
    }

    private handleApiError(error: any): HttpException {
        if (error.response?.data) {
            const apiError: AzureDevOpsApiError = error.response.data;
            return new HttpException(
                apiError.message || 'Azure DevOps API error',
                error.response.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }

        if (error.code === 'ECONNABORTED') {
            return new HttpException('Request timeout', HttpStatus.REQUEST_TIMEOUT);
        }

        return new HttpException(
            error.message || 'Unknown API error',
            HttpStatus.INTERNAL_SERVER_ERROR,
        );
    }

    setAccessToken(accessToken: string): void {
        this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    }

    private buildUrl(organization: string, project?: string, endpoint?: string): string {
        let url = `${this.baseUrl}/${organization}`;
        if (project) {
            url += `/${project}`;
        }
        if (endpoint) {
            url += `/_apis/${endpoint}`;
        }
        return url;
    }

    async getProjects(organization: string): Promise<ProjectReference[]> {
        try {
            const url = this.buildUrl(organization, null, 'projects');
            const response: AxiosResponse = await this.axiosInstance.get(url, {
                params: { 'api-version': this.apiVersion },
            });

            return response.data.value;
        } catch (error) {
            this.logger.error('Failed to get projects:', error);
            throw error;
        }
    }

    async getWorkItems(
        organization: string,
        project: string,
        ids: number[],
        fields?: string[],
        expand?: 'None' | 'Relations' | 'Fields' | 'Links' | 'All',
    ): Promise<AzureDevOpsWorkItem[]> {
        try {
            const url = this.buildUrl(organization, project, 'wit/workitems');
            const params: any = {
                ids: ids.join(','),
                'api-version': this.apiVersion,
            };

            if (fields && fields.length > 0) {
                params.fields = fields.join(',');
            }

            if (expand) {
                params['$expand'] = expand;
            }

            const response: AxiosResponse = await this.axiosInstance.get(url, { params });

            return response.data.value;
        } catch (error) {
            this.logger.error('Failed to get work items:', error);
            throw error;
        }
    }

    async getWorkItem(
        organization: string,
        project: string,
        id: number,
        fields?: string[],
        expand?: 'None' | 'Relations' | 'Fields' | 'Links' | 'All',
    ): Promise<AzureDevOpsWorkItem> {
        try {
            const url = this.buildUrl(organization, project, `wit/workitems/${id}`);
            const params: any = {
                'api-version': this.apiVersion,
            };

            if (fields && fields.length > 0) {
                params.fields = fields.join(',');
            }

            if (expand) {
                params['$expand'] = expand;
            }

            const response: AxiosResponse = await this.axiosInstance.get(url, { params });

            return response.data;
        } catch (error) {
            this.logger.error(`Failed to get work item ${id}:`, error);
            throw error;
        }
    }

    async createWorkItem(
        organization: string,
        project: string,
        workItemType: string,
        operations: CreateWorkItemRequest[],
    ): Promise<AzureDevOpsWorkItem> {
        try {
            const url = this.buildUrl(organization, project, `wit/workitems/$${workItemType}`);
            const config: AxiosRequestConfig = {
                params: { 'api-version': this.apiVersion },
                headers: { 'Content-Type': 'application/json-patch+json' },
            };

            const response: AxiosResponse = await this.axiosInstance.post(url, operations, config);

            return response.data;
        } catch (error) {
            this.logger.error('Failed to create work item:', error);
            throw error;
        }
    }

    async updateWorkItem(
        organization: string,
        project: string,
        id: number,
        operations: UpdateWorkItemRequest[],
        validateOnly = false,
        bypassRules = false,
    ): Promise<AzureDevOpsWorkItem> {
        try {
            const url = this.buildUrl(organization, project, `wit/workitems/${id}`);
            const params: any = {
                'api-version': this.apiVersion,
            };

            if (validateOnly) {
                params.validateOnly = 'true';
            }

            if (bypassRules) {
                params.bypassRules = 'true';
            }

            const config: AxiosRequestConfig = {
                params,
                headers: { 'Content-Type': 'application/json-patch+json' },
            };

            const response: AxiosResponse = await this.axiosInstance.patch(url, operations, config);

            return response.data;
        } catch (error) {
            this.logger.error(`Failed to update work item ${id}:`, error);
            throw error;
        }
    }

    async deleteWorkItem(
        organization: string,
        project: string,
        id: number,
        destroy = false,
    ): Promise<AzureDevOpsWorkItem> {
        try {
            const url = this.buildUrl(organization, project, `wit/workitems/${id}`);
            const params: any = {
                'api-version': this.apiVersion,
            };

            if (destroy) {
                params.destroy = 'true';
            }

            const response: AxiosResponse = await this.axiosInstance.delete(url, { params });

            return response.data;
        } catch (error) {
            this.logger.error(`Failed to delete work item ${id}:`, error);
            throw error;
        }
    }

    async queryWorkItems(
        organization: string,
        project: string,
        wiql: string,
        timePrecision = false,
        top?: number,
    ): Promise<WorkItemQueryResult> {
        try {
            const url = this.buildUrl(organization, project, 'wit/wiql');
            const params: any = {
                'api-version': this.apiVersion,
            };

            if (timePrecision) {
                params.timePrecision = 'true';
            }

            if (top) {
                params['$top'] = top;
            }

            const requestBody = { query: wiql };
            const response: AxiosResponse = await this.axiosInstance.post(url, requestBody, { params });

            return response.data;
        } catch (error) {
            this.logger.error('Failed to query work items:', error);
            throw error;
        }
    }

    async getWorkItemsBatch(
        organization: string,
        project: string,
        batch: WorkItemBatch,
    ): Promise<WorkItemBatchResponse> {
        try {
            const url = this.buildUrl(organization, project, 'wit/workitemsbatch');
            const params = {
                'api-version': this.apiVersion,
            };

            const response: AxiosResponse = await this.axiosInstance.post(url, batch, { params });

            return response.data;
        } catch (error) {
            this.logger.error('Failed to get work items batch:', error);
            throw error;
        }
    }

    async getWorkItemTypes(organization: string, project: string): Promise<WorkItemTypeCategory[]> {
        try {
            const url = this.buildUrl(organization, project, 'wit/workitemtypecategories');
            const response: AxiosResponse = await this.axiosInstance.get(url, {
                params: { 'api-version': this.apiVersion },
            });

            return response.data.value;
        } catch (error) {
            this.logger.error('Failed to get work item types:', error);
            throw error;
        }
    }

    async getWorkItemHistory(
        organization: string,
        project: string,
        id: number,
        top?: number,
        skip?: number,
    ): Promise<any[]> {
        try {
            const url = this.buildUrl(organization, project, `wit/workitems/${id}/updates`);
            const params: any = {
                'api-version': this.apiVersion,
            };

            if (top) {
                params['$top'] = top;
            }

            if (skip) {
                params['$skip'] = skip;
            }

            const response: AxiosResponse = await this.axiosInstance.get(url, { params });

            return response.data.value;
        } catch (error) {
            this.logger.error(`Failed to get work item ${id} history:`, error);
            throw error;
        }
    }

    getRateLimitStatus(): { requests: number; window: number; maxRequests: number } {
        return {
            requests: this.rateLimitRequests,
            window: this.rateLimitWindow,
            maxRequests: this.maxRequestsPerMinute,
        };
    }

    resetRateLimit(): void {
        this.rateLimitRequests = 0;
        this.rateLimitWindow = Date.now();
    }
}